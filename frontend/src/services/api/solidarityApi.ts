/**
 * Service API Solidarité, Bons de Santé & Orange Money (Module 4)
 * Soutien Rose Burkina Faso
 */

import { apiFetch } from './httpClient';
import type { DemandeAide, FondsSolidariteSummary, BonSante } from '../../types/solidarity';

const EMPTY_FONDS_SUMMARY: FondsSolidariteSummary = {
  dotationTotale: 0,
  montantEngage: 0,
  montantDisponible: 0,
  nombreDemandesTotal: 0,
  nombreAidesAttribuees: 0,
  nombreExamensRealises: 0,
  demandesEnAttente: 0,
};

export const solidarityApi = {
  /**
   * Récupère la liste de toutes les demandes de prise en charge solidaire
   */
  async getDemandesAide(): Promise<DemandeAide[]> {
    const data = await apiFetch<any>('/demandes-aide', {
      method: 'GET',
      fallbackData: [],
    });
    return Array.isArray(data) ? data : data?.content || [];
  },

  /**
   * Récupère la synthèse financière du fonds de solidarité
   */
  async getFondsSummary(): Promise<FondsSolidariteSummary> {
    return apiFetch<FondsSolidariteSummary>('/fonds/summary', {
      method: 'GET',
      fallbackData: EMPTY_FONDS_SUMMARY,
    });
  },

  /**
   * Crée une nouvelle demande d'aide pour une patiente à risque élevé
   */
  async createDemandeAide(demande: Partial<DemandeAide>): Promise<DemandeAide> {
    const fallback: DemandeAide = {
      ...(demande as any),
      id: demande.id || `aide-${Date.now()}`,
      codeDossier: demande.codeDossier || `MAMMO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      dateDemande: demande.dateDemande || new Date().toISOString().split('T')[0],
      statut: demande.statut || 'a_examiner',
      coutEstime: demande.coutEstime || 25000,
      montantAccorde: demande.montantAccorde || 25000,
      patienteId: demande.patienteId || 'pat-1',
      patienteNom: demande.patienteNom || 'Kaboré',
      patientePrenom: demande.patientePrenom || 'Awa',
      patienteAge: demande.patienteAge || 40,
      patienteTelephone: demande.patienteTelephone || '+226 70 00 00 00',
      patienteLangue: demande.patienteLangue || 'Mooré',
      commune: demande.commune || 'Ouagadougou',
      secteur: demande.secteur || 'Secteur 22',
      centreDemandeurId: demande.centreDemandeurId || 'centre-1',
      centreDemandeurNom: demande.centreDemandeurNom || 'CSPS Schiphra',
      centreImagerieId: demande.centreImagerieId || 'img-1',
      centreImagerieNom: demande.centreImagerieNom || 'Service Radiologie CHU Yalgado',
      motifClinique: demande.motifClinique || 'Nodule suspect avec score élevé',
      niveauPriorite: demande.niveauPriorite || 'urgent',
      agentDemandeurNom: demande.agentDemandeurNom || 'Agent de Santé',
    };

    return apiFetch<DemandeAide>('/demandes-aide', {
      method: 'POST',
      body: JSON.stringify(demande),
      fallbackData: fallback,
      syncQueueMetadata: {
        typeAction: 'CREATE_AID_REQUEST',
        entiteNom: `${demande.patientePrenom || ''} ${demande.patienteNom || ''}`.trim() || 'Demande de Prise en Charge',
        description: `Demande de bon solidaire ${fallback.codeDossier} (${fallback.coutEstime} FCFA)`,
      },
    });
  },

  /**
   * Valide ou refuse une demande d'aide (Commission médicale)
   */
  async validateDemandeAide(
    id: string,
    decision: { statut: DemandeAide['statut']; montantAccorde?: number }
  ): Promise<DemandeAide> {
    const fallback: DemandeAide = {
      ...decision,
      id,
    } as DemandeAide;

    return apiFetch<DemandeAide>(`/demandes-aide/${id}/decision`, {
      method: 'PATCH',
      body: JSON.stringify(decision),
      fallbackData: fallback,
    });
  },

  /**
   * Déclenche le versement direct du bon de santé via l'API Orange Money B2W
   */
  async executeOrangeMoneyPayment(payload: {
    demandeId: string;
    centreImagerieCompteOM: string;
    montantFCFA: number;
    beneficiaireRef: string;
  }): Promise<{ status: string; referenceTransaction: string; dateTransaction: string }> {
    return apiFetch('/orange-money/pay', {
      method: 'POST',
      body: JSON.stringify(payload),
      fallbackData: {
        status: 'PAIEMENT_ORANGE_MONEY_CONFIRME',
        referenceTransaction: `OM-BFK-${Date.now().toString().slice(-8)}`,
        dateTransaction: new Date().toISOString(),
      },
      syncQueueMetadata: {
        typeAction: 'DONATION_PROCESSED',
        entiteNom: `Paiement Orange Money ${payload.beneficiaireRef}`,
        description: `Règlement de ${payload.montantFCFA} FCFA au centre d'imagerie`,
      },
    });
  },

  /**
   * Récupère la liste des bons de santé émis
   */
  async getBonsSante(): Promise<BonSante[]> {
    return apiFetch<BonSante[]>('/bons-sante', {
      method: 'GET',
      fallbackData: [],
    });
  },
};
