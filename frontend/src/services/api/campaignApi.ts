/**
 * Service API Campagnes & SMS Orange (Module 1)
 * Soutien Rose Burkina Faso
 */

import { apiFetch } from './httpClient';
import type { Campagne, SmsLog } from '../../types/campaign';
import { MOCK_CAMPAGNES } from '../../data/mockCampaignData';

export const campaignApi = {
  /**
   * Récupère la liste de toutes les campagnes de sensibilisation
   */
  async getCampagnes(): Promise<Campagne[]> {
    return apiFetch<Campagne[]>('/campagnes', {
      method: 'GET',
      fallbackData: MOCK_CAMPAGNES,
    });
  },

  /**
   * Récupère une campagne par son identifiant
   */
  async getCampagneById(id: string): Promise<Campagne | undefined> {
    return apiFetch<Campagne>(`/campagnes/${id}`, {
      method: 'GET',
      fallbackData: MOCK_CAMPAGNES.find((c) => c.id === id),
    });
  },

  /**
   * Crée une nouvelle campagne
   */
  async createCampagne(campagne: Partial<Campagne>): Promise<Campagne> {
    const fallbackCampagne: Campagne = {
      ...(campagne as any),
      id: campagne.id || `camp-${Date.now()}`,
      statut: campagne.statut || 'BROUILLON',
      totalSmsEnvoyes: campagne.totalSmsEnvoyes || 0,
      personnesSensibiliseesIds: campagne.personnesSensibiliseesIds || [],
      dateCreation: new Date().toISOString().split('T')[0],
      historique: [
        {
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          auteurNom: campagne.creeParNom || 'Agent de santé',
          auteurRole: 'Coordinateur',
          action: 'creation',
          commentaire: 'Campagne initialisée',
        },
      ],
    };

    return apiFetch<Campagne>('/campagnes', {
      method: 'POST',
      body: JSON.stringify(campagne),
      fallbackData: fallbackCampagne,
      syncQueueMetadata: {
        typeAction: 'CREATE_CAMPAIGN',
        entiteNom: campagne.titre || campagne.nom || 'Campagne de sensibilisation',
        description: `Création de campagne à ${campagne.commune || 'Burkina Faso'}`,
      },
    });
  },

  /**
   * Met à jour une campagne existante
   */
  async updateCampagne(id: string, updates: Partial<Campagne>): Promise<Campagne> {
    const existing = MOCK_CAMPAGNES.find((c) => c.id === id);
    const fallback = { ...(existing || {}), ...updates, id } as Campagne;

    return apiFetch<Campagne>(`/campagnes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      fallbackData: fallback,
    });
  },

  /**
   * Envoie une diffusion de SMS de sensibilisation via la Passerelle Orange SMS API
   */
  async sendPushSms(payload: {
    campagneId: string;
    message: string;
    langue: string;
    commune: string;
    ciblesCount: number;
  }): Promise<{ status: string; totalSent: number; messageId: string }> {
    return apiFetch('/sms/push', {
      method: 'POST',
      body: JSON.stringify(payload),
      fallbackData: {
        status: 'ENVOYE_ORANGE_API',
        totalSent: payload.ciblesCount || 150,
        messageId: `sms-orange-${Date.now()}`,
      },
    });
  },

  /**
   * Récupère l'historique des SMS envoyés
   */
  async getSmsLogs(): Promise<SmsLog[]> {
    return apiFetch<SmsLog[]>('/sms/logs', {
      method: 'GET',
      fallbackData: [],
    });
  },
};
