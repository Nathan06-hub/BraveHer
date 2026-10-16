import React, { useState } from 'react';
import type { CurrentUserContext } from '../../types/campaign';
import { NavBrandHeader } from './NavBrandHeader';
import { NavListItem } from './NavListItem';
import { NavUserProfile } from './NavUserProfile';
import './sidebarNavbar.css';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarNavbarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  currentUser?: CurrentUserContext | null;
  className?: string;
  activeCampaignsCount?: number;
}

export const SidebarNavbar: React.FC<SidebarNavbarProps> = ({
  activeTab = 'dashboard',
  onTabChange,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
  onLogout,
  currentUser,
  className = '',
  activeCampaignsCount,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const handleItemClick = (id: string) => {
    if (onTabChange) {
      onTabChange(id);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const mainNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Vue d’ensemble',
      icon: (
        <svg viewBox="0 0 24 24">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      id: 'campaigns',
      label: 'Campagnes',
      badge: activeCampaignsCount !== undefined ? String(activeCampaignsCount) : '8',
      icon: (
        <svg viewBox="0 0 24 24">
          <rect x="4" y="3.5" width="16" height="17" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h4" />
        </svg>
      ),
    },
    {
      id: 'my_campaigns',
      label: 'Mes Campagnes',
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6M16 11h6" />
        </svg>
      ),
    },
    {
      id: 'beneficiaries',
      label: 'Bénéficiaires & Patientes',
      icon: (
        <svg viewBox="0 0 24 24">
          <circle cx="9" cy="8" r="3.3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: 'Push SMS Orange',
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M4 5.5h16v12H9l-5 3v-15Z" />
          <path d="M8 10h8M8 14h5" />
        </svg>
      ),
    },
    {
      id: 'impact',
      label: 'Solidarité & Statistiques',
      icon: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M7 14.5 10 11l2.5 2 4.5-5M14 8h3v3" />
        </svg>
      ),
    },
    {
      id: 'predictive',
      label: 'Pilotage Ministère (Data)',
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
          <circle cx="19" cy="9" r="2" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: (
        <svg viewBox="0 0 24 24">
          <path
            d="m10 3.8.5-1h3l.5 1 1.7 1 1.1-.2 1.5 2.6-.6.9v2l.6.9-1.5 2.6-1.1-.2-1.7 1-.5 1h-3l-.5-1-1.7-1-1.1.2-1.5-2.6.6-.9v-2l-.6-.9 1.5-2.6 1.1.2 1.7-1Z"
            transform="translate(1 2) scale(.92)"
          />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Scrim */}
      {isOpenMobile && (
        <div
          className="nav-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar-navbar ${isCollapsed ? 'collapsed' : ''} ${
          isOpenMobile ? 'mobile-open' : ''
        } ${className}`}
        aria-label="Navigation principale"
      >
        {/* En-tête : Brand & Logo & Boutons */}
        <NavBrandHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggle}
          onCloseMobile={onCloseMobile}
          onBrandClick={() => handleItemClick('dashboard')}
        />

        {/* Section Médiane : Navigation scrollable de manière fluide */}
        <div className="nav-scroll-area">
          <nav className="nav-items-list" aria-label="Liens principaux">
            {mainNavItems.map((item) => (
              <NavListItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                isActive={activeTab === item.id}
                isCollapsed={isCollapsed}
                onClick={handleItemClick}
              />
            ))}
          </nav>
        </div>

        {/* Pied de navigation fixe : Aide & Profil avec déconnexion intégrée façon maquette */}
        <div className="nav-fixed-footer">
          {/* Action Aide & support */}
          <div className="nav-bottom-section">
            <NavListItem
              id="help"
              label="Aide & support"
              isActive={activeTab === 'help'}
              isCollapsed={isCollapsed}
              onClick={handleItemClick}
              icon={
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M9.7 9a2.4 2.4 0 1 1 4.1 1.7c-1.1 1.1-1.8 1.3-1.8 2.8M12 16.8v.1" />
                </svg>
              }
            />
          </div>

          {/* Profil utilisateur connecté avec bouton déconnexion [→ à droite comme sur la maquette */}
          <NavUserProfile
            currentUser={currentUser ?? null}
            isCollapsed={isCollapsed}
            onLogout={handleLogoutClick}
          />
        </div>
      </aside>
    </>
  );
};

// Re-export MobileNavTopbar for backward compatibility
export { MobileNavTopbar } from './MobileNavTopbar';
export type { MobileNavTopbarProps } from './MobileNavTopbar';

export default SidebarNavbar;
