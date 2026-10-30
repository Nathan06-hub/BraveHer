import React from 'react';

interface DashboardFooterProps {
  lastUpdatedTime?: string;
  tagline?: string;
}

export const DashboardFooter: React.FC<DashboardFooterProps> = ({
  lastUpdatedTime = '09:42',
  tagline = 'Brave_her · Ensemble pour la santé des femmes',
}) => {
  return (
    <footer className="dashboard-footer">
      <span>{tagline}</span>
      <span>
        Dernière mise à jour à {lastUpdatedTime}{' '}
        <i className="dashboard-live-dot" title="Flux de données synchronisé en temps réel" />
      </span>
    </footer>
  );
};
