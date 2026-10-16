import React from 'react';
import type { LanguePatiente } from '../../types/campaign';

export interface LanguageBadgeProps {
  langue: LanguePatiente | string;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

// Configuration harmonisée avec la palette Soutien Rose & langues nationales
const LANGUAGE_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  Mooré: {
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FDE68A',
    label: 'Mooré',
  },
  Dioula: {
    bg: '#E0F2FE',
    text: '#0284C7',
    border: '#BAE6FD',
    label: 'Dioula',
  },
  Fulfuldé: {
    bg: '#F3E8FF',
    text: '#6B21A8',
    border: '#E9D5FF',
    label: 'Fulfuldé',
  },
  Français: {
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
    label: 'Français',
  },
  Autre: {
    bg: '#F1F5F9',
    text: '#475569',
    border: '#CBD5E1',
    label: 'Autre',
  },
};

export const LanguageBadge: React.FC<LanguageBadgeProps> = ({
  langue,
  size = 'sm',
  className = '',
  showIcon = false,
}) => {
  const config = LANGUAGE_STYLES[langue] || LANGUAGE_STYLES.Autre;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full transition-colors ${sizeClasses} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      {showIcon && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: config.text }}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};

export default LanguageBadge;
