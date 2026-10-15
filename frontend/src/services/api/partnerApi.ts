/**
 * Service API Partenaires, Parrainage & Simulateur Webhooks (Module 4)
 * Soutien Rose Burkina Faso
 */

import { apiFetch } from './httpClient';
import type { PartenaireDonneur, DonTransaction, AppelAideCasGrave } from '../../types/partner';
import { MOCK_PARTENAIRES, MOCK_APPELS_AIDE_CAS_GRAVES, MOCK_DONS_TRANSACTIONS } from '../../data/mockPartnersData';

export const partnerApi = {
  /**
   * Récupère la liste des partenaires institutionnels et entreprises marraines
   */
  async getPartenaires(): Promise<PartenaireDonneur[]> {
    return apiFetch<PartenaireDonneur[]>('/partners', {
      method: 'GET',
      fallbackData: MOCK_PARTENAIRES,
    });
  },

  /**
   * Récupère la liste des appels à l'aide pour cas graves
   */
  async getAppelsAide(): Promise<AppelAideCasGrave[]> {
    return apiFetch<AppelAideCasGrave[]>('/partners/appels-aide', {
      method: 'GET',
      fallbackData: MOCK_APPELS_AIDE_CAS_GRAVES,
    });
  },

  /**
   * Transmet un appel à l'aide / dossier de parrainage à un partenaire
   */
  async sendPartnerAidAppeal(appealData: Partial<AppelAideCasGrave>): Promise<AppelAideCasGrave> {
    const fallback: AppelAideCasGrave = {
      ...(appealData as any),
      id: appealData.id || `appel-${Date.now()}`,
      codeDossier: appealData.codeDossier || `SOL-URG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patienteId: appealData.patienteId || 'pat-1',
      patienteCodeAnonymise: appealData.patienteCodeAnonymise || 'PAT-BF-OUAGA-42',
      patienteAge: appealData.patienteAge || 38,
      commune: appealData.commune || 'Ouagadougou',
      region: appealData.region || 'Centre',
      statutVulnerabilite: appealData.statutVulnerabilite || 'Vulnérabilité confirmée',
      centreDemandeurNom: appealData.centreDemandeurNom || 'CSPS Schiphra',
      scoreIA: appealData.scoreIA ?? 85,
      niveauRisque: appealData.niveauRisque || 'ELEVE',
      descriptionMedicale: appealData.descriptionMedicale || 'Suspicion clinique majeure, nodule fixe adhérent',
      montantNecessaire: appealData.montantNecessaire || 25000,
      partenaireCibleId: appealData.partenaireCibleId || 'part-1',
      partenaireCibleNom: appealData.partenaireCibleNom || 'Fondation Orange Burkina Faso',
      messageAccompagnement: appealData.messageAccompagnement || 'Demande de parrainage solidaire',
      dateEnvoi: appealData.dateEnvoi || new Date().toISOString(),
      statut: appealData.statut || 'emis',
    };

    return apiFetch<AppelAideCasGrave>('/partners/appels-aide', {
      method: 'POST',
      body: JSON.stringify(appealData),
      fallbackData: fallback,
      syncQueueMetadata: {
        typeAction: 'CREATE_AID_REQUEST',
        entiteNom: `Appel Partenaire ${fallback.patienteCodeAnonymise}`,
        description: `Appel à l'aide transmis à ${fallback.partenaireCibleNom}`,
      },
    });
  },

  /**
   * Récupère l'historique des transactions de dons
   */
  async getDonTransactions(): Promise<DonTransaction[]> {
    return apiFetch<DonTransaction[]>('/partners/donations', {
      method: 'GET',
      fallbackData: MOCK_DONS_TRANSACTIONS,
    });
  },

  /**
   * Simule la réception d'un webhook entrant de don (ex. Orange Money B2W, Coris Bank)
   */
  async simulateWebhookDonation(webhookPayload: Partial<DonTransaction>): Promise<DonTransaction> {
    const fallback: DonTransaction = {
      id: `don-${Date.now()}`,
      partenaireId: webhookPayload.partenaireId || 'part-1',
      partenaireNom: webhookPayload.partenaireNom || 'Fondation Orange Burkina Faso',
      montant: webhookPayload.montant || 1000000,
      typeDon: webhookPayload.typeDon || 'api_automatique',
      referenceTransaction: webhookPayload.referenceTransaction || `OM-WH-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      statut: 'confirme',
      affectation: webhookPayload.affectation || 'fonds_general',
      messagePartenaire: webhookPayload.messagePartenaire || 'Don via Webhook Orange Money',
    };

    return apiFetch<DonTransaction>('/partners/donations/webhook', {
      method: 'POST',
      body: JSON.stringify(webhookPayload),
      fallbackData: fallback,
      syncQueueMetadata: {
        typeAction: 'DONATION_PROCESSED',
        entiteNom: `Don Webhook ${fallback.referenceTransaction}`,
        description: `Crédit de ${fallback.montant} FCFA par ${fallback.partenaireNom}`,
      },
    });
  },
};
