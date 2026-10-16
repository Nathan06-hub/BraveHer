import React from 'react';
import { Download, Plus } from 'lucide-react';

interface DashboardWelcomeHeaderProps {
  userName?: string;
  dateLabel?: string;
  onExport?: () => void;
  onCreateCampaign?: () => void;
}

export const DashboardWelcomeHeader: React.FC<DashboardWelcomeHeaderProps> = ({
  userName = 'Aïcha',
  dateLabel,
  onExport,
  onCreateCampaign,
}) => {
  // Date dynamique en français selon la date du jour
  const displayDate =
    dateLabel ||
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
      .format(new Date())
      .toUpperCase();

  return (
    <section className="dashboard-welcome">
      <div>
        <div className="dashboard-eyebrow">
          <i aria-hidden="true" />
          <span>{displayDate}</span>
        </div>
        <h1>Bonjour {userName}</h1>
        <p>Voici ce qui se passe dans votre communauté aujourd’hui.</p>
      </div>

      <div className="dashboard-actions">
        <button
          type="button"
          className="dashboard-btn"
          onClick={onExport}
          title="Exporter le rapport d'activité"
        >
          <Download size={14} aria-hidden="true" />
          <span>Exporter</span>
        </button>

        <button
          type="button"
          className="dashboard-btn dashboard-btn-primary"
          onClick={onCreateCampaign}
          title="Créer une nouvelle campagne de dépistage"
        >
          <Plus size={15} aria-hidden="true" />
          <span>Nouvelle campagne</span>
        </button>
      </div>
    </section>
  );
};
