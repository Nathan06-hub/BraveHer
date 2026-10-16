import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  ShieldAlert,
  Heart,
  User,
} from 'lucide-react';

export type StatusBadgeVariant =
  | 'neutral'
  | 'warning'
  | 'info'
  | 'success'
  | 'danger'
  | 'primary'
  | 'purple'
  | 'orange';

export interface StatusBadgeProps {
  label: React.ReactNode;
  variant?: StatusBadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
  pulse?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const VARIANT_STYLES: Record<
  StatusBadgeVariant,
  { bg: string; text: string; border: string; pulseColor?: string }
> = {
  neutral: {
    bg: '#F1F5F9',
    text: '#475569',
    border: '#CBD5E1',
    pulseColor: '#94A3B8',
  },
  warning: {
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FDE68A',
    pulseColor: '#F59E0B',
  },
  info: {
    bg: '#E0F2FE',
    text: '#0284C7',
    border: '#BAE6FD',
    pulseColor: '#0EA5E9',
  },
  success: {
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
    pulseColor: '#10B981',
  },
  danger: {
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FECACA',
    pulseColor: '#EF4444',
  },
  primary: {
    bg: 'rgba(0, 117, 153, 0.1)',
    text: '#007599',
    border: 'rgba(0, 117, 153, 0.25)',
    pulseColor: '#007599',
  },
  purple: {
    bg: '#FAF5FF',
    text: '#6B21A8',
    border: '#E9D5FF',
    pulseColor: '#A855F7',
  },
  orange: {
    bg: '#FFF4EB',
    text: '#C05E00',
    border: '#FED7AA',
    pulseColor: '#ED8B00',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  icon: IconComponent,
  pulse = false,
  className = '',
  style = {},
}) => {
  const currentVariant = VARIANT_STYLES[variant] || VARIANT_STYLES.neutral;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full transition-colors ${sizeClasses} ${className}`}
      style={{
        backgroundColor: currentVariant.bg,
        color: currentVariant.text,
        border: `1px solid ${currentVariant.border}`,
        ...style,
      }}
    >
      {IconComponent && <IconComponent className={iconSizes} aria-hidden="true" />}
      <span>{label}</span>
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse ml-0.5"
          style={{ backgroundColor: currentVariant.pulseColor || currentVariant.text }}
          aria-hidden="true"
        />
      )}
    </span>
  );
};

/* ========================================================================= */
/* SOUS-COMPOSANTS SPÉCIALISÉS POUR LE TRIAGE MÉDICAL ET LES PATIENTES        */
/* ========================================================================= */

export type ClinicalRiskLevel = 'eleve' | 'modere' | 'faible' | 'non_evalue';

export interface ClinicalRiskBadgeProps {
  niveau: ClinicalRiskLevel;
  size?: 'sm' | 'md';
  className?: string;
}

export const ClinicalRiskBadge: React.FC<ClinicalRiskBadgeProps> = ({
  niveau,
  size = 'md',
  className = '',
}) => {
  switch (niveau) {
    case 'eleve':
      return (
        <StatusBadge
          label="Risque Élevé (Suspicion)"
          variant="danger"
          size={size}
          icon={AlertTriangle}
          pulse
          className={className}
        />
      );
    case 'modere':
      return (
        <StatusBadge
          label="Vigilance (Modéré)"
          variant="warning"
          size={size}
          icon={Clock}
          className={className}
        />
      );
    case 'faible':
      return (
        <StatusBadge
          label="Normal (Faible)"
          variant="success"
          size={size}
          icon={CheckCircle2}
          className={className}
        />
      );
    case 'non_evalue':
    default:
      return (
        <StatusBadge
          label="Non Évalué"
          variant="neutral"
          size={size}
          icon={HelpCircle}
          className={className}
        />
      );
  }
};

export type PatientVulnerabilityStatus = 'PDI' | 'Vulnerable' | 'Standard';

export interface PatientVulnerabilityBadgeProps {
  statut: PatientVulnerabilityStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const PatientVulnerabilityBadge: React.FC<PatientVulnerabilityBadgeProps> = ({
  statut,
  size = 'sm',
  className = '',
}) => {
  if (statut === 'PDI') {
    return (
      <StatusBadge
        label="PDI (Déplacée Interne)"
        variant="purple"
        size={size}
        icon={ShieldAlert}
        className={className}
      />
    );
  }
  if (statut === 'Vulnerable') {
    return (
      <StatusBadge
        label="Vulnérable"
        variant="danger"
        size={size}
        icon={Heart}
        className={className}
      />
    );
  }
  return (
    <StatusBadge
      label="Standard"
      variant="neutral"
      size={size}
      icon={User}
      className={className}
    />
  );
};

export interface SmsStatusBadgeProps {
  statut: 'ENVOYE' | 'ECHEC' | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const SmsStatusBadge: React.FC<SmsStatusBadgeProps> = ({
  statut,
  size = 'sm',
  className = '',
}) => {
  if (statut === 'ENVOYE') {
    return (
      <StatusBadge
        label="ENVOYÉ"
        variant="success"
        size={size}
        icon={CheckCircle2}
        className={className}
      />
    );
  }

  return (
    <StatusBadge
      label="ÉCHEC"
      variant="danger"
      size={size}
      icon={XCircle}
      className={className}
    />
  );
};
