import React, { useState } from 'react';
import type {
  Campagne,
  PersonneSensibilisee,
  AgentSante,
  CurrentUserContext,
  CentreSante,
} from '../../types/campaign';
import type { Beneficiaire } from '../../types/beneficiary';
import { AgentActiveCampaignCard } from './AgentActiveCampaignCard';
import { PatientFormModal } from '../beneficiaries/PatientFormModal';
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
  centres?: CentreSante[];
  allBeneficiaires?: Beneficiaire[];
  onAddPersonne: (personne: Omit<PersonneSensibilisee, 'id'>) => void;
  onRegisterBeneficiaire?: (patient: Beneficiaire) => void;
  onViewCampaignDetails?: (campagne: Campagne) => void;
  onSwitchUser?: (user: CurrentUserContext) => void;
  availableUsers?: CurrentUserContext[];
}

export const AgentMyCampaignsView: React.FC<AgentMyCampaignsViewProps> = ({
  campagnes,
  personnes,
  allAgents,
  currentUser,
  centres = [],
  allBeneficiaires = [],
  onAddPersonne,
  onRegisterBeneficiaire,
  onViewCampaignDetails,
}) => {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

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

  const handlePatientSubmit = (patient: Beneficiaire) => {
    if (onRegisterBeneficiaire) {
      onRegisterBeneficiaire(patient);
    }
    onAddPersonne({
      campagneId: campagneActive?.id || patient.campagneId || '',
      nom: patient.nom,
      prenom: patient.prenom,
      age: patient.age,
      telephone: patient.telephone,
      languePreferee: patient.languePreferee,
      commune: patient.commune,
      secteur: patient.secteur,
      statutDepistage: patient.statutDepistage,
      dateSensibilisation: patient.dateSensibilisation,
      agentContactNom: patient.agentContactNom,
      derniereEvaluation: patient.derniereEvaluation,
    });
    setIsPatientModalOpen(false);
  };

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
        onOpenAddPatient={() => setIsPatientModalOpen(true)}
        onViewCampaignDetails={onViewCampaignDetails}
      />

      {/* Section : Historique & autres campagnes de l'agent */}
      <AgentCampaignHistoryList
        campagnes={mesCampagnes}
        personnes={personnes}
        onViewDetails={onViewCampaignDetails}
      />

      {/* Modal Standard de Création Patiente avec Exclusivité de Campagne */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSubmit={handlePatientSubmit}
        centres={centres}
        currentUser={currentUser}
        assignedCampagne={campagneActive}
        allCampagnes={campagnes}
        allBeneficiaires={allBeneficiaires}
      />
    </div>
  );
};
