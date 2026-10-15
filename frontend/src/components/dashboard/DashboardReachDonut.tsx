import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface ReachChannelItem {
  canal: string;
  count: number | string;
  pourcentage: number;
  couleur?: string;
}

interface DashboardReachDonutProps {
  totalCount?: string;
  channels?: ReachChannelItem[];
  growthLabel?: string;
  onOptionsClick?: () => void;
}

export const DashboardReachDonut: React.FC<DashboardReachDonutProps> = ({
  totalCount = '4 829',
  channels,
  growthLabel = '↗ 16,4 %',
  onOptionsClick,
}) => {
  const displayChannels: ReachChannelItem[] = channels || [
    { canal: 'Présentiel', count: '2 801', pourcentage: 58 },
    { canal: 'Réseaux sociaux', count: '1 324', pourcentage: 27 },
    { canal: 'Radio & médias', count: '704', pourcentage: 15 },
  ];

  return (
    <article className="dashboard-panel dashboard-reach-panel">
      {/* En-tête du panneau portée */}
      <div className="dashboard-panel-head">
        <div>
          <h2>Votre portée</h2>
          <p className="dashboard-panel-sub">Personnes touchées ce mois-ci</p>
        </div>

        <button
          type="button"
          className="dashboard-icon-button"
          aria-label="Plus d’options de portée"
          onClick={onOptionsClick}
          title="Détails de la portée"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Chiffre total clé */}
      <div className="dashboard-reach-total">
        {totalCount} <small>personnes</small>
      </div>

      {/* Corps avec le diagramme circulaire Conic Donut et sa légende */}
      <div className="dashboard-reach-body">
        <div className="dashboard-donut" role="img" aria-label="Répartition des canaux de sensibilisation">
          <div className="dashboard-donut-label">
            <b>{totalCount}</b>
            <small>au total</small>
          </div>
        </div>

        <div className="dashboard-donut-legend">
          {displayChannels.map((item, idx) => (
            <div key={idx} className="dashboard-legend-row">
              <i />
              <span>{item.canal}</span>
              <b>{item.count}</b>
            </div>
          ))}
        </div>
      </div>

      {/* Pied de carte avec variation mensuelle */}
      <div className="dashboard-reach-foot">
        <span className="stat-change">{growthLabel}</span>
        <span>de portée par rapport au mois dernier</span>
      </div>
    </article>
  );
};
