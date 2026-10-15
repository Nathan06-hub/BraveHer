import React, { useState } from 'react';
import { Calendar, Sparkles } from 'lucide-react';

interface DashboardParticipationChartProps {
  onViewReport?: () => void;
}

export const DashboardParticipationChart: React.FC<DashboardParticipationChartProps> = ({
  onViewReport,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30 derniers jours');

  return (
    <article className="dashboard-panel dashboard-trend-panel">
      {/* En-tête du panneau */}
      <div className="dashboard-panel-head">
        <div>
          <h2>Évolution de la participation</h2>
          <p className="dashboard-panel-sub">Femmes touchées par vos actions de sensibilisation</p>
        </div>

        <label className="dashboard-period-selector">
          <Calendar size={13} aria-hidden="true" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            aria-label="Période sélectionnée"
          >
            <option value="30 derniers jours">30 derniers jours</option>
            <option value="7 derniers jours">7 derniers jours</option>
            <option value="Cette année">Cette année</option>
          </select>
          <span style={{ fontSize: '10px', color: '#94A3A5' }}>⌄</span>
        </label>
      </div>

      {/* Légende du graphique */}
      <div className="dashboard-chart-legend">
        <span>
          <i />
          <span>Femmes accompagnées</span>
        </span>
        <span>
          <i className="target" />
          <span>Objectif</span>
        </span>
      </div>

      {/* Zone du graphique avec courbe SVG et axe */}
      <div className="dashboard-chart-wrapper">
        <div className="dashboard-y-labels">
          <span>400</span>
          <span>300</span>
          <span>200</span>
          <span>100</span>
          <span>0</span>
        </div>

        <div className="dashboard-plot-area">
          <div className="dashboard-grid-lines">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>

          <svg
            viewBox="0 0 700 160"
            preserveAspectRatio="none"
            role="img"
            aria-label="La participation est en hausse continue sur la période"
          >
            <defs>
              <linearGradient id="dashboardAreaFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#168a8b" stopOpacity="0.18" />
                <stop offset="1" stopColor="#168a8b" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Remplissage en dégradé sous la courbe */}
            <path
              d="M0 134 C35 129 44 111 75 118 S117 105 140 109 S178 82 207 92 S246 72 277 80 S317 58 348 68 S390 45 418 56 S459 35 490 44 S531 26 560 34 S602 17 631 25 S673 9 700 14 L700 160 L0 160Z"
              fill="url(#dashboardAreaFill)"
            />

            {/* Ligne principale (Femmes accompagnées) */}
            <path
              d="M0 134 C35 129 44 111 75 118 S117 105 140 109 S178 82 207 92 S246 72 277 80 S317 58 348 68 S390 45 418 56 S459 35 490 44 S531 26 560 34 S602 17 631 25 S673 9 700 14"
              fill="none"
              stroke="#168A8B"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />

            {/* Ligne pointillée d'objectif */}
            <path
              d="M0 145 C50 139 83 136 130 133 S205 121 255 122 S331 105 381 107 S456 91 507 96 S580 78 626 82 S677 70 700 73"
              fill="none"
              stroke="#E89BB5"
              strokeWidth="2"
              strokeDasharray="5 6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="dashboard-x-labels">
            <span>15 sept.</span>
            <span>20 sept.</span>
            <span>25 sept.</span>
            <span>30 sept.</span>
            <span>05 oct.</span>
            <span>10 oct.</span>
            <span>14 oct.</span>
          </div>
        </div>
      </div>

      {/* Note d'insight en bas du panneau */}
      <div className="dashboard-insight-note">
        <span className="dashboard-insight-mark">
          <Sparkles size={13} />
        </span>
        <span>
          <b>Votre impact progresse !</b> Vous avez accompagné 18 % de femmes en plus ce mois-ci.
        </span>
        <button
          type="button"
          className="dashboard-insight-link"
          onClick={onViewReport}
        >
          Voir le rapport →
        </button>
      </div>
    </article>
  );
};
