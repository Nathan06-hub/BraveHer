import React from 'react';
import type { StatutCampagne, CentreSante } from '../../types/campaign';
import { Search, X, Building, MapPin, UserCheck } from 'lucide-react';

interface CampaignFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatut: StatutCampagne | 'tous';
  onStatutChange: (statut: StatutCampagne | 'tous') => void;
  selectedCommune: string;
  onCommuneChange: (commune: string) => void;
  selectedCentreId: string;
  onCentreChange: (centreId: string) => void;
  onlyMyCampaigns: boolean;
  onOnlyMyCampaignsChange: (val: boolean) => void;
  centres: CentreSante[];
  communes: string[];
  countsByStatut: Record<string, number>;
  totalCount: number;
  onReset: () => void;
}

export const CampaignFilters: React.FC<CampaignFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatut,
  onStatutChange,
  selectedCommune,
  onCommuneChange,
  selectedCentreId,
  onCentreChange,
  onlyMyCampaigns,
  onOnlyMyCampaignsChange,
  centres,
  communes,
  countsByStatut,
  totalCount,
  onReset,
}) => {

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedStatut !== 'tous' ||
    selectedCommune !== '' ||
    selectedCentreId !== '' ||
    onlyMyCampaigns;

  const STATUT_TABS: Array<{ id: StatutCampagne | 'tous'; label: string }> = [
    { id: 'tous', label: 'Toutes' },
    { id: 'en_cours', label: 'En cours' },
    { id: 'en_attente', label: 'Planifiées & Préparation' },
    { id: 'terminee', label: 'Terminées' },
  ];

  return (
    <div className="campaign-filters-panel">
      {/* Barre supérieure : Recherche + Dropdowns */}
      <div className="filters-main-row">
        {/* Recherche texte */}
        <div className="filter-search-wrapper">
          <Search className="search-icon w-4 h-4" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Rechercher par titre, commune, secteur ou description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sélecteur de Commune */}
        <div className="filter-select-wrapper">
          <MapPin className="select-icon w-4 h-4 text-[#007599]" />
          <select
            className="filter-select"
            value={selectedCommune}
            onChange={(e) => onCommuneChange(e.target.value)}
            aria-label="Filtrer par commune"
          >
            <option value="">Toutes les communes</option>
            {communes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sélecteur de Centre de Santé */}
        <div className="filter-select-wrapper">
          <Building className="select-icon w-4 h-4 text-[#007599]" />
          <select
            className="filter-select"
            value={selectedCentreId}
            onChange={(e) => onCentreChange(e.target.value)}
            aria-label="Filtrer par centre de santé"
          >
            <option value="">Tous les centres</option>
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} ({c.commune})
              </option>
            ))}
          </select>
        </div>

        {/* Interrupteur Mes campagnes */}
        <label className="filter-toggle-label" title="Filtrer selon votre rattachement">
          <input
            type="checkbox"
            checked={onlyMyCampaigns}
            onChange={(e) => onOnlyMyCampaignsChange(e.target.checked)}
            className="sr-only"
          />
          <div className={`filter-toggle-pill ${onlyMyCampaigns ? 'active' : ''}`}>
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mon centre / Mes missions</span>
          </div>
        </label>

        {/* Bouton Réinitialiser */}
        {hasActiveFilters && (
          <button
            type="button"
            className="filter-reset-btn"
            onClick={onReset}
            title="Réinitialiser tous les filtres"
          >
            <X className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Onglets de Statut */}
      <div className="statut-tabs-row" role="tablist">
        {STATUT_TABS.map((tab) => {
          const isActive = selectedStatut === tab.id;
          const count =
            tab.id === 'tous' ? totalCount : countsByStatut[tab.id] || 0;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`statut-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onStatutChange(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="statut-tab-badge">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
