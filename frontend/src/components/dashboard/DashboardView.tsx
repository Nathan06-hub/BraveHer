import React from 'react';
import type { Campagne } from '../../types/campaign';
import { DashboardWelcomeHeader } from './DashboardWelcomeHeader';
import { DashboardStatsGrid } from './DashboardStatsGrid';
import { DashboardParticipationChart } from './DashboardParticipationChart';
import { DashboardReachDonut } from './DashboardReachDonut';
import { DashboardActiveCampaigns } from './DashboardActiveCampaigns';
import { DashboardFooter } from './DashboardFooter';
import './dashboard.css';

interface DashboardViewProps {
  currentUser?: {
    prenom: string;
    nom: string;
    roleTitre?: string;
  };
  campagnes?: Campagne[];
  onNavigateTab?: (tab: string) => void;
  onCreateCampaign?: () => void;
  onViewCampaign?: (campagneId: string) => void;
  onExportReport?: () => void;
  onViewReport?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  campagnes,
  onNavigateTab,
  onCreateCampaign,
  onViewCampaign,
  onExportReport,
  onViewReport,
}) => {
  return (
    <div className="dashboard-content-container">
      {/* 1. En-tête de bienvenue avec salutation et boutons d'action rapide */}
      <DashboardWelcomeHeader
        userName={currentUser?.prenom || 'Aïcha'}
        onExport={onExportReport}
        onCreateCampaign={onCreateCampaign}
      />

      {/* 2. Grille des 4 indicateurs clés (Stats) */}
      <DashboardStatsGrid />

      {/* 3. Section d'analyses & graphiques : Courbe d'évolution et Donut de portée */}
      <section className="dashboard-insights-grid">
        <DashboardParticipationChart onViewReport={onViewReport} />
        <DashboardReachDonut />
      </section>

      {/* 4. Section des Campagnes actives en cours */}
      <DashboardActiveCampaigns
        campagnes={campagnes}
        onViewAll={() => onNavigateTab?.('campaigns')}
        onSelectCampaign={(id) => {
          if (onViewCampaign) {
            onViewCampaign(id);
          } else {
            onNavigateTab?.('campaigns');
          }
        }}
      />

      {/* 5. Pied de page avec statut en direct */}
      <DashboardFooter />
    </div>
  );
};
