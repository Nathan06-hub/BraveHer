import React, { useState } from 'react';
import type { Campagne, PersonneSensibilisee } from '../../types/campaign';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

interface AgentCampaignHistoryListProps {
  campagnes: Campagne[];
  personnes: PersonneSensibilisee[];
  onViewDetails?: (campagne: Campagne) => void;
}

export const AgentCampaignHistoryList: React.FC<AgentCampaignHistoryListProps> = ({
  campagnes,
  personnes,
  onViewDetails,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'en_cours' | 'terminee' | 'en_attente'>('all');

  const filteredCampaigns = campagnes.filter((c) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'en_cours') return c.statut === 'en_cours';
    if (filterStatus === 'terminee') return c.statut === 'terminee';
    if (filterStatus === 'en_attente') {
      return c.statut === 'en_attente' || c.statut === 'approuvee' || c.statut === 'brouillon';
    }
    return true;
  });

  return (
    <section className="agent-history-section">
      <div className="agent-history-head">
        <div>
          <h3>Toutes mes campagnes assignées ({campagnes.length})</h3>
          <p className="text-xs text-[#6C8185] m-0 mt-0.5">
            Historique complet des missions de dépistage et de sensibilisation auxquelles vous participez.
          </p>
        </div>

        {/* Filtres par statut */}
        <div className="agent-filter-tabs">
          <button
            type="button"
            className={`agent-filter-tab-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Toutes ({campagnes.length})
          </button>
          <button
            type="button"
            className={`agent-filter-tab-btn ${filterStatus === 'en_cours' ? 'active' : ''}`}
            onClick={() => setFilterStatus('en_cours')}
          >
            En cours ({campagnes.filter((c) => c.statut === 'en_cours').length})
          </button>
          <button
            type="button"
            className={`agent-filter-tab-btn ${filterStatus === 'terminee' ? 'active' : ''}`}
            onClick={() => setFilterStatus('terminee')}
          >
            Terminées ({campagnes.filter((c) => c.statut === 'terminee').length})
          </button>
          <button
            type="button"
            className={`agent-filter-tab-btn ${filterStatus === 'en_attente' ? 'active' : ''}`}
            onClick={() => setFilterStatus('en_attente')}
          >
            À venir ({campagnes.filter((c) => c.statut !== 'en_cours' && c.statut !== 'terminee').length})
          </button>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="p-6 bg-white border border-[#D6E8E8] rounded-xl text-center text-xs text-[#71888C]">
          Aucune campagne ne correspond à ce filtre.
        </div>
      ) : (
        <div className="agent-campaigns-grid">
          {filteredCampaigns.map((camp) => {
            const inscrits = personnes.filter((p) => p.campagneId === camp.id).length;
            const target = camp.objectifFemmes || 100;
            const pct = Math.min(100, Math.round((inscrits / target) * 100));

            return (
              <article key={camp.id} className="agent-campaign-history-card">
                <div>
                  <div className="agent-card-top-row">
                    <h4>{camp.nom}</h4>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        camp.statut === 'en_cours'
                          ? 'bg-[#E8F5EE] text-[#2E7D32]'
                          : camp.statut === 'terminee'
                          ? 'bg-[#EAF3F2] text-[#005C75]'
                          : 'bg-[#FFF4DF] text-[#A8781A]'
                      }`}
                    >
                      {camp.statut === 'en_cours'
                        ? 'En cours'
                        : camp.statut === 'terminee'
                        ? 'Terminée'
                        : 'Planifiée'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-[#6C8185] mt-2">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#007599]" />
                      <span>
                        {camp.commune} · {camp.centreNom}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#71888C]" />
                      <span>
                        Du {camp.dateDebut} au {camp.dateFin}
                      </span>
                    </span>
                  </div>

                  {/* Progression */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-[#71888C] mb-1">
                      <span>Progression enrôlement</span>
                      <b>
                        {inscrits} / {target} ({pct} %)
                      </b>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#E5EFEF] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#007599]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="agent-card-footer-action">
                  <span className="text-[11px] text-[#819194]">
                    {camp.secteurs.length} secteurs couverts
                  </span>
                  {onViewDetails && (
                    <button
                      type="button"
                      className="text-xs text-[#007599] font-bold hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer p-0"
                      onClick={() => onViewDetails(camp)}
                    >
                      <span>Consulter</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
