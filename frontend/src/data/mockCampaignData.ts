/**
 * Données réelles du Module 1 (Campagnes de sensibilisation)
 * Toutes les données fictives ont été purgées.
 * Les campagnes, centres et personnes proviennent désormais du Backend PostgreSQL.
 */

import type {
  Campagne,
  CentreSante,
  AgentSante,
  PersonneSensibilisee,
  SmsLog,
  RegleAutomatisationAge,
} from '../types/campaign';

import {
  COMMUNES_BF,
  REGLES_AUTOMATISATION_AGE_SYSTEME,
} from './referentials';

export { COMMUNES_BF };

// Données purgées : les listes débutent vides et sont alimentées par l'API Spring Boot
export const MOCK_CENTRES: CentreSante[] = [];
export const MOCK_AGENTS: AgentSante[] = [];
export const MOCK_PERSONNES_SENSIBILISEES: PersonneSensibilisee[] = [];
export const MOCK_CAMPAGNES: Campagne[] = [];
export const MOCK_SMS_LOGS: SmsLog[] = [];
export const MOCK_REGLES_AUTOMATISATION_AGE: RegleAutomatisationAge[] = REGLES_AUTOMATISATION_AGE_SYSTEME;
