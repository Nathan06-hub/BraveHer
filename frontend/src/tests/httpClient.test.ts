import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch, checkBackendHealth, API_BASE_URL } from '../services/api/httpClient';

describe('Client HTTP & Résilience Hybride (httpClient.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('doit définir l\'URL de base par défaut vers /api/v1', () => {
    expect(API_BASE_URL).toBe('/api/v1');
  });

  it('doit retourner le fallbackData quand le backend est éteint sans propager d\'erreur fatale', async () => {
    // Simule une erreur réseau "Connection refused"
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));

    const fallback = [{ id: 'mock-1', nom: 'Campagne Rurale Test' }];
    const result = await apiFetch('/campagnes', {
      method: 'GET',
      fallbackData: fallback,
    });

    expect(result).toEqual(fallback);
  });

  it('doit renvoyer les données du backend si le statut HTTP est 200 OK', async () => {
    const mockData = { message: 'Succès Spring Boot' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      })
    );

    const result = await apiFetch('/test-endpoint');
    expect(result).toEqual(mockData);
  });

  it('doit détecter proprement l\'inaccessibilité du backend lors d\'un health check', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

    const health = await checkBackendHealth(500);
    expect(health.online).toBe(false);
    expect(health.error).toBeDefined();
  });
});
