import React from 'react';
import type { CurrentUserContext } from '../../types/campaign';

export interface NavUserProfileProps {
  currentUser: CurrentUserContext | null;
  isCollapsed?: boolean;
  onLogout?: () => void;
}

export const NavUserProfile: React.FC<NavUserProfileProps> = ({
  currentUser,
  isCollapsed = false,
  onLogout,
}) => {
  if (!currentUser) return null;

  const initials =
    (currentUser.prenom?.[0] || 'U') + (currentUser.nom?.[0] || '');
  const cleanCentreName = currentUser.centreNom
    ? currentUser.centreNom.split('(')[0].trim()
    : '';

  const tooltipText = isCollapsed
    ? `${currentUser.prenom} ${currentUser.nom} (${currentUser.roleTitre})`
    : undefined;

  const titleText = isCollapsed
    ? `${currentUser.prenom} ${currentUser.nom} (${currentUser.roleTitre}) · ${cleanCentreName}`
    : undefined;

  return (
    <div
      className={`nav-user-card ${isCollapsed ? 'collapsed' : ''}`}
      data-tooltip={tooltipText}
      title={titleText}
    >
      {/* Avatar avec badge de statut en ligne */}
      <div className="nav-user-avatar-wrap">
        <div className="nav-user-avatar">{initials}</div>
        <span className="nav-user-status-dot" title="En ligne" />
      </div>

      {!isCollapsed && (
        <>
          {/* Informations utilisateur */}
          <div className="nav-user-info">
            <div className="nav-user-name-row">
              <span className="nav-user-name">
                {currentUser.prenom} {currentUser.nom}
              </span>
            </div>
            <p className="nav-user-role">{currentUser.roleTitre || 'Professionnel de santé'}</p>
          </div>

          {/* Bouton de déconnexion intégré à droite comme sur la maquette */}
          {onLogout && (
            <button
              type="button"
              className="nav-user-logout-btn"
              onClick={onLogout}
              aria-label="Déconnexion"
              title="Déconnexion"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default NavUserProfile;
