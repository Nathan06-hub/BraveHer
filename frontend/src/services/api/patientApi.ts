/**
 * Service API Patientes & Dossier Bénéficiaire (Module 2)
 * Connecté au Backend Spring Boot (PostgreSQL)
 * Soutien Rose Burkina Faso
 */

import { apiFetch } from './httpClient';
import type { Beneficiaire, StatutVulnerabilite } from '../../types/beneficiary';
import type { LanguePatiente } from '../../types/campaign';

const isUuid = (str?: string) =>
  typeof str === 'string' &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

const determineRegion = (commune?: string): string => {
  if (!commune) return 'Centre';
  const c = commune.toLowerCase();
  if (c.includes('ouaga')) return 'Centre';
  if (c.includes('bobo')) return 'Hauts-Bassins';
  if (c.includes('koudougou')) return 'Centre-Ouest';
  if (c.includes('ouahigouya')) return 'Nord';
  if (c.includes('kaya')) return 'Centre-Nord';
  if (c.includes('fada')) return 'Est';
  if (c.includes('banfora')) return 'Cascades';
  if (c.includes('dori') || c.includes('djibo')) return 'Sahel';
  if (c.includes('tenkodogo')) return 'Centre-Est';
  if (c.includes('dedougou') || c.includes('dédougou')) return 'Boucle du Mouhoun';
  if (c.includes('manga')) return 'Centre-Sud';
  if (c.includes('gaoua')) return 'Sud-Ouest';
  if (c.includes('ziniare') || c.includes('ziniaré')) return 'Plateau-Central';
  return 'Centre';
};

const mapLangueToBackendEnum = (lang?: string): 'MOORE' | 'DIOULA' | 'FULFULDE' | 'FRANCAIS' => {
  if (!lang) return 'MOORE';
  const l = lang.toLowerCase();
  if (l.includes('dioula')) return 'DIOULA';
  if (l.includes('ful') || l.includes('peul')) return 'FULFULDE';
  if (l.includes('fran')) return 'FRANCAIS';
  return 'MOORE';
};

export function normalizePatiente(raw: any): Beneficiaire {
  if (!raw) return raw;

  const langueMap: Record<string, LanguePatiente> = {
    MOORE: 'Mooré',
    DIOULA: 'Dioula',
    FULFULDE: 'Fulfuldé',
    FRANCAIS: 'Français',
    'Mooré': 'Mooré',
    'Dioula': 'Dioula',
    'Fulfuldé': 'Fulfuldé',
    'Français': 'Français',
  };
  const languePreferee = (langueMap[raw.langue] || raw.languePreferee || 'Mooré') as LanguePatiente;

  let statutVulnerabilite: StatutVulnerabilite = 'Standard';
  if (raw.deplaceeInterne) {
    statutVulnerabilite = 'PDI';
  } else if (raw.vulnerable) {
    statutVulnerabilite = 'Vulnerable';
  } else if (raw.statutVulnerabilite) {
    statutVulnerabilite = raw.statutVulnerabilite;
  }

  return {
    id: String(raw.id || `pat-${Date.now()}`),
    numeroDossier: raw.codeAnonyme || raw.numeroDossier || `PAT-BF-2026-${String(raw.id || '').substring(0, 4)}`,
    campagneId: raw.campagneId,
    campagneNom: raw.campagneNom,
    nom: raw.nom || '',
    prenom: raw.prenom || '',
    age: Number(raw.age) || 35,
    telephone: raw.telephone || '',
    languePreferee,
    canalPrefere: raw.canalNotification || (raw.utiliseWhatsApp ? 'WHATSAPP' : 'SMS'),
    commune: raw.commune || 'Ouagadougou',
    secteur: raw.secteur || raw.region || 'Centre',
    statutVulnerabilite,
    centreSuiviId: String(raw.centreSuiviId || raw.centreId || ''),
    centreSuiviNom: raw.centreSuiviNom || raw.centreNom || 'CSPS de Tanghin',
    dateSensibilisation: raw.dateSensibilisation || raw.dateCreation || new Date().toISOString().split('T')[0],
    statutDepistage: raw.statutDepistage || (raw.dernierTriage || raw.derniereEvaluation ? 'Effectué' : 'Effectué'),
    agentContactNom: raw.agentContactNom || 'Sage-femme de garde',
    dernierTriage: raw.dernierTriage,
    derniereEvaluation: raw.derniereEvaluation,
    evaluations: Array.isArray(raw.evaluations) ? raw.evaluations : [],
    demandeAideId: raw.demandeAideId,
    demandeAideCode: raw.demandeAideCode,
    statutAideFonds: raw.statutAideFonds,
    historiqueExamens: Array.isArray(raw.historiqueExamens) ? raw.historiqueExamens : [],
  };
}

export const patientApi = {
  /**
   * Récupère la liste de toutes les patientes réelles depuis le Backend Spring Boot
   */
  async getPatientes(): Promise<Beneficiaire[]> {
    const data = await apiFetch<any>('/patientes', {
      method: 'GET',
      fallbackData: [],
    });
    const list = Array.isArray(data)
      ? data
      : data && Array.isArray(data.content)
      ? data.content
      : [];
    return list.map(normalizePatiente);
  },

  /**
   * Récupère le dossier complet d'une patiente par son ID
   */
  async getPatienteById(id: string): Promise<Beneficiaire | undefined> {
    const raw = await apiFetch<any>(`/patientes/${id}`, {
      method: 'GET',
      fallbackData: undefined,
    });
    return raw ? normalizePatiente(raw) : undefined;
  },

  /**
   * Enregistre une nouvelle patiente dans PostgreSQL (avec support offline-first)
   */
  async registerPatiente(patiente: Partial<Beneficiaire>): Promise<Beneficiaire> {
    const fallbackPatiente: Beneficiaire = {
      ...(patiente as any),
      id: patiente.id || `pat-${Date.now()}`,
      numeroDossier:
        patiente.numeroDossier ||
        `PAT-BF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      dateSensibilisation:
        patiente.dateSensibilisation || new Date().toISOString().split('T')[0],
      statutDepistage: patiente.statutDepistage || 'Effectué',
      statutVulnerabilite: patiente.statutVulnerabilite || 'Standard',
    };

    const isVulnerable =
      patiente.statutVulnerabilite === 'Vulnerable' ||
      patiente.statutVulnerabilite === 'PDI';
    const isPdi = patiente.statutVulnerabilite === 'PDI';

    const payload = {
      nom: patiente.nom || '',
      prenom: patiente.prenom || '',
      age: Number(patiente.age) || 35,
      telephone: patiente.telephone || '',
      utiliseWhatsApp: patiente.canalPrefere === 'WHATSAPP',
      langue: mapLangueToBackendEnum(patiente.languePreferee),
      commune: patiente.commune || 'Ouagadougou',
      region: determineRegion(patiente.commune),
      vulnerable: isVulnerable,
      deplaceeInterne: isPdi,
      centreId: isUuid(patiente.centreSuiviId) ? patiente.centreSuiviId : undefined,
    };

    const res = await apiFetch<any>('/patientes', {
      method: 'POST',
      body: JSON.stringify(payload),
      fallbackData: fallbackPatiente,
      syncQueueMetadata: {
        typeAction: 'CREATE_PATIENT',
        entiteNom: `${patiente.prenom || ''} ${patiente.nom || ''}`.trim() || 'Nouvelle Patiente',
        description: `Enregistrement patiente - ${patiente.commune || 'Burkina Faso'}`,
      },
    });

    return normalizePatiente(res || fallbackPatiente);
  },

  /**
   * Met à jour le dossier clinique d'une patiente
   */
  async updatePatiente(id: string, updates: Partial<Beneficiaire>): Promise<Beneficiaire> {
    const res = await apiFetch<any>(`/patientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      fallbackData: { ...updates, id },
      syncQueueMetadata: {
        typeAction: 'CREATE_PATIENT',
        entiteNom: `${updates.prenom || ''} ${updates.nom || ''}`.trim() || 'Patiente',
        description: `Mise à jour dossier patiente ${id}`,
      },
    });

    return normalizePatiente(res || { ...updates, id });
  },
};
