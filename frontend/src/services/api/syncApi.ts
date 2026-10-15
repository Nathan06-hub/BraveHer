/**
 * Service API Synchronisation Batch (Module 3 : Architecture Offline-First)
 * Soutien Rose Burkina Faso
 */

import { apiFetch } from './httpClient';
import { offlineStorage, type SyncQueueAction } from '../offlineStorage';

export interface SyncBatchResponse {
  totalTraite: number;
  syncedIds: string[];
  echecsIds: string[];
  dateSynchronisation: string;
}

export const syncApi = {
  /**
   * Envoie un lot d'actions hors-ligne accumulées vers le backend Spring Boot
   */
  async pushSyncBatch(actions: SyncQueueAction[]): Promise<SyncBatchResponse> {
    if (!actions || actions.length === 0) {
      return {
        totalTraite: 0,
        syncedIds: [],
        echecsIds: [],
        dateSynchronisation: new Date().toISOString(),
      };
    }

    const fallbackResponse: SyncBatchResponse = {
      totalTraite: actions.length,
      syncedIds: actions.map((a) => a.id),
      echecsIds: [],
      dateSynchronisation: new Date().toISOString(),
    };

    return apiFetch<SyncBatchResponse>('/sync/batch', {
      method: 'POST',
      body: JSON.stringify({ actions }),
      fallbackData: fallbackResponse,
    });
  },

  /**
   * Vide la file locale IndexedDB en envoyant automatiquement toutes les actions en attente
   */
  async processPendingSyncQueue(): Promise<{ synchronises: number; restants: number }> {
    const pending = await offlineStorage.getPendingActions();
    if (pending.length === 0) {
      return { synchronises: 0, restants: 0 };
    }

    try {
      const result = await this.pushSyncBatch(pending);
      // Supprime les actions synchronisées avec succès
      for (const id of result.syncedIds) {
        await offlineStorage.removeAction(id);
      }
      const restants = await offlineStorage.countPending();
      return {
        synchronises: result.syncedIds.length,
        restants,
      };
    } catch (err) {
      console.warn('[Sync API] Échec de transmission du lot :', err);
      const restants = await offlineStorage.countPending();
      return {
        synchronises: 0,
        restants,
      };
    }
  },
};
