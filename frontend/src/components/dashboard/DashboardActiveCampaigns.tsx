import React from 'react';
import type { Campagne } from '../../types/campaign';
import { Sparkles, Heart, Sun, MapPin, Clock, ArrowRight, MoreHorizontal } from 'lucide-react';

interface DashboardActiveCampaignsProps {
  campagnes?: Campagne[];
  onViewAll?: () => void;
  onSelectCampaign?: (campagneId: string) => void;
}

interface CampaignPreviewCard {
  id: string;
  nom: string;
  centre: string;
  dates: string;
  icon: 'sparkle' | 'heart' | 'sun';
  statusLabel: string;
  isDone?: boolean;
  atteint: number;
  cible: number;
  pourcentage: number;
}

export const DashboardActiveCampaigns: React.FC<DashboardActiveCampaignsProps> = ({
  campagnes,
  onViewAll,
  onSelectCampaign,
}) => {
  // Préparation des 3 campagnes affichées
  const defaultPreviews: CampaignPreviewCard[] = [
    {
      id: 'camp-1',
      nom: 'Dépistage précoce',
      centre: 'Ouagadougou · Centre médical Schiphra',
      dates: '12 – 24 octobre 2026',
      icon: 'sparkle',
      statusLabel: 'En cours',
      atteint: 68,
      cible: 100,
      pourcentage: 68,
    },
    {
      id: 'camp-2',
      nom: 'Parlons santé des femmes',
      centre: 'Bobo-Dioulasso · Maison de la femme',
      dates: '05 – 31 octobre 2026',
      icon: 'heart',
      statusLabel: 'En cours',
      atteint: 42,
      cible: 80,
      pourcentage: 52,
    },
    {
      id: 'camp-3',
      nom: 'Octobre Rose en communauté',
      centre: 'Koudougou · 3 centres de santé',
      dates: '01 – 20 octobre 2026',
      icon: 'sun',
      statusLabel: 'Objectif atteint',
      isDone: true,
      atteint: 91,
      cible: 90,
      pourcentage: 100,
    },
  ];

  // Si des campagnes réelles sont passées et que l'utilisateur en a au moins 1 active
  const cardsToDisplay: CampaignPreviewCard[] =
    campagnes && campagnes.length >= 3
      ? campagnes.slice(0, 3).map((c, index) => {
          const count = c.personnesSensibiliseesIds?.length || 0;
          const target = c.objectifFemmes || 100;
          const pct = Math.min(100, Math.round((count / target) * 100));
          const isDone = pct >= 100 || c.statut === 'terminee';

          return {
            id: c.id,
            nom: c.nom,
            centre: `${c.commune} · ${c.centreNom}`,
            dates: `${c.dateDebut} au ${c.dateFin}`,
            icon: index === 0 ? 'sparkle' : index === 1 ? 'heart' : 'sun',
            statusLabel: isDone ? 'Objectif atteint' : 'En cours',
            isDone,
            atteint: count,
            cible: target,
            pourcentage: pct,
          };
        })
      : defaultPreviews;

  return (
    <section className="dashboard-campaigns-section" id="campagnes">
      {/* En-tête de section */}
      <div className="dashboard-section-head">
        <div>
          <div className="dashboard-section-title">
            <h2>Campagnes en cours</h2>
            <span className="dashboard-count-badge">{cardsToDisplay.length}</span>
          </div>
          <p>Suivez l’avancement de vos actions de terrain dans les régions.</p>
        </div>

        <button
          type="button"
          className="dashboard-view-all-btn"
          onClick={onViewAll}
        >
          Toutes les campagnes →
        </button>
      </div>

      {/* Grille des 3 campagnes */}
      <div className="dashboard-campaigns-grid">
        {cardsToDisplay.map((card) => {
          return (
            <article key={card.id} className="dashboard-campaign-card">
              <div className="dashboard-camp-top">
                <span className="dashboard-camp-icon">
                  {card.icon === 'sparkle' && <Sparkles size={16} />}
                  {card.icon === 'heart' && <Heart size={16} />}
                  {card.icon === 'sun' && <Sun size={16} />}
                </span>

                <span
                  className={`dashboard-camp-status ${
                    card.isDone ? 'done' : ''
                  }`}
                >
                  <i />
                  <span>{card.statusLabel}</span>
                </span>

                <button
                  type="button"
                  className="dashboard-icon-button"
                  style={{ marginLeft: 'auto', border: 0, background: 'none' }}
                  aria-label="Options"
                  title="Options de campagne"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <h3>{card.nom}</h3>

              <div className="dashboard-camp-meta">
                <MapPin size={12} aria-hidden="true" />
                <span>{card.centre}</span>
              </div>

              <div className="dashboard-camp-meta">
                <Clock size={12} aria-hidden="true" />
                <span>{card.dates}</span>
              </div>

              <div className="dashboard-camp-progress-label">
                <span>Progression</span>
                <b>
                  {card.atteint}{' '}
                  <span style={{ fontWeight: 400, color: '#819194' }}>
                    / {card.cible} {card.cible <= 100 ? '%' : 'femmes'}
                  </span>
                </b>
              </div>

              <div className="dashboard-camp-progress-bar">
                <i style={{ width: `${card.pourcentage}%` }} />
              </div>

              <button
                type="button"
                className="dashboard-camp-link"
                onClick={() => onSelectCampaign?.(card.id)}
              >
                <span>Voir la campagne</span>
                <ArrowRight size={14} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};
