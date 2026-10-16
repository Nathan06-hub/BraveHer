/**
 * Service API Patientes & Dossier Bénéficiaire (Module 2)
 * Connecté au Backend Spring Boot (PostgreSQL)
 * Soutien Rose Burkina Faso
 */

import { apiFetch } from './httpClient';
import type { Beneficiaire, StatutVulnerabilite } from '../../types/beneficiary';
<<<<<<< HEAD
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

function normalizePatiente(raw: any): Beneficiaire {
  if (!raw) return raw;

  const langueMap: Record<string, LanguePatiente> = {
    MOORE: 'Mooré',
    DIOULA: 'Dioula',
    FULFULDE: 'Fulfuldé',
    FRANCAIS: 'Français',
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
    id: String(raw.id),
    numeroDossier: raw.codeAnonyme || raw.numeroDossier || `PAT-${String(raw.id).slice(0, 8).toUpperCase()}`,
    nom: raw.nom || '',
    prenom: raw.prenom || '',
    age: Number(raw.age) || 35,
    telephone: raw.telephone || '',
    languePreferee,
    canalPrefere: raw.utiliseWhatsApp ? 'WHATSAPP' : raw.canalNotification || 'SMS',
    commune: raw.commune || 'Ouagadougou',
    secteur: raw.secteur || raw.region || 'Centre',
    statutVulnerabilite,
    centreSuiviId: String(raw.centreId || ''),
    centreSuiviNom: raw.centreNom || 'Centre de Santé',
    dateSensibilisation: raw.dateSensibilisation || new Date().toISOString().split('T')[0],
    statutDepistage: raw.statutDepistage || 'Effectué',
    agentContactNom: raw.agentContactNom || 'Agent de Santé',
    dernierTriage: raw.dernierTriage,
    derniereEvaluation: raw.derniereEvaluation,
    evaluations: Array.isArray(raw.evaluations) ? raw.evaluations : [],
    demandeAideId: raw.demandeAideId,
    demandeAideCode: raw.demandeAideCode,
    statutAideFonds: raw.statutAideFonds,
    historiqueExamens: Array.isArray(raw.historiqueExamens) ? raw.historiqueExamens : [],
  };
}
=======
import { MOCK_BENEFICIAIRES } from '../../data/mockBeneficiariesData';
>>>>>>> omai/dev

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
<<<<<<< HEAD
   * Récupère la liste de toutes les patientes réelles depuis le Backend Spring Boot
=======
   * Récupère la liste de toutes les patientes réelles depuis le backend
>>>>>>> omai/dev
   */
  async getPatientes(): Promise<Beneficiaire[]> {
    const data = await apiFetch<any>('/patientes', {
      method: 'GET',
      fallbackData: [],
    });
<<<<<<< HEAD

=======
>>>>>>> omai/dev
    const list = Array.isArray(data)
      ? data
      : data && Array.isArray(data.content)
      ? data.content
<<<<<<< HEAD
      : [];

=======
      : MOCK_BENEFICIAIRES;
>>>>>>> omai/dev
    return list.map(normalizePatiente);
  },

  /**
   * Récupère le dossier complet d'une patiente par son ID
   */
  async getPatienteById(id: string): Promise<Beneficiaire | undefined> {
<<<<<<< HEAD
    const raw = await apiFetch<any>(`/patientes/${id}`, {
=======
    const res = await apiFetch<any>(`/patientes/${id}`, {
>>>>>>> omai/dev
      method: 'GET',
      fallbackData: undefined,
    });
<<<<<<< HEAD
    return raw ? normalizePatiente(raw) : undefined;
=======
    return res ? normalizePatiente(res) : undefined;
>>>>>>> omai/dev
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

<<<<<<< HEAD
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
=======
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
>>>>>>> omai/dev
      fallbackData: fallbackPatiente,
      syncQueueMetadata: {
        typeAction: 'CREATE_PATIENT',
        entiteNom: `${patiente.prenom || ''} ${patiente.nom || ''}`.trim() || 'Nouvelle Patiente',
        description: `Enregistrement patiente - ${patiente.commune || 'Burkina Faso'}`,
      },
    });

<<<<<<< HEAD
    return normalizePatiente(res || fallbackPatiente);
=======
    return normalizePatiente(res);
>>>>>>> omai/dev
  },

  /**
   * Met à jour le dossier clinique d'une patiente
   */
  async updatePatiente(id: string, updates: Partial<Beneficiaire>): Promise<Beneficiaire> {
<<<<<<< HEAD
=======
    const existing = MOCK_BENEFICIAIRES.find((p) => p.id === id);
    const fallback = { ...(existing || {}), ...updates, id } as Beneficiaire;

>>>>>>> omai/dev
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

<<<<<<< HEAD
    return normalizePatiente(res || { ...updates, id });
=======
    return normalizePatiente(res);
>>>>>>> omai/dev
  },
};
