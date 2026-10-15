import React from 'react';
import type { StatutAide, NiveauPriorite } from '../../types/solidarity';
import {
  Clock,
  FileSearch,
  CheckCircle2,
  XCircle,
  CreditCard,
  Activity,
  AlertOctagon,
  AlertTriangle,
  Shield,
} from 'lucide-react';

interface AidStatusBadgeProps {
  statut: StatutAide;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  StatutAide,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  a_examiner: {
    label: 'À examiner',
    bg: '#E0F2FE',
    text: '#0284C7',
    border: '#BAE6FD',
    icon: Clock,
  },
  en_attente_decision: {
    label: 'En attente de décision',
    bg: '#FEF3C7',
    text: '#B45309',
    border: '#FDE68A',
    icon: FileSearch,
  },
  approuvee: {
    label: 'Approuvée (Prise en charge)',
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
    icon: CheckCircle2,
  },
  refusee: {
    label: 'Non retenue',
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FECACA',
    icon: XCircle,
  },
  aide_attribuee: {
    label: 'Aide attribuée (Orange Money)',
    bg: '#FFF7ED',
    text: '#C2410C',
    border: '#FED7AA',
    icon: CreditCard,
  },
  examen_realise: {
    label: 'Mammographie effectuée',
    bg: '#EEF7F7',
    text: '#005C75',
    border: '#B2DDDD',
    icon: Activity,
  },
};

export const AidStatusBadge: React.FC<AidStatusBadgeProps> = ({
  statut,
  size = 'md',
}) => {
  const config = STATUS_CONFIG[statut] || STATUS_CONFIG.a_examiner;
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
      {statut === 'aide_attribuee' && (
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse ml-0.5" />
      )}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priorite: NiveauPriorite }> = ({ priorite }) => {
  if (priorite === 'urgent') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
        <AlertOctagon className="w-3 h-3 text-red-600" />
        <span>Urgent</span>
      </span>
    );
  }
  if (priorite === 'eleve') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
        <AlertTriangle className="w-3 h-3 text-orange-600" />
        <span>Élevé</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
      <Shield className="w-3 h-3 text-slate-500" />
      <span>Standard</span>
    </span>
  );
};
