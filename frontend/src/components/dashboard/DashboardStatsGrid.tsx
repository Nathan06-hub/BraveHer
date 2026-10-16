import React from 'react';
import { Users, CheckCircle, Megaphone, Heart } from 'lucide-react';

export interface DashboardStatsData {
  femmesAccompagnees?: {
    total: number | string;
    progression: string;
    isPositive?: boolean;
  };
  depistagesRealises?: {
    total: number | string;
    progression: string;
    pourcentageObjectif: number;
  };
  campagnesActives?: {
    total: number | string;
    terminentBientot: number;
    nombreRegions: number;
    avatars?: string[];
  };
  tauxParticipation?: {
    pourcentage: number;
    progression: string;
    isPositive?: boolean;
  };
}

interface DashboardStatsGridProps {
  data?: DashboardStatsData;
}

export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ data }) => {
  const femmes = data?.femmesAccompagnees || {
    total: 0,
    progression: '0',
    isPositive: true,
  };

  const depistages = data?.depistagesRealises || {
    total: 0,
    progression: '0',
    pourcentageObjectif: 0,
  };

  const campagnes = data?.campagnesActives || {
    total: 0,
    terminentBientot: 0,
    nombreRegions: 0,
    avatars: [],
  };

  const participation = data?.tauxParticipation || {
    pourcentage: 0,
    progression: '0%',
    isPositive: true,
  };

  return (
    <section className="dashboard-stats-grid" aria-label="Indicateurs clés">
      {/* 1. Femmes accompagnées */}
      <article className="dashboard-stat-card">
        <div className="dashboard-stat-head">
          <span>Femmes accompagnées</span>
          <span className="dashboard-stat-ico rose" title="Bénéficiaires">
            <Users size={15} />
          </span>
        </div>
        <div className="dashboard-stat-value">{femmes.total}</div>
        <div className="dashboard-stat-foot">
          <span className={`stat-change ${femmes.isPositive !== false ? '' : 'down'}`}>
            {femmes.progression}
          </span>
          <span>vs période précédente</span>
        </div>
        <div className="stat-sparkline" aria-hidden="true">
          <svg viewBox="0 0 100 32" preserveAspectRatio="none">
            <path
              d="M0 26 14 20 27 23 40 13 54 17 66 8 79 13 100 2"
              fill="none"
              stroke="#e89bb5"
              strokeWidth="2"
            />
          </svg>
        </div>
      </article>

      {/* 2. Dépistages réalisés */}
      <article className="dashboard-stat-card">
        <div className="dashboard-stat-head">
          <span>Dépistages réalisés</span>
          <span className="dashboard-stat-ico" title="Dépistages cliniques">
            <CheckCircle size={15} />
          </span>
        </div>
        <div className="dashboard-stat-value">{depistages.total}</div>
        <div className="dashboard-stat-foot">
          <span className="stat-change">{depistages.progression}</span>
          <span>vs période précédente</span>
        </div>
        <div className="dashboard-goal-row">
          <span>Objectif mensuel</span>
          <b>{depistages.pourcentageObjectif} %</b>
        </div>
        <div className="dashboard-mini-progress">
          <i style={{ width: `${depistages.pourcentageObjectif}%` }} />
        </div>
      </article>

      {/* 3. Campagnes actives */}
      <article className="dashboard-stat-card">
        <div className="dashboard-stat-head">
          <span>Campagnes actives</span>
          <span className="dashboard-stat-ico" title="Actions terrain">
            <Megaphone size={15} />
          </span>
        </div>
        <div className="dashboard-stat-value">{campagnes.total}</div>
        <div className="dashboard-stat-foot">
          <span>● &nbsp;{campagnes.terminentBientot} se terminent bientôt</span>
        </div>
        <div className="dashboard-dots">
          {(campagnes.avatars && campagnes.avatars.length > 0) ? (
            <>
              {campagnes.avatars.map((initial, idx) => (
                <span key={idx} className="dashboard-dot-avatar">
                  {initial}
                </span>
              ))}
              <span className="dashboard-regions-label">dans {campagnes.nombreRegions} région{campagnes.nombreRegions > 1 ? 's' : ''}</span>
            </>
          ) : (
            <span className="dashboard-regions-label">dans {campagnes.nombreRegions} région{campagnes.nombreRegions > 1 ? 's' : ''}</span>
          )}
        </div>
      </article>

      {/* 4. Taux de participation */}
      <article className="dashboard-stat-card">
        <div className="dashboard-stat-head">
          <span>Taux de participation</span>
          <span className="dashboard-stat-ico gold" title="Engagement communautaire">
            <Heart size={15} />
          </span>
        </div>
        <div className="dashboard-stat-value">
          {participation.pourcentage}
          <small>%</small>
        </div>
        <div className="dashboard-stat-foot">
          <span className={`stat-change ${participation.isPositive ? '' : 'down'}`}>
            {participation.progression}
          </span>
          <span>vs période précédente</span>
        </div>
        <div className="dashboard-goal-row">
          <span>Participation aux activités</span>
        </div>
        <div className="dashboard-mini-progress">
          <i
            style={{
              width: `${participation.pourcentage}%`,
              background: '#d6ad60',
            }}
          />
        </div>
      </article>
    </section>
  );
};
