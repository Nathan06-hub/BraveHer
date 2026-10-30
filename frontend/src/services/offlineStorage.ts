// Service de Persistance Locale IndexedDB (Module 3 : Architecture Offline-First)
// Stockage hors ligne Brave_her.
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
  localEntityId?: string;
}

const DB_NAME = 'BraveHerBF_OfflineDB';
const KEY_DB_NAME = 'BraveHerBF_KeyVault';
const LEGACY_DB_NAME = 'SoutienRoseBFK_OfflineDB';
const DB_VERSION = 2;
const OFFLINE_STORES = ['patientes', 'evaluations', 'demandes_aide', 'sync_queue', 'local_id_map'];

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private keyPromise: Promise<CryptoKey> | null = null;

  private getEncryptionKey(): Promise<CryptoKey> {
    if (!this.keyPromise) {
      this.keyPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(KEY_DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore('keys', { keyPath: 'id' });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }).then(async (keyDb) => {
        const savedKey = await new Promise<CryptoKey | undefined>((resolve, reject) => {
          const req = keyDb.transaction('keys', 'readonly').objectStore('keys').get('offline-aes-gcm');
          req.onsuccess = () => resolve(req.result?.key);
          req.onerror = () => reject(req.error);
        });
        if (savedKey) { keyDb.close(); return savedKey; }
        if (!globalThis.crypto?.subtle) throw new Error('Chiffrement indisponible dans ce navigateur.');
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
        await new Promise<void>((resolve, reject) => {
          const tx = keyDb.transaction('keys', 'readwrite');
          tx.objectStore('keys').put({ id: 'offline-aes-gcm', key });
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
        keyDb.close();
        return key;
      });
    }
    return this.keyPromise;
  }

  private async encryptRecord(storeName: string, value: any): Promise<any> {
    if (value?.__encrypted === true) return value;
    const keyPath = storeName === 'local_id_map' ? 'localId' : 'id';
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cleartext = new TextEncoder().encode(JSON.stringify(value));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await this.getEncryptionKey(), cleartext);
    const base64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
    return { [keyPath]: value[keyPath], __encrypted: true, iv: base64(iv), data: base64(new Uint8Array(ciphertext)) };
  }

  private async decryptRecord<T>(record: any): Promise<T> {
    if (!record?.__encrypted) return record as T;
    const bytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
    const cleartext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytes(record.iv) }, await this.getEncryptionKey(), bytes(record.data),
    );
    return JSON.parse(new TextDecoder().decode(cleartext)) as T;
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains('patientes')) {
            const store = db.createObjectStore('patientes', { keyPath: 'id' });
            store.createIndex('numeroDossier', 'numeroDossier', { unique: false });
            store.createIndex('commune', 'commune', { unique: false });
          }
          if (!db.objectStoreNames.contains('evaluations')) {
            const store = db.createObjectStore('evaluations', { keyPath: 'id' });
            store.createIndex('patienteId', 'patienteId', { unique: false });
            store.createIndex('niveauRisque', 'niveauRisque', { unique: false });
          }
          if (!db.objectStoreNames.contains('demandes_aide')) {
            const store = db.createObjectStore('demandes_aide', { keyPath: 'id' });
            store.createIndex('codeDossier', 'codeDossier', { unique: false });
          }
          if (!db.objectStoreNames.contains('sync_queue')) {
            const store = db.createObjectStore('sync_queue', { keyPath: 'id' });
            store.createIndex('statut', 'statut', { unique: false });
            store.createIndex('dateCreation', 'dateCreation', { unique: false });
          }
          if (!db.objectStoreNames.contains('local_id_map')) db.createObjectStore('local_id_map', { keyPath: 'localId' });
          if (!db.objectStoreNames.contains('migration_meta')) db.createObjectStore('migration_meta', { keyPath: 'key' });
        };

        request.onsuccess = () => {
          const db = request.result;
          this.migrateCurrentDatabase(db).then(() => this.migrateLegacyDatabase(db)).then(() => resolve(db), (error) => {
            db.close();
            this.dbPromise = null;
            reject(error);
          });
        };
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  private async migrateCurrentDatabase(db: IDBDatabase): Promise<void> {
    const migrated = await new Promise<boolean>((resolve, reject) => {
      const req = db.transaction('migration_meta', 'readonly').objectStore('migration_meta').get('encrypted-v1');
      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => reject(req.error);
    });
    if (migrated) return;
    const copies = await Promise.all(OFFLINE_STORES.map((store) => new Promise<[string, unknown[]]>((resolve, reject) => {
      const req = db.transaction(store, 'readonly').objectStore(store).getAll();
      req.onsuccess = () => resolve([store, req.result]);
      req.onerror = () => reject(req.error);
    })));
    const encrypted = await Promise.all(copies.map(async ([store, values]) =>
      [store, await Promise.all(values.map((value) => this.encryptRecord(store, value)))] as [string, unknown[]]
    ));
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([...OFFLINE_STORES, 'migration_meta'], 'readwrite');
      for (const [store, values] of encrypted) {
        const objectStore = tx.objectStore(store);
        objectStore.clear();
        for (const value of values) objectStore.put(value);
      }
      tx.objectStore('migration_meta').put({ key: 'encrypted-v1', migratedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  private async migrateLegacyDatabase(target: IDBDatabase): Promise<void> {
    const migrated = await new Promise<boolean>((resolve, reject) => {
      const req = target.transaction('migration_meta', 'readonly').objectStore('migration_meta').get('legacy-v1');
      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => reject(req.error);
    });
    if (migrated) {
      await this.deleteLegacyDatabase();
      return;
    }

    const legacy = await new Promise<IDBDatabase | null>((resolve, reject) => {
      const req = indexedDB.open(LEGACY_DB_NAME);
      req.onupgradeneeded = (event) => {
        if (event.oldVersion === 0) req.result.close();
      };
      req.onsuccess = () => {
        if (req.result.version === 1 && req.result.objectStoreNames.length === 0) {
          req.result.close();
          indexedDB.deleteDatabase(LEGACY_DB_NAME);
          resolve(null);
        } else resolve(req.result);
      };
      req.onerror = () => reject(req.error);
    });

    if (legacy) {
      const copies = await Promise.all(OFFLINE_STORES.filter((name) =>
        legacy.objectStoreNames.contains(name)
      ).map((name) => new Promise<[string, unknown[]]>((resolve, reject) => {
        const req = legacy.transaction(name, 'readonly').objectStore(name).getAll();
        req.onsuccess = () => resolve([name, req.result]);
        req.onerror = () => reject(req.error);
      })));
      legacy.close();
      const encryptedCopies = await Promise.all(copies.map(async ([store, values]) =>
        [store, await Promise.all(values.map((value) => this.encryptRecord(store, value)))] as [string, unknown[]]
      ));
      await new Promise<void>((resolve, reject) => {
        const tx = target.transaction([...OFFLINE_STORES, 'migration_meta'], 'readwrite');
        for (const [store, values] of encryptedCopies) {
          const objectStore = tx.objectStore(store);
          for (const value of values) objectStore.put(value);
        }
        tx.objectStore('migration_meta').put({ key: 'legacy-v1', migratedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      await this.deleteLegacyDatabase();
    } else {
      await new Promise<void>((resolve, reject) => {
        const tx = target.transaction('migration_meta', 'readwrite');
        tx.objectStore('migration_meta').put({ key: 'legacy-v1', migratedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  }

  private deleteLegacyDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(LEGACY_DB_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Fermez les autres onglets Brave_her pour terminer la migration du stockage local.'));
    });
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
    const encryptedAction = await this.encryptRecord('sync_queue', newAction);

    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const req = store.add(encryptedAction);
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
        Promise.all((req.result as any[]).map((item) => this.decryptRecord<SyncQueueAction>(item)))
          .then((all) => resolve(all.filter((item) => item.statut === 'en_attente' || item.statut === 'erreur')))
          .catch(reject);
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

  async saveServerId(localId: string, serverId: string): Promise<void> {
    const db = await this.getDB();
    const encryptedMapping = await this.encryptRecord('local_id_map', { localId, serverId });
    return new Promise((resolve, reject) => {
      const tx = db.transaction('local_id_map', 'readwrite');
      tx.objectStore('local_id_map').put(encryptedMapping);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getServerId(localId: string): Promise<string | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction('local_id_map', 'readonly').objectStore('local_id_map').get(localId);
      req.onsuccess = () => {
        this.decryptRecord<{ serverId?: string }>(req.result).then((mapping) => resolve(mapping?.serverId), reject);
      };
      req.onerror = () => reject(req.error);
    });
  }
}

export const offlineStorage = new OfflineStorageService();
