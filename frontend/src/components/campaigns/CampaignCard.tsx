import React from 'react';
import type { Campagne, AgentSante, CurrentUserContext } from '../../types/campaign';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import {
  MapPin,
  Calendar,
  Clock,
  Building2,
  Users,
  ArrowRight,
  AlertCircle,
  Edit3,
  ShieldCheck,
} from 'lucide-react';

interface CampaignCardProps {
  campagne: Campagne;
  allAgents: AgentSante[];
  currentUser: CurrentUserContext;
  onViewDetails: (campagne: Campagne) => void;
  onEdit?: (campagne: Campagne) => void;
  onValidate?: (campagne: Campagne) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campagne,
  allAgents,
  currentUser,
  onViewDetails,
  onEdit,
  onValidate,
}) => {
  // Trouver les agents mobilisés
  const agentsMobilises = allAgents.filter((a) =>
    campagne.agentsMobilisesIds.includes(a.id)
  );

  const totalSensibilisees = campagne.personnesSensibiliseesIds?.length || 0;
  const targetPercent = Math.min(
    100,
    Math.round((totalSensibilisees / (campagne.objectifFemmes || 1)) * 100)
  );

  const canEdit =
    currentUser.role === 'admin' ||
    (currentUser.role === 'responsable' && currentUser.centreId === campagne.centreId) ||
    (currentUser.role === 'agent' &&
      (campagne.statut === 'brouillon' || campagne.statut === 'a_corriger'));

  const canValidate =
    (currentUser.role === 'responsable' || currentUser.role === 'admin') &&
    campagne.statut === 'en_attente';

  return (
    <article className="campaign-card" aria-label={`Campagne ${campagne.nom}`}>
      {/* En-tête de carte */}
      <div className="campaign-card-header">
        <div className="flex items-center gap-2 flex-wrap">
          <CampaignStatusBadge statut={campagne.statut} />
          <span className="campaign-date-pill">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(campagne.dateDebut).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}{' '}
              -{' '}
              {new Date(campagne.dateFin).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </span>
        </div>

        <span className="campaign-center-tag">
          <Building2 className="w-3.5 h-3.5 text-[#007599]" />
          <span>{campagne.centreNom}</span>
        </span>
      </div>

      {/* Titre et description */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="campaign-card-title">{campagne.titre || campagne.nom}</h3>
        {campagne.totalSmsEnvoyes !== undefined && campagne.totalSmsEnvoyes > 0 && (
          <span className="shrink-0 text-[10px] font-bold text-[#FF7900] bg-[#FFF4EB] border border-[#FFD8B8] px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900] animate-pulse" />
            {campagne.totalSmsEnvoyes} SMS Push Orange
          </span>
        )}
      </div>
      <p className="campaign-card-desc">{campagne.description}</p>

      {/* Alerte si à corriger ou refusée */}
      {campagne.motifValidation && (campagne.statut === 'a_corriger' || campagne.statut === 'refusee') && (
        <div
          className={`campaign-alert-box ${
            campagne.statut === 'a_corriger' ? 'alert-warning' : 'alert-danger'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-xs font-semibold mb-0.5">
              {campagne.statut === 'a_corriger'
                ? 'Consignes de correction médicale :'
                : 'Motif du refus :'}
            </strong>
            <p className="text-xs leading-relaxed">{campagne.motifValidation}</p>
          </div>
        </div>
      )}

      {/* Métadonnées géographiques et horaires */}
      <div className="campaign-meta-grid">
        <div className="meta-item">
          <MapPin className="w-4 h-4 text-[#007599] shrink-0" />
          <span className="truncate">
            <strong>{campagne.commune}</strong> · {campagne.secteurCible || campagne.secteurs.join(', ')}
          </span>
        </div>
        <div className="meta-item">
          <Clock className="w-4 h-4 text-[#007599] shrink-0" />
          <span>{campagne.horaires}</span>
        </div>
      </div>

      {/* Jauge d'impact et agents mobilisés */}
      <div className="campaign-impact-section">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#536B70] font-medium">Femmes sensibilisées</span>
          <span className="font-semibold text-[#17343B]">
            {totalSensibilisees} / {campagne.objectifFemmes} ({targetPercent}%)
          </span>
        </div>
        <div className="campaign-progress-bar">
          <div
            className="campaign-progress-fill"
            style={{ width: `${targetPercent}%` }}
          />
        </div>

        {/* Équipe mobilisée */}
        <div className="campaign-agents-preview">
          <div className="flex items-center gap-1.5 text-xs text-[#536B70]">
            <Users className="w-3.5 h-3.5" />
            <span>
              {agentsMobilises.length} agent{agentsMobilises.length > 1 ? 's' : ''} mobilisé
              {agentsMobilises.length > 1 ? 's' : ''} :
            </span>
          </div>
          <div className="flex items-center gap-1">
            {agentsMobilises.slice(0, 3).map((agent) => (
              <span
                key={agent.id}
                className="agent-mini-chip"
                title={`${agent.prenom} ${agent.nom} (${agent.roleFonction})`}
              >
                {agent.prenom[0]}
                {agent.nom[0]}
              </span>
            ))}
            {agentsMobilises.length > 3 && (
              <span className="agent-mini-chip chip-more">
                +{agentsMobilises.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="campaign-card-footer">
        {canValidate && onValidate && (
          <button
            type="button"
            className="btn-card-action btn-validate"
            onClick={() => onValidate(campagne)}
            title="Examiner et valider la campagne"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Examiner & Valider</span>
          </button>
        )}

        {canEdit && onEdit && (
          <button
            type="button"
            className="btn-card-action btn-secondary"
            onClick={() => onEdit(campagne)}
            title="Modifier les informations"
          >
            <Edit3 className="w-4 h-4" />
            <span>Modifier</span>
          </button>
        )}

        <button
          type="button"
          className="btn-card-action btn-primary"
          onClick={() => onViewDetails(campagne)}
        >
          <span>Fiche & Patientes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
