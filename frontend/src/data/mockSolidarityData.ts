/**
 * Données du Module 4 : Solidarité et Pilotage Statistique
 * Toutes les fausses demandes d'aide et faux compteurs ont été purgés.
 * Les demandes réelles proviennent du Backend PostgreSQL.
 */

import type {
  DemandeAide,
  FondsSolidariteSummary,
  IndicateurZoneBF,
  CentreImagerie,
} from '../types/solidarity';

import {
  CENTRES_IMAGERIE_BF,
  INDICATEURS_REGIONS_BF,
} from './referentials';

// Référentiels réels réexportés
export const MOCK_CENTRES_IMAGERIE: CentreImagerie[] = CENTRES_IMAGERIE_BF;
export const MOCK_INDICATEURS_REGIONS_BF: IndicateurZoneBF[] = INDICATEURS_REGIONS_BF;

// Synthèse financière réelle initialisée à zéro
export const MOCK_FONDS_SOLIDARITE: FondsSolidariteSummary = {
  dotationTotale: 0,
  montantEngage: 0,
  montantDisponible: 0,
  nombreDemandesTotal: 0,
  nombreAidesAttribuees: 0,
  nombreExamensRealises: 0,
  demandesEnAttente: 0,
};

// Demandes d'aides réelles (démarrage à vide)
export const MOCK_DEMANDES_AIDE: DemandeAide[] = [];
