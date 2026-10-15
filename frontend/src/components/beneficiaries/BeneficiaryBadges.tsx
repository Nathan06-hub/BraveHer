import React from 'react';
import type { NiveauSuspicion, StatutVulnerabilite, StatutDepistage } from '../../types/beneficiary';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldAlert,
  Heart,
  User,
} from 'lucide-react';

interface SuspicionBadgeProps {
  niveau: NiveauSuspicion;
  size?: 'sm' | 'md';
}

export const SuspicionBadge: React.FC<SuspicionBadgeProps> = ({
  niveau,
  size = 'md',
}) => {
  const isSmall = size === 'sm';

  switch (niveau) {
    case 'eleve':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${
            isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <AlertTriangle className={isSmall ? 'w-3 h-3 text-rose-600' : 'w-3.5 h-3.5 text-rose-600'} />
          <span>Risque Élevé (Suspicion)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse ml-0.5" />
        </span>
      );

    case 'modere':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${
            isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <Clock className={isSmall ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          <span>Vigilance (Modéré)</span>
        </span>
      );

    case 'faible':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${
            isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <CheckCircle2 className={isSmall ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
          <span>Normal (Faible)</span>
        </span>
      );

    case 'non_evalue':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${
            isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <HelpCircle className={isSmall ? 'w-3 h-3 text-slate-400' : 'w-3.5 h-3.5 text-slate-400'} />
          <span>Non Évalué</span>
        </span>
      );
  }
};

interface VulnerabilityBadgeProps {
  statut: StatutVulnerabilite;
}

export const VulnerabilityBadge: React.FC<VulnerabilityBadgeProps> = ({ statut }) => {
  if (statut === 'PDI') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
        <ShieldAlert className="w-3 h-3 text-purple-600" />
        <span>PDI (Déplacée Interne)</span>
      </span>
    );
  }

  if (statut === 'Vulnerable') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
        <Heart className="w-3 h-3 text-rose-500" />
        <span>Vulnérable</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
      <User className="w-3 h-3 text-slate-400" />
      <span>Standard</span>
    </span>
  );
};

interface ScreeningStatusBadgeProps {
  statut: StatutDepistage;
}

export const ScreeningStatusBadge: React.FC<ScreeningStatusBadgeProps> = ({ statut }) => {
  switch (statut) {
    case 'Effectué':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Effectué</span>
        </span>
      );
    case 'Planifié':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600" />
          <span>RDV Planifié</span>
        </span>
      );
    case 'À orienter':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>À Orienter</span>
        </span>
      );
    case 'Refusé':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
          <span>Refusé</span>
        </span>
      );
    default:
      return null;
  }
};
