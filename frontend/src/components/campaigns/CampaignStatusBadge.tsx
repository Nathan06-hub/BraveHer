import React from 'react';
import type { StatutCampagne } from '../../types/campaign';
import {
  FileEdit,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Archive,
} from 'lucide-react';

interface CampaignStatusBadgeProps {
  statut: StatutCampagne;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  StatutCampagne,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  brouillon: {
    label: 'Brouillon',
    bg: '#F1F5F9',
    text: '#475569',
    border: '#CBD5E1',
    icon: FileEdit,
  },
  en_attente: {
    label: 'En attente de validation',
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FDE68A',
    icon: Clock,
  },
  a_corriger: {
    label: 'À corriger',
    bg: '#FFF7ED',
    text: '#C2410C',
    border: '#FED7AA',
    icon: AlertTriangle,
  },
  approuvee: {
    label: 'Approuvée',
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
    icon: CheckCircle2,
  },
  refusee: {
    label: 'Refusée',
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FECACA',
    icon: XCircle,
  },
  en_cours: {
    label: 'En cours sur le terrain',
    bg: '#E0F2FE',
    text: '#0284C7',
    border: '#BAE6FD',
    icon: Activity,
  },
  terminee: {
    label: 'Terminée',
    bg: '#F3F4F6',
    text: '#4B5563',
    border: '#E5E7EB',
    icon: Archive,
  },
  BROUILLON: {
    label: 'Brouillon',
    bg: '#F1F5F9',
    text: '#475569',
    border: '#CBD5E1',
    icon: FileEdit,
  },
  PLANIFIEE: {
    label: 'Planifiée (Prête)',
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
    icon: CheckCircle2,
  },
  EN_COURS: {
    label: 'En cours d’exécution',
    bg: '#E0F2FE',
    text: '#0284C7',
    border: '#BAE6FD',
    icon: Activity,
  },
  TERMINEE: {
    label: 'Terminée',
    bg: '#F3F4F6',
    text: '#4B5563',
    border: '#E5E7EB',
    icon: Archive,
  },
};

export const CampaignStatusBadge: React.FC<CampaignStatusBadgeProps> = ({
  statut,
  size = 'md',
}) => {
  const config = STATUS_CONFIG[statut] || STATUS_CONFIG.brouillon;
  const IconComponent = config.icon;

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
        isSmall ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1'
      }`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      <IconComponent className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {statut === 'en_cours' && (
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse ml-0.5" />
      )}
    </span>
  );
};
