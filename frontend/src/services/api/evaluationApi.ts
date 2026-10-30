/**
 * Service API Évaluations Cliniques & Moteur Score de triage (Module 2)
 * Brave_her Burkina Faso
 */

import { apiFetch } from './httpClient';
import type { Evaluation } from '../../types/evaluation';

export const evaluationApi = {
  /**
   * Enregistre une nouvelle évaluation clinique avec score de triage (Barème officiel 15 pts)
   */
  async createEvaluation(evaluation: Partial<Evaluation>): Promise<Evaluation> {
    const fallbackEvaluation: Evaluation = {
      ...(evaluation as any),
      id: evaluation.id || `eval-${Date.now()}`,
      dateEvaluation: evaluation.dateEvaluation || new Date().toISOString(),
      scoreIA: evaluation.scoreIA ?? 0,
      pointsObtenus: evaluation.pointsObtenus ?? 0,
      pointsMax: evaluation.pointsMax ?? 15,
      niveauRisque: evaluation.niveauRisque || 'FAIBLE',
      conduiteATenir: evaluation.conduiteATenir || 'Examen clinique de routine et auto-palpation',
      nodule: evaluation.nodule ?? false,
      peauOrange: evaluation.peauOrange ?? false,
      autresIndicateurs: evaluation.autresIndicateurs || {},
    };

    return apiFetch<Evaluation>('/evaluations', {
      method: 'POST',
      body: JSON.stringify(evaluation),
      fallbackData: fallbackEvaluation,
      syncQueueMetadata: {
        typeAction: 'SAVE_EVALUATION',
        entiteNom: `Évaluation ${fallbackEvaluation.id}`,
        description: `Triage médical - Risque ${fallbackEvaluation.niveauRisque} (${fallbackEvaluation.pointsObtenus}/15 pts)`,
      },
    });
  },

  /**
   * Récupère toutes les évaluations associées à une patiente
   */
  async getEvaluationsByPatiente(patienteId: string): Promise<Evaluation[]> {
    return apiFetch<Evaluation[]>(`/evaluations/patiente/${patienteId}`, {
      method: 'GET',
      fallbackData: [],
    });
  },

  /**
   * Récupère une évaluation par son identifiant
   */
  async getEvaluationById(id: string): Promise<Evaluation | undefined> {
    return apiFetch<Evaluation>(`/evaluations/${id}`, {
      method: 'GET',
      fallbackData: undefined,
    });
  },
};
