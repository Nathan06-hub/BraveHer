// Types pour le Module 4 : Solidarité et Pilotage Statistique
// Soutien Rose Burkina Faso

export type StatutAide =
  | 'a_examiner'
  | 'en_attente_decision'
  | 'approuvee'
  | 'refusee'
  | 'aide_attribuee'
  | 'examen_realise';

export const ALL_STATUTS_AIDE: StatutAide[] = [
  'a_examiner',
  'en_attente_decision',
  'approuvee',
  'refusee',
  'aide_attribuee',
  'examen_realise',
];

export type NiveauPriorite = 'urgent' | 'eleve' | 'standard';

export const ALL_PRIORITES: NiveauPriorite[] = ['urgent', 'eleve', 'standard'];

export type StatutPaiementOM = 'a_effectuer' | 'en_cours' | 'reussi' | 'echoue';

export interface TransactionOrangeMoney {
  id: string;
  reference: string; // Ex: "OM-BF-2026-92814"
  montant: number; // Montant en FCFA
  date: string;
  destinataireNom: string; // Ex: "Service Radiologie - CHU Yalgado"
  destinataireCompte: string; // Numéro marchand ou compte Orange Money
  statut: StatutPaiementOM;
  codeAutorisation: string;
  fraisTransaction?: number;
}

export interface DemandeAide {
  id: string;
  codeDossier: string; // Ex: "AIDE-2026-0042"
  patienteId: string;
  patienteNom: string;
  patientePrenom: string;
  patienteAge: number;
  patienteTelephone: string;
  patienteLangue: string; // Mooré, Dioula, Fulfuldé, Français
  commune: string;
  secteur: string;
  centreDemandeurId: string;
  centreDemandeurNom: string;
  centreImagerieId: string;
  centreImagerieNom: string;
  motifClinique: string;
  niveauPriorite: NiveauPriorite;
  coutEstime: number; // En FCFA (ex: 25 000 FCFA)
  montantAccorde: number; // En FCFA
  statut: StatutAide;
  dateDemande: string;
  agentDemandeurNom: string;
  agentDemandeurId: string;
  // Sponsor & Parrainage Partenaire (Module 4 & Diagramme Mermaid)
  partenaireSponsorId?: string;
  partenaireSponsorNom?: string;
  estParrainageCible?: boolean;
  // Décision médicale et financière
  responsableValidationNom?: string;
  dateDecision?: string;
  commentaireValidation?: string;
  motifRefus?: string;
  // Paiement Orange Money
  transactionOM?: TransactionOrangeMoney;
  // Suivi de l'examen
  dateExamen?: string;
  centreExamenNom?: string;
  compteRenduExamen?: string;
}

// Statuts officiels du BonSante du Diagramme Mermaid : EMI, UTILISE, EXPIRE
export type StatutBon = 'EMI' | 'UTILISE' | 'EXPIRE';

// Entité BonSante conforme au Diagramme de classes Mermaid
export interface BonSante {
  id: string;
  codeUnique: string; // Ex: "BON-OM-2026-0042"
  patienteId?: string;
  patienteNom?: string;
  montantPrisEnCharge: number; // 25 000 FCFA
  statut: StatutBon;
  dateTimeEmission: string; // ISO DateTime
  dateTimeUtilisation?: string;
  fondsParrainageId?: string;
  partenaireSponsorNom?: string;
  centreImagerieNom?: string;
}

// Entité FondsParrainage conforme au Diagramme de classes Mermaid
export interface FondsParrainage {
  id: string;
  nom: string;
  sponsor: string; // Nom du Partenaire Donneur
  soldeFCFA: number;
}

export interface FondsSolidariteSummary {
  dotationTotale: number; // Ex: 15 000 000 FCFA
  montantEngage: number; // Ex: 8 450 000 FCFA
  montantDisponible: number; // Ex: 6 550 000 FCFA
  nombreDemandesTotal: number;
  nombreAidesAttribuees: number;
  nombreExamensRealises: number;
  demandesEnAttente: number;
}

export interface IndicateurZoneBF {
  regionId: string;
  regionNom: string;
  chefLieu: string;
  femmesSensibilisees: number;
  depistagesRealises: number;
  casSuspicionElevee: number;
  demandesAideDeposees: number;
  aidesAttribuees: number;
  examensRealises: number;
  tauxCouverture: number; // en %
  niveauRisque: 'faible' | 'modere' | 'eleve' | 'critique';
}

export interface CentreImagerie {
  id: string;
  nom: string;
  commune: string;
  telephone: string;
  compteOrangeMoney: string;
  tarifStandardFCFA: number;
  delaiMoyenJours: number;
}
