// Types pour le Module 1 : Gestion des campagnes de sensibilisation
import type { Evaluation } from './evaluation';

export type UserRole = 'admin' | 'responsable' | 'agent' | 'AGENT_SANTE' | 'SAGE_FEMME' | 'ADMIN';

// Statuts officiels du diagramme : BROUILLON, PLANIFIEE, EN_COURS, TERMINEE
export type StatutCampagne =
  | 'BROUILLON'
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'TERMINEE'
  | 'brouillon'
  | 'en_attente'
  | 'a_corriger'
  | 'approuvee'
  | 'refusee'
  | 'en_cours'
  | 'terminee';

export const ALL_STATUTS_CAMPAGNE: StatutCampagne[] = [
  'BROUILLON',
  'PLANIFIEE',
  'EN_COURS',
  'TERMINEE',
  'brouillon',
  'en_attente',
  'a_corriger',
  'approuvee',
  'refusee',
  'en_cours',
  'terminee',
];

export type LanguePatiente = 'Mooré' | 'Dioula' | 'Fulfuldé' | 'Français' | 'Autre';

export const ALL_LANGUES_PATIENTES: LanguePatiente[] = [
  'Mooré',
  'Dioula',
  'Fulfuldé',
  'Français',
  'Autre',
];

// Énumération StatutSms du diagramme
export type StatutSms = 'ENVOYE' | 'ECHEC';

// Types de ciblage démographique pour les diffusions SMS Orange
export type GenreCible = 'FEMMES_UNIQUEMENT' | 'TOUS_PUBLICS';
export type TrancheAgeCible = '15-25' | '25-49' | '50+' | 'TOUTES';

// Types de messages Push SMS
export type TypeMessageSms =
  | 'PUSH_CAMPAGNE'
  | 'RELANCE_POST_CAMPAGNE'
  | 'RAPPEL_AGE_AUTOPALPATION'
  | 'ALERTE_IMMEDIATE';

// Entité SmsLog du diagramme : journalisation des Push SMS Orange
export interface SmsLog {
  id: string;
  campagneId?: string;
  campagneTitre?: string;
  patienteId?: string;
  destinataireNom?: string;
  destinataireTelephone: string;
  langue: LanguePatiente;
  contenu: string;
  dateEnvoi: string; // DateTime ISO
  statut: StatutSms;
  motifEchec?: string;
  operateur?: string;
  typeMessage?: TypeMessageSms;
  ageCible?: number;
}

// Règle d'automatisation récurrente par tranche d'âge (cycle de vie / prévention continue)
export interface RegleAutomatisationAge {
  id: string;
  nom: string;
  description: string;
  ageMin: number;
  ageMax: number;
  frequence: 'MENSUEL' | 'TRIMESTRIEL' | 'SEMESTRIEL' | 'ANNUEL';
  jourDuMois: number; // Ex: 1 pour le 1er du mois
  actif: boolean;
  messages: {
    moore: string;
    dioula: string;
    fulfulde: string;
    francais: string;
  };
  totalEnvoyes: number;
  derniereExecution?: string;
  prochaineExecution: string;
}

export interface CentreSante {
  id: string;
  nom: string;
  commune: string;
  region: string;
  secteur?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
}

export interface AgentSante {
  id: string;
  nom: string;
  prenom: string;
  roleFonction:
    | 'Sage-femme'
    | 'Médecin-chef'
    | 'Médecin généraliste'
    | 'Infirmier d’État'
    | 'Agent de santé communautaire';
  centreId: string;
  centreNom: string;
  telephone: string;
  email: string;
  avatarUrl?: string;
}

export interface PersonneSensibilisee {
  id: string;
  campagneId: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  languePreferee: LanguePatiente;
  commune: string;
  secteur: string;
  dateSensibilisation: string; // YYYY-MM-DD
  statutDepistage: 'Planifié' | 'Effectué' | 'À orienter' | 'Refusé';
  agentContactNom: string;
  observations?: string;
  derniereEvaluation?: Evaluation;
  evaluations?: Evaluation[];
}

export interface HistoriqueValidation {
  date: string;
  auteurNom: string;
  auteurRole: string;
  action:
    | 'creation'
    | 'soumission'
    | 'approbation'
    | 'rejet'
    | 'demande_correction'
    | 'modification';
  commentaire?: string;
}

// Entité Campagne conforme au diagramme de classes (avec titre, secteurCible, message)
export interface Campagne {
  id: string;
  titre: string; // Selon diagramme
  nom: string; // Alias rétro-compatible
  description: string;
  commune: string; // Commune burkinabè
  secteurCible: string; // Selon diagramme
  secteurs: string[]; // Liste des secteurs
  message: string; // Selon diagramme & Cahier des charges (Push SMS Orange)
  messageLangues?: {
    moore?: string;
    dioula?: string;
    fulfulde?: string;
    francais?: string;
  };
  dateDebut: string; // YYYY-MM-DD
  dateFin: string; // YYYY-MM-DD
  horaires: string; // Ex: "08:00 - 15:30"
  centreId: string;
  centreNom: string;
  statut: StatutCampagne;
  creeParId: string;
  creeParNom: string;
  dateCreation: string;
  agentsMobilisesIds: string[];
  motifValidation?: string;
  historique: HistoriqueValidation[];
  objectifFemmes: number;
  personnesSensibiliseesIds?: string[];
  totalSmsEnvoyes?: number;
  activerPushSms?: boolean;
  genreCible?: GenreCible;
  trancheAgeCible?: TrancheAgeCible;
  activerRelancesPostCampagne?: boolean;
}

export interface CurrentUserContext {
  id: string;
  nom: string;
  prenom: string;
  role: UserRole;
  roleTitre: string;
  centreId: string;
  centreNom: string;
}
