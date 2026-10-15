import React, { useState } from 'react';
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
  className?: string;
}

export const SidebarNavbar: React.FC<SidebarNavbarProps> = ({
  activeTab = 'dashboard',
  onTabChange,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
  onLogout,
  className = '',
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

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
      badge: '8',
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
      badge: 'Agent',
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
      badge: 'M2',
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
      badge: 'Hub',
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
      badge: 'M4',
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
      badge: 'Data for Good',
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
        {/*  */}
        <div className="nav-brand-row">
          <div className="nav-brand-mark font-serif" aria-hidden="true">
            R
          </div>
          <div className="nav-brand-name">
            <span>Soutien Rose</span>
            <small>Burkina Faso</small>
          </div>
          

          {/* Desktop/Tablet Collapse Toggle Button */}
          <button
            className="nav-toggle-btn"
            onClick={handleToggle}
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

          {/* Mobile Close Button (✕) */}
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

        {/* Main Navigation items */}
        <nav className="nav-items-list" aria-label="Liens principaux">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
                type="button"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
                {item.badge && <span className="nav-badge-pill">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Flexible Spacer */}
        <div className="nav-flexible-spacer" />

        {/* Bottom Links: Help & Logout */}
        <div className="nav-bottom-section">
          <button
            className={`nav-item-btn ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => handleItemClick('help')}
            title={isCollapsed ? 'Aide & support' : undefined}
            type="button"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M9.7 9a2.4 2.4 0 1 1 4.1 1.7c-1.1 1.1-1.8 1.3-1.8 2.8M12 16.8v.1" />
              </svg>
            </span>
            <span className="nav-item-label">Aide & support</span>
          </button>

          <button
            className="nav-item-btn nav-logout-btn"
            onClick={handleLogoutClick}
            title={isCollapsed ? 'Déconnexion' : undefined}
            type="button"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 8l4 4-4 4M7 12h11" />
              </svg>
            </span>
            <span className="nav-item-label font-semibold">Déconnexion</span>
          </button>
        </div>

        {/* Theme Toggle Row */}
        <div className="nav-theme-row">
          <button
            className={`nav-theme-btn ${theme === 'light' ? 'selected' : ''}`}
            onClick={() => setTheme('light')}
            aria-label="Thème clair"
            title="Thème clair"
            type="button"
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3.5" />
              <path d="M12 2.5v2M12 19.5v2M4.1 4.1l1.4 1.4m13 13 1.4 1.4M2.5 12h2m15 0h2M4.1 19.9l1.4-1.4m13-13 1.4-1.4" />
            </svg>
          </button>
          <button
            className={`nav-theme-btn ${theme === 'dark' ? 'selected' : ''}`}
            onClick={() => setTheme('dark')}
            aria-label="Thème sombre"
            title="Thème sombre"
            type="button"
          >
            <svg viewBox="0 0 24 24">
              <path d="M19.5 15.3A8 8 0 0 1 8.7 4.5 8.5 8.5 0 1 0 19.5 15.3Z" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};

export interface MobileNavTopbarProps {
  onOpenMenu: () => void;
  brandTitle?: string;
  brandSubtitle?: string;
}

export const MobileNavTopbar: React.FC<MobileNavTopbarProps> = ({
  onOpenMenu,
  brandTitle = 'Soutien Rose',
  brandSubtitle = 'Burkina Faso',
}) => {
  return (
    <header className="mobile-nav-topbar">
      <button
        type="button"
        className="mobile-menu-trigger-btn"
        onClick={onOpenMenu}
        aria-label="Ouvrir le menu de navigation"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="mobile-topbar-brand">
        <span className="mobile-topbar-mark font-serif">R</span>
        <div className="mobile-topbar-text">
          <span className="font-bold text-sm text-[#17343B] leading-none">{brandTitle}</span>
          <span className="text-[9px] text-[#536B70] uppercase tracking-wider">{brandSubtitle}</span>
        </div>
      </div>
    </header>
  );
};

export default SidebarNavbar;
