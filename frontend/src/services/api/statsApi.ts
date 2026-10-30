/**
 * Service API Statistiques & Pilotage Épidémiologique (Ministère & CSPS)
 * Brave_her Burkina Faso
 */

import { apiFetch } from './httpClient';

export interface DashboardStats {
  totalPatientes: number;
  totalEvaluations: number;
  totalCasEleves: number;
  totalCasModeres: number;
  totalCasFaibles: number;
  totalBonsEmis: number;
  totalBonsUtilises: number;
  totalSmsEnvoyes: number;
  totalWhatsAppEnvoyes: number;
  totalFondsDisponiblesXof: number;
}

export interface HeatmapPoint {
  commune: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  totalEvaluations: number;
  casEleves: number;
  casModeres: number;
  casFaibles: number;
  tauxSuspicionElevee: number;
}

export const statsApi = {
  /**
   * Récupère les statistiques réelles consolidées depuis Spring Boot
   */
  async getDashboard(): Promise<DashboardStats> {
    return apiFetch<DashboardStats>('/stats/dashboard', {
      method: 'GET',
      fallbackData: {
        totalPatientes: 0,
        totalEvaluations: 0,
        totalCasEleves: 0,
        totalCasModeres: 0,
        totalCasFaibles: 0,
        totalBonsEmis: 0,
        totalBonsUtilises: 0,
        totalSmsEnvoyes: 0,
        totalWhatsAppEnvoyes: 0,
        totalFondsDisponiblesXof: 0,
      },
    });
  },

  /**
   * Récupère les points géographiques réels de dépistage pour la cartographie
   */
  async getHeatmap(): Promise<HeatmapPoint[]> {
    return apiFetch<HeatmapPoint[]>('/stats/heatmap', {
      method: 'GET',
      fallbackData: [],
    });
  },
};
export default statsApi;
