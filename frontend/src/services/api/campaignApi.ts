/**
 * Service API Campagnes & SMS Orange (Module 1)
 * Soutien Rose Burkina Faso
 */

import { apiFetch } from './httpClient';
import type { Campagne, SmsLog, StatutCampagne } from '../../types/campaign';
import { MOCK_CAMPAGNES } from '../../data/mockCampaignData';

function normalizeCampagne(raw: any): Campagne {
  if (!raw) return raw;
  const statutMap: Record<string, StatutCampagne> = {
    'EN_COURS': 'en_cours',
    'PLANIFIEE': 'PLANIFIEE',
    'TERMINEE': 'terminee',
    'CLOTUREE': 'terminee',
    'ANNULEE': 'terminee',
    'BROUILLON': 'brouillon',
    'EN_ATTENTE': 'en_attente',
  };
  const statut = (statutMap[raw.statut] || (typeof raw.statut === 'string' ? raw.statut.toLowerCase() : 'en_cours')) as StatutCampagne;

  return {
    ...raw,
    id: String(raw.id),
    titre: raw.titre || raw.nom || 'Campagne de sensibilisation',
    nom: raw.nom || raw.titre || 'Campagne de sensibilisation',
    description: raw.description || raw.message || 'Sensibilisation et dépistage précoce du cancer du sein.',
    message: raw.message || raw.description || '',
    commune: raw.commune || 'Ouagadougou',
    secteurCible: raw.secteurCible || raw.region || 'Secteur Central',
    secteurs: Array.isArray(raw.secteurs) && raw.secteurs.length ? raw.secteurs : [raw.secteurCible || raw.region || 'Secteur Central'],
    dateDebut: raw.dateDebut || new Date().toISOString().split('T')[0],
    dateFin: raw.dateFin || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    horaires: raw.horaires || '08:00 - 15:30',
    centreId: String(raw.centreId || ''),
    centreNom: raw.centreNom || 'CSPS de Tanghin',
    statut,
    creeParId: String(raw.planifieParId || raw.creeParId || 'agent-1'),
    creeParNom: raw.planifieParNom || raw.creeParNom || 'Awa Ouédraogo',
    dateCreation: raw.dateCreation || raw.dateDebut || new Date().toISOString().split('T')[0],
    agentsMobilisesIds: Array.isArray(raw.agentsMobilisesIds) ? raw.agentsMobilisesIds : ['agent-1', 'agent-2'],
    historique: Array.isArray(raw.historique) ? raw.historique : [],
    objectifFemmes: raw.objectifFemmes || 150,
    personnesSensibiliseesIds: Array.isArray(raw.personnesSensibiliseesIds) ? raw.personnesSensibiliseesIds : [],
    totalSmsEnvoyes: raw.totalSmsEnvoyes || 0,
    activerPushSms: raw.activerPushSms ?? false,
    activerRelancesPostCampagne: raw.activerRelancesPostCampagne ?? false,
  };
}

export const campaignApi = {
  /**
   * Récupère la liste de toutes les campagnes de sensibilisation réelles depuis le Backend Spring Boot
   */
  async getCampagnes(): Promise<Campagne[]> {
    const data = await apiFetch<any>('/campagnes', {
      method: 'GET',
      fallbackData: MOCK_CAMPAGNES,
    });
    const list = Array.isArray(data)
      ? data
      : data?.content && Array.isArray(data.content)
      ? data.content
      : [];
    return list.map(normalizeCampagne);
  },

  /**
   * Récupère une campagne par son identifiant
   */
  async getCampagneById(id: string): Promise<Campagne | undefined> {
    const data = await apiFetch<any>(`/campagnes/${id}`, {
      method: 'GET',
      fallbackData: undefined,
    });
    return data ? normalizeCampagne(data) : undefined;
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

    // Détermination d'une région burkinabè valide conforme au backend Spring Boot
    const determineRegion = (commune?: string, secteur?: string): string => {
      const c = (commune || '').toLowerCase();
      const s = (secteur || '').toLowerCase();
      if (c.includes('bobo') || c.includes('dioulasso') || s.includes('bobo')) return 'Hauts-Bassins';
      if (c.includes('koudougou') || s.includes('koudougou')) return 'Centre-Ouest';
      if (c.includes('ouahigouya') || s.includes('ouahigouya')) return 'Nord';
      if (c.includes('fada') || s.includes('fada')) return 'Est';
      if (c.includes('kaya') || s.includes('kaya')) return 'Centre-Nord';
      if (c.includes('banfora') || s.includes('banfora')) return 'Cascades';
      if (c.includes('dori') || s.includes('dori')) return 'Sahel';
      if (c.includes('tenkodogo') || s.includes('tenkodogo')) return 'Centre-Est';
      if (c.includes('dedougou') || c.includes('dédougou')) return 'Boucle du Mouhoun';
      if (c.includes('manga')) return 'Centre-Sud';
      if (c.includes('gaoua')) return 'Sud-Ouest';
      if (c.includes('ziniare') || c.includes('ziniaré')) return 'Plateau-Central';
      return 'Centre'; // Par défaut : Région du Centre
    };

    const isUuid = (str?: string) =>
      typeof str === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

    const payload = {
      titre: campagne.titre || campagne.nom || 'Campagne de sensibilisation',
      message: campagne.message || campagne.description || 'Dépistage précoce gratuit du cancer du sein avec Soutien Rose.',
      region: determineRegion(campagne.commune, campagne.secteurCible),
      commune: campagne.commune || 'Ouagadougou',
      langueCible: 'FRANCAIS',
      dateDebut: campagne.dateDebut || new Date().toISOString().split('T')[0],
      dateFin: campagne.dateFin || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      centreId: isUuid(campagne.centreId) ? campagne.centreId : undefined,
    };

    const res = await apiFetch<any>('/campagnes', {
      method: 'POST',
      body: JSON.stringify(payload),
      fallbackData: fallbackCampagne,
      syncQueueMetadata: {
        typeAction: 'CREATE_CAMPAIGN',
        entiteNom: campagne.titre || campagne.nom || 'Campagne de sensibilisation',
        description: `Création de campagne à ${campagne.commune || 'Burkina Faso'}`,
      },
    });

    return normalizeCampagne(res || fallbackCampagne);
  },

  /**
   * Met à jour une campagne existante
   */
  async updateCampagne(id: string, updates: Partial<Campagne>): Promise<Campagne> {
    const fallback = { ...updates, id } as Campagne;

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
    const data = await apiFetch<any>('/sms/logs', {
      method: 'GET',
      fallbackData: [],
    });
    const list = Array.isArray(data)
      ? data
      : data?.content && Array.isArray(data.content)
      ? data.content
      : [];

    return list.map((item: any) => ({
      id: String(item.id || `sms-${Date.now()}`),
      campagneId: item.campagneId,
      campagneTitre: item.campagneTitre || 'Octobre Rose 2026 — Kadiogo',
      destinataireTelephone: item.destinataire || item.destinataireTelephone || '',
      destinataireNom: item.patienteNom ? `${item.patientePrenom || ''} ${item.patienteNom}`.trim() : 'Patiente',
      langue: item.langue || 'Mooré',
      canal: item.canal || 'SMS',
      statut: item.statut || 'ENVOYE',
      dateEnvoi: item.dateEnvoi ? new Date(item.dateEnvoi).toLocaleDateString('fr-FR') : 'Aujourd\'hui',
      heureEnvoi: item.dateEnvoi ? new Date(item.dateEnvoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '10:00',
      messageApercu: item.contenu || item.messageApercu || '',
      mediaUrl: item.mediaUrl,
    }));
  },
};
