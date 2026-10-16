import React from 'react';
import type { AgentSante, CurrentUserContext } from '../../../types/campaign';
import { CheckCircle, Users, ShieldCheck } from 'lucide-react';

interface AgentSelectionGridProps {
  currentUser: CurrentUserContext;
  agentsDuCentre: AgentSante[];
  autresAgents: AgentSante[];
  selectedAgentIds: string[];
  onToggleAgent: (agentId: string) => void;
  agentSearch: string;
  onSearchChange: (value: string) => void;
}

export const AgentSelectionGrid: React.FC<AgentSelectionGridProps> = ({
  currentUser,
  agentsDuCentre,
  autresAgents,
  selectedAgentIds,
  onToggleAgent,
  agentSearch,
  onSearchChange,
}) => {
  const filterAgent = (agent: AgentSante) => {
    if (!agentSearch.trim()) return true;
    const term = agentSearch.toLowerCase();
    const fullName = `${agent.prenom} ${agent.nom}`.toLowerCase();
    const role = (agent.roleFonction || '').toLowerCase();
    const centre = (agent.centreNom || '').toLowerCase();
    return fullName.includes(term) || role.includes(term) || centre.includes(term);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Bannière explicative */}
      <div className="p-3.5 bg-[#F0F9F8] border border-[#B3DFE5] rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#007599] shrink-0 mt-0.5" />
        <div>
          <strong className="text-xs font-bold text-[#005C75] block">
            Mobilisation des professionnels de santé sur le terrain
          </strong>
          <p className="text-xs text-[#17343B] leading-relaxed mt-0.5 m-0">
            En tant que créateur de la campagne, vous êtes automatiquement assigné comme coordinateur. Sélectionnez les sages-femmes, infirmiers et agents de santé communautaires (ASC) mobilisés pour les consultations et l'orientation clinique.
          </p>
        </div>
      </div>

      {/* Barre d'en-tête et recherche */}
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-xs font-bold text-[#17343B] uppercase tracking-wide flex items-center gap-1.5 m-0">
          <Users className="w-4 h-4 text-[#007599]" />
          <span>Personnel mobilisé sur la mission ({selectedAgentIds.length})</span>
        </h4>

        <input
          type="text"
          placeholder="Filtrer un agent par nom ou fonction..."
          value={agentSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-xs px-2.5 py-1 border border-gray-300 rounded-lg w-56 focus:outline-none focus:ring-1 focus:ring-[#007599]"
        />
      </div>

      {/* Grille des agents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto p-1.5 bg-gray-50 border border-gray-200 rounded-xl">
        {/* Carte Coordinateur (Connecté) */}
        <div className="agent-select-card selected bg-white p-3 rounded-xl border border-[#007599]/40 flex items-center gap-3 shadow-xs">
          <div className="agent-checkbox-pill checked">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <strong className="block text-xs font-bold text-[#005C75]">
              {currentUser.prenom} {currentUser.nom} (Vous)
            </strong>
            <span className="text-[11px] text-[#536B70] block">
              {currentUser.roleTitre} · Coordinateur de mission
            </span>
          </div>
        </div>

        {/* Agents du centre de santé responsable */}
        {agentsDuCentre
          .filter((a) => a.id !== currentUser.id)
          .filter(filterAgent)
          .map((agent) => {
            const isSelected = selectedAgentIds.includes(agent.id);
            return (
              <label
                key={agent.id}
                className={`agent-select-card ${isSelected ? 'selected' : ''} bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3 cursor-pointer hover:border-[#007599]/40 transition-colors shadow-xs`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleAgent(agent.id)}
                  className="sr-only"
                />
                <div className={`agent-checkbox-pill ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <strong className="block text-xs font-semibold text-[#17343B]">
                    {agent.prenom} {agent.nom}
                  </strong>
                  <span className="text-[11px] text-[#536B70] block">
                    {agent.roleFonction} · {agent.centreNom}
                  </span>
                </div>
              </label>
            );
          })}

        {/* Renforts d'autres centres */}
        {autresAgents
          .filter((a) => a.id !== currentUser.id)
          .filter(filterAgent)
          .map((agent) => {
            const isSelected = selectedAgentIds.includes(agent.id);
            return (
              <label
                key={agent.id}
                className={`agent-select-card ${isSelected ? 'selected' : ''} bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3 cursor-pointer hover:border-[#007599]/40 transition-colors shadow-xs`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleAgent(agent.id)}
                  className="sr-only"
                />
                <div className={`agent-checkbox-pill ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <strong className="block text-xs font-semibold text-[#17343B]">
                    {agent.prenom} {agent.nom}
                  </strong>
                  <span className="text-[11px] text-[#536B70] block">
                    {agent.roleFonction} ({agent.centreNom})
                  </span>
                </div>
              </label>
            );
          })}
      </div>

      {/* Résumé de l'équipe */}
      <div className="p-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-xs text-[#536B70]">
        <span>
          Équipe actuelle : <strong>{selectedAgentIds.length} professionnel(s)</strong> mobilisé(s)
        </span>
        <span className="text-[11px] text-[#007599]">
          Chaque agent mobilisé aura accès à la fiche de dépistage dans son espace
        </span>
      </div>
    </div>
  );
};
