import React from 'react';
import type { Campagne } from '../../types/campaign';
import { Sparkles, Heart, Sun, MapPin, Clock, ArrowRight, MoreHorizontal } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

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
  campagnes = [],
  onViewAll,
  onSelectCampaign,
}) => {
<<<<<<< HEAD
  // Préparation des campagnes actives réelles à afficher (jusqu'à 3)
  const cardsToDisplay: CampaignPreviewCard[] = (campagnes || [])
    .slice(0, 3)
    .map((c, index) => {
      const count = c.personnesSensibiliseesIds?.length || 0;
      const target = c.objectifFemmes || 100;
      const pct = Math.min(100, Math.round((count / target) * 100));
      const isDone = pct >= 100 || c.statut === 'terminee';

      return {
        id: c.id,
        nom: c.nom,
        centre: `${c.commune || 'Burkina Faso'} · ${c.centreNom || 'Centre de santé'}`,
        dates: `${c.dateDebut || 'Non planifiée'} au ${c.dateFin || 'Non planifiée'}`,
        icon: index === 0 ? 'sparkle' : index === 1 ? 'heart' : 'sun',
        statusLabel: isDone ? 'Objectif atteint' : 'En cours',
        isDone,
        atteint: count,
        cible: target,
        pourcentage: pct,
      };
    });
=======
  // Affichage des campagnes réelles du Backend Spring Boot
  const cardsToDisplay: CampaignPreviewCard[] =
    campagnes && campagnes.length > 0
      ? campagnes.slice(0, 3).map((c, index) => {
          const count = c.personnesSensibiliseesIds?.length || (c.totalSmsEnvoyes ? Math.round(c.totalSmsEnvoyes * 0.8) : 0);
          const target = c.objectifFemmes || 100;
          const pct = Math.min(100, Math.round((count / target) * 100));
          const isDone = pct >= 100 || c.statut === 'terminee' || c.statut === 'TERMINEE';

          return {
            id: c.id,
            nom: c.nom || (c as any).titre || 'Campagne de Sensibilisation',
            centre: `${c.commune || 'Burkina Faso'} · ${c.centreNom || 'Centre de santé'}`,
            dates: c.dateDebut ? `${c.dateDebut} au ${c.dateFin || 'fin du mois'}` : 'Octobre 2026',
            icon: index === 0 ? 'sparkle' : index === 1 ? 'heart' : 'sun',
            statusLabel: isDone ? 'Objectif atteint' : 'En cours',
            isDone,
            atteint: count,
            cible: target,
            pourcentage: pct,
          };
        })
      : [];
>>>>>>> omai/dev

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

<<<<<<< HEAD
      {cardsToDisplay.length === 0 ? (
        <div style={{ marginTop: '1rem' }}>
          <EmptyState
            title="Aucune campagne active"
            description="Aucune campagne de sensibilisation ou de dépistage n'est en cours pour le moment. Lancez une campagne pour suivre vos actions sur le terrain."
            action={onViewAll ? { label: "Gérer les campagnes", onClick: onViewAll } : undefined}
          />
        </div>
      ) : (
        /* Grille des campagnes */
        <div className="dashboard-campaigns-grid">
        {cardsToDisplay.map((card) => {
=======
      {/* Grille des campagnes */}
      <div className="dashboard-campaigns-grid">
        {cardsToDisplay.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '32px 24px', background: '#FFFFFF', borderRadius: '14px', border: '1px dashed #D6E8E8', textAlign: 'center', color: '#64748B' }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#17343B', fontSize: '15px' }}>Aucune campagne de sensibilisation en cours actuellement.</p>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#819194' }}>Créez une nouvelle campagne pour mobiliser votre communauté et lancer des dépistages sur le terrain.</p>
          </div>
        ) : (
          cardsToDisplay.map((card) => {
>>>>>>> omai/dev
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
<<<<<<< HEAD
        })}
        </div>
      )}
=======
        }))}
      </div>
>>>>>>> omai/dev
    </section>
  );
};
