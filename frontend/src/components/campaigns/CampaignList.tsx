
import React, { useState, useMemo } from 'react';
import type {
  Campagne,
  CentreSante,
  AgentSante,
  CurrentUserContext,
  StatutCampagne,
  PersonneSensibilisee,
} from '../../types/campaign';
import { CampaignCard } from './CampaignCard';
import { CampaignFilters } from './CampaignFilters';
import {
  Plus,
  Sparkles,
  Users,
  Layers,
  Calendar,
} from 'lucide-react';

interface CampaignListProps {
  campagnes: Campagne[];
  centres: CentreSante[];
  agents: AgentSante[];
  currentUser: CurrentUserContext;
  personnes?: PersonneSensibilisee[];
  onSwitchUser?: (newUser: CurrentUserContext) => void;
  availableUsers?: CurrentUserContext[];
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
  personnes,
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
      // Filtre statut optimisé
      if (selectedStatut !== 'tous') {
        if (selectedStatut === 'en_cours') {
          if (camp.statut !== 'en_cours' && camp.statut !== 'EN_COURS') return false;
        } else if (selectedStatut === 'en_attente') {
          const pending = ['en_attente', 'approuvee', 'PLANIFIEE', 'a_corriger', 'brouillon', 'BROUILLON'];
          if (!pending.includes(camp.statut)) return false;
        } else if (selectedStatut === 'terminee') {
          if (camp.statut !== 'terminee' && camp.statut !== 'TERMINEE') return false;
        } else if (camp.statut !== selectedStatut) {
          return false;
        }
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
          const agentIds = Array.isArray(camp.agentsMobilisesIds) ? camp.agentsMobilisesIds : [];
          if (!agentIds.includes(currentUser.id) && camp.creeParId !== currentUser.id) {
            return false;
          }
        }
      }

      // Recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (camp.titre || camp.nom || '').toLowerCase().includes(q);
        const matchDesc = (camp.description || camp.message || '').toLowerCase().includes(q);
        const matchCommune = (camp.commune || '').toLowerCase().includes(q);
        const matchSecteur = Array.isArray(camp.secteurs) && camp.secteurs.some((s) => s && s.toLowerCase().includes(q));
        const matchCenter = (camp.centreNom || '').toLowerCase().includes(q);

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

  // Compteurs synthétisés pour les onglets de filtres (chaque campagne comptée exactement 1 fois)
  const countsByStatut = useMemo(() => {
    const counts: Record<string, number> = {
      tous: campagnes.length,
      en_cours: 0,
      en_attente: 0,
      terminee: 0,
    };
    campagnes.forEach((c) => {
      const s = c.statut;
      if (s === 'en_cours' || s === 'EN_COURS') {
        counts.en_cours++;
      } else if (
        ['en_attente', 'approuvee', 'PLANIFIEE', 'a_corriger', 'brouillon', 'BROUILLON'].includes(s)
      ) {
        counts.en_attente++;
      } else if (s === 'terminee' || s === 'TERMINEE') {
        counts.terminee++;
      }
    });
    return counts;
  }, [campagnes]);

  // Statistiques détaillées et cohérentes pour les cartes KPI
  const detailedStats = useMemo(() => {
    let enCours = 0;
    let planifiees = 0;
    let aValider = 0;
    let brouillons = 0;
    let terminees = 0;
    let femmesCiblees = 0;
    let smsEnvoyes = 0;

    campagnes.forEach((c) => {
      femmesCiblees += Number(c.objectifFemmes) || 150;
      smsEnvoyes += Number(c.totalSmsEnvoyes) || 0;

      const s = c.statut;
      if (s === 'en_cours' || s === 'EN_COURS') {
        enCours++;
      } else if (s === 'PLANIFIEE' || s === 'approuvee') {
        planifiees++;
      } else if (s === 'en_attente' || s === 'a_corriger') {
        aValider++;
      } else if (s === 'brouillon' || s === 'BROUILLON') {
        brouillons++;
      } else if (s === 'terminee' || s === 'TERMINEE') {
        terminees++;
      }
    });

    const totalAvenir = planifiees + aValider + brouillons;

    return {
      enCours,
      planifiees,
      aValider,
      brouillons,
      totalAvenir,
      terminees,
      femmesCiblees,
      smsEnvoyes,
    };
  }, [campagnes]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatut('tous');
    setSelectedCommune('');
    setSelectedCentreId('');
    setOnlyMyCampaigns(false);
  };

  return (
    <div className="campaign-module-container">
      {/* En-tête de page + CTA Création */}
      <div className="campaign-list-header">
        <div>
          <h2 className="campaign-list-title">Campagnes de Dépistage & Sensibilisation</h2>
          <p className="campaign-list-subtitle">
            Planifiez, mobilisez vos agents de santé et suivez le déploiement sur le territoire burkinabè.
          </p>
        </div>

        {(currentUser.role === 'admin' || currentUser.role === 'ADMIN') && (
          <button
            type="button"
            className="btn-create-campaign"
            onClick={onCreateCampaign}
          >
            <Plus className="w-5 h-5" />
            <span>Créer une Campagne</span>
          </button>
        )}
      </div>

      {/* Cartes KPI du Module */}
      <div className="campaign-stats-grid">
        {/* 1. Total Campagnes */}
        <div className="stat-card">
          <div className="stat-icon-wrap icon-teal">
            <Layers className="w-5 h-5 text-[#007599]" />
          </div>
          <div className="min-w-0">
            <span className="stat-label">Total Campagnes</span>
            <div className="stat-value">{campagnes.length}</div>
            <span className="text-[11px] text-[#536B70] font-medium block mt-0.5 truncate">
              Toutes régions burkinabè
            </span>
          </div>
        </div>

        {/* 2. En cours sur le terrain */}
        <div className="stat-card">
          <div className="stat-icon-wrap icon-sky">
            <Sparkles className="w-5 h-5 text-sky-600" />
          </div>
          <div className="min-w-0">
            <span className="stat-label">En cours sur le terrain</span>
            <div className="stat-value text-sky-600">{detailedStats.enCours}</div>
            <span className="text-[11px] text-sky-700 font-medium block mt-0.5 truncate">
              Missions de dépistage actives
            </span>
          </div>
        </div>

        {/* 3. Planifiées & Préparation */}
        <div className="stat-card">
          <div className="stat-icon-wrap icon-amber">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <span className="stat-label">Planifiées & Préparation</span>
            <div className="stat-value text-amber-600">{detailedStats.totalAvenir}</div>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-[11px] text-[#536B70]">
                {detailedStats.planifiees} prête{detailedStats.planifiees > 1 ? 's' : ''} · {detailedStats.brouillons} brouillon{detailedStats.brouillons > 1 ? 's' : ''}
              </span>
              {detailedStats.aValider > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  {detailedStats.aValider} à valider
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4. Objectif Femmes Ciblées */}
        <div className="stat-card">
          <div className="stat-icon-wrap icon-rose">
            <Users className="w-5 h-5 text-[#D8638A]" />
          </div>
          <div className="min-w-0">
            <span className="stat-label">Objectif Femmes Ciblées</span>
            <div className="stat-value text-[#D8638A]">
              {detailedStats.femmesCiblees.toLocaleString('fr-FR')}
            </div>
            <span className="text-[11px] text-[#536B70] font-medium block mt-0.5 truncate">
              {detailedStats.smsEnvoyes > 0
                ? `${detailedStats.smsEnvoyes.toLocaleString('fr-FR')} SMS Orange diffusés`
                : `${personnes?.length || 0} patientes enregistrées`}
            </span>
          </div>
        </div>
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
