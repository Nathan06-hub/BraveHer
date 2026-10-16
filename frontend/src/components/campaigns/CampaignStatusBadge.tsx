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
import { StatusBadge, type StatusBadgeVariant } from '../ui/StatusBadge';

interface CampaignStatusBadgeProps {
  statut: StatutCampagne;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  StatutCampagne,
  { label: string; variant: StatusBadgeVariant; icon: React.ElementType; pulse?: boolean }
> = {
  brouillon: { label: 'Brouillon', variant: 'neutral', icon: FileEdit },
  en_attente: { label: 'En attente de validation', variant: 'warning', icon: Clock },
  a_corriger: { label: 'À corriger', variant: 'warning', icon: AlertTriangle },
  approuvee: { label: 'Approuvée', variant: 'success', icon: CheckCircle2 },
  refusee: { label: 'Refusée', variant: 'danger', icon: XCircle },
  en_cours: { label: 'En cours sur le terrain', variant: 'info', icon: Activity, pulse: true },
  terminee: { label: 'Terminée', variant: 'neutral', icon: Archive },
  BROUILLON: { label: 'Brouillon', variant: 'neutral', icon: FileEdit },
  PLANIFIEE: { label: 'Planifiée (Prête)', variant: 'success', icon: CheckCircle2 },
  EN_COURS: { label: 'En cours d’exécution', variant: 'info', icon: Activity, pulse: true },
  TERMINEE: { label: 'Terminée', variant: 'neutral', icon: Archive },
};

export const CampaignStatusBadge: React.FC<CampaignStatusBadgeProps> = ({
  statut,
  size = 'md',
}) => {
  const config = STATUS_CONFIG[statut] || STATUS_CONFIG.brouillon;

  return (
    <StatusBadge
      label={config.label}
      variant={config.variant}
      icon={config.icon}
      size={size}
      pulse={config.pulse}
    />
  );
};
