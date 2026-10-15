import React, { useState } from 'react';
import type {
  Campagne,
  AgentSante,
  CurrentUserContext,
} from '../../types/campaign';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import {
  X,
  AlertTriangle,
  XCircle,
  CheckCircle,
  MapPin,
  Calendar,
  Clock,
  Building2,
  Users,
  Bell,
  History,
  MessageSquare,
} from 'lucide-react';

interface CampaignValidationModalProps {
  isOpen: boolean;
  campagne: Campagne | null;
  allAgents: AgentSante[];
  currentUser?: CurrentUserContext;
  onClose: () => void;
  onDecision: (
    campagneId: string,
    decision: 'approuvee' | 'a_corriger' | 'refusee',
    motif?: string
  ) => void;
}

export const CampaignValidationModal: React.FC<CampaignValidationModalProps> = ({
  isOpen,
  campagne,
  allAgents,
  onClose,
  onDecision,
}) => {

  if (!isOpen || !campagne) return null;

  const [commentaire, setCommentaire] = useState('');
  const [errorComment, setErrorComment] = useState('');

  // Agents mobilisés pour cette campagne
  const agentsMobilises = allAgents.filter((a) =>
    Array.isArray(campagne.agentsMobilisesIds) && campagne.agentsMobilisesIds.includes(a.id)
  );

  const handleAction = (decision: 'approuvee' | 'a_corriger' | 'refusee') => {
    // Si refus ou demande de correction, le motif est obligatoire
    if (decision === 'a_corriger' || decision === 'refusee') {
      if (!commentaire.trim()) {
        setErrorComment(
          decision === 'a_corriger'
            ? 'Veuillez saisir les consignes de correction pour l’agent de santé.'
            : 'Veuillez motiver la raison du refus de la campagne.'
        );
        return;
      }
    }

    onDecision(campagne.id, decision, commentaire.trim() || undefined);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="validation-title">
      <div className="modal-content modal-large">
        {/* En-tête */}
        <div className="modal-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="modal-eyebrow">ESPACE RESPONSABLE MÉDICAL · VALIDATION</span>
              <CampaignStatusBadge statut={campagne.statut} size="sm" />
            </div>
            <h2 id="validation-title" className="modal-title">
              Examen de conformité de la campagne
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="modal-body space-y-5">
          {/* Fiche récapitulative de la campagne */}
          <div className="validation-summary-card">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-base font-bold text-[#17343B] font-serif">
                  {campagne.nom}
                </h3>
                <p className="text-xs text-[#536B70] mt-0.5">
                  Proposée par : <strong>{campagne.creeParNom}</strong> · Créée le{' '}
                  {new Date(campagne.dateCreation).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-[#EEF7F7] text-[#007599] rounded-lg">
                <Building2 className="w-3.5 h-3.5" />
                <span>{campagne.centreNom}</span>
              </div>
            </div>

            <p className="text-xs text-[#17343B] leading-relaxed mt-3 bg-white p-3 rounded-lg border border-[#D6E8E8]">
              {campagne.description}
            </p>

            {/* Grille des caractéristiques */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="summary-pill">
                <MapPin className="w-4 h-4 text-[#007599]" />
                <div>
                  <span className="block text-[10px] text-[#536B70] uppercase font-bold">Zone</span>
                  <span className="text-xs font-semibold text-[#17343B]">
                    {campagne.commune} ({campagne.secteurs.join(', ')})
                  </span>
                </div>
              </div>

              <div className="summary-pill">
                <Calendar className="w-4 h-4 text-[#007599]" />
                <div>
                  <span className="block text-[10px] text-[#536B70] uppercase font-bold">Période</span>
                  <span className="text-xs font-semibold text-[#17343B]">
                    {campagne.dateDebut} au {campagne.dateFin}
                  </span>
                </div>
              </div>

              <div className="summary-pill">
                <Clock className="w-4 h-4 text-[#007599]" />
                <div>
                  <span className="block text-[10px] text-[#536B70] uppercase font-bold">Horaires</span>
                  <span className="text-xs font-semibold text-[#17343B]">
                    {campagne.horaires}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Équipe d'agents mobilisés */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#17343B] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#007599]" />
                <span>
                  Agents de santé mobilisés ({agentsMobilises.length})
                </span>
              </h4>
              <span className="text-xs text-[#536B70]">
                Objectif de sensibilisation : <strong>{campagne.objectifFemmes} femmes</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {agentsMobilises.map((agent) => (
                <div key={agent.id} className="validation-agent-card">
                  <div className="agent-avatar-circle">
                    {agent.prenom[0]}
                    {agent.nom[0]}
                  </div>
                  <div className="truncate">
                    <strong className="block text-xs text-[#17343B]">
                      {agent.prenom} {agent.nom}
                    </strong>
                    <span className="text-[11px] text-[#536B70]">
                      {agent.roleFonction} · {agent.centreNom}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Encart informatif de notification automatique */}
          <div className="validation-notification-notice">
            <Bell className="w-4 h-4 text-[#007599] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-[#17343B]">
              <strong>Notification automatique :</strong> Dès validation par vos soins, les <strong>{agentsMobilises.length} agents de santé mobilisés</strong> recevront immédiatement une notification opérationnelle pour préparer leur matériel et se déployer.
            </div>
          </div>

          {/* Historique des échanges / validation */}
          {campagne.historique && campagne.historique.length > 0 && (
            <div className="validation-history-box">
              <span className="text-xs font-bold text-[#17343B] flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-[#536B70]" />
                <span>Journal des validations & révisions</span>
              </span>
              <div className="space-y-1.5">
                {campagne.historique.map((h, i) => (
                  <div key={i} className="text-xs text-[#536B70] flex items-start gap-2">
                    <span className="text-[10px] text-[#869E9E] shrink-0 mt-0.5">{h.date}</span>
                    <div>
                      <strong className="text-[#17343B]">{h.auteurNom}</strong> ({h.auteurRole}) :{' '}
                      <span className="capitalize text-[#007599] font-medium">[{h.action}]</span>{' '}
                      {h.commentaire && <span className="italic">« {h.commentaire} »</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zone de décision & commentaire médical */}
          <div className="decision-form-area">
            <label htmlFor="decision-comment" className="form-label flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#007599]" />
              <span>Commentaire médical / Consignes d'ajustement</span>
              <span className="text-xs font-normal text-[#536B70]">(Obligatoire en cas de refus ou de correction)</span>
            </label>
            <textarea
              id="decision-comment"
              rows={3}
              className={`form-input form-textarea ${errorComment ? 'input-error' : ''}`}
              placeholder="Ex : Effectif validé. Merci de prévoir une dotation supplémentaire de gants et de supports visuels d'auto-palpation en Mooré."
              value={commentaire}
              onChange={(e) => {
                setCommentaire(e.target.value);
                if (errorComment) setErrorComment('');
              }}
            />
            {errorComment && <span className="error-message">{errorComment}</span>}
          </div>
        </div>

        {/* Boutons d'arbitrage */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Fermer sans statuer
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Refuser */}
            <button
              type="button"
              className="btn-decision-reject"
              onClick={() => handleAction('refusee')}
              title="Rejeter définitivement la campagne avec motif"
            >
              <XCircle className="w-4 h-4" />
              <span>Refuser</span>
            </button>

            {/* 2. Demander correction */}
            <button
              type="button"
              className="btn-decision-revise"
              onClick={() => handleAction('a_corriger')}
              title="Renvoyer à l'agent avec des consignes médicales"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Demander des corrections</span>
            </button>

            {/* 3. Approuver */}
            <button
              type="button"
              className="btn-decision-approve"
              onClick={() => handleAction('approuvee')}
              title="Valider et notifier immédiatement les agents"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approuver & Notifier les agents</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
