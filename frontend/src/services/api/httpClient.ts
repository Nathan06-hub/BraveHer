/**
 * Client HTTP Universel & Résilience Hybride (Graceful Fallback)
 * Brave_her Burkina Faso
 * 
 * Permet au Frontend de communiquer avec le Backend Spring Boot (port 8080 via proxy Vite)
 * tout en assurant une démo 100% stable en basculant automatiquement sur les données locales
 * si le backend est momentanément inaccessible.
 */

import { offlineStorage, type SyncQueueAction } from '../offlineStorage';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const ENABLE_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true' ||
  (!import.meta.env.PROD && import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false');

export interface BackendHealthStatus {
  online: boolean;
  latencyMs?: number;
  timestamp: string;
  backendVersion?: string;
  error?: string;
}

export interface ApiFetchOptions<T = any> extends RequestInit {
  timeoutMs?: number;
  fallbackData?: T | (() => T | Promise<T>);
  syncQueueMetadata?: {
    typeAction: SyncQueueAction['typeAction'];
    entiteNom: string;
    description: string;
    localEntityId?: string;
  };
}

export class ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: any;

  constructor(message: string, status?: number, statusText?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// État mémoire du statut backend
let cachedBackendStatus: BackendHealthStatus = {
  online: false,
  timestamp: new Date().toISOString(),
};

/**
 * Sonde de santé silencieuse du Backend Spring Boot
 * Vérifie si le serveur 8080 répond à /api/v1/health
 */
export async function checkBackendHealth(timeoutMs: number = 2000): Promise<BackendHealthStatus> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const healthEndpoint = import.meta.env.VITE_BACKEND_HEALTH_ENDPOINT || `${API_BASE_URL}/auth/me`;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

  try {
    const res = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    if (res.ok) {
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Simple 200 OK text response
      }
      cachedBackendStatus = {
        online: true,
        latencyMs,
        timestamp: new Date().toISOString(),
        backendVersion: data.version || 'Spring Boot 3.x (H2 DB)',
      };
      return cachedBackendStatus;
    } else {
      cachedBackendStatus = {
        online: false,
        latencyMs,
        timestamp: new Date().toISOString(),
        error: `HTTP ${res.status} ${res.statusText}`,
      };
      return cachedBackendStatus;
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    cachedBackendStatus = {
      online: false,
      timestamp: new Date().toISOString(),
      error: err.name === 'AbortError' ? 'Délai d\'attente dépassé (Timeout)' : 'Serveur Spring Boot inaccessible',
    };
    return cachedBackendStatus;
  }
}

/**
 * Récupère le dernier statut de santé connu
 */
export function getLastKnownBackendStatus(): BackendHealthStatus {
  return cachedBackendStatus;
}

/**
 * Méthode universelle d'appel API avec résilience hybride
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions<T> = {}
): Promise<T> {
  const {
    timeoutMs = 6000,
    fallbackData,
    syncQueueMetadata,
    headers = {},
    ...restOptions
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const method = (restOptions.method || 'GET').toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

  try {
    const response = await fetch(url, {
      ...restOptions,
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      throw new ApiError(
        `Erreur API [${response.status}] sur ${method} ${endpoint}`,
        response.status,
        response.statusText,
        errorBody
      );
    }

    // Traitement de la réponse JSON (ou vide pour 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Détection de coupure réseau ou backend éteint
    const isNetworkOrConnectionError =
      error.name === 'AbortError' ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('Connection refused');

    // Mise en file d'attente hors-ligne si c'est une mutation métier
    if (
      isNetworkOrConnectionError &&
      (method === 'POST' || method === 'PUT' || method === 'PATCH') &&
      syncQueueMetadata &&
      typeof indexedDB !== 'undefined'
    ) {
      try {
        let payload = restOptions.body;
        if (typeof payload === 'string') {
          try {
            payload = JSON.parse(payload);
          } catch {
            // keep raw string
          }
        }
        await offlineStorage.enqueueAction({
          typeAction: syncQueueMetadata.typeAction,
          endpoint,
          methode: method,
          payload,
          entiteNom: syncQueueMetadata.entiteNom,
          description: syncQueueMetadata.description,
          localEntityId: syncQueueMetadata.localEntityId,
        });
        console.warn(`[Sync Queue] Action ${syncQueueMetadata.typeAction} mise en file d'attente locale IndexedDB.`);
      } catch (queueErr) {
        console.error('[Sync Queue] Erreur lors de la mise en file d\'attente :', queueErr);
      }
    }

    // Gestion du fallback gracieux
    if (fallbackData !== undefined && ENABLE_FALLBACK) {
      console.warn(
        `[Mode Résilience] Appel ${method} ${endpoint} indisponible. Utilisation automatique des données locales de secours.`
      );
      if (typeof fallbackData === 'function') {
        return (fallbackData as () => T | Promise<T>)();
      }
      return fallbackData;
    }

    throw error;
  }
}
