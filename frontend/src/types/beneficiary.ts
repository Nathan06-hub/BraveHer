// Types pour le Module Bénéficiaires & Patientes
// Module 2 : Triage Intelligent par IA & Diagnostic Assisté
// Module 3 : Inclusivité & Continuité de Service
// Soutien Rose Burkina Faso

import type { LanguePatiente } from './campaign';
import type { Evaluation } from './evaluation';


export type StatutDepistage = 'Planifié' | 'Effectué' | 'À orienter' | 'Refusé';

export type StatutVulnerabilite = 'PDI' | 'Vulnerable' | 'Standard';

// Énumération CanalCommunication conforme au Diagramme Mermaid
export type CanalCommunication = 'SMS' | 'WHATSAPP';

export type NiveauSuspicion = 'non_evalue' | 'faible' | 'modere' | 'eleve';

export type QuadrantSein =
  | 'supero_externe'
  | 'supero_interne'
  | 'infero_externe'
  | 'infero_interne'
  | 'retro_areolaire'
  | 'aucun';

export interface ExamenCliniqueDetails {
  id: string;
  dateExamen: string;
  soignantNom: string;
  soignantRole: string;
  seinConcerne: 'gauche' | 'droit' | 'bilateral' | 'aucun';
  quadrant: QuadrantSein;
  nodulePalpable: boolean;
  consistanceNodule: 'dur_adherent' | 'ferme' | 'mobile_elastique' | 'aucun';
  tailleNoduleCm?: number;
  ecoulementMamelonnaire: boolean;
  typeEcoulement?: 'sanglant' | 'sereux' | 'purulent' | 'aucun';
  retractionCutanee: boolean;
  peauOrange: boolean;
  adenopathieAxillaire: boolean;
  antecedentsFamiliauxCancer: boolean;
  douleurMammaire: boolean;
  modificationTailleForme?: boolean; // Critère officiel : Asymétrie récente (+2 pts)
  pointsObtenus?: number; // 0 à 15 points
  // Module 2 : Dictée vocale Speech-to-Text
  observationsVocales?: string;
  // Calculateur de risque IA
  scoreCalcule: number; // 0 à 100
  niveauSuspicion: NiveauSuspicion;
  conduiteATenir: string;
  besoinMammographieUrgence: boolean;
}

export interface Beneficiaire {
  id: string;
  numeroDossier: string; // Ex: "PAT-BF-2026-0042"
  campagneId?: string;
  campagneNom?: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  languePreferee: LanguePatiente;
  canalPrefere?: CanalCommunication;
  commune: string;
  secteur: string;
  statutVulnerabilite: StatutVulnerabilite;
  centreSuiviId: string;
  centreSuiviNom: string;
  dateSensibilisation: string;
  statutDepistage: StatutDepistage;
  agentContactNom: string;
  // Données de triage clinique & Évaluation Mermaid officielle
  dernierTriage?: ExamenCliniqueDetails;
  derniereEvaluation?: Evaluation;
  evaluations?: Evaluation[];
  // Passerelle vers Module 4 (Solidarité Orange Money)
  demandeAideId?: string;
  demandeAideCode?: string;
  statutAideFonds?: string;
  historiqueExamens?: ExamenCliniqueDetails[];
}

export interface BeneficiairesKPIs {
  totalPatientes: number;
  depistagesEffectues: number;
  casRisqueEleve: number;
  casRisqueModere: number;
  femmesPdiOuVulnerables: number;
  aidesAttribueesCount: number;
}
