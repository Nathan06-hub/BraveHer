import React, { useState } from 'react';
import type {
  Campagne,
  PersonneSensibilisee,
  AgentSante,
  CurrentUserContext,
} from '../../types/campaign';
import { AgentActiveCampaignCard } from './AgentActiveCampaignCard';
import { AgentPatientCreationForm } from './AgentPatientCreationForm';
import { AgentCampaignHistoryList } from './AgentCampaignHistoryList';
import {
  Megaphone,
  Users,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import './agentCampaigns.css';

interface AgentMyCampaignsViewProps {
  campagnes: Campagne[];
  personnes: PersonneSensibilisee[];
  allAgents: AgentSante[];
  currentUser: CurrentUserContext;
  onAddPersonne: (personne: Omit<PersonneSensibilisee, 'id'>) => void;
  onViewCampaignDetails?: (campagne: Campagne) => void;
  onSwitchUser?: (user: CurrentUserContext) => void;
  availableUsers?: CurrentUserContext[];
}

export const AgentMyCampaignsView: React.FC<AgentMyCampaignsViewProps> = ({
  campagnes,
  personnes,
  allAgents,
  currentUser,
  onAddPersonne,
  onViewCampaignDetails,
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'create_patient'>('overview');

  // Filtrer les campagnes attribuées à cet agent
  // Si l'utilisateur est admin, ou responsable sans filtre strict, on peut lui montrer les campagnes de son centre ou celles où il est nommé
  const mesCampagnes = campagnes.filter((c) => {
    if (currentUser.role === 'admin') return true;
    return (
      c.agentsMobilisesIds.includes(currentUser.id) ||
      c.creeParId === currentUser.id ||
      c.centreId === currentUser.centreId
    );
  });

  // Identifier la campagne active prioritaire en cours
  const campagneActive =
    mesCampagnes.find((c) => c.statut === 'en_cours') ||
    mesCampagnes.find((c) => c.statut === 'approuvee') ||
    null;

  // Statistiques de l'agent
  const patientesDeMesCampagnes = personnes.filter((p) =>
    mesCampagnes.some((c) => c.id === p.campagneId)
  );

  const totalPatientesEnrolees = patientesDeMesCampagnes.length;
  const totalDepistagesFaits = patientesDeMesCampagnes.filter(
    (p) => p.statutDepistage === 'Effectué'
  ).length;
  const totalCasAOrienter = patientesDeMesCampagnes.filter(
    (p) => p.statutDepistage === 'À orienter'
  ).length;

  const handlePatientSubmit = (data: Omit<PersonneSensibilisee, 'id'>) => {
    onAddPersonne(data);
    setViewMode('overview');
  };

  // Si l'agent a cliqué sur 'Fiche de création de patiente'
  if (viewMode === 'create_patient' && campagneActive) {
    return (
      <div className="agent-campaigns-container">
        <AgentPatientCreationForm
          campagne={campagneActive}
          currentUser={currentUser}
          onBack={() => setViewMode('overview')}
          onSubmit={handlePatientSubmit}
        />
      </div>
    );
  }

  return (
    <div className="agent-campaigns-container">
      {/* En-tête de bienvenue de l'agent */}
      <header className="agent-header">
        <div>
          <div className="agent-eyebrow">
            <i />
            <span>ESPACE AGENT DE SANTÉ · SUIVI DE TERRAIN</span>
          </div>
          <h1>Mes Campagnes de Dépistage</h1>
          <p>
            Missions de sensibilisation et dépistage précoce assignées à votre profil au sein du{' '}
            <b>{currentUser.centreNom}</b>.
          </p>
        </div>

        {/* Badge profil et sélecteur rapide de test */}
        <div className="flex items-center gap-3">
          <div className="agent-badge-profile">
            <div className="agent-avatar-circle">
              {currentUser.prenom[0]}
              {currentUser.nom[0]}
            </div>
            <div className="agent-profile-info">
              <span className="agent-profile-name">
                {currentUser.prenom} {currentUser.nom}
              </span>
              <span className="agent-profile-role">{currentUser.roleTitre}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#007599]/10 border border-[#007599]/25 rounded-full text-xs font-semibold text-[#007599] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{currentUser.centreNom}</span>
          </div>
        </div>
      </header>

      {/* Grille des 4 indicateurs de l'agent */}
      <section className="agent-stats-grid" aria-label="Statistiques de terrain">
        <article className="agent-stat-mini-card">
          <div className="agent-stat-icon">
            <Megaphone size={18} />
          </div>
          <div className="agent-stat-details">
            <span className="agent-stat-label">Campagnes assignées</span>
            <span className="agent-stat-num">{mesCampagnes.length}</span>
          </div>
        </article>

        <article className="agent-stat-mini-card">
          <div className="agent-stat-icon rose">
            <Users size={18} />
          </div>
          <div className="agent-stat-details">
            <span className="agent-stat-label">Femmes enregistrées</span>
            <span className="agent-stat-num">{totalPatientesEnrolees}</span>
          </div>
        </article>

        <article className="agent-stat-mini-card">
          <div className="agent-stat-icon green">
            <CheckCircle size={18} />
          </div>
          <div className="agent-stat-details">
            <span className="agent-stat-label">Dépistages effectués</span>
            <span className="agent-stat-num">{totalDepistagesFaits}</span>
          </div>
        </article>

        <article className="agent-stat-mini-card">
          <div className="agent-stat-icon gold">
            <AlertTriangle size={18} />
          </div>
          <div className="agent-stat-details">
            <span className="agent-stat-label">Cas orientés / Solidarité</span>
            <span className="agent-stat-num">{totalCasAOrienter}</span>
          </div>
        </article>
      </section>

      {/* Section FOCUS : Ma campagne active en cours */}
      <AgentActiveCampaignCard
        campagne={campagneActive}
        personnes={personnes}
        allAgents={allAgents}
        onOpenAddPatient={() => setViewMode('create_patient')}
        onViewCampaignDetails={onViewCampaignDetails}
      />

      {/* Section : Historique & autres campagnes de l'agent */}
      <AgentCampaignHistoryList
        campagnes={mesCampagnes}
        personnes={personnes}
        onViewDetails={onViewCampaignDetails}
      />
    </div>
  );
};
