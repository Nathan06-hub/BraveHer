/**
 * Service de synchronisation de la file d'actions hors ligne.
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

    const syncedIds: string[] = [];
    const echecsIds: string[] = [];

    // La file contient des mutations de domaines différents. Les envoyer à
    // l'endpoint d'origine évite de les poster sous un faux contrat /sync/batch.
    const orderedActions = [...actions].sort((a, b) => {
      const evaluationForA = a.typeAction === 'SAVE_EVALUATION' && a.payload?.patienteId === b.localEntityId;
      const evaluationForB = b.typeAction === 'SAVE_EVALUATION' && b.payload?.patienteId === a.localEntityId;
      if (evaluationForA) return 1;
      if (evaluationForB) return -1;
      return a.dateCreation.localeCompare(b.dateCreation);
    });
    for (const action of orderedActions) {
      try {
        const payload = structuredClone(action.payload);
        if (action.typeAction === 'SAVE_EVALUATION' && payload?.patienteId) {
          const serverId = await offlineStorage.getServerId(payload.patienteId);
          if (serverId) payload.patienteId = serverId;
          else if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(payload.patienteId)) {
            throw new Error('Identifiant local historique sans correspondance serveur');
          }
        }
        const response = await apiFetch<any>(action.endpoint, {
          method: action.methode,
          body: JSON.stringify(payload),
        });
        if (action.typeAction === 'CREATE_PATIENT' && action.localEntityId && response?.id) {
          await offlineStorage.saveServerId(action.localEntityId, response.id);
        }
        syncedIds.push(action.id);
      } catch (error) {
        console.warn(`[Sync API] Action ${action.id} conservée dans la file :`, error);
        echecsIds.push(action.id);
      }
    }

    return {
      totalTraite: actions.length,
      syncedIds,
      echecsIds,
      dateSynchronisation: new Date().toISOString(),
    };
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
