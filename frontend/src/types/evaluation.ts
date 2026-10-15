// Types pour l'entité Evaluation & Triage IA
// Conforme au Diagramme de Classes Mermaid & Cahier des Charges Soutien Rose Burkina Faso

export type NiveauRisque = 'FAIBLE' | 'MODERE' | 'ELEVE';

export interface AutresIndicateursEvaluation {
  seinConcerne?: 'gauche' | 'droit' | 'bilateral' | 'aucun';
  quadrant?:
    | 'supero_externe'
    | 'supero_interne'
    | 'infero_externe'
    | 'infero_interne'
    | 'retro_areolaire'
    | 'aucun';
  consistanceNodule?: 'dur_adherent' | 'ferme' | 'mobile_elastique' | 'aucun';
  tailleNoduleCm?: number;
  ecoulementMamelonnaire?: boolean;
  typeEcoulement?: 'sanglant' | 'sereux' | 'purulent' | 'aucun';
  retractionCutanee?: boolean;
  adenopathieAxillaire?: boolean;
  douleurMammaire?: boolean;
  antecedentsFamiliaux?: boolean;
  modificationTailleForme?: boolean; // Grille officielle : Asymétrie récente (+2 pts)
  agePatiente?: number; // Grille officielle : Âge >= 40 ans (+1 pt)
  observationsVocales?: string;
  [key: string]: any;
}

export interface Evaluation {
  id: string;
  dateEvaluation: string; // ISO DateTime
  patienteId?: string;
  patienteNom?: string;
  utilisateurId?: string;
  utilisateurNom?: string;
  // Attributs officiels du diagramme Mermaid
  nodule: boolean;
  peauOrange: boolean;
  autresIndicateurs: AutresIndicateursEvaluation;
  scoreIA: number; // 0 à 100
  niveauRisque: NiveauRisque;
  conduiteATenir: string;
  // Métadonnées & liaisons du diagramme
  bonSanteDeclenche?: boolean;
  dicteeVocaleUtilisee?: boolean;
  pointsObtenus?: number; // 0 à 15 points de la grille officielle
  pointsMax?: number; // 15
}

// Entité DicteeVocale conforme au Diagramme de classes Mermaid
export interface DicteeVocale {
  id: string;
  fichierAudio?: string;
  texteTranscrit: string;
  dateCreation: string; // ISO DateTime
}

export interface ElementBaremeOfficiel {
  symptome: string;
  poids: number;
  justification: string;
  detecte: boolean;
}

export interface ResultatScoreEvaluation {
  pointsObtenus: number; // 0 à 15 points
  pointsMax: number; // 15
  scoreIA: number; // 0 à 100% normalisé
  niveauRisque: NiveauRisque;
  conduiteATenir: string;
  alerteBonSante: boolean;
  detailsBareme: ElementBaremeOfficiel[];
}

/**
 * Méthode métier calculerScore() du diagramme Mermaid pour Evaluation
 * Conforme STRICTEMENT à la Grille Officielle Médicale (WhatsApp Image 2026-10-15) :
 * 1. Nodule au sein : +3 pts (Signe majeur suspect)
 * 2. Peau d'orange ou rétraction : +3 pts (Signe fort d'invasion cutanée)
 * 3. Écoulement mamelonnaire : +2 pts (Écoulement séreux ou hémorragique suspect)
 * 4. Adénopathie axillaire : +2 pts (Atteinte ganglionnaire sous l'aisselle)
 * 5. Modification de taille/forme : +2 pts (Asymétrie récente)
 * 6. Antécédents familiaux : +1 pt (Facteur de prédisposition génétique)
 * 7. Âge >= 40 ans : +1 pt (Pic d'incidence statistique)
 * 8. Douleur persistante : +1 pt (Mastodynie non cyclique)
 * Total Max = 15 points
 */
export function calculerScoreEvaluation(
  nodule: boolean,
  peauOrange: boolean,
  autres: AutresIndicateursEvaluation
): ResultatScoreEvaluation {
  // 1. Nodule au sein (+3)
  const isNodule = Boolean(nodule);

  // 2. Peau d'orange ou rétraction (+3)
  const isPeauOrangeOuRetraction = Boolean(peauOrange || autres.retractionCutanee);

  // 3. Écoulement mamelonnaire (+2)
  const isEcoulement = Boolean(autres.ecoulementMamelonnaire);

  // 4. Adénopathie axillaire (+2)
  const isAdenopathie = Boolean(autres.adenopathieAxillaire);

  // 5. Modification de taille/forme (+2)
  const isModifTailleForme = Boolean(autres.modificationTailleForme);

  // 6. Antécédents familiaux (+1)
  const isAntecedents = Boolean(autres.antecedentsFamiliaux);

  // 7. Âge >= 40 ans (+1)
  const isAgeSuperieurOuEgal40 = Boolean(autres.agePatiente !== undefined && autres.agePatiente >= 40);

  // 8. Douleur persistante (+1)
  const isDouleur = Boolean(autres.douleurMammaire);

  // Grille détaillée officielle
  const detailsBareme: ElementBaremeOfficiel[] = [
    {
      symptome: 'Nodule au sein',
      poids: 3,
      justification: 'Signe majeur suspect',
      detecte: isNodule,
    },
    {
      symptome: 'Peau d’orange ou rétraction',
      poids: 3,
      justification: 'Signe fort d’invasion cutanée',
      detecte: isPeauOrangeOuRetraction,
    },
    {
      symptome: 'Écoulement mamelonnaire',
      poids: 2,
      justification: 'Écoulement séreux ou hémorragique suspect',
      detecte: isEcoulement,
    },
    {
      symptome: 'Adénopathie axillaire',
      poids: 2,
      justification: 'Atteinte ganglionnaire sous l’aisselle',
      detecte: isAdenopathie,
    },
    {
      symptome: 'Modification de taille/forme',
      poids: 2,
      justification: 'Asymétrie récente',
      detecte: isModifTailleForme,
    },
    {
      symptome: 'Antécédents familiaux',
      poids: 1,
      justification: 'Facteur de prédisposition génétique',
      detecte: isAntecedents,
    },
    {
      symptome: 'Âge >= 40 ans',
      poids: 1,
      justification: 'Pic d’incidence statistique',
      detecte: isAgeSuperieurOuEgal40,
    },
    {
      symptome: 'Douleur persistante',
      poids: 1,
      justification: 'Mastodynie non cyclique',
      detecte: isDouleur,
    },
  ];

  // Calcul direct de la somme des points (Max = 15)
  const pointsObtenus = detailsBareme.reduce(
    (sum, item) => sum + (item.detecte ? item.poids : 0),
    0
  );
  const pointsMax = 15;

  // Calcul du score IA normalisé en pourcentage (0 - 100%)
  const scoreIA = Math.min(100, Math.round((pointsObtenus / pointsMax) * 100));

  // Décision clinique sénologique selon le barème officiel :
  // >= 5 points (>= 33%) ou présence simultanée nodule (+3) + signe cutané (+3) = ELEVE
  // 3 à 4 points = MODERE
  // 0 à 2 points = FAIBLE
  if (pointsObtenus >= 5 || (isNodule && isPeauOrangeOuRetraction)) {
    return {
      pointsObtenus,
      pointsMax,
      scoreIA: Math.max(scoreIA, 70), // Affichage >= 70% pour concordance avec le seuil d'urgence
      niveauRisque: 'ELEVE',
      conduiteATenir:
        'Forte suspicion clinique (équivalent ACR 4/5). Mammographie diagnostique urgente sous 72h avec échographie et orientation prioritaire au CHU.',
      alerteBonSante: true,
      detailsBareme,
    };
  } else if (pointsObtenus >= 3) {
    return {
      pointsObtenus,
      pointsMax,
      scoreIA: Math.max(Math.min(scoreIA, 68), 35), // Plage 35-68% pour MODERE
      niveauRisque: 'MODERE',
      conduiteATenir:
        'Lésion suspecte ou nodule d’allure bénigne avec facteurs de risque (équivalent ACR 3). Échographie mammaire et bilan de contrôle sous 15 à 30 jours.',
      alerteBonSante: false,
      detailsBareme,
    };
  } else {
    return {
      pointsObtenus,
      pointsMax,
      scoreIA: Math.min(scoreIA, 30), // Plage 0-30% pour FAIBLE
      niveauRisque: 'FAIBLE',
      conduiteATenir:
        'Examen clinique rassurant (équivalent ACR 1/2). Poursuite de l’auto-palpation mensuelle et contrôle clinique de routine l’année prochaine.',
      alerteBonSante: false,
      detailsBareme,
    };
  }
}
