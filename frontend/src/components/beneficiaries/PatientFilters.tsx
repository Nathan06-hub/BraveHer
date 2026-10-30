import React from 'react';
import { Users, AlertTriangle, Clock, HeartHandshake, CheckCircle2 } from 'lucide-react';

export type PatientFilterTab =
  | 'tous'
  | 'risque_eleve'
  | 'vigilance'
  | 'vulnerables'
  | 'depistees';

export interface PatientFilterCounts {
  total: number;
  risqueEleve: number;
  vigilance: number;
  vulnerables: number;
  depistees: number;
}

export interface PatientFiltersProps {
  activeTab: PatientFilterTab;
  onTabChange: (tab: PatientFilterTab) => void;
  counts: PatientFilterCounts;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  selectedCommune: string;
  onCommuneChange: (commune: string) => void;
  communesList: string[];
}

export const PatientFilters: React.FC<PatientFiltersProps> = ({
  activeTab,
  onTabChange,
  counts,
  selectedLanguage,
  onLanguageChange,
  selectedCommune,
  onCommuneChange,
  communesList,
}) => {
  const tabs = [
    {
      id: 'tous' as PatientFilterTab,
      label: 'Toutes les patientes',
      count: counts.total,
      icon: Users,
    },
    {
      id: 'risque_eleve' as PatientFilterTab,
      label: '🔴 Suspicion élevée (triage)',
      count: counts.risqueEleve,
      icon: AlertTriangle,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'vigilance' as PatientFilterTab,
      label: '🟡 Vigilance (Modéré)',
      count: counts.vigilance,
      icon: Clock,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'vulnerables' as PatientFilterTab,
      label: '💜 PDI & Vulnérables',
      count: counts.vulnerables,
      icon: HeartHandshake,
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'depistees' as PatientFilterTab,
      label: 'Dépistages Faits',
      count: counts.depistees,
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Pilules de filtrage interactives */}
      <div className="flex flex-wrap items-center gap-1.5" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none border ${
                isActive
                  ? 'bg-[#007599] text-white border-[#007599] shadow-xs'
                  : 'bg-white text-[#536B70] border-gray-200 hover:border-[#007599]/40 hover:text-[#17343B]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.badgeColor || 'bg-gray-100 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtres secondaires légers (Langue & Commune) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs">
        <span className="text-[11px] font-bold text-[#64748B]">Filtres ciblés :</span>

        {/* Sélecteur de langue */}
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg bg-white text-[#17343B] font-medium focus:outline-none focus:border-[#007599]"
        >
          <option value="toutes">Toutes les langues</option>
          <option value="Mooré">Mooré</option>
          <option value="Dioula">Dioula</option>
          <option value="Fulfuldé">Fulfuldé</option>
          <option value="Français">Français</option>
        </select>

        {/* Sélecteur de commune */}
        <select
          value={selectedCommune}
          onChange={(e) => onCommuneChange(e.target.value)}
          className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg bg-white text-[#17343B] font-medium focus:outline-none focus:border-[#007599]"
        >
          <option value="toutes">Toutes les communes</option>
          {communesList.map((comm) => (
            <option key={comm} value={comm}>
              {comm}
            </option>
          ))}
        </select>

        {(selectedLanguage !== 'toutes' || selectedCommune !== 'toutes') && (
          <button
            type="button"
            onClick={() => {
              onLanguageChange('toutes');
              onCommuneChange('toutes');
            }}
            className="text-[11px] text-[#007599] hover:underline font-semibold cursor-pointer"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
};
