import React, { useState, useMemo } from 'react';
import type {
  Campagne,
  AgentSante,
  PersonneSensibilisee,
  LanguePatiente,
  CurrentUserContext,
  SmsLog,
} from '../../types/campaign';
import type { Evaluation } from '../../types/evaluation';
import { calculerScoreEvaluation } from '../../types/evaluation';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Building2,
  Users,
  UserPlus,
  Phone,
  HeartHandshake,
  AlertCircle,
  Globe,
  Sparkles,
  MessageSquare,
  Send,
  Radio,
  CheckCircle2,
  XCircle,
  Filter,
  Smartphone,
} from 'lucide-react';

interface CampaignDetailModalProps {
  isOpen: boolean;
  campagne: Campagne | null;
  allAgents: AgentSante[];
  allPersonnes: PersonneSensibilisee[];
  allSmsLogs?: SmsLog[];
  currentUser: CurrentUserContext;
  onClose: () => void;
  onAddPersonne: (personne: Omit<PersonneSensibilisee, 'id'>) => void;
  onTriggerPushSms?: (campagneId: string, langue: LanguePatiente, customMessage?: string) => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  isOpen,
  campagne,
  allAgents,
  allPersonnes,
  allSmsLogs = [],
  currentUser,
  onClose,
  onAddPersonne,
  onTriggerPushSms,
}) => {
  if (!isOpen || !campagne) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'beneficiaries' | 'sms_orange'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSmsTriggerModal, setShowSmsTriggerModal] = useState(false);

  // Vue aperçu des langues de message
  const [previewMsgLang, setPreviewMsgLang] = useState<'moore' | 'dioula' | 'fulfulde' | 'francais'>('moore');

  // État du modal de déclenchement SMS
  const [pushLangueChoice, setPushLangueChoice] = useState<LanguePatiente>('Mooré');
  const [pushCustomMessage, setPushCustomMessage] = useState<string>(
    campagne.messageLangues?.moore ||
    campagne.message ||
    'Yaa yéelé ! Dépistage précoce gratuit du cancer du sein au CSPS. Venez nombreuses !'
  );

  // Filtres du journal SMS Orange
  const [smsStatusFilter, setSmsStatusFilter] = useState<'ALL' | 'ENVOYE' | 'ECHEC'>('ALL');
  const [smsLangueFilter, setSmsLangueFilter] = useState<'ALL' | LanguePatiente>('ALL');

  // Formulaire d'ajout rapide d'une personne sensibilisée
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [age, setAge] = useState<number>(35);
  const [telephone, setTelephone] = useState('+226 ');
  const [languePreferee, setLanguePreferee] = useState<LanguePatiente>('Mooré');
  const [secteur, setSecteur] = useState(campagne.secteurs[0] || 'Secteur 1');
  const [statutDepistage, setStatutDepistage] = useState<
    'Planifié' | 'Effectué' | 'À orienter' | 'Refusé'
  >('Effectué');
  const [observations, setObservations] = useState('');

  // Indicateurs d'examen clinique rapide
  const [nodule, setNodule] = useState(false);
  const [peauOrange, setPeauOrange] = useState(false);
  const [ecoulement, setEcoulement] = useState(false);
  const [adenopathie, setAdenopathie] = useState(false);
  const [modificationTailleForme, setModificationTailleForme] = useState(false);

  const quickScore = useMemo(() => {
    return calculerScoreEvaluation(nodule, peauOrange, {
      ecoulementMamelonnaire: ecoulement,
      typeEcoulement: ecoulement ? 'sanglant' : 'aucun',
      adenopathieAxillaire: adenopathie,
      modificationTailleForme,
      agePatiente: Number(age) || 0,
    });
  }, [nodule, peauOrange, ecoulement, adenopathie, modificationTailleForme, age]);

  // Agents mobilisés pour cette campagne
  const agentsMobilises = allAgents.filter((a) =>
    Array.isArray(campagne.agentsMobilisesIds) && campagne.agentsMobilisesIds.includes(a.id)
  );

  // Personnes rattachées à cette campagne
  const personnesDeLaCampagne = allPersonnes.filter(
    (p) => p.campagneId === campagne.id
  );

  // Logs SMS rattachés à cette campagne
  const campaignSmsLogs = allSmsLogs.filter(
    (log) => log.campagneId === campagne.id
  );

  const totalSmsSucces = campaignSmsLogs.filter((l) => l.statut === 'ENVOYE').length;
  const totalSmsEchecs = campaignSmsLogs.filter((l) => l.statut === 'ECHEC').length;

  const filteredSmsLogs = campaignSmsLogs.filter((log) => {
    if (smsStatusFilter !== 'ALL' && log.statut !== smsStatusFilter) return false;
    if (smsLangueFilter !== 'ALL' && log.langue !== smsLangueFilter) return false;
    return true;
  });

  const percentRealise = Math.min(
    100,
    Math.round(
      (personnesDeLaCampagne.length / (campagne.objectifFemmes || 1)) * 100
    )
  );

  const handleCreatePersonne = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) return;

    const evalRes = calculerScoreEvaluation(nodule, peauOrange, {
      ecoulementMamelonnaire: ecoulement,
      typeEcoulement: ecoulement ? 'sanglant' : 'aucun',
      adenopathieAxillaire: adenopathie,
      modificationTailleForme,
      agePatiente: Number(age) || 0,
      observationsVocales: observations.trim() || undefined,
    });

    const nouvelleEvaluation: Evaluation = {
      id: `eval-${Date.now()}`,
      dateEvaluation: new Date().toISOString(),
      patienteNom: `${prenom.trim()} ${nom.trim().toUpperCase()}`,
      utilisateurId: currentUser.id,
      utilisateurNom: `${currentUser.prenom} ${currentUser.nom}`,
      nodule,
      peauOrange,
      autresIndicateurs: {
        ecoulementMamelonnaire: ecoulement,
        typeEcoulement: ecoulement ? 'sanglant' : 'aucun',
        adenopathieAxillaire: adenopathie,
        modificationTailleForme,
        agePatiente: Number(age) || 0,
        observationsVocales: observations.trim() || undefined,
      },
      scoreIA: evalRes.scoreIA,
      niveauRisque: evalRes.niveauRisque,
      conduiteATenir: evalRes.conduiteATenir,
      bonSanteDeclenche: evalRes.alerteBonSante,
      pointsObtenus: evalRes.pointsObtenus,
      pointsMax: evalRes.pointsMax,
    };

    onAddPersonne({
      campagneId: campagne.id,
      nom: nom.trim(),
      prenom: prenom.trim(),
      age: Number(age) || 30,
      telephone: telephone.trim(),
      languePreferee,
      commune: campagne.commune,
      secteur,
      dateSensibilisation: new Date().toISOString().split('T')[0],
      statutDepistage: evalRes.niveauRisque === 'ELEVE' ? 'À orienter' : statutDepistage,
      agentContactNom: `${currentUser.prenom} ${currentUser.nom} (${currentUser.roleTitre.split('/')[0].trim()})`,
      observations: observations.trim() || undefined,
      derniereEvaluation: nouvelleEvaluation,
      evaluations: [nouvelleEvaluation],
    });

    // Reset form
    setNom('');
    setPrenom('');
    setAge(35);
    setTelephone('+226 ');
    setObservations('');
    setNodule(false);
    setPeauOrange(false);
    setEcoulement(false);
    setAdenopathie(false);
    setShowAddForm(false);
  };

  const handleOpenSmsModalWithLang = (lang: LanguePatiente) => {
    setPushLangueChoice(lang);
    let msg = campagne.message || '';
    if (lang === 'Mooré' && campagne.messageLangues?.moore) msg = campagne.messageLangues.moore;
    if (lang === 'Dioula' && campagne.messageLangues?.dioula) msg = campagne.messageLangues.dioula;
    if (lang === 'Fulfuldé' && campagne.messageLangues?.fulfulde) msg = campagne.messageLangues.fulfulde;
    if (lang === 'Français' && campagne.messageLangues?.francais) msg = campagne.messageLangues.francais;
    setPushCustomMessage(msg);
    setShowSmsTriggerModal(true);
  };

  const handleConfirmTriggerPushSms = () => {
    if (onTriggerPushSms) {
      onTriggerPushSms(campagne.id, pushLangueChoice, pushCustomMessage);
    }
    setShowSmsTriggerModal(false);
    setActiveTab('sms_orange');
  };

  const LANGUE_BADGES: Record<LanguePatiente, { bg: string; text: string }> = {
    Mooré: { bg: '#FEF3C7', text: '#92400E' },
    Dioula: { bg: '#E0F2FE', text: '#0369A1' },
    Fulfuldé: { bg: '#F3E8FF', text: '#7E22CE' },
    Français: { bg: '#ECFDF5', text: '#047857' },
    Autre: { bg: '#F1F5F9', text: '#475569' },
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="modal-content modal-large">
        {/* En-tête */}
        <div className="modal-header">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="modal-eyebrow">MODULE 1 · SENSIBILISATION & CAMPAGNES</span>
              <CampaignStatusBadge statut={campagne.statut} size="sm" />
              <span className="text-[11px] font-semibold text-[#FF7900] bg-[#FFF4EB] px-2 py-0.5 rounded-full border border-[#FFD8B8] flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#FF7900] animate-pulse" />
                Orange BF SMS Gateway
              </span>
            </div>
            <h2 id="detail-title" className="modal-title">
              {campagne.titre || campagne.nom}
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

        {/* Onglets internes : 3 onglets conformes au diagramme */}
        <div className="detail-modal-tabs">
          <button
            type="button"
            className={`detail-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Building2 className="w-4 h-4" />
            <span>Vue d'ensemble & Agents ({agentsMobilises.length})</span>
          </button>

          <button
            type="button"
            className={`detail-tab-btn ${activeTab === 'beneficiaries' ? 'active' : ''}`}
            onClick={() => setActiveTab('beneficiaries')}
          >
            <Users className="w-4 h-4" />
            <span>Patientes sensibilisées ({personnesDeLaCampagne.length})</span>
          </button>

          <button
            type="button"
            className={`detail-tab-btn ${activeTab === 'sms_orange' ? 'active' : ''}`}
            onClick={() => setActiveTab('sms_orange')}
            style={activeTab === 'sms_orange' ? { color: '#FF7900', borderBottomColor: '#FF7900' } : {}}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Journal SMS Orange ({campaignSmsLogs.length})</span>
          </button>
        </div>

        {/* Corps de l'onglet actif */}
        <div className="modal-body space-y-5">
          {activeTab === 'overview' ? (
            /* TAB 1 : Vue d'ensemble */
            <div className="space-y-4">
              {/* Alerte si motif */}
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
                        ? 'Consignes de révision par le responsable médical :'
                        : 'Motif du refus :'}
                    </strong>
                    <p className="text-xs leading-relaxed">{campagne.motifValidation}</p>
                  </div>
                </div>
              )}

              {/* Description & Objectifs */}
              <div className="bg-[#F8FAFB] p-3.5 rounded-xl border border-[#D6E8E8]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#536B70] block mb-1">
                  Objectifs de la campagne
                </span>
                <p className="text-xs text-[#17343B] leading-relaxed">
                  {campagne.description}
                </p>
              </div>

              {/* SECTION CLÉ DIAGRAMME : Push SMS Orange géociblé & méthode envoyerRappels() */}
              <div className="p-4 rounded-xl border border-[#FFD8B8] bg-gradient-to-br from-[#FFF9F5] to-[#FFFFFF] space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FF7900] text-white flex items-center justify-center font-bold">
                      <Radio className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#17343B] uppercase tracking-wide">
                          Diffusion Push SMS Orange (Ciblage local)
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF7900] text-white">
                          Méthode envoyerRappels()
                        </span>
                      </div>
                      <p className="text-[11px] text-[#536B70]">
                        Secteur cible : <strong>{campagne.secteurCible || campagne.secteurs.join(', ')}</strong> · {campagne.commune}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#17343B] bg-white px-2.5 py-1 rounded-lg border border-[#D6E8E8]">
                      {campagne.totalSmsEnvoyes || campaignSmsLogs.length} SMS diffusés
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#FF7900] hover:bg-[#E06A00] transition-colors shadow-sm flex items-center gap-1.5"
                      onClick={() => handleOpenSmsModalWithLang('Mooré')}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>⚡ Déclencher Push SMS Orange</span>
                    </button>
                  </div>
                </div>

                {/* Sélecteur d'aperçu de langue du SMS */}
                <div className="bg-white p-3 rounded-lg border border-[#FFE1CC] space-y-2">
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <span className="font-semibold text-[#536B70] text-[11px]">
                      Message configuré pour la zone (Push SMS) :
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewMsgLang('moore')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                          previewMsgLang === 'moore'
                            ? 'bg-[#FF7900] text-white'
                            : 'bg-[#F1F5F9] text-[#536B70] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        Mooré
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMsgLang('dioula')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                          previewMsgLang === 'dioula'
                            ? 'bg-[#FF7900] text-white'
                            : 'bg-[#F1F5F9] text-[#536B70] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        Dioula
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMsgLang('fulfulde')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                          previewMsgLang === 'fulfulde'
                            ? 'bg-[#FF7900] text-white'
                            : 'bg-[#F1F5F9] text-[#536B70] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        Fulfuldé
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMsgLang('francais')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                          previewMsgLang === 'francais'
                            ? 'bg-[#FF7900] text-white'
                            : 'bg-[#F1F5F9] text-[#536B70] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        Français
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#17343B] font-mono bg-[#FFF9F5] p-2 rounded border border-[#FFE1CC] leading-relaxed">
                    {previewMsgLang === 'moore' && (campagne.messageLangues?.moore || campagne.message)}
                    {previewMsgLang === 'dioula' && (campagne.messageLangues?.dioula || 'Aw bismila ! Dépistage précoce gbansan CSPS Schiphra kɔnɔ. Kene ya ye foyi tèmè.')}
                    {previewMsgLang === 'fulfulde' && (campagne.messageLangues?.fulfulde || 'Jam waali ! Kuje cellal rewbe e CSPS Schiphra. War to do ngam depistage.')}
                    {previewMsgLang === 'francais' && (campagne.messageLangues?.francais || campagne.message)}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#536B70]">
                    <span>Opérateur partenaire : <strong>Orange Burkina Faso (GSM)</strong></span>
                    <span>160 caractères max · Pas besoin de smartphone pour les femmes</span>
                  </div>
                </div>
              </div>

              {/* Paramètres géographiques et planning */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="detail-info-tile">
                  <MapPin className="w-4 h-4 text-[#007599]" />
                  <div>
                    <span className="tile-label">Commune & Secteur cible</span>
                    <strong className="tile-value">
                      {campagne.commune}
                    </strong>
                    <span className="tile-sub">{campagne.secteurCible || campagne.secteurs.join(', ')}</span>
                  </div>
                </div>

                <div className="detail-info-tile">
                  <Calendar className="w-4 h-4 text-[#007599]" />
                  <div>
                    <span className="tile-label">Dates d'intervention</span>
                    <strong className="tile-value">
                      {campagne.dateDebut}
                    </strong>
                    <span className="tile-sub">au {campagne.dateFin}</span>
                  </div>
                </div>

                <div className="detail-info-tile">
                  <Clock className="w-4 h-4 text-[#007599]" />
                  <div>
                    <span className="tile-label">Horaires</span>
                    <strong className="tile-value">{campagne.horaires}</strong>
                    <span className="tile-sub">Créneau de dépistage</span>
                  </div>
                </div>

                <div className="detail-info-tile">
                  <Building2 className="w-4 h-4 text-[#007599]" />
                  <div>
                    <span className="tile-label">Centre responsable</span>
                    <strong className="tile-value truncate">{campagne.centreNom}</strong>
                    <span className="tile-sub">Coordination</span>
                  </div>
                </div>
              </div>

              {/* Jauge d'atteinte de l'objectif */}
              <div className="bg-[#F0F9F8] p-4 rounded-xl border border-[#D6E8E8]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-[#17343B] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#007599]" />
                    <span>Progression de la sensibilisation de terrain</span>
                  </span>
                  <span className="font-bold text-[#007599]">
                    {personnesDeLaCampagne.length} / {campagne.objectifFemmes} femmes ({percentRealise}%)
                  </span>
                </div>
                <div className="campaign-progress-bar h-2">
                  <div
                    className="campaign-progress-fill"
                    style={{ width: `${percentRealise}%` }}
                  />
                </div>
              </div>

              {/* Liste complète des agents mobilisés */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#17343B] mb-2.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#007599]" />
                  <span>Équipe médicale mobilisée ({agentsMobilises.length})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {agentsMobilises.map((agent) => (
                    <div key={agent.id} className="agent-detail-card">
                      <div className="agent-avatar-circle">
                        {agent.prenom[0]}
                        {agent.nom[0]}
                      </div>
                      <div className="flex-1 truncate">
                        <strong className="block text-xs text-[#17343B]">
                          {agent.prenom} {agent.nom}
                        </strong>
                        <span className="text-[11px] text-[#007599] font-medium block">
                          {agent.roleFonction}
                        </span>
                        <span className="text-[11px] text-[#536B70] truncate block">
                          {agent.centreNom}
                        </span>
                      </div>
                      <a
                        href={`tel:${agent.telephone}`}
                        className="agent-phone-btn"
                        title={`Appeler ${agent.telephone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'beneficiaries' ? (
            /* TAB 2 : Personnes sensibilisées */
            <div className="space-y-4">
              {/* Note obligatoire sur la langue patiente */}
              <div className="info-banner-patient-lang">
                <Globe className="w-4 h-4 text-[#007599] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-[#17343B]">
                  <strong>Langue maternelle de la patiente :</strong> La langue affichée (<em>Mooré</em>, <em>Dioula</em>, <em>Fulfuldé</em>, <em>Français</em>) est directement rattachée au dossier individuel de la femme sensibilisée. Elle assure un accompagnement personnalisé sans barrière linguistique.
                </div>
              </div>

              {/* Barre d'action : Titre + Bouton Ajouter */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h4 className="text-sm font-bold text-[#17343B]">
                    Patientes enregistrées sur cette campagne ({personnesDeLaCampagne.length})
                  </h4>
                  <p className="text-xs text-[#536B70]">
                    Suivi des examens cliniques, palpations et orientations
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-create-campaign text-xs py-2 px-3"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{showAddForm ? 'Fermer le formulaire' : 'Enregistrer une patiente'}</span>
                </button>
              </div>

              {/* Formulaire dépliable d'ajout rapide sur le terrain */}
              {showAddForm && (
                <form
                  onSubmit={handleCreatePersonne}
                  className="bg-[#F8FAFB] p-4 rounded-xl border border-[#D6E8E8] space-y-3"
                >
                  <span className="text-xs font-bold text-[#007599] block mb-1">
                    Enregistrement rapide lors de l'action de terrain
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="form-group">
                      <label className="form-label required">Nom</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Ex : Kaboré"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Prénom</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Ex : Rasmata"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Âge</label>
                      <input
                        type="number"
                        min="15"
                        max="95"
                        required
                        className="form-input"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="form-group">
                      <label className="form-label required">Téléphone</label>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Langue du dossier patiente</label>
                      <select
                        className="form-input"
                        value={languePreferee}
                        onChange={(e) => setLanguePreferee(e.target.value as LanguePatiente)}
                      >
                        <option value="Mooré">Mooré</option>
                        <option value="Dioula">Dioula</option>
                        <option value="Fulfuldé">Fulfuldé</option>
                        <option value="Français">Français</option>
                        <option value="Autre">Autre langue</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Statut dépistage</label>
                      <select
                        className="form-input"
                        value={statutDepistage}
                        onChange={(e) =>
                          setStatutDepistage(
                            e.target.value as 'Planifié' | 'Effectué' | 'À orienter' | 'Refusé'
                          )
                        }
                      >
                        <option value="Effectué">Effectué (Normal)</option>
                        <option value="À orienter">À orienter (Suspicion / Écho)</option>
                        <option value="Planifié">Planifié pour RDV</option>
                        <option value="Refusé">Refusé</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label required">Secteur d'intervention</label>
                      <select
                        className="form-input"
                        value={secteur}
                        onChange={(e) => setSecteur(e.target.value)}
                      >
                        {campagne.secteurs.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Observations cliniques & orientation</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ex : Palpation bilatérale négative. Sensibilisée à l'autopalpation."
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Signes cliniques & Évaluation IA rapide */}
                  <div className="p-3 bg-[#EEF7F7] rounded-lg border border-[#B2DDDD] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17343B] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#007599]" />
                        <span>Signes cliniques rapides (Évaluation IA)</span>
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          quickScore.niveauRisque === 'ELEVE'
                            ? 'bg-rose-600 text-white animate-pulse'
                            : quickScore.niveauRisque === 'MODERE'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        Score IA : {quickScore.scoreIA}% ({quickScore.pointsObtenus} / 15 pts)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded bg-white border border-slate-200">
                        <input
                          type="checkbox"
                          checked={nodule}
                          onChange={(e) => setNodule(e.target.checked)}
                          className="rounded text-[#007599]"
                        />
                        <span className="font-semibold text-slate-800">Nodule (+3)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded bg-white border border-slate-200">
                        <input
                          type="checkbox"
                          checked={peauOrange}
                          onChange={(e) => setPeauOrange(e.target.checked)}
                          className="rounded text-[#007599]"
                        />
                        <span className="font-semibold text-slate-800">Peau orange (+3)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded bg-white border border-slate-200">
                        <input
                          type="checkbox"
                          checked={ecoulement}
                          onChange={(e) => setEcoulement(e.target.checked)}
                          className="rounded text-[#007599]"
                        />
                        <span className="font-semibold text-slate-800">Écoulement (+2)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded bg-white border border-slate-200">
                        <input
                          type="checkbox"
                          checked={adenopathie}
                          onChange={(e) => setAdenopathie(e.target.checked)}
                          className="rounded text-[#007599]"
                        />
                        <span className="font-semibold text-slate-800">Ganglion (+2)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded bg-white border border-slate-200">
                        <input
                          type="checkbox"
                          checked={modificationTailleForme}
                          onChange={(e) => setModificationTailleForme(e.target.checked)}
                          className="rounded text-[#007599]"
                        />
                        <span className="font-semibold text-slate-800">Asymétrie (+2)</span>
                      </label>
                    </div>

                    {quickScore.niveauRisque === 'ELEVE' && (
                      <p className="text-[11px] text-rose-800 font-bold m-0 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Forte suspicion clinique : orientation urgente CHU et éligibilité Bon de Santé.</span>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      className="btn-modal-cancel"
                      onClick={() => setShowAddForm(false)}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn-modal-submit">
                      Valider et Enregistrer
                    </button>
                  </div>
                </form>
              )}

              {/* Tableau des patientes */}
              {personnesDeLaCampagne.length > 0 ? (
                <div className="beneficiaries-table-wrapper">
                  <table className="beneficiaries-table">
                    <thead>
                      <tr>
                        <th>Patiente</th>
                        <th>Langue (dossier)</th>
                        <th>Contact</th>
                        <th>Statut Dépistage</th>
                        <th>Agent référent</th>
                        <th>Observations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personnesDeLaCampagne.map((p) => {
                        const lBadge = LANGUE_BADGES[p.languePreferee] || LANGUE_BADGES.Autre;
                        return (
                          <tr key={p.id}>
                            <td>
                              <strong className="block text-[#17343B]">
                                {p.prenom} {p.nom}
                              </strong>
                              <span className="text-[11px] text-[#536B70]">
                                {p.age} ans · {p.secteur}
                              </span>
                            </td>

                            <td>
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: lBadge.bg, color: lBadge.text }}
                              >
                                {p.languePreferee}
                              </span>
                            </td>

                            <td>
                              <span className="text-xs text-[#17343B] font-mono">
                                {p.telephone}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  p.statutDepistage === 'Effectué'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.statutDepistage === 'À orienter'
                                    ? 'bg-amber-100 text-amber-800'
                                    : p.statutDepistage === 'Planifié'
                                    ? 'bg-sky-100 text-sky-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {p.statutDepistage}
                              </span>
                            </td>

                            <td>
                              <span className="text-xs text-[#536B70]">
                                {p.agentContactNom}
                              </span>
                            </td>

                            <td>
                              <span className="text-xs text-[#17343B] line-clamp-2">
                                {p.observations || '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center bg-[#F8FAFB] rounded-xl border border-dashed border-[#D6E8E8]">
                  <HeartHandshake className="w-8 h-8 text-[#536B70] mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-[#536B70]">
                    Aucune patiente enregistrée pour l'instant. Utilisez le bouton ci-dessus lors du déploiement sur le terrain.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* TAB 3 : JOURNAL SMS ORANGE (Entité SmsLog conforme au diagramme de classe) */
            <div className="space-y-4">
              {/* Carte résumé KPIs Orange SMS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#FFF9F5] p-3 rounded-xl border border-[#FFD8B8]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#536B70] uppercase">SMS Diffusés</span>
                    <Smartphone className="w-4 h-4 text-[#FF7900]" />
                  </div>
                  <strong className="text-lg font-bold text-[#17343B] mt-1 block">
                    {campaignSmsLogs.length}
                  </strong>
                  <span className="text-[10px] text-[#536B70]">Orange Burkina Faso</span>
                </div>

                <div className="bg-[#F0FDF4] p-3 rounded-xl border border-[#BBF7D0]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#166534] uppercase">Délivrés (ENVOYE)</span>
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <strong className="text-lg font-bold text-[#166534] mt-1 block">
                    {totalSmsSucces}
                  </strong>
                  <span className="text-[10px] text-[#166534]">
                    {campaignSmsLogs.length ? Math.round((totalSmsSucces / campaignSmsLogs.length) * 100) : 100}% de succès
                  </span>
                </div>

                <div className="bg-[#FEF2F2] p-3 rounded-xl border border-[#FECACA]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#991B1B] uppercase">Échecs réseau</span>
                    <XCircle className="w-4 h-4 text-[#DC2626]" />
                  </div>
                  <strong className="text-lg font-bold text-[#991B1B] mt-1 block">
                    {totalSmsEchecs}
                  </strong>
                  <span className="text-[10px] text-[#991B1B]">Numéro / Hors zone</span>
                </div>

                <div className="bg-[#F0F9F8] p-3 rounded-xl border border-[#D6E8E8]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#007599] uppercase">Ciblage</span>
                    <Radio className="w-4 h-4 text-[#007599]" />
                  </div>
                  <strong className="text-xs font-bold text-[#17343B] mt-1 block truncate">
                    {campagne.secteurCible || 'Secteur local'}
                  </strong>
                  <span className="text-[10px] text-[#536B70]">{campagne.commune}</span>
                </div>
              </div>

              {/* Barre de filtre et d'action */}
              <div className="flex items-center justify-between gap-3 flex-wrap bg-[#F8FAFB] p-3 rounded-xl border border-[#D6E8E8]">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-4 h-4 text-[#536B70]" />
                  <span className="text-xs font-bold text-[#17343B]">Filtrer les logs :</span>

                  <select
                    className="text-xs p-1.5 rounded-lg border border-[#D6E8E8] bg-white text-[#17343B]"
                    value={smsStatusFilter}
                    onChange={(e) => setSmsStatusFilter(e.target.value as any)}
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="ENVOYE">ENVOYE (Succès)</option>
                    <option value="ECHEC">ECHEC</option>
                  </select>

                  <select
                    className="text-xs p-1.5 rounded-lg border border-[#D6E8E8] bg-white text-[#17343B]"
                    value={smsLangueFilter}
                    onChange={(e) => setSmsLangueFilter(e.target.value as any)}
                  >
                    <option value="ALL">Toutes les langues</option>
                    <option value="Mooré">Mooré</option>
                    <option value="Dioula">Dioula</option>
                    <option value="Fulfuldé">Fulfuldé</option>
                    <option value="Français">Français</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenSmsModalWithLang('Mooré')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#FF7900] hover:bg-[#E06A00] transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>⚡ Déclencher Push SMS Orange</span>
                </button>
              </div>

              {/* Tableau SmsLog conforme au diagramme de classe */}
              {filteredSmsLogs.length > 0 ? (
                <div className="beneficiaries-table-wrapper">
                  <table className="beneficiaries-table">
                    <thead>
                      <tr>
                        <th>Date & Heure</th>
                        <th>Destinataire</th>
                        <th>Langue</th>
                        <th>Contenu SMS Orange</th>
                        <th>Opérateur</th>
                        <th>Statut (Diagramme)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSmsLogs.map((log) => {
                        const lBadge = log.langue ? (LANGUE_BADGES[log.langue] || LANGUE_BADGES.Autre) : LANGUE_BADGES.Mooré;
                        return (
                          <tr key={log.id}>
                            <td className="whitespace-nowrap">
                              <span className="text-xs font-mono text-[#17343B] block">
                                {log.dateEnvoi}
                              </span>
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
                                {log.langue || 'Mooré'}
                              </span>
                            </td>

                            <td>
                              <p className="text-xs text-[#17343B] font-mono leading-snug line-clamp-2 max-w-md">
                                {log.contenu}
                              </p>
                            </td>

                            <td>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF7900] bg-[#FFF4EB] px-2 py-0.5 rounded-md border border-[#FFD8B8]">
                                {log.operateur || 'Orange BF'}
                              </span>
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
                  <MessageSquare className="w-8 h-8 text-[#FF7900] mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-[#536B70] mb-3">
                    Aucun historique SMS pour ce filtre.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenSmsModalWithLang('Mooré')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#FF7900] hover:bg-[#E06A00] transition-colors inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Lancer une diffusion de test maintenant</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="modal-footer">
          <span className="text-xs text-[#536B70]">
            Campagne coordonnée par <strong>{campagne.centreNom}</strong> · Secteur cible : <strong>{campagne.secteurCible || campagne.secteurs.join(', ')}</strong>
          </span>
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Fermer la fiche
          </button>
        </div>
      </div>

      {/* SOUS-MODAL : Déclencheur Push SMS Orange (envoyerRappels()) */}
      {showSmsTriggerModal && (
        <div className="modal-backdrop z-[110]" role="dialog" aria-modal="true">
          <div className="modal-content max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-[#FFD8B8] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FF7900] text-white flex items-center justify-center font-bold">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17343B]">
                    ⚡ Déclencher Push SMS Orange géociblé
                  </h3>
                  <span className="text-[11px] text-[#536B70]">
                    Exécute la méthode <code className="font-mono text-[#007599]">envoyerRappels()</code> sur la zone
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowSmsTriggerModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FFF9F5] p-3 rounded-xl border border-[#FFD8B8] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#536B70] font-medium">Zone d'intervention :</span>
                <strong className="text-[#17343B]">{campagne.secteurCible || campagne.secteurs.join(', ')} ({campagne.commune})</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#536B70] font-medium">Abonnés Orange détectés :</span>
                <strong className="text-[#FF7900]">~ 350 à 480 téléphones mobiles</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#536B70] font-medium">Passerelle opérateur :</span>
                <span className="font-semibold text-[#17343B]">Orange Burkina Faso (GSM)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="form-label required">Langue locale de diffusion :</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Mooré', 'Dioula', 'Fulfuldé', 'Français'] as LanguePatiente[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        setPushLangueChoice(l);
                        let msg = campagne.message || '';
                        if (l === 'Mooré' && campagne.messageLangues?.moore) msg = campagne.messageLangues.moore;
                        if (l === 'Dioula' && campagne.messageLangues?.dioula) msg = campagne.messageLangues.dioula;
                        if (l === 'Fulfuldé' && campagne.messageLangues?.fulfulde) msg = campagne.messageLangues.fulfulde;
                        if (l === 'Français' && campagne.messageLangues?.francais) msg = campagne.messageLangues.francais;
                        setPushCustomMessage(msg);
                      }}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all text-center ${
                        pushLangueChoice === l
                          ? 'bg-[#FF7900] text-white border-[#FF7900] shadow-sm'
                          : 'bg-[#F8FAFB] text-[#17343B] border-[#D6E8E8] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label required">Texte du SMS ({pushLangueChoice}) :</label>
                  <span className={`text-[11px] font-mono ${
                    pushCustomMessage.length > 160 ? 'text-amber-600 font-bold' : 'text-[#536B70]'
                  }`}>
                    {pushCustomMessage.length} / 160 caractères
                  </span>
                </div>
                <textarea
                  rows={3}
                  className="form-input text-xs font-mono resize-none leading-relaxed"
                  value={pushCustomMessage}
                  onChange={(e) => setPushCustomMessage(e.target.value)}
                  placeholder="Rédigez le texte SMS de sensibilisation..."
                />
                <span className="text-[11px] text-[#536B70] mt-1 block">
                  💡 Format adapté aux téléphones basiques 2G/3G sans connexion Internet.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6E8E8]">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowSmsTriggerModal(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF7900] hover:bg-[#E06A00] transition-colors shadow-md flex items-center gap-1.5"
                onClick={handleConfirmTriggerPushSms}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirmer & Envoyer via Orange Gateway</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

