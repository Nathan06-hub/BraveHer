import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  campaignApi,
  patientApi,
  evaluationApi,
  solidarityApi,
  partnerApi,
  syncApi,
} from '../services/api';
import { offlineStorage } from '../services/offlineStorage';

describe('Services API Domaine Métier (Modules 1 à 4)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Module 1 : campaignApi', () => {
    it('doit récupérer les campagnes avec fallback local en mode déconnecté', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
      const campagnes = await campaignApi.getCampagnes();
      expect(campagnes).toBeDefined();
      expect(Array.isArray(campagnes)).toBe(true);
    });

    it('doit envoyer un Push SMS avec accusé de réception simulé', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
      const res = await campaignApi.sendPushSms({
        campagneId: 'camp-1',
        message: 'Sensibilisation',
        langue: 'Mooré',
        commune: 'Ouagadougou',
        ciblesCount: 50,
      });
      expect(res.status).toBe('ENVOYE_ORANGE_API');
      expect(res.totalSent).toBe(50);
    });
  });

  describe('Module 2 : patientApi & evaluationApi', () => {
    it('doit enregistrer une patiente avec génération d\'identifiant et numéro de dossier', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
      const patiente = await patientApi.registerPatiente({
        nom: 'SANOGO',
        prenom: 'Mariam',
        age: 34,
        commune: 'Bobo-Dioulasso',
      });
      expect(patiente.id).toBeDefined();
      expect(patiente.numeroDossier).toContain('PAT-BF-2026-');
      expect(patiente.nom).toBe('SANOGO');
    });

    it('doit créer une évaluation clinique avec le score 15 pts', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
      const evaluation = await evaluationApi.createEvaluation({
        patienteId: 'pat-1',
        scoreIA: 85,
        pointsObtenus: 11,
        pointsMax: 15,
        niveauRisque: 'ELEVE',
      });
      expect(evaluation.id).toBeDefined();
      expect(evaluation.pointsObtenus).toBe(11);
      expect(evaluation.pointsMax).toBe(15);
      expect(evaluation.niveauRisque).toBe('ELEVE');
    });
  });

  describe('Module 4 : solidarityApi & partnerApi', () => {
    it('doit initialiser une demande d\'aide pour mammographie urgente', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
      const demande = await solidarityApi.createDemandeAide({
        patienteNom: 'KABORE',
        patientePrenom: 'Awa',
        coutEstime: 25000,
      });
      expect(demande.id).toBeDefined();
      expect(demande.codeDossier).toContain('MAMMO-2026-');
      expect(demande.statut).toBe('a_examiner');
    });

    it('doit simuler un webhook de don avec référence de transaction OM', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
      const don = await partnerApi.simulateWebhookDonation({
        partenaireNom: 'Fondation Orange BF',
        montant: 500000,
      });
      expect(don.statut).toBe('confirme');
      expect(don.montant).toBe(500000);
      expect(don.referenceTransaction).toContain('OM-WH-');
    });
  });

  describe('Module 3 : syncApi', () => {
    it('rejoue une action sur sa route d\'origine', async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
      vi.stubGlobal('fetch', fetchMock);
      const res = await syncApi.pushSyncBatch([
        {
          id: 'sync-1',
          typeAction: 'CREATE_PATIENT',
          endpoint: '/patientes',
          methode: 'POST',
          payload: { nom: 'Test' },
          dateCreation: new Date().toISOString(),
          statut: 'en_attente',
          tentatives: 0,
          entiteNom: 'Test Patient',
          description: 'Création',
        },
      ]);
      expect(res.totalTraite).toBe(1);
      expect(res.syncedIds).toContain('sync-1');
      expect(res.echecsIds).toEqual([]);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/patientes',
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ nom: 'Test' }) }),
      );
    });

    it('crée la patiente avant de rejouer son évaluation, même si la file est désordonnée', async () => {
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      const fetchMock = vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ id: patientId }), {
          status: 200, headers: { 'Content-Type': 'application/json' },
        }))
        .mockResolvedValueOnce(new Response('{}', {
          status: 200, headers: { 'Content-Type': 'application/json' },
        }));
      vi.stubGlobal('fetch', fetchMock);
      vi.spyOn(offlineStorage, 'getServerId').mockResolvedValue(undefined);
      vi.spyOn(offlineStorage, 'saveServerId').mockResolvedValue(undefined);
      const createdAt = new Date().toISOString();

      const result = await syncApi.pushSyncBatch([
        {
          id: 'evaluation', typeAction: 'SAVE_EVALUATION', endpoint: '/evaluations', methode: 'POST',
          payload: { patienteId: patientId }, dateCreation: createdAt, statut: 'en_attente', tentatives: 0,
          entiteNom: 'Évaluation', description: 'Évaluation clinique',
        },
        {
          id: 'patient', typeAction: 'CREATE_PATIENT', endpoint: '/patientes', methode: 'POST',
          payload: { id: patientId, nom: 'Test' }, dateCreation: createdAt, statut: 'en_attente', tentatives: 0,
          entiteNom: 'Test Patient', description: 'Création', localEntityId: patientId,
        },
      ]);

      expect(result.syncedIds).toEqual(['patient', 'evaluation']);
      expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/patientes');
      expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/evaluations');
      expect(fetchMock.mock.calls[1][1].body).toContain(patientId);
    });

    it('conserve les actions dont la requête échoue', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
      const res = await syncApi.pushSyncBatch([{
        id: 'sync-failed', typeAction: 'CREATE_PATIENT', endpoint: '/patientes', methode: 'POST',
        payload: { nom: 'Test' }, dateCreation: new Date().toISOString(), statut: 'en_attente',
        tentatives: 0, entiteNom: 'Test', description: 'Création',
      }]);
      expect(res.syncedIds).toEqual([]);
      expect(res.echecsIds).toContain('sync-failed');
    });
  });
});
