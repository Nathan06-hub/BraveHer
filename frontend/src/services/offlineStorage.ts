// Service de Persistance Locale IndexedDB (Module 3 : Architecture Offline-First)
// Soutien Rose Burkina Faso — Hackathon Orange
// Conforme au Cahier des Charges (Page 2, Module 3 : Inclusivité & Continuité de Service)

export interface SyncQueueAction {
  id: string;
  typeAction: 'CREATE_PATIENT' | 'SAVE_EVALUATION' | 'CREATE_AID_REQUEST' | 'DONATION_PROCESSED' | 'CREATE_CAMPAIGN';
  endpoint: string;
  methode: 'POST' | 'PUT' | 'PATCH';
  payload: any;
  dateCreation: string; // ISO
  statut: 'en_attente' | 'en_cours' | 'synchronise' | 'erreur';
  tentatives: number;
  entiteNom: string; // Ex: "Fatoumata Ouédraogo"
  description: string;
}

const DB_NAME = 'SoutienRoseBFK_OfflineDB';
const DB_VERSION = 1;

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // 1. Store Patientes
          if (!db.objectStoreNames.contains('patientes')) {
            const patientStore = db.createObjectStore('patientes', { keyPath: 'id' });
            patientStore.createIndex('numeroDossier', 'numeroDossier', { unique: false });
            patientStore.createIndex('commune', 'commune', { unique: false });
          }

          // 2. Store Evaluations cliniques & Score IA
          if (!db.objectStoreNames.contains('evaluations')) {
            const evalStore = db.createObjectStore('evaluations', { keyPath: 'id' });
            evalStore.createIndex('patienteId', 'patienteId', { unique: false });
            evalStore.createIndex('niveauRisque', 'niveauRisque', { unique: false });
          }

          // 3. Store Demandes de Solidarité & Bons de Santé
          if (!db.objectStoreNames.contains('demandes_aide')) {
            const aideStore = db.createObjectStore('demandes_aide', { keyPath: 'id' });
            aideStore.createIndex('codeDossier', 'codeDossier', { unique: false });
          }

          // 4. File d'attente de synchronisation vers Spring Boot (Sync Queue)
          if (!db.objectStoreNames.contains('sync_queue')) {
            const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
            queueStore.createIndex('statut', 'statut', { unique: false });
            queueStore.createIndex('dateCreation', 'dateCreation', { unique: false });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  // Ajouter une action dans la file d'attente de synchronisation
  async enqueueAction(action: Omit<SyncQueueAction, 'id' | 'dateCreation' | 'statut' | 'tentatives'>): Promise<SyncQueueAction> {
    const db = await this.getDB();
    const newAction: SyncQueueAction = {
      ...action,
      id: `sync-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      dateCreation: new Date().toISOString(),
      statut: 'en_attente',
      tentatives: 0,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const req = store.add(newAction);
      req.onsuccess = () => resolve(newAction);
      req.onerror = () => reject(req.error);
    });
  }

  // Récupérer toutes les actions en attente de synchronisation
  async getPendingActions(): Promise<SyncQueueAction[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result as SyncQueueAction[];
        resolve(all.filter((item) => item.statut === 'en_attente' || item.statut === 'erreur'));
      };
      req.onerror = () => reject(req.error);
    });
  }

  // Supprimer une action synchronisée avec succès
  async removeAction(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Compter le nombre d'éléments en attente
  async countPending(): Promise<number> {
    const pending = await this.getPendingActions();
    return pending.length;
  }
}

export const offlineStorage = new OfflineStorageService();
