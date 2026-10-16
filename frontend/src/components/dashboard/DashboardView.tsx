import React from 'react';
import type { Campagne } from '../../types/campaign';
import type { Beneficiaire, BeneficiairesKPIs } from '../../types/beneficiary';
import { DashboardWelcomeHeader } from './DashboardWelcomeHeader';
import { DashboardStatsGrid, type DashboardStatsData } from './DashboardStatsGrid';
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
  beneficiairesList?: Beneficiaire[];
  beneficiairesKpis?: BeneficiairesKPIs;
  onNavigateTab?: (tab: string) => void;
  onCreateCampaign?: () => void;
  onViewCampaign?: (campagneId: string) => void;
  onExportReport?: () => void;
  onViewReport?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  campagnes = [],
  beneficiairesList = [],
  beneficiairesKpis,
  onNavigateTab,
  onCreateCampaign,
  onViewCampaign,
  onExportReport,
  onViewReport,
}) => {
  const totalFemmes = beneficiairesList.length;
  const depistagesEffectues = beneficiairesKpis?.depistagesEffectues || 0;
  const actives = campagnes.filter(
    (c) => c.statut === 'EN_COURS' || c.statut === 'en_cours'
  );
  const totalCible = campagnes.reduce((acc, c) => acc + (c.objectifFemmes || 0), 0);
  const tauxParticipation =
    totalCible > 0 ? Math.min(100, Math.round((totalFemmes / totalCible) * 100)) : 0;
  const regionsSet = new Set(campagnes.map((c) => c.commune).filter(Boolean));

  const statsData: DashboardStatsData = {
    femmesAccompagnees: {
      total: totalFemmes.toLocaleString('fr-FR'),
      progression: totalFemmes > 0 ? `+${totalFemmes}` : '0',
      isPositive: true,
    },
    depistagesRealises: {
      total: depistagesEffectues.toLocaleString('fr-FR'),
      progression: depistagesEffectues > 0 ? `+${depistagesEffectues}` : '0',
      pourcentageObjectif:
        totalFemmes > 0
          ? Math.min(100, Math.round((depistagesEffectues / totalFemmes) * 100))
          : 0,
    },
    campagnesActives: {
      total: actives.length,
      terminentBientot: 0,
      nombreRegions: regionsSet.size,
      avatars: [],
    },
    tauxParticipation: {
      pourcentage: tauxParticipation,
      progression: tauxParticipation > 0 ? `${tauxParticipation}%` : '0%',
      isPositive: true,
    },
  };

  return (
    <div className="dashboard-content-container">
      {/* 1. En-tête de bienvenue avec salutation et boutons d'action rapide */}
      <DashboardWelcomeHeader
        userName={currentUser?.prenom || 'Aïcha'}
        onExport={onExportReport}
        onCreateCampaign={onCreateCampaign}
      />

      {/* 2. Grille des 4 indicateurs clés (Stats calculées en temps réel) */}
      <DashboardStatsGrid data={statsData} />

      {/* 3. Section d'analyses & graphiques : Courbe d'évolution et Donut de portée */}
      <section className="dashboard-insights-grid">
        <DashboardParticipationChart onViewReport={onViewReport} />
        <DashboardReachDonut
          totalCount={totalFemmes.toLocaleString('fr-FR')}
          growthLabel={totalFemmes > 0 ? `+${totalFemmes} au total` : '0'}
          channels={
            totalFemmes > 0
              ? [
                  {
                    canal: 'Terrain & Communauté',
                    count: totalFemmes.toLocaleString('fr-FR'),
                    pourcentage: 100,
                  },
                ]
              : []
          }
        />
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
