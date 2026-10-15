import React from 'react';
import type { Campagne, PersonneSensibilisee, AgentSante } from '../../types/campaign';
import {
  Calendar,
  MapPin,
  Users,
  UserPlus,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AgentActiveCampaignCardProps {
  campagne: Campagne | null;
  personnes: PersonneSensibilisee[];
  allAgents: AgentSante[];
  onOpenAddPatient: () => void;
  onViewCampaignDetails?: (campagne: Campagne) => void;
}

export const AgentActiveCampaignCard: React.FC<AgentActiveCampaignCardProps> = ({
  campagne,
  personnes,
  allAgents,
  onOpenAddPatient,
  onViewCampaignDetails,
}) => {
  if (!campagne) {
    return (
      <div className="agent-active-campaign-card" style={{ borderColor: '#D6E8E8' }}>
        <div className="text-center py-6">
          <Sparkles className="w-8 h-8 mx-auto text-[#71888C] mb-2" />
          <h3 className="text-base font-bold text-[#17343B]">Aucune campagne active actuellement</h3>
          <p className="text-xs text-[#536B70] mt-1 max-w-md mx-auto">
            Vous n'avez pas de mission de terrain en cours aujourd’hui. Vos prochaines campagnes apparaîtront dès leur validation médicale.
          </p>
        </div>
      </div>
    );
  }

  // Filtrer les personnes sensibilisées rattachées à cette campagne
  const patientsDeLaCampagne = personnes.filter((p) => p.campagneId === campagne.id);
  const totalInscrits = patientsDeLaCampagne.length;
  const objectif = campagne.objectifFemmes || 100;
  const progressionPct = Math.min(100, Math.round((totalInscrits / objectif) * 100));

  // Agents mobilisés pour cette campagne
  const colleguesMobilises = allAgents.filter((a) => campagne.agentsMobilisesIds.includes(a.id));

  // Les 4 dernières patientes enrôlées
  const dernieresPatientes = patientsDeLaCampagne.slice(0, 4);

  return (
    <article className="agent-active-campaign-card">
      {/* Barre de statut supérieure */}
      <div className="agent-active-badge-bar">
        <span className="agent-status-pulse">
          <i />
          <span>Campagne active en cours</span>
        </span>

        <div className="flex items-center gap-2 text-xs text-[#5C7377]">
          <Calendar size={13} className="text-[#007599]" />
          <span>
            Du <b>{campagne.dateDebut}</b> au <b>{campagne.dateFin}</b>
          </span>
        </div>
      </div>

      {/* Titre, Lieu et Bouton d'action principale */}
      <div className="agent-active-title-row">
        <div>
          <h2>{campagne.nom}</h2>
          <div className="agent-active-meta-chips">
            <span className="agent-meta-chip">
              <MapPin size={13} className="text-[#007599]" />
              <span>
                {campagne.commune} · {campagne.centreNom}
              </span>
            </span>
            <span className="agent-meta-chip">
              <Clock size={13} className="text-[#71888C]" />
              <span>{campagne.horaires}</span>
            </span>
            <span className="agent-meta-chip">
              <Users size={13} className="text-[#71888C]" />
              <span>{colleguesMobilises.length} agents mobilisés</span>
            </span>
          </div>
        </div>

        {/* Bouton de création de patiente */}
        <button
          type="button"
          className="agent-btn-add-patient"
          onClick={onOpenAddPatient}
          title="Ouvrir la fiche d'enrôlement patiente"
        >
          <UserPlus size={16} />
          <span>＋ Fiche de création de patiente</span>
        </button>
      </div>

      {/* Bloc de progression et secteurs d'intervention */}
      <div className="agent-campaign-progress-block">
        <div className="agent-progress-header">
          <span>Femmes sensibilisées & dépistées sur le terrain</span>
          <b>
            {totalInscrits} <span style={{ fontWeight: 400, color: '#819194' }}>/ {objectif} objectif</span> ({progressionPct} %)
          </b>
        </div>
        <div className="agent-progress-bar-track">
          <div
            className="agent-progress-bar-fill"
            style={{ width: `${progressionPct}%` }}
          />
        </div>

        {/* Secteurs couverts */}
        <div className="agent-sectors-row">
          <span className="text-xs text-[#71888C] font-semibold mr-1">Secteurs couverts :</span>
          {campagne.secteurs.map((sec, idx) => (
            <span key={idx} className="agent-sector-badge">
              {sec}
            </span>
          ))}
        </div>
      </div>

      {/* Dernières patientes enregistrées sur cette campagne */}
      <div className="agent-recent-patients-section">
        <div className="agent-recent-patients-title">
          <span>Dernières patientes enrôlées sur cette campagne ({totalInscrits})</span>
          {onViewCampaignDetails && (
            <button
              type="button"
              className="text-xs text-[#007599] hover:underline flex items-center gap-1 font-semibold border-none bg-transparent cursor-pointer p-0"
              onClick={() => onViewCampaignDetails(campagne)}
            >
              <span>Voir tout le registre</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {dernieresPatientes.length === 0 ? (
          <div className="p-3 bg-[#F8FCFC] border border-[#E5EFEF] rounded-lg text-xs text-[#6C8185] flex items-center justify-between">
            <span>Aucune patiente n'a encore été enregistrée sur cette mission.</span>
            <button
              type="button"
              onClick={onOpenAddPatient}
              className="text-xs text-[#007599] font-bold border-none bg-transparent hover:underline cursor-pointer"
            >
              Enregistrer la 1ère patiente →
            </button>
          </div>
        ) : (
          <div className="agent-recent-patients-list">
            {dernieresPatientes.map((p) => {
              const statusClass =
                p.statutDepistage === 'Effectué'
                  ? 'effectue'
                  : p.statutDepistage === 'À orienter'
                  ? 'orienter'
                  : 'planifie';

              return (
                <div key={p.id} className="agent-patient-mini-card">
                  <div className="agent-patient-mini-info">
                    <h4>
                      {p.prenom} {p.nom}
                    </h4>
                    <span>
                      {p.age} ans · {p.languePreferee} · {p.secteur}
                    </span>
                  </div>
                  <span className={`agent-patient-status-pill ${statusClass}`}>
                    {p.statutDepistage}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
};
