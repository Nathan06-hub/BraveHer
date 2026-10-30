/**
 * Service API Centres de Santé
 * Brave_her Burkina Faso
 */

import { apiFetch } from './httpClient';
import type { CentreSante } from '../../types/campaign';

function normalizeCentre(raw: any): CentreSante {
  if (!raw) return raw;
  return {
    id: String(raw.id),
    nom: raw.nom || 'Centre de Santé',
    commune: raw.commune || 'Ouagadougou',
    region: raw.region || 'Centre',
    secteur: raw.province || raw.secteur || '',
    telephone: raw.telephone || '+226 25 30 00 00',
    email: raw.email || 'contact@sante.bf',
    adresse: raw.adresse || raw.commune || '',
    latitude: typeof raw.latitude === 'number' ? raw.latitude : undefined,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : undefined,
  };
}

export const centreApi = {
  /**
   * Récupère la liste de tous les centres de santé officiels enregistrés dans le backend
   */
  async getCentres(): Promise<CentreSante[]> {
    try {
      const data = await apiFetch<any>('/centres', {
        method: 'GET',
        fallbackData: [],
      });
      const list = Array.isArray(data)
        ? data
        : data?.content && Array.isArray(data.content)
        ? data.content
        : [];

      return list.map(normalizeCentre);
    } catch {
      return [];
    }
  },

  /**
   * Récupère un centre par son identifiant
   */
  async getCentreById(id: string): Promise<CentreSante | undefined> {
    try {
      const data = await apiFetch<any>(`/centres/${id}`, {
        method: 'GET',
        fallbackData: undefined,
      });
      return data ? normalizeCentre(data) : undefined;
    } catch {
      return undefined;
    }
  },
};
