import React, { useState, useMemo } from 'react';
import type {
  Campagne,
  PersonneSensibilisee,
  SmsLog,
  RegleAutomatisationAge,
  CurrentUserContext,
  LanguePatiente,
} from '../types/campaign';
import {
  KpiCard,
  SearchInput,
  LanguageBadge,
  SmsStatusBadge,
  EmptyState,
  Button,
} from '../components/ui';
import {
  SmsAutomationRulesCard,
  PostCampaignFollowupModal,
  QuickPushSmsModal,
} from '../components/messaging';
import '../components/messaging/messaging.css';
import {
  Send,
  Smartphone,
  Filter,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  Globe,
  CheckCircle2,
} from 'lucide-react';

export interface PushSmsPageProps {
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

export const PushSmsPage: React.FC<PushSmsPageProps> = ({
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
  // Navigation par onglets épurée en 3 vues cohérentes
  const [activeTab, setActiveTab] = useState<'overview' | 'automation' | 'logs'>('overview');

  // Modales
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [isQuickPushModalOpen, setIsQuickPushModalOpen] = useState(false);
  const [preselectedCampagneId, setPreselectedCampagneId] = useState<string | undefined>(undefined);

  // Filtres pour le journal des logs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ENVOYE' | 'ECHEC'>('ALL');
  const [langFilter, setLangFilter] = useState<'ALL' | LanguePatiente>('ALL');

  // KPIs dynamiques calculés à partir des vrais logs
  const totalSms = smsLogs.length;
  const totalSucces = useMemo(() => smsLogs.filter((l) => l.statut === 'ENVOYE').length, [smsLogs]);
  const totalEchecs = useMemo(() => smsLogs.filter((l) => l.statut === 'ECHEC').length, [smsLogs]);
  const tauxReussite = totalSms > 0 ? Math.round((totalSucces / totalSms) * 100) : 100;

  // Calcul dynamique de la répartition linguistique réelle
  const langStats = useMemo(() => {
    const counts: Record<string, number> = {
      Mooré: 0,
      Dioula: 0,
      Français: 0,
      Fulfuldé: 0,
    };

    smsLogs.forEach((log) => {
      const l = log.langue || 'Mooré';
      if (counts[l] !== undefined) {
        counts[l] += 1;
      } else {
        counts['Mooré'] += 1;
      }
    });

    const denom = totalSms || 1;
    return {
      mooreCount: counts['Mooré'],
      moorePct: Math.round((counts['Mooré'] / denom) * 100),
      dioulaCount: counts['Dioula'],
      dioulaPct: Math.round((counts['Dioula'] / denom) * 100),
      francaisCount: counts['Français'],
      francaisPct: Math.round((counts['Français'] / denom) * 100),
      fulfuldeCount: counts['Fulfuldé'],
      fulfuldePct: Math.round((counts['Fulfuldé'] / denom) * 100),
    };
  }, [smsLogs, totalSms]);

  // Langue dominante calculée
  const dominantLang = useMemo(() => {
    const entries = [
      { name: 'Mooré', count: langStats.mooreCount, pct: langStats.moorePct },
      { name: 'Dioula', count: langStats.dioulaCount, pct: langStats.dioulaPct },
      { name: 'Français', count: langStats.francaisCount, pct: langStats.francaisPct },
      { name: 'Fulfuldé', count: langStats.fulfuldeCount, pct: langStats.fulfuldePct },
    ];
    entries.sort((a, b) => b.count - a.count);
    return entries[0] || { name: 'Mooré', count: 0, pct: 0 };
  }, [langStats]);

  // Filtrage du journal des logs
  const filteredLogs = useMemo(() => {
    return smsLogs.filter((log) => {
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
  }, [smsLogs, statusFilter, langFilter, searchQuery]);

  const handleOpenFollowup = (campagneId?: string) => {
    setPreselectedCampagneId(campagneId);
    setIsFollowupModalOpen(true);
  };

  return (
    <div className="push-sms-page-container">
      {/* 1. Header harmonisé avec branding Orange Burkina Faso & Palette Brave_her */}
      <header className="sms-page-header">
        <div className="sms-page-header-content">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="max-w-2xl">
              <h1 className="sms-page-title">
                Diffusion Push SMS & Sensibilisation
              </h1>

              <p className="sms-page-subtitle">
                Sensibilisation de santé communautaire sans connexion Internet 4G : contact direct des femmes du Burkina Faso par SMS en <strong>Mooré</strong>, <strong>Dioula</strong>, <strong>Fulfuldé</strong> et <strong>Français</strong> · Centre de coordination : <em>{currentUser.centreNom}</em>.
              </p>
            </div>

            {/* Actions rapides d'envoi dans le header */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenFollowup()}
                leftIcon={<Users className="w-4 h-4 text-[var(--teal)]" />}
                className="bg-white/95 text-[var(--ink)] border-white/30 hover:bg-white shadow-sm"
              >
                Relance Post-Campagne
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsQuickPushModalOpen(true)}
                leftIcon={<Send className="w-4 h-4 text-white" />}
                className="!bg-[var(--orange)] hover:!bg-[#D97706] text-white shadow-md border-0"
              >
                Nouveau Push SMS Immédiat
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Barre d'onglets de navigation épurée */}
      <nav className="sms-page-tabs-bar" aria-label="Navigation Push SMS">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`sms-page-tab-item ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Vue d'ensemble & Envois</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('automation')}
          className={`sms-page-tab-item ${activeTab === 'automation' ? 'active' : ''}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Automatisation Cycle de Vie ({automationRules.length} règles)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`sms-page-tab-item ${activeTab === 'logs' ? 'active' : ''}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Journal d'audit SMS ({smsLogs.length})</span>
        </button>
      </nav>

      {/* 3. Contenu de la vue active */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Cartes KPIs standardisées réutilisant KpiCard du Design System */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total SMS Diffusés"
              value={totalSms}
              icon={Smartphone}
              variant="teal"
              subtitle="Envois répertoriés"
            />

            <KpiCard
              title="Taux de Délivrabilité"
              value={`${tauxReussite}%`}
              icon={CheckCircle2}
              variant="amber"
              subtitle={`${totalSucces} délivrés · ${totalEchecs} échecs`}
            />

            <KpiCard
              title="Protocoles d'Âge"
              value={automationRules.filter((r) => r.actif).length}
              icon={Sparkles}
              variant="teal"
              subtitle="Règles automatiques actives"
            />

            <KpiCard
              title="Langue Prédominante"
              value={dominantLang.name}
              icon={Globe}
              variant="purple"
              subtitle={`${dominantLang.pct}% des diffusions (${dominantLang.count} SMS)`}
            />
          </div>

          {/* Grille principale : Répartition Linguistique Dynamique & Relances par Campagne */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne 1 : Répartition Linguistique Réelle calculée dynamiquement */}
            <div className="bg-white p-5 rounded-2xl border border-[var(--line)] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--cream)] text-[var(--teal)] flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--ink)]">
                        Répartition Linguistique
                      </h3>
                      <p className="text-[11px] text-[var(--muted)]">
                        Calculée en temps réel d'après les logs
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--teal)] bg-[var(--cream)] px-2 py-0.5 rounded-full border border-[var(--line)]">
                    4 langues
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <LanguageBadge langue="Mooré" size="sm" />
                        <span className="text-[11px] text-[var(--muted)]">Centre / Plateau</span>
                      </div>
                      <strong className="text-[var(--ink)]">
                        {langStats.moorePct}% ({langStats.mooreCount})
                      </strong>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${langStats.moorePct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <LanguageBadge langue="Dioula" size="sm" />
                        <span className="text-[11px] text-[var(--muted)]">Hauts-Bassins / Ouest</span>
                      </div>
                      <strong className="text-[var(--ink)]">
                        {langStats.dioulaPct}% ({langStats.dioulaCount})
                      </strong>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${langStats.dioulaPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <LanguageBadge langue="Français" size="sm" />
                        <span className="text-[11px] text-[var(--muted)]">Urbain</span>
                      </div>
                      <strong className="text-[var(--ink)]">
                        {langStats.francaisPct}% ({langStats.francaisCount})
                      </strong>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${langStats.francaisPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <LanguageBadge langue="Fulfuldé" size="sm" />
                        <span className="text-[11px] text-[var(--muted)]">Sahel / Nord</span>
                      </div>
                      <strong className="text-[var(--ink)]">
                        {langStats.fulfuldePct}% ({langStats.fulfuldeCount})
                      </strong>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${langStats.fulfuldePct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-[var(--cream)] border border-[var(--line)] text-xs text-[var(--muted)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--teal)] shrink-0" />
                <span>
                  La langue préférée de la patiente est automatiquement sélectionnée lors des relances.
                </span>
              </div>
            </div>

            {/* Colonnes 2 et 3 : Relances Ciblées par Campagne */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[var(--line)] shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink)]">
                    Relances & Suivi Post-Campagne
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Programmez un rappel SMS ciblé pour les cas avec suspicion d'échographie ou les convocations de dépistage.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenFollowup()}
                  leftIcon={<Users className="w-3.5 h-3.5 text-[var(--teal)]" />}
                >
                  Relance Groupée
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {campagnes.map((camp) => {
                  const campPersonnes = allPersonnes.filter((p) => p.campagneId === camp.id);
                  const aOrienterCount = campPersonnes.filter(
                    (p) => p.statutDepistage === 'À orienter'
                  ).length;

                  return (
                    <div
                      key={camp.id}
                      className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--teal)]/40 transition-all flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-xs font-bold text-[var(--ink)] line-clamp-1">
                            {camp.titre || camp.nom}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[var(--muted)] shrink-0">
                            {camp.statut}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--muted)] block">
                          📍 {camp.commune} · {camp.secteurCible || camp.secteurs.join(', ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs p-2 bg-[var(--cream)] rounded-lg">
                        <div>
                          <span className="text-[10px] text-[var(--muted)] block uppercase font-semibold">
                            Sensibilisées
                          </span>
                          <strong className="text-[var(--ink)]">{campPersonnes.length} femmes</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--muted)] block uppercase font-semibold">
                            À orienter
                          </span>
                          <strong className="text-amber-700 font-bold">{aOrienterCount} cas</strong>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenFollowup(camp.id)}
                        leftIcon={<Send className="w-3 h-3 text-[var(--teal)]" />}
                        className="w-full text-xs !h-[34px]"
                      >
                        Programmer relance pour ce secteur
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Onglet Automatisation par Âge (Cycle de vie) */}
      {activeTab === 'automation' && (
        <SmsAutomationRulesCard
          rules={automationRules}
          onToggleRule={onToggleRule}
          onTriggerRuleSimulation={onTriggerAgeWave}
        />
      )}

      {/* 5. Onglet Journal d'Audit GSM Centralisé */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Barre de recherche et filtres harmonisée avec SearchInput */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3.5 rounded-2xl border border-[var(--line)] shadow-xs">
            <div className="w-full sm:w-80">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher par téléphone, nom, mot-clé..."
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-[var(--muted)]" />

              <select
                className="text-xs p-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none focus:border-[var(--teal)]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label="Filtrer par statut de livraison"
              >
                <option value="ALL">Tous les statuts de livraison</option>
                <option value="ENVOYE">ENVOYE (Succès)</option>
                <option value="ECHEC">ECHEC (Erreur)</option>
              </select>

              <select
                className="text-xs p-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none focus:border-[var(--teal)]"
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value as any)}
                aria-label="Filtrer par langue de diffusion"
              >
                <option value="ALL">Toutes les langues</option>
                <option value="Mooré">Mooré</option>
                <option value="Dioula">Dioula</option>
                <option value="Fulfuldé">Fulfuldé</option>
                <option value="Français">Français</option>
              </select>
            </div>
          </div>

          {/* Tableau épuré des SmsLog */}
          {filteredLogs.length > 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--line)] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[var(--cream)] border-b border-[var(--line)] text-[11px] font-bold text-[var(--ink)] uppercase tracking-wider">
                      <th className="py-3 px-4">Date & Heure</th>
                      <th className="py-3 px-4">Destinataire</th>
                      <th className="py-3 px-4">Langue</th>
                      <th className="py-3 px-4">Contenu du Message SMS</th>
                      <th className="py-3 px-4">Statut de livraison</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--cream)]/40 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[var(--ink)]">
                          {log.dateEnvoi}
                        </td>

                        <td className="py-3 px-4">
                          <strong className="block text-[var(--ink)] font-semibold">
                            {log.destinataireNom || 'Contact géociblé'}
                          </strong>
                          <span className="text-[11px] font-mono text-[var(--muted)]">
                            {log.destinataireTelephone}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <LanguageBadge langue={log.langue || 'Mooré'} size="sm" />
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-mono text-xs text-[var(--ink)] leading-snug max-w-xl">
                            {log.contenu}
                          </p>
                          {log.campagneTitre && (
                            <span className="text-[10px] text-[var(--muted)] italic mt-0.5 block">
                              Campagne : {log.campagneTitre}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <SmsStatusBadge statut={log.statut} size="sm" />
                            {log.motifEchec && (
                              <span className="block text-[10px] text-rose-700 italic max-w-xs">
                                {log.motifEchec}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Aucun log SMS ne correspond aux filtres"
              description="Vérifiez les termes de votre recherche ou réinitialisez les filtres par statut et par langue."
              action={{
                label: 'Réinitialiser les filtres',
                onClick: () => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setLangFilter('ALL');
                },
              }}
            />
          )}
        </div>
      )}

      {/* Modale de Relance Post-Campagne */}
      <PostCampaignFollowupModal
        isOpen={isFollowupModalOpen}
        onClose={() => {
          setIsFollowupModalOpen(false);
          setPreselectedCampagneId(undefined);
        }}
        campagnes={campagnes}
        allPersonnes={allPersonnes}
        initialCampagneId={preselectedCampagneId}
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

export default PushSmsPage;
