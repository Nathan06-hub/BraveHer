import React, { useState } from 'react';
import type {
  Campagne,
  PersonneSensibilisee,
  SmsLog,
  RegleAutomatisationAge,
  CurrentUserContext,
  LanguePatiente,
} from '../../types/campaign';
import { SmsAutomationRulesCard } from './SmsAutomationRulesCard';
import { PostCampaignFollowupModal } from './PostCampaignFollowupModal';
import { QuickPushSmsModal } from './QuickPushSmsModal';
import './messaging.css';
import {
  Send,
  Smartphone,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Users,
  Calendar,
  ArrowRight,
  TrendingUp,
  Globe,
} from 'lucide-react';

interface PushSmsMessagingViewProps {
  campagnes: Campagne[];
  allPersonnes: PersonneSensibilisee[];
  smsLogs: SmsLog[];
  automationRules: RegleAutomatisationAge[];
  currentUser: CurrentUserContext;
  onToggleRule: (ruleId: string) => void;
  onTriggerAgeWave: (rule: RegleAutomatisationAge) => void;
  onTriggerPostCampaignFollowup: (
    campagneId: string,
    targetFilter: 'A_ORIENTER' | 'EFFECTUE' | 'TOUTES',
    messages: {
      moore: string;
      dioula: string;
      fulfulde: string;
      francais: string;
    }
  ) => void;
  onSendQuickPush: (
    commune: string,
    secteur: string,
    langue: LanguePatiente,
    contenu: string,
    estimatedCount: number
  ) => void;
}

export const PushSmsMessagingView: React.FC<PushSmsMessagingViewProps> = ({
  campagnes,
  allPersonnes,
  smsLogs,
  automationRules,
  currentUser,
  onToggleRule,
  onTriggerAgeWave,
  onTriggerPostCampaignFollowup,
  onSendQuickPush,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 'automation' | 'post_campaign' | 'logs'
  >('dashboard');

  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [isQuickPushModalOpen, setIsQuickPushModalOpen] = useState(false);

  // Filtres pour le journal des logs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ENVOYE' | 'ECHEC'>('ALL');
  const [langFilter, setLangFilter] = useState<'ALL' | LanguePatiente>('ALL');

  // KPIs
  const totalSms = smsLogs.length;
  const totalSucces = smsLogs.filter((l) => l.statut === 'ENVOYE').length;
  const totalEchecs = smsLogs.filter((l) => l.statut === 'ECHEC').length;
  const tauxReussite = totalSms > 0 ? Math.round((totalSucces / totalSms) * 100) : 100;

  // Filtrage des logs
  const filteredLogs = smsLogs.filter((log) => {
    if (statusFilter !== 'ALL' && log.statut !== statusFilter) return false;
    if (langFilter !== 'ALL' && log.langue !== langFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTel = log.destinataireTelephone.toLowerCase().includes(q);
      const matchNom = log.destinataireNom?.toLowerCase().includes(q) || false;
      const matchContenu = log.contenu.toLowerCase().includes(q);
      const matchCampagne = log.campagneTitre?.toLowerCase().includes(q) || false;
      if (!matchTel && !matchNom && !matchContenu && !matchCampagne) return false;
    }
    return true;
  });

  const LANGUE_BADGES: Record<LanguePatiente, { bg: string; text: string }> = {
    Mooré: { bg: '#FEF3C7', text: '#92400E' },
    Dioula: { bg: '#E0F2FE', text: '#0369A1' },
    Fulfuldé: { bg: '#F3E8FF', text: '#7E22CE' },
    Français: { bg: '#ECFDF5', text: '#047857' },
    Autre: { bg: '#F1F5F9', text: '#475569' },
  };

  return (
    <div className="messaging-hub-container">
      {/* 1. Grande Bannière Header avec branding Orange Burkina Faso */}
      <div className="messaging-header-card">
        <div className="messaging-header-content">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="messaging-title">
                Hub de Messagerie & Diffusion Push SMS
              </h1>
              <p className="messaging-subtitle">
                Sensibilisation de santé communautaire sans connexion Internet 4G : contact direct des femmes du Burkina Faso par SMS en <strong>Mooré</strong>, <strong>Dioula</strong>, <strong>Fulfuldé</strong> et <strong>Français</strong> · Centre de coordination : <em>{currentUser.centreNom}</em>.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsFollowupModalOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#17343B] bg-white hover:bg-[#F8FAFB] transition-all shadow-md flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-[#007599]" />
                <span>📢 Relance Post-Campagne</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuickPushModalOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF7900] hover:bg-[#E06A00] transition-all shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-white" />
                <span>⚡ Nouveau Push SMS Immédiat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Onglets de navigation du Hub */}
      <div className="messaging-tabs-nav">
        <button
          type="button"
          onClick={() => setActiveSubTab('dashboard')}
          className={`messaging-tab-btn ${activeSubTab === 'dashboard' ? 'active' : ''}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tableau de bord Passerelle</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('automation')}
          className={`messaging-tab-btn ${activeSubTab === 'automation' ? 'active' : ''}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Automatisation par Âge (20 ans, 40 ans...)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('post_campaign')}
          className={`messaging-tab-btn ${activeSubTab === 'post_campaign' ? 'active' : ''}`}
        >
          <Users className="w-4 h-4" />
          <span>Relances Post-Campagne</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('logs')}
          className={`messaging-tab-btn ${activeSubTab === 'logs' ? 'active' : ''}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Journal d'audit SMS ({smsLogs.length})</span>
        </button>
      </div>

      {/* 3. Contenu de l'onglet actif */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Cartes KPIs Passerelle Orange */}
          <div className="gateway-kpi-grid">
            <div className="gateway-kpi-card">
              <span className="gateway-kpi-label">Solde Crédits SMS Orange</span>
              <div className="gateway-kpi-value text-[#FF7900]">
                4 850 <span className="text-xs font-normal text-[#536B70]">crédits</span>
              </div>
              <span className="gateway-kpi-sub">Recharge subventionnée Orange Money</span>
            </div>

            <div className="gateway-kpi-card">
              <span className="gateway-kpi-label">Total SMS Diffusés</span>
              <div className="gateway-kpi-value">
                {totalSms} <span className="text-xs font-normal text-[#536B70]">envois</span>
              </div>
              <span className="gateway-kpi-sub">Depuis le lancement des campagnes</span>
            </div>

            <div className="gateway-kpi-card">
              <span className="gateway-kpi-label">Taux de Délivrabilité GSM</span>
              <div className="gateway-kpi-value text-emerald-600">
                {tauxReussite}% <span className="text-xs font-normal text-[#536B70]">succès</span>
              </div>
              <span className="gateway-kpi-sub">{totalSucces} délivrés · {totalEchecs} échecs</span>
            </div>

            <div className="gateway-kpi-card">
              <span className="gateway-kpi-label">Langue la plus utilisée</span>
              <div className="gateway-kpi-value text-[#007599]">
                Mooré <span className="text-xs font-normal text-[#536B70]">(54%)</span>
              </div>
              <span className="gateway-kpi-sub">Suivi du Dioula (26%) et Français (15%)</span>
            </div>
          </div>

          {/* Grille : Répartition linguistique + Programmes actifs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Boîte 1 : Répartition par Langue locale */}
            <div className="bg-white p-4 rounded-xl border border-[#D6E8E8] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#17343B] uppercase tracking-wide flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#007599]" />
                  <span>Répartition Linguistique des SMS</span>
                </h4>
                <span className="text-[11px] text-[#536B70]">Adapté à chaque femme</span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#92400E]">Mooré (Région Centre & Plateau)</span>
                    <strong className="text-[#17343B]">54% (780 SMS)</strong>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '54%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#0369A1]">Dioula (Hauts-Bassins & Ouest)</span>
                    <strong className="text-[#17343B]">26% (375 SMS)</strong>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: '26%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#047857]">Français (Urbain / Administratif)</span>
                    <strong className="text-[#17343B]">14% (200 SMS)</strong>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '14%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#7E22CE]">Fulfuldé (Sahel & Nord)</span>
                    <strong className="text-[#17343B]">6% (87 SMS)</strong>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '6%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Boîte 2 : Raccourcis d'actions */}
            <div className="bg-gradient-to-br from-[#FFF9F5] to-white p-4 rounded-xl border border-[#FFD8B8] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#FF7900] uppercase tracking-wider block mb-1">
                  Accès Rapides & Actions Automatisées
                </span>
                <h4 className="text-sm font-bold text-[#17343B] mb-2">
                  Programmes de Prévention Précoce
                </h4>
                <p className="text-xs text-[#536B70] leading-relaxed mb-4">
                  Déclenchez la vague mensuelle d'autopalpation pour les femmes de 20 à 35 ans ou lancez une relance de confirmation d'échographie pour une campagne précise.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('automation')}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-[#17343B] bg-white hover:bg-[#F8FAFB] border border-[#FFD8B8] flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF7900]" />
                    <span>Gérer les règles récurrentes (20 ans, 40 ans...)</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#536B70]" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsFollowupModalOpen(true)}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-[#FF7900] hover:bg-[#E06A00] flex items-center justify-between transition-all shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white" />
                    <span>Lancer une relance ciblée post-campagne</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Onglet Automatisation par âge */}
      {activeSubTab === 'automation' && (
        <SmsAutomationRulesCard
          rules={automationRules}
          onToggleRule={onToggleRule}
          onTriggerRuleSimulation={onTriggerAgeWave}
        />
      )}

      {/* 5. Onglet Relances Post-Campagne */}
      {activeSubTab === 'post_campaign' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-[#17343B]">
                Relances Post-Campagne & Suivi des Patientes
              </h3>
              <p className="text-xs text-[#536B70]">
                Après une campagne, relancez les femmes selon leur statut clinique (suspicion échographie, autopalpation mensuelle) dans leur langue maternelle.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFollowupModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF7900] hover:bg-[#E06A00] transition-all shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Programmer une Relance Groupée</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campagnes.map((camp) => {
              const campPersonnes = allPersonnes.filter((p) => p.campagneId === camp.id);
              const aOrienterCount = campPersonnes.filter((p) => p.statutDepistage === 'À orienter').length;

              return (
                <div key={camp.id} className="post-campaign-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#17343B]">{camp.titre || camp.nom}</h4>
                      <span className="text-[11px] text-[#536B70]">
                        {camp.commune} · {camp.secteurCible || camp.secteurs.join(', ')}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#536B70]">
                      {camp.statut}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-2 bg-[#F8FAFB] rounded-lg">
                    <div>
                      <span className="text-[10px] text-[#536B70] block uppercase">Femmes sensibilisées</span>
                      <strong className="text-[#17343B] font-bold">{campPersonnes.length} patientes</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#536B70] block uppercase">Cas à orienter</span>
                      <strong className="text-amber-700 font-bold">{aOrienterCount} échographies</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFollowupModalOpen(true)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-[#FF7900] bg-[#FFF4EB] hover:bg-[#FFE8D6] transition-colors border border-[#FFD8B8] flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Déclencher relance pour cette campagne</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Onglet Journal d'audit centralisé des SmsLog */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          {/* Barre de recherche et filtres */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-[#F8FAFB] p-3 rounded-xl border border-[#D6E8E8]">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#536B70]" />
              <input
                type="text"
                placeholder="Rechercher par téléphone, nom ou mot-clé..."
                className="form-input text-xs w-full bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-[#536B70]" />

              <select
                className="text-xs p-1.5 rounded-lg border border-[#D6E8E8] bg-white text-[#17343B]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ENVOYE">ENVOYE (Succès)</option>
                <option value="ECHEC">ECHEC</option>
              </select>

              <select
                className="text-xs p-1.5 rounded-lg border border-[#D6E8E8] bg-white text-[#17343B]"
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value as any)}
              >
                <option value="ALL">Toutes les langues</option>
                <option value="Mooré">Mooré</option>
                <option value="Dioula">Dioula</option>
                <option value="Fulfuldé">Fulfuldé</option>
                <option value="Français">Français</option>
              </select>
            </div>
          </div>

          {/* Tableau central des SmsLog */}
          {filteredLogs.length > 0 ? (
            <div className="beneficiaries-table-wrapper">
              <table className="beneficiaries-table">
                <thead>
                  <tr>
                    <th>Date & Heure</th>
                    <th>Destinataire</th>
                    <th>Langue</th>
                    <th>Type Message</th>
                    <th>Contenu SMS</th>
                    <th>Statut de livraison</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const lBadge = log.langue ? (LANGUE_BADGES[log.langue] || LANGUE_BADGES.Autre) : LANGUE_BADGES.Mooré;
                    return (
                      <tr key={log.id}>
                        <td className="whitespace-nowrap font-mono text-xs text-[#17343B]">
                          {log.dateEnvoi}
                        </td>

                        <td>
                          <strong className="block text-xs text-[#17343B]">
                            {log.destinataireNom || 'Contact géociblé'}
                          </strong>
                          <span className="text-[11px] font-mono text-[#536B70]">
                            {log.destinataireTelephone}
                          </span>
                        </td>

                        <td>
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: lBadge.bg, color: lBadge.text }}
                          >
                            {log.langue}
                          </span>
                        </td>

                        <td>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#536B70] uppercase">
                            {log.typeMessage || 'PUSH_SMS'}
                          </span>
                        </td>

                        <td>
                          <p className="text-xs text-[#17343B] font-mono leading-snug line-clamp-2 max-w-md">
                            {log.contenu}
                          </p>
                        </td>

                        <td>
                          {log.statut === 'ENVOYE' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ENVOYE</span>
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>ECHEC</span>
                              </span>
                              {log.motifEchec && (
                                <span className="block text-[10px] text-rose-700 italic max-w-xs">
                                  {log.motifEchec}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#F8FAFB] rounded-xl border border-dashed border-[#D6E8E8]">
              <Smartphone className="w-8 h-8 text-[#536B70] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[#536B70]">
                Aucun log SMS ne correspond à vos filtres de recherche.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modale de Relance Post-Campagne */}
      <PostCampaignFollowupModal
        isOpen={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        campagnes={campagnes}
        allPersonnes={allPersonnes}
        onConfirmFollowup={onTriggerPostCampaignFollowup}
      />

      {/* Modale de Push SMS Immédiat */}
      <QuickPushSmsModal
        isOpen={isQuickPushModalOpen}
        onClose={() => setIsQuickPushModalOpen(false)}
        onSendQuickPush={onSendQuickPush}
      />
    </div>
  );
};
