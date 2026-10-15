import React, { useState, useMemo } from 'react';
import type {
  Campagne,
  CentreSante,
  AgentSante,
  CurrentUserContext,
  StatutCampagne,
} from '../../types/campaign';
import { CampaignCard } from './CampaignCard';
import { CampaignFilters } from './CampaignFilters';
import {
  Plus,
  Sparkles,
  Users,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';


interface CampaignListProps {
  campagnes: Campagne[];
  centres: CentreSante[];
  agents: AgentSante[];
  currentUser: CurrentUserContext;
  onSwitchUser: (newUser: CurrentUserContext) => void;
  availableUsers: CurrentUserContext[];
  onCreateCampaign: () => void;
  onViewDetails: (campagne: Campagne) => void;
  onEditCampaign: (campagne: Campagne) => void;
  onValidateCampaign: (campagne: Campagne) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campagnes,
  centres,
  agents,
  currentUser,
  onSwitchUser,
  availableUsers,
  onCreateCampaign,
  onViewDetails,
  onEditCampaign,
  onValidateCampaign,
}) => {
  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<StatutCampagne | 'tous'>('tous');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedCentreId, setSelectedCentreId] = useState('');
  const [onlyMyCampaigns, setOnlyMyCampaigns] = useState(false);

  // Liste unique des communes disponibles
  const communes = useMemo(() => {
    const list = Array.from(new Set(centres.map((c) => c.commune)));
    return list.sort();
  }, [centres]);

  // Filtrage
  const filteredCampagnes = useMemo(() => {
    return campagnes.filter((camp) => {
      // Filtre statut
      if (selectedStatut !== 'tous' && camp.statut !== selectedStatut) {
        return false;
      }

      // Filtre commune
      if (selectedCommune && camp.commune !== selectedCommune) {
        return false;
      }

      // Filtre centre
      if (selectedCentreId && camp.centreId !== selectedCentreId) {
        return false;
      }

      // Filtre "Mon centre / Mes missions"
      if (onlyMyCampaigns) {
        if (currentUser.role === 'admin') {
          // Admin voit tout
        } else if (currentUser.role === 'responsable') {
          if (camp.centreId !== currentUser.centreId) return false;
        } else if (currentUser.role === 'agent') {
          if (
            !camp.agentsMobilisesIds.includes(currentUser.id) &&
            camp.creeParId !== currentUser.id
          ) {
            return false;
          }
        }
      }

      // Recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = camp.nom.toLowerCase().includes(q);
        const matchDesc = camp.description.toLowerCase().includes(q);
        const matchCommune = camp.commune.toLowerCase().includes(q);
        const matchSecteur = camp.secteurs.some((s) => s.toLowerCase().includes(q));
        const matchCenter = camp.centreNom.toLowerCase().includes(q);

        if (!matchTitle && !matchDesc && !matchCommune && !matchSecteur && !matchCenter) {
          return false;
        }
      }

      return true;
    });
  }, [
    campagnes,
    selectedStatut,
    selectedCommune,
    selectedCentreId,
    onlyMyCampaigns,
    searchQuery,
    currentUser,
  ]);

  // Compteurs par statut
  const countsByStatut = useMemo(() => {
    const counts: Record<string, number> = {};
    campagnes.forEach((c) => {
      counts[c.statut] = (counts[c.statut] || 0) + 1;
    });
    return counts;
  }, [campagnes]);

  // Statistiques globales
  const totalFemmesSensibilisees = useMemo(() => {
    return campagnes.reduce(
      (acc, c) => acc + (c.personnesSensibiliseesIds?.length || 0),
      0
    );
  }, [campagnes]);

  const pendingValidationsCount = countsByStatut['en_attente'] || 0;
  const inProgressCount = countsByStatut['en_cours'] || 0;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatut('tous');
    setSelectedCommune('');
    setSelectedCentreId('');
    setOnlyMyCampaigns(false);
  };

  return (
    <div className="campaign-module-container">
      {/* Barre de contexte utilisateur (Identification du rôle et centre) */}
      <div className="user-context-banner">
        <div className="context-identity">
          <div className="context-avatar-badge">
            <Shield className="w-4 h-4 text-[#007599]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="context-user-name">
                {currentUser.prenom} {currentUser.nom}
              </span>
              <span className="context-role-tag">{currentUser.roleTitre}</span>
            </div>
            <p className="context-center-name">
              Rattaché à : <strong>{currentUser.centreNom}</strong>
            </p>
          </div>
        </div>

        {/* Sélecteur rapide de profil (démonstration des droits) */}
        <div className="context-switcher">
          <span className="switcher-label">Tester avec le rôle :</span>
          <select
            className="switcher-select"
            value={currentUser.id}
            onChange={(e) => {
              const u = availableUsers.find((x) => x.id === e.target.value);
              if (u) onSwitchUser(u);
            }}
            aria-label="Changer d'utilisateur de test"
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.prenom} {u.nom} — {u.roleTitre} ({u.centreNom.split('(')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartes KPI du Module */}
      <div className="campaign-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap icon-teal">
            <Layers className="w-5 h-5 text-[#007599]" />
          </div>
          <div>
            <span className="stat-label">Total Campagnes</span>
            <div className="stat-value">{campagnes.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap icon-amber">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="stat-label">En attente de validation</span>
            <div className="stat-value text-amber-600">
              {pendingValidationsCount}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap icon-sky">
            <Sparkles className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <span className="stat-label">En cours sur le terrain</span>
            <div className="stat-value text-sky-600">{inProgressCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap icon-rose">
            <Users className="w-5 h-5 text-[#D8638A]" />
          </div>
          <div>
            <span className="stat-label">Femmes Sensibilisées</span>
            <div className="stat-value text-[#D8638A]">
              {totalFemmesSensibilisees}
            </div>
          </div>
        </div>
      </div>

      {/* Entête de liste + CTA Création */}
      <div className="campaign-list-header">
        <div>
          <h2 className="campaign-list-title">Campagnes de Dépistage & Sensibilisation</h2>
          <p className="campaign-list-subtitle">
            Planifiez, mobilisez vos agents de santé et suivez le déploiement sur le territoire burkinabè.
          </p>
        </div>

        <button
          type="button"
          className="btn-create-campaign"
          onClick={onCreateCampaign}
        >
          <Plus className="w-5 h-5" />
          <span>Créer une Campagne</span>
        </button>
      </div>

      {/* Panneau de Filtres */}
      <CampaignFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatut={selectedStatut}
        onStatutChange={setSelectedStatut}
        selectedCommune={selectedCommune}
        onCommuneChange={setSelectedCommune}
        selectedCentreId={selectedCentreId}
        onCentreChange={setSelectedCentreId}
        onlyMyCampaigns={onlyMyCampaigns}
        onOnlyMyCampaignsChange={setOnlyMyCampaigns}
        centres={centres}
        communes={communes}
        countsByStatut={countsByStatut}
        totalCount={campagnes.length}
        onReset={handleResetFilters}
      />


      {/* Grille des cartes */}
      {filteredCampagnes.length > 0 ? (
        <div className="campaign-cards-grid">
          {filteredCampagnes.map((campagne) => (
            <CampaignCard
              key={campagne.id}
              campagne={campagne}
              allAgents={agents}
              currentUser={currentUser}
              onViewDetails={onViewDetails}
              onEdit={onEditCampaign}
              onValidate={onValidateCampaign}
            />
          ))}
        </div>
      ) : (
        /* État vide */
        <div className="campaign-empty-state">
          <div className="empty-icon-wrap">
            <Layers className="w-10 h-10 text-[#536B70]" />
          </div>
          <h3 className="empty-title">Aucune campagne ne correspond à vos critères</h3>
          <p className="empty-desc">
            Essayez de modifier votre recherche ou réinitialisez les filtres pour afficher l'ensemble des campagnes.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              className="btn-secondary-outline"
              onClick={handleResetFilters}
            >
              Réinitialiser les filtres
            </button>
            <button
              type="button"
              className="btn-primary-filled"
              onClick={onCreateCampaign}
            >
              Créer une nouvelle campagne
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
