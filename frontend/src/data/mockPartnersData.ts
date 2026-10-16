/**
 * Données du Module Partenariats, Parrainage & Mécénat
 * Toutes les données fictives ont été purgées.
 * Les partenaires et transactions proviennent désormais exclusivement du Backend PostgreSQL.
 */

import type {
  PartenaireDonneur,
  DonTransaction,
  AppelAideCasGrave,
} from '../types/partner';
import type { BonSante, FondsParrainage } from '../types/solidarity';

export const MOCK_FONDS_PARRAINAGE: FondsParrainage[] = [];
export const MOCK_PARTENAIRES: PartenaireDonneur[] = [];
export const MOCK_DONS_TRANSACTIONS: DonTransaction[] = [];
export const MOCK_APPELS_AIDE_CAS_GRAVES: AppelAideCasGrave[] = [];
export const MOCK_BONS_SANTE: BonSante[] = [];
