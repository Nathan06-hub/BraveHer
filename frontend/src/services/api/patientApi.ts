/**
 * Service API Patientes & Dossier Bénéficiaire (Module 2)
 * Soutien Rose Burkina Faso
 */

import { apiFetch } from './httpClient';
import type { Beneficiaire, StatutVulnerabilite } from '../../types/beneficiary';
import { MOCK_BENEFICIAIRES } from '../../data/mockBeneficiariesData';

export function normalizePatiente(item: any): Beneficiaire {
  const langueMap: Record<string, any> = {
    MOORE: 'Mooré',
    DIOULA: 'Dioula',
    FULFULDE: 'Fulfuldé',
    FRANCAIS: 'Français',
  };

  const statutVuln: StatutVulnerabilite = item.deplaceeInterne
    ? 'PDI'
    : item.vulnerable
    ? 'Vulnerable'
    : 'Standard';

  return {
    id: String(item.id || `pat-${Date.now()}`),
    numeroDossier: item.numeroDossier || item.codeAnonyme || `PAT-BF-2026-${String(item.id || '').substring(0, 4)}`,
    campagneId: item.campagneId,
    campagneNom: item.campagneNom,
    nom: item.nom || '',
    prenom: item.prenom || '',
    age: item.age || 0,
    telephone: item.telephone || '',
    languePreferee: langueMap[item.langue] || item.languePreferee || 'Mooré',
    canalPrefere: item.canalNotification || (item.utiliseWhatsApp ? 'WHATSAPP' : 'SMS'),
    commune: item.commune || 'Ouagadougou',
    secteur: item.secteur || item.region || 'Centre',
    statutVulnerabilite: item.statutVulnerabilite || statutVuln,
    centreSuiviId: item.centreSuiviId || (item.centreId ? String(item.centreId) : 'centre-1'),
    centreSuiviNom: item.centreSuiviNom || item.centreNom || 'CSPS de Tanghin',
    dateSensibilisation: item.dateSensibilisation || item.dateCreation || new Date().toISOString().split('T')[0],
    statutDepistage: item.statutDepistage || (item.dernierTriage || item.derniereEvaluation ? 'Effectué' : 'Effectué'),
    agentContactNom: item.agentContactNom || 'Sage-femme de garde',
    dernierTriage: item.dernierTriage,
    derniereEvaluation: item.derniereEvaluation,
  };
}

export const patientApi = {
  /**
   * Récupère la liste de toutes les patientes réelles depuis le backend
   */
  async getPatientes(): Promise<Beneficiaire[]> {
    const data = await apiFetch<any>('/patientes', {
      method: 'GET',
      fallbackData: MOCK_BENEFICIAIRES,
    });
    const list = Array.isArray(data)
      ? data
      : data && Array.isArray(data.content)
      ? data.content
      : MOCK_BENEFICIAIRES;
    return list.map(normalizePatiente);
  },

  /**
   * Récupère le dossier complet d'une patiente
   */
  async getPatienteById(id: string): Promise<Beneficiaire | undefined> {
    const res = await apiFetch<any>(`/patientes/${id}`, {
      method: 'GET',
      fallbackData: MOCK_BENEFICIAIRES.find((p) => p.id === id),
    });
    return res ? normalizePatiente(res) : undefined;
  },

  /**
   * Enregistre une nouvelle patiente dépistée (avec mise en file automatique si hors-ligne)
   */
  async registerPatiente(patiente: Partial<Beneficiaire>): Promise<Beneficiaire> {
    const fallbackPatiente: Beneficiaire = {
      ...(patiente as any),
      id: patiente.id || `pat-${Date.now()}`,
      numeroDossier: patiente.numeroDossier || `PAT-BF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      dateSensibilisation: patiente.dateSensibilisation || new Date().toISOString().split('T')[0],
      statutDepistage: patiente.statutDepistage || 'Effectué',
    };

    const res = await apiFetch<any>('/patientes', {
      method: 'POST',
      body: JSON.stringify({
        nom: patiente.nom,
        prenom: patiente.prenom,
        age: patiente.age,
        telephone: patiente.telephone,
        utiliseWhatsApp: patiente.canalPrefere === 'WHATSAPP',
        langue: patiente.languePreferee?.toUpperCase() === 'MOORÉ' ? 'MOORE' : patiente.languePreferee?.toUpperCase(),
        commune: patiente.commune,
        region: patiente.secteur,
        vulnerable: patiente.statutVulnerabilite === 'Vulnerable',
        deplaceeInterne: patiente.statutVulnerabilite === 'PDI',
        centreId: patiente.centreSuiviId,
      }),
      fallbackData: fallbackPatiente,
      syncQueueMetadata: {
        typeAction: 'CREATE_PATIENT',
        entiteNom: `${patiente.prenom || ''} ${patiente.nom || ''}`.trim() || 'Nouvelle Patiente',
        description: `Enregistrement patiente - ${patiente.commune || 'Burkina Faso'}`,
      },
    });

    return normalizePatiente(res);
  },

  /**
   * Met à jour le dossier clinique d'une patiente
   */
  async updatePatiente(id: string, updates: Partial<Beneficiaire>): Promise<Beneficiaire> {
    const existing = MOCK_BENEFICIAIRES.find((p) => p.id === id);
    const fallback = { ...(existing || {}), ...updates, id } as Beneficiaire;

    const res = await apiFetch<any>(`/patientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      fallbackData: fallback,
      syncQueueMetadata: {
        typeAction: 'CREATE_PATIENT',
        entiteNom: `${fallback.prenom || ''} ${fallback.nom || ''}`.trim(),
        description: `Mise à jour dossier patiente ${fallback.numeroDossier}`,
      },
    });

    return normalizePatiente(res);
  },
};
