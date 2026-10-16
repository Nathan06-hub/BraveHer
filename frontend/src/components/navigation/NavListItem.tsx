import React from 'react';

export interface NavListItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick: (id: string) => void;
  className?: string;
}

export const NavListItem: React.FC<NavListItemProps> = ({
  id,
  label,
  icon,
  badge,
  isActive = false,
  isCollapsed = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      className={`nav-item-btn ${isActive ? 'active' : ''} ${className}`}
      onClick={() => onClick(id)}
      aria-current={isActive ? 'page' : undefined}
      data-tooltip={label}
      title={isCollapsed ? label : undefined}
      type="button"
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-item-label">{label}</span>
      {badge && <span className="nav-badge-pill">{badge}</span>}
    </button>
  );
};

export default NavListItem;
