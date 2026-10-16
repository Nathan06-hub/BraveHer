import React from 'react';
import { Logo } from '../ui';

export interface NavBrandHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
  onBrandClick?: () => void;
}

export const NavBrandHeader: React.FC<NavBrandHeaderProps> = ({
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
  onBrandClick,
}) => {
  return (
    <div className="nav-brand-row">
      <Logo
        variant="teal"
        size="md"
        layout={isCollapsed ? 'icon-only' : 'horizontal'}
        onClick={onBrandClick}
      />

      {/* Bouton de repliage Desktop/Tablet */}
      <button
        className="nav-toggle-btn"
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? 'Développer le menu' : 'Réduire le menu'}
        title={isCollapsed ? 'Développer le menu' : 'Réduire le menu'}
        type="button"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="m10 3-5 5 5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Bouton fermer Mobile (✕) */}
      <button
        className="nav-mobile-close-btn"
        onClick={onCloseMobile}
        aria-label="Fermer le menu"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default NavBrandHeader;
