// Types pour la gestion des Partenaires, Dons et Parrainage des Cas Graves
// Conforme au Diagramme de Classes Mermaid & Cahier des Charges Soutien Rose BFK (Module 4)

import type { NiveauRisque } from './evaluation';

export type CategoriePartenaire =
  | 'telecom_fondation' // Ex: Fondation Orange Burkina Faso
  | 'banque_finance' // Ex: Coris Bank International
  | 'ong_internationale' // Ex: UNICEF / OMS
  | 'institution_etat' // Ex: Ministère de la Santé
  | 'entreprise_privee'; // Ex: Société minière ou privée burkinabè

export type StatutApiPartenaire = 'connecte' | 'en_attente' | 'desactive';

export type TypeDon =
  | 'api_automatique' // Webhook / API Orange Money Corporate
  | 'virement_bancaire'
  | 'orange_money_b2b'
  | 'subvention_directe';

export type StatutDon = 'confirme' | 'en_traitement' | 'rejete';

export type StatutAppelAide =
  | 'emis' // Envoyé au partenaire
  | 'consulte_par_partenaire'
  | 'parraine' // Accepté par le partenaire
  | 'declenche_bon' // Bon de santé émis
  | 'decline';

export interface PartenaireDonneur {
  id: string;
  nom: string;
  sigle: string;
  categorie: CategoriePartenaire;
  logoUrl?: string;
  description: string;
  totalDonsVerses: number; // En FCFA
  soldeDisponible: number; // En FCFA
  nombrePatientesParrainees: number;
  contactNom: string;
  contactEmail: string;
  contactTelephone: string;
  statutApi: StatutApiPartenaire;
  apiEndpoint?: string;
  apiKeyPrefix?: string;
  conventionActive: boolean;
  datePartenariat: string;
  fondsRattacheId?: string;
}

export interface DonTransaction {
  id: string;
  partenaireId: string;
  partenaireNom: string;
  montant: number; // En FCFA
  date: string; // ISO DateTime
  typeDon: TypeDon;
  referenceTransaction: string; // Ex: "API-OM-CORP-2026-98124"
  statut: StatutDon;
  affectation: 'fonds_general' | 'cas_graves_specifiques' | 'octobre_rose_campagne';
  messagePartenaire?: string;
  payloadApi?: {
    event?: string;
    partnerId?: string;
    amount?: number;
    currency?: string;
    channel?: string;
    timestamp?: string;
    signature?: string;
    [key: string]: any;
  };
}

export interface AppelAideCasGrave {
  id: string;
  codeDossier: string; // Ex: "SOL-URG-2026-0042"
  patienteId: string;
  patienteCodeAnonymise: string; // Ex: "PAT-BF-KAYA-42"
  patienteAge: number;
  commune: string;
  region: string;
  statutVulnerabilite: string;
  centreDemandeurNom: string;
  scoreIA: number; // 0 à 100 (ex: 85%)
  niveauRisque: NiveauRisque; // Toujours 'ELEVE' pour cas graves
  descriptionMedicale: string; // Anonymisé : masse rétro-aréolaire adhérente, adénopathie, urgence 72h
  montantNecessaire: number; // 25 000 FCFA (mammographie) ou 50 000 FCFA (bilan sénologique complet)
  partenaireCibleId: string;
  partenaireCibleNom: string;
  messageAccompagnement: string;
  dateEnvoi: string;
  statut: StatutAppelAide;
  bonSanteGenereId?: string;
  bonSanteCode?: string;
  dateReponsePartenaire?: string;
  reponseCommentaire?: string;
}
