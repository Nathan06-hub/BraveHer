import type { Beneficiaire, BeneficiairesKPIs } from '../types/beneficiary';

/**
 * Données mockées des bénéficiaires purgées.
 * Les données des patientes proviennent désormais exclusivement du Backend PostgreSQL (/api/patientes).
 */
export const MOCK_BENEFICIAIRES: Beneficiaire[] = [];

export const MOCK_BENEFICIAIRES_KPIS: BeneficiairesKPIs = {
  totalPatientes: 0,
  depistagesEffectues: 0,
  casRisqueEleve: 0,
  casRisqueModere: 0,
  femmesPdiOuVulnerables: 0,
  aidesAttribueesCount: 0,
};
