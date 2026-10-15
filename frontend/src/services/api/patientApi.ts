/**
 * Service API Patientes & Dossier Bénéficiaire (Module 2)
 * Soutien Rose Burkina Faso
 */

import { apiFetch } from './httpClient';
import type { Beneficiaire } from '../../types/beneficiary';
import { MOCK_BENEFICIAIRES } from '../../data/mockBeneficiariesData';

export const patientApi = {
  /**
   * Récupère la liste de toutes les patientes
   */
  async getPatientes(): Promise<Beneficiaire[]> {
    return apiFetch<Beneficiaire[]>('/patientes', {
      method: 'GET',
      fallbackData: MOCK_BENEFICIAIRES,
    });
  },

  /**
   * Récupère le dossier complet d'une patiente
   */
  async getPatienteById(id: string): Promise<Beneficiaire | undefined> {
    return apiFetch<Beneficiaire>(`/patientes/${id}`, {
      method: 'GET',
      fallbackData: MOCK_BENEFICIAIRES.find((p) => p.id === id),
    });
  },

  /**
   * Enregistre une nouvelle patiente dépistée (avec mise en file automatique si hors-ligne)
   */
  async registerPatiente(patiente: Partial<Beneficiaire>): Promise<Beneficiaire> {
    const fallbackPatiente: Beneficiaire = {
      ...(patiente as any),
      id: patiente.id || `pat-${Date.now()}`,
      numeroDossier: patiente.numeroDossier || `PAT-BF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      dateSensibilisation: patiente.dateSensibilisation || new Date().toISOString().split('T')[0],
      statutDepistage: patiente.statutDepistage || 'Effectué',
    };

    return apiFetch<Beneficiaire>('/patientes', {
      method: 'POST',
      body: JSON.stringify(patiente),
      fallbackData: fallbackPatiente,
      syncQueueMetadata: {
        typeAction: 'CREATE_PATIENT',
        entiteNom: `${patiente.prenom || ''} ${patiente.nom || ''}`.trim() || 'Nouvelle Patiente',
        description: `Enregistrement patiente - ${patiente.commune || 'Burkina Faso'}`,
      },
    });
  },

  /**
   * Met à jour le dossier clinique d'une patiente
   */
  async updatePatiente(id: string, updates: Partial<Beneficiaire>): Promise<Beneficiaire> {
    const existing = MOCK_BENEFICIAIRES.find((p) => p.id === id);
    const fallback = { ...(existing || {}), ...updates, id } as Beneficiaire;

    return apiFetch<Beneficiaire>(`/patientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      fallbackData: fallback,
      syncQueueMetadata: {
        typeAction: 'CREATE_PATIENT',
        entiteNom: `${fallback.prenom || ''} ${fallback.nom || ''}`.trim(),
        description: `Mise à jour dossier patiente ${fallback.numeroDossier}`,
      },
    });
  },
};
