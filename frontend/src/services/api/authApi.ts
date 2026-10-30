/**
 * Service d'authentification connecté au Backend Spring Boot (port 8084 via proxy Vite)
 * Plateforme Brave_her Burkina Faso
 */

import type { CurrentUserContext, UserRole } from '../../types/campaign';

export interface BackendUser {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  role: 'ADMIN' | 'SAGE_FEMME' | 'AGENT_SANTE' | 'MINISTERE';
  centreId: string | null;
  centreNom: string | null;
}

export interface LoginResponse {
  token: string;
  type: string;
  expiresIn: number;
  utilisateur: BackendUser;
}

/**
 * Mappe l'utilisateur renvoyé par l'API backend vers le contexte frontend CurrentUserContext
 */
export function mapBackendUserToContext(u: BackendUser): CurrentUserContext {
  const roleMapping: Record<
    string,
    { role: UserRole; roleTitre: string }
  > = {
    ADMIN: {
      role: 'admin',
      roleTitre: 'Administrateur National de Santé',
    },
    SAGE_FEMME: {
      role: 'responsable',
      roleTitre: 'Sage-femme / Responsable clinique',
    },
    AGENT_SANTE: {
      role: 'agent',
      roleTitre: 'Agent de santé communautaire',
    },
    MINISTERE: {
      role: 'admin',
      roleTitre: 'Représentant Ministère de la Santé',
    },
  };

  const mapped = roleMapping[u.role] || {
    role: 'agent' as UserRole,
    roleTitre: u.role,
  };

  return {
    id: u.id,
    nom: u.nom,
    prenom: u.prenom,
    role: mapped.role,
    roleTitre: mapped.roleTitre,
    centreId: u.centreId || 'coordination-nationale',
    centreNom: u.centreNom || 'Coordination Nationale (Ouagadougou)',
  };
}

export const authApi = {
  /**
   * Connexion avec identifiant (email ou téléphone) et mot de passe
   */
  async login(identifiant: string, motDePasse: string): Promise<LoginResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        identifiant: identifiant.trim(),
        motDePasse,
      }),
    });

    if (!res.ok) {
      let errorMessage = 'Identifiant ou mot de passe incorrect.';
      try {
        const errorData = await res.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch {
        // Fallback
      }
      throw new Error(errorMessage);
    }

    const data: LoginResponse = await res.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.utilisateur));
    }

    return data;
  },

  /**
   * Récupère le profil de l'utilisateur connecté via /api/auth/me avec le jeton JWT
   */
  async getCurrentUser(): Promise<BackendUser | null> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          this.logout();
        }
        return null;
      }

      const user: BackendUser = await res.json();
      localStorage.setItem('auth_user', JSON.stringify(user));
      return user;
    } catch (err) {
      console.warn('Erreur lors de la récupération du profil utilisateur :', err);
      // En cas de problème de réseau temporaire, tentative de repli sur les données stockées
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        try {
          return JSON.parse(stored) as BackendUser;
        } catch {
          return null;
        }
      }
      return null;
    }
  },

  /**
   * Déconnexion complète
   */
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  /**
   * Retourne le jeton JWT en mémoire locale
   */
  getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  },
};
