// Hook de Gestion de Connectivité & Synchronisation Réseau (Module 3)
// Brave_her Burkina Faso

import { useState, useEffect, useCallback } from 'react';
import { offlineStorage, type SyncQueueAction } from '../services/offlineStorage';
import { checkBackendHealth } from '../services/api/httpClient';
import { syncApi } from '../services/api/syncApi';

export interface NetworkStatusState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  backendAvailable: boolean;
  backendLatencyMs?: number;
  pendingSyncCount: number;
  pendingActions: SyncQueueAction[];
  isSyncing: boolean;
  lastSyncTime: Date | null;
  toggleSimulatedOffline: () => void;
  syncNow: () => Promise<{ success: number; failed: number }>;
  enqueueOfflineAction: (
    action: Omit<SyncQueueAction, 'id' | 'dateCreation' | 'statut' | 'tentatives'>
  ) => Promise<SyncQueueAction>;
}

export function useNetworkStatus(): NetworkStatusState {
  const [realOnline, setRealOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);
  const [backendLatencyMs, setBackendLatencyMs] = useState<number | undefined>(undefined);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [pendingActions, setPendingActions] = useState<SyncQueueAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());

  const isOnline = realOnline && !isSimulatedOffline;

  // Rafraîchir les actions en attente depuis IndexedDB
  const refreshPending = useCallback(async () => {
    try {
      const actions = await offlineStorage.getPendingActions();
      setPendingActions(actions);
      setPendingSyncCount(actions.length);
    } catch {
      // Ignorer silencieusement si IndexedDB est restreint
    }
  }, []);

  // Sonde de santé Spring Boot périodique
  const checkHealth = useCallback(async () => {
    if (!realOnline || isSimulatedOffline) {
      setBackendAvailable(false);
      setBackendLatencyMs(undefined);
      return;
    }
    try {
      const status = await checkBackendHealth(2000);
      setBackendAvailable(status.online);
      setBackendLatencyMs(status.latencyMs);
    } catch {
      setBackendAvailable(false);
      setBackendLatencyMs(undefined);
    }
  }, [realOnline, isSimulatedOffline]);

  useEffect(() => {
    const handleOnline = () => setRealOnline(true);
    const handleOffline = () => setRealOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshPending();
    checkHealth();

    // Vérification périodique de l'état du backend toutes les 15 secondes
    const interval = setInterval(() => {
      checkHealth();
      refreshPending();
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [refreshPending, checkHealth]);

  // Bascule du mode hors-ligne simulé (Pitch Démo Hackathon)
  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => !prev);
  }, []);

  // Déclencher la synchronisation des actions en attente
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      return { success: 0, failed: 0 };
    }

    setIsSyncing(true);
    let success = 0;
    let failed = 0;

    if (backendAvailable) {
      // Envoi du lot vers l'API Spring Boot
      try {
        const res = await syncApi.processPendingSyncQueue();
        success = res.synchronises;
        failed = res.restants;
      } catch {
        failed = pendingSyncCount;
      }
    } else {
      // Ne jamais déclarer synchronisées des mutations non reçues par l'API.
      failed = await offlineStorage.countPending();
    }

    await refreshPending();
    setIsSyncing(false);
    setLastSyncTime(new Date());

    return { success, failed };
  }, [isOnline, backendAvailable, refreshPending]);

  // Ajouter une action hors-ligne
  const enqueueOfflineAction = useCallback(
    async (action: Omit<SyncQueueAction, 'id' | 'dateCreation' | 'statut' | 'tentatives'>) => {
      const created = await offlineStorage.enqueueAction(action);
      await refreshPending();
      return created;
    },
    [refreshPending]
  );

  return {
    isOnline,
    isSimulatedOffline,
    backendAvailable,
    backendLatencyMs,
    pendingSyncCount,
    pendingActions,
    isSyncing,
    lastSyncTime,
    toggleSimulatedOffline,
    syncNow,
    enqueueOfflineAction,
  };
}
