import React, { useState, useMemo } from 'react';
import type {
  PartenaireDonneur,
  DonTransaction,
  AppelAideCasGrave,
  CategoriePartenaire,
} from '../../types/partner';
import {
  Building2,
  Coins,
  Send,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Search,
  Code2,
  ChevronUp,
  AlertCircle,
  Phone,
  Mail,
  Shield,
  Heart,
  TrendingUp,
} from 'lucide-react';

interface PartnersHubViewProps {
  partenaires: PartenaireDonneur[];
  dons: DonTransaction[];
  appelsAide: AppelAideCasGrave[];
  onSimulateDonation: (partenaire?: PartenaireDonneur) => void;
  onNewAidAppeal: () => void;
  onViewPartnerDetail: (partenaire: PartenaireDonneur) => void;
  onSponsorPatient: (partenaire: PartenaireDonneur) => void;
  onApproveAppeal?: (appel: AppelAideCasGrave) => void;
}

export const PartnersHubView: React.FC<PartnersHubViewProps> = ({
  partenaires,
  dons,
  appelsAide,
  onSimulateDonation,
  onNewAidAppeal,
  onViewPartnerDetail,
  onSponsorPatient,
  onApproveAppeal,
}) => {
  const [subTab, setSubTab] = useState<'repertoire' | 'transactions' | 'appels'>('repertoire');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | CategoriePartenaire>('all');
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);

  // Statistiques calculées pour le Hub
  const totalDonsCollectes = useMemo(() => {
    return partenaires.reduce((acc, p) => acc + p.totalDonsVerses, 0);
  }, [partenaires]);

  const soldeDisponibleGlobal = useMemo(() => {
    return partenaires.reduce((acc, p) => acc + p.soldeDisponible, 0);
  }, [partenaires]);

  const totalPatientesParrainees = useMemo(() => {
    return partenaires.reduce((acc, p) => acc + p.nombrePatientesParrainees, 0);
  }, [partenaires]);

  const partenairesConnectesCount = useMemo(() => {
    return partenaires.filter((p) => p.statutApi === 'connecte').length;
  }, [partenaires]);

  // Filtrage des partenaires
  const filteredPartenaires = useMemo(() => {
    return partenaires.filter((p) => {
      const matchesSearch =
        p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sigle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contactNom.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || p.categorie === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [partenaires, searchQuery, selectedCategory]);

  // Obtenir le thème visuel pour un partenaire
  const getPartnerColor = (sigle: string) => {
    switch (sigle) {
      case 'FOND-ORANGE':
        return {
          bg: '#FFF7ED',
          border: '#FED7AA',
          text: '#C2410C',
          badgeBg: '#EA580C',
          accent: '#FF7900',
        };
      case 'CORIS-FOND':
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#1D4ED8',
          badgeBg: '#1E40AF',
          accent: '#0F2E5A',
        };
      case 'UNICEF-BF':
        return {
          bg: '#F0F9FF',
          border: '#BAE6FD',
          text: '#0284C7',
          badgeBg: '#0284C7',
          accent: '#00AEEF',
        };
      case 'MSHP-DSME':
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#047857',
          badgeBg: '#059669',
          accent: '#008751',
        };
      case 'MOOV-CSR':
        return {
          bg: '#F0FDFA',
          border: '#99F6E4',
          text: '#0F766E',
          badgeBg: '#0D9488',
          accent: '#0284C7',
        };
      default:
        return {
          bg: '#F8FAFC',
          border: '#E2E8F0',
          text: '#475569',
          badgeBg: '#64748B',
          accent: '#007599',
        };
    }
  };

  const getCategoryLabel = (cat: CategoriePartenaire) => {
    switch (cat) {
      case 'telecom_fondation':
        return 'Télécom & Fondation RSE';
      case 'banque_finance':
        return 'Banque & Secteur Financier';
      case 'ong_internationale':
        return 'ONG Internationale';
      case 'institution_etat':
        return 'Institution Publique / État';
      case 'entreprise_privee':
        return 'Entreprise Privée';
      default:
        return cat;
    }
  };

  const getTypeDonLabel = (type: string) => {
    switch (type) {
      case 'api_automatique':
        return 'Webhook API Auto';
      case 'orange_money_b2b':
        return 'Orange Money B2B';
      case 'virement_bancaire':
        return 'Virement Bancaire';
      case 'subvention_directe':
        return 'Subvention d’État';
      default:
        return type;
    }
  };

  const getStatutAppelBadge = (statut: string) => {
    switch (statut) {
      case 'parraine':
      case 'declenche_bon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Parrainage Confirmé (Bon Émis)
          </span>
        );
      case 'consulte_par_partenaire':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            En examen chez le partenaire
          </span>
        );
      case 'emis':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Send className="w-3.5 h-3.5 text-amber-600" />
            Appel transmis au partenaire
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Bandeau KPI du Hub Partenaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Total Dons Collectés */}
        <div className="bg-white rounded-2xl p-4 border border-[#D6E8E8] shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#007599] shrink-0 border border-teal-100">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-[#536B70] uppercase">
              Total Mécénat Collecté
            </span>
            <div className="text-xl font-bold text-[#17343B]">
              {totalDonsCollectes.toLocaleString('fr-FR')} <span className="text-xs font-medium text-slate-500">FCFA</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +15.4% ce mois (Octobre Rose)
            </span>
          </div>
        </div>

        {/* KPI 2 : Solde Disponible */}
        <div className="bg-white rounded-2xl p-4 border border-[#D6E8E8] shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0 border border-emerald-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-[#536B70] uppercase">
              Solde Prêt à Décaisser
            </span>
            <div className="text-xl font-bold text-emerald-700">
              {soldeDisponibleGlobal.toLocaleString('fr-FR')} <span className="text-xs font-medium text-slate-500">FCFA</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Fonds de parrainage mutualisés
            </span>
          </div>
        </div>

        {/* KPI 3 : Patientes Parrainées */}
        <div className="bg-white rounded-2xl p-4 border border-[#D6E8E8] shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-[#D8638A] shrink-0 border border-pink-100">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-[#536B70] uppercase">
              Patientes Parrainées
            </span>
            <div className="text-xl font-bold text-[#D8638A]">
              {totalPatientesParrainees} <span className="text-xs font-medium text-slate-500">femmes</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Prises en charge intégrales (100%)
            </span>
          </div>
        </div>

        {/* KPI 4 : Connexions API */}
        <div className="bg-white rounded-2xl p-4 border border-[#D6E8E8] shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 border border-amber-100">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-[#536B70] uppercase">
              Partenaires API Actifs
            </span>
            <div className="text-xl font-bold text-[#17343B]">
              {partenairesConnectesCount} <span className="text-xs font-medium text-slate-500">/ {partenaires.length} connectés</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">
                Webhooks opérationnels
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barre d'outils & Sous-Navigation du Hub */}
      <div className="bg-white rounded-2xl p-4 border border-[#D6E8E8] shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Onglets internes */}
          <div className="flex items-center gap-2 bg-[#F0F7F7] p-1.5 rounded-xl border border-[#D6E8E8] self-start">
            <button
              type="button"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'repertoire'
                  ? 'bg-white text-[#17343B] shadow-sm border border-[#D6E8E8]'
                  : 'text-[#536B70] hover:text-[#17343B]'
              }`}
              onClick={() => setSubTab('repertoire')}
            >
              <Building2 className="w-4 h-4 text-[#007599]" />
              <span>Partenaires & Fonds ({partenaires.length})</span>
            </button>

            <button
              type="button"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'transactions'
                  ? 'bg-white text-[#17343B] shadow-sm border border-[#D6E8E8]'
                  : 'text-[#536B70] hover:text-[#17343B]'
              }`}
              onClick={() => setSubTab('transactions')}
            >
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Flux des Dons API ({dons.length})</span>
            </button>

            <button
              type="button"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'appels'
                  ? 'bg-white text-[#17343B] shadow-sm border border-[#D6E8E8]'
                  : 'text-[#536B70] hover:text-[#17343B]'
              }`}
              onClick={() => setSubTab('appels')}
            >
              <Send className="w-4 h-4 text-[#D8638A]" />
              <span>Appels Cas Graves ({appelsAide.length})</span>
            </button>
          </div>

          {/* Boutons d'actions rapides */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => onSimulateDonation()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm transition-all hover:shadow active:scale-[0.98]"
            >
              <Zap className="w-4 h-4" />
              <span>Simuler Don API (Webhook)</span>
            </button>

            <button
              type="button"
              onClick={onNewAidAppeal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D8638A] to-[#B8456C] hover:from-[#B8456C] hover:to-[#963454] text-white shadow-sm transition-all hover:shadow active:scale-[0.98]"
            >
              <Heart className="w-4 h-4" />
              <span>Parrainer un Cas Grave</span>
            </button>
          </div>
        </div>

        {/* Filtres et recherche (affichés sur le répertoire) */}
        {subTab === 'repertoire' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#EEF5F5]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un partenaire, sigle ou responsable..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D6E8E8] bg-[#FAFCFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007599]/30 focus:border-[#007599] transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#17343B] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tous ({partenaires.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('telecom_fondation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'telecom_fondation'
                    ? 'bg-[#EA580C] text-white'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                Télécom / Orange
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('banque_finance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'banque_finance'
                    ? 'bg-[#1D4ED8] text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Banque / Coris
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('ong_internationale')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'ong_internationale'
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                ONG / UNICEF
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('institution_etat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'institution_etat'
                    ? 'bg-[#059669] text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Ministère Santé
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Contenu de la sous-vue active */}

      {/* SOUS-VUE 1 : RÉPERTOIRE DES PARTENAIRES */}
      {subTab === 'repertoire' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredPartenaires.map((p) => {
            const theme = getPartnerColor(p.sigle);
            const percentAvailable =
              p.totalDonsVerses > 0
                ? Math.round((p.soldeDisponible / p.totalDonsVerses) * 100)
                : 0;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-[#D6E8E8] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* En-tête de la carte */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Avatar / Sigle */}
                      <div
                        className="w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 text-sm"
                        style={{ backgroundColor: theme.badgeBg }}
                      >
                        {p.sigle.substring(0, 4)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-[#17343B]">
                            {p.nom}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: theme.bg,
                              color: theme.text,
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            {getCategoryLabel(p.categorie)}
                          </span>

                          {p.conventionActive && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Convention Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Statut API */}
                    <div className="shrink-0">
                      {p.statutApi === 'connecte' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          API Webhook Live
                        </span>
                      ) : p.statutApi === 'en_attente' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          API en config
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Manuel
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#536B70] mt-3 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* Métriques financières du partenaire */}
                <div className="px-5 py-3.5 bg-[#FAFCFC] border-y border-[#EEF5F5] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Solde Disponible</span>
                      <strong className="text-sm font-bold text-emerald-700">
                        {p.soldeDisponible.toLocaleString('fr-FR')} FCFA
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 text-[11px] block">Total Versé</span>
                      <strong className="text-xs font-semibold text-slate-800">
                        {p.totalDonsVerses.toLocaleString('fr-FR')} FCFA
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 text-[11px] block">Prises en charge</span>
                      <strong className="text-xs font-bold text-[#D8638A] flex items-center justify-end gap-1">
                        <Heart className="w-3 h-3 fill-[#D8638A]" />
                        {p.nombrePatientesParrainees} femmes
                      </strong>
                    </div>
                  </div>

                  {/* Jauge financière */}
                  <div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(5, percentAvailable))}%`,
                          backgroundColor: theme.accent,
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>{percentAvailable}% du fonds disponible</span>
                      <span>Convention signée le {new Date(p.datePartenariat).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                {/* Coordonnées de contact */}
                <div className="px-5 py-2.5 flex items-center justify-between text-xs text-slate-600 border-b border-[#EEF5F5]">
                  <span className="font-medium text-[#17343B] truncate max-w-[150px]">
                    👤 {p.contactNom}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 hover:text-[#007599]">
                      <Phone className="w-3 h-3" /> {p.contactTelephone}
                    </span>
                    <span className="flex items-center gap-1 hover:text-[#007599] truncate max-w-[140px]">
                      <Mail className="w-3 h-3" /> {p.contactEmail}
                    </span>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="p-3.5 bg-white flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onViewPartnerDetail(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#007599] hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Détails & Contrat</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSimulateDonation(p)}
                      title="Simuler un don entrant via l'API de ce partenaire"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tester Don API</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSponsorPatient(p)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#D8638A] hover:bg-[#B8456C] text-white rounded-lg shadow-sm transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>Demander Parrainage</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SOUS-VUE 2 : FLUX DES DONS RÉCENTS & WEBHOOKS API */}
      {subTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-[#D6E8E8] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#D6E8E8] flex items-center justify-between bg-[#FAFCFC]">
            <div>
              <h3 className="text-sm font-bold text-[#17343B]">
                Journal des Dons Entrants & Webhooks API
              </h3>
              <p className="text-xs text-[#536B70]">
                Traçabilité en temps réel des versements Orange Money B2B, virements institutionnels et notifications d'API.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSimulateDonation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simuler un flux entrant</span>
            </button>
          </div>

          <div className="divide-y divide-[#EEF5F5]">
            {dons.map((don) => (
              <div key={don.id} className="p-4 hover:bg-[#FAFCFC] transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#007599] shrink-0 mt-0.5">
                      <Coins className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-bold text-[#17343B]">
                          {don.partenaireNom}
                        </strong>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {don.referenceTransaction}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {getTypeDonLabel(don.typeDon)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">
                        {don.messagePartenaire || 'Contribution au fonds de solidarité'}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                        <span>🕒 {new Date(don.date).toLocaleString('fr-FR')}</span>
                        <span>•</span>
                        <span className="capitalize">Affectation : {don.affectation.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-emerald-700">
                        +{don.montant.toLocaleString('fr-FR')} FCFA
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">
                        {don.statut === 'confirme' ? '✓ Crédité' : 'En attente'}
                      </span>
                    </div>

                    {don.payloadApi && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPayloadId(
                            expandedPayloadId === don.id ? null : don.id
                          )
                        }
                        className="p-1.5 text-slate-400 hover:text-[#007599] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Voir la charge utile JSON reçue via Webhook"
                      >
                        {expandedPayloadId === don.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <Code2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Inspecteur de payload JSON Webhook */}
                {expandedPayloadId === don.id && don.payloadApi && (
                  <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
                      <span>POST /api/v1/partners/donations/webhook (Simulation API)</span>
                      <span className="text-emerald-400 font-bold">200 OK</span>
                    </div>
                    <pre className="text-[11px] leading-relaxed">
                      {JSON.stringify(don.payloadApi, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOUS-VUE 3 : APPELS D'URGENCE POUR CAS GRAVES */}
      {subTab === 'appels' && (
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>Parrainage ciblé des urgences cliniques :</strong> Ces demandes d'aide concernent des femmes présentant un score de triage élevé (nodule palpable suspect, mastite suspecte, adénopathie). Elles sont soumises directement à un partenaire partenaire pour prise en charge immédiate via l'émission d'un <em>Bon de Santé Orange Money</em>.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {appelsAide.map((appel) => (
              <div
                key={appel.id}
                className="bg-white rounded-2xl border border-[#D6E8E8] shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-[#17343B] text-white">
                        {appel.codeDossier}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {appel.patienteCodeAnonymise} ({appel.patienteAge} ans)
                      </span>
                      <span className="text-xs text-slate-500">
                        📍 {appel.commune}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Score de triage : {appel.scoreIA}/100 (Risque Élevé)
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-2 font-medium">
                      🩺 <strong>Signes cliniques :</strong> {appel.descriptionMedicale}
                    </p>

                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Demande au partenaire :</strong> {appel.messageAccompagnement}
                    </div>

                    {appel.reponseCommentaire && (
                      <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <strong>Réponse du sponsor ({appel.partenaireCibleNom}) :</strong> {appel.reponseCommentaire}
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col items-end justify-between md:justify-start gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Montant demandé</span>
                      <span className="text-base font-extrabold text-[#007599]">
                        {appel.montantNecessaire.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    <div>{getStatutAppelBadge(appel.statut)}</div>

                    {appel.bonSanteCode && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Bon de Santé émis</span>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {appel.bonSanteCode}
                        </span>
                      </div>
                    )}

                    {appel.statut === 'emis' && onApproveAppeal && (
                      <button
                        type="button"
                        onClick={() => onApproveAppeal(appel)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Simuler accord partenaire</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EEF5F5] flex items-center justify-between text-xs text-slate-500">
                  <span>Partenaire ciblé : <strong className="text-[#17343B]">{appel.partenaireCibleNom}</strong></span>
                  <span>Transmis le {new Date(appel.dateEnvoi).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
