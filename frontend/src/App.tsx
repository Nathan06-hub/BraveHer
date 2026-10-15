import { useState, useEffect, useMemo, useCallback } from 'react';
import { SidebarNavbar, MobileNavTopbar } from './components/navigation';
import { LoginPage } from './pages/loginPage';
import {
  CampaignList,
  CampaignFormModal,
  CampaignValidationModal,
  CampaignDetailModal,
} from './components/campaigns';
import {
  MOCK_CAMPAGNES,
  MOCK_CENTRES,
  MOCK_AGENTS,
  MOCK_PERSONNES_SENSIBILISEES,
  MOCK_SMS_LOGS,
  MOCK_REGLES_AUTOMATISATION_AGE,
  PROFILES_DEMO,
} from './data/mockCampaignData';
import type {
  Campagne,
  PersonneSensibilisee,
  CurrentUserContext,
  StatutCampagne,
  SmsLog,
  LanguePatiente,
  RegleAutomatisationAge,
} from './types/campaign';
import {
  SolidarityDashboard,
  AidRequestFormView,
  AidValidationView,
  OrangeMoneyPaymentView,
  IncomingDonationApiModal,
  SendPartnerAidRequestModal,
  PartnerDetailModal,
  type SolidaritySectionTab,
  type PatientCandidate,
} from './components/solidarity';
import {
  MOCK_DEMANDES_AIDE,
  MOCK_FONDS_SOLIDARITE,
  MOCK_INDICATEURS_REGIONS_BF,
} from './data/mockSolidarityData';
import {
  MOCK_PARTENAIRES,
  MOCK_DONS_TRANSACTIONS,
  MOCK_APPELS_AIDE_CAS_GRAVES,
} from './data/mockPartnersData';
import type {
  PartenaireDonneur,
  DonTransaction,
  AppelAideCasGrave,
} from './types/partner';
import type { DemandeAide, FondsSolidariteSummary } from './types/solidarity';
import {
  BeneficiariesDashboard,
  PatientTriageView,
  NewPatientRegistrationView,
  PatientProfileView,
} from './components/beneficiaries';
import {
  MOCK_BENEFICIAIRES,
  MOCK_BENEFICIAIRES_KPIS,
} from './data/mockBeneficiariesData';
import type { Beneficiaire, BeneficiairesKPIs, ExamenCliniqueDetails } from './types/beneficiary';
import { DashboardView } from './components/dashboard';
import { AgentMyCampaignsView } from './components/agentCampaigns';
import { PushSmsMessagingView } from './components/messaging';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { NetworkStatusBadge } from './components/common/NetworkStatusBadge';
import {
  campaignApi,
  patientApi,
  solidarityApi,
  partnerApi,
} from './services/api';
import { PredictiveHealthDashboard } from './components/predictive';
import './App.css';

const TAB_PATH_MAP: Record<string, string> = {
  dashboard: '/dashboard',
  campaigns: '/campaigns',
  my_campaigns: '/my-campaigns',
  beneficiaries: '/beneficiaries',
  messages: '/messages',
  impact: '/solidarity',
  predictive: '/predictive',
  settings: '/settings',
  help: '/help',
};

const PATH_TAB_MAP: Record<string, string> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/campaigns': 'campaigns',
  '/my-campaigns': 'my_campaigns',
  '/beneficiaries': 'beneficiaries',
  '/messages': 'messages',
  '/solidarity': 'impact',
  '/impact': 'impact',
  '/predictive': 'predictive',
  '/settings': 'settings',
  '/help': 'help',
};

function getInitialRoute(): { view: 'dashboard' | 'login'; tab: string } {
  if (typeof window === 'undefined') {
    return { view: 'dashboard', tab: 'dashboard' };
  }
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (path === '/login') {
    return { view: 'login', tab: 'dashboard' };
  }
  const mappedTab = PATH_TAB_MAP[path];
  return {
    view: 'dashboard',
    tab: mappedTab || 'dashboard',
  };
}

export function App() {
  const initialRoute = useMemo(() => getInitialRoute(), []);
  const [currentView, setCurrentView] = useState<'dashboard' | 'login'>(initialRoute.view);
  const [activeTab, setActiveTab] = useState(initialRoute.tab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hook de connectivité & Offline-First (Module 3)
  const {
    isOnline,
    isSimulatedOffline,
    backendAvailable,
    backendLatencyMs,
    pendingSyncCount,
    isSyncing,
    toggleSimulatedOffline,
    syncNow,
  } = useNetworkStatus();

  // État des données du Module 1 (Campagnes et Logs SMS Orange conformes au diagramme de classe)
  const [campagnes, setCampagnes] = useState<Campagne[]>(MOCK_CAMPAGNES);
  const [personnes, setPersonnes] = useState<PersonneSensibilisee[]>(
    MOCK_PERSONNES_SENSIBILISEES
  );
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>(MOCK_SMS_LOGS);
  const [automationRules, setAutomationRules] = useState<RegleAutomatisationAge[]>(
    MOCK_REGLES_AUTOMATISATION_AGE
  );
  const [currentUser, setCurrentUser] = useState<CurrentUserContext>(PROFILES_DEMO[1]); // Par défaut : Dr. Aminata Ouédraogo (Responsable)

  // Modals d'interaction
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campagne | null>(null);
  const [validatingCampaign, setValidatingCampaign] = useState<Campagne | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<Campagne | null>(null);

  // État des données du Module 4 : Solidarité & Pilotage Statistique
  const [demandesAide, setDemandesAide] = useState<DemandeAide[]>(MOCK_DEMANDES_AIDE);
  const [fondsSolidarite, setFondsSolidarite] = useState<FondsSolidariteSummary>(
    MOCK_FONDS_SOLIDARITE
  );
  const [solidarityView, setSolidarityView] = useState<
    'dashboard' | 'create' | 'validate' | 'pay_om'
  >('dashboard');
  const [activeSolidarityTab, setActiveSolidarityTab] = useState<SolidaritySectionTab>('requests');
  const [selectedAidRequest, setSelectedAidRequest] = useState<DemandeAide | null>(null);

  // Données Partenaires & Parrainages (Étape 2 & 3)
  const [partenairesList, setPartenairesList] = useState<PartenaireDonneur[]>(MOCK_PARTENAIRES);
  const [donsTransactions, setDonsTransactions] = useState<DonTransaction[]>(MOCK_DONS_TRANSACTIONS);
  const [appelsAideCasGraves, setAppelsAideCasGraves] = useState<AppelAideCasGrave[]>(MOCK_APPELS_AIDE_CAS_GRAVES);
  const [isIncomingDonationModalOpen, setIsIncomingDonationModalOpen] = useState<boolean>(false);
  const [preselectedPartnerForDonation, setPreselectedPartnerForDonation] = useState<string | undefined>(undefined);

  // Modals Parrainage & Détail Partenaire (Étape 4 & 5)
  const [isSendAidAppealModalOpen, setIsSendAidAppealModalOpen] = useState<boolean>(false);
  const [preselectedPartnerForAppeal, setPreselectedPartnerForAppeal] = useState<string | undefined>(undefined);
  const [preselectedPatientForAppeal, setPreselectedPatientForAppeal] = useState<PatientCandidate | undefined>(undefined);

  const [isPartnerDetailModalOpen, setIsPartnerDetailModalOpen] = useState<boolean>(false);
  const [selectedPartnerForDetail, setSelectedPartnerForDetail] = useState<PartenaireDonneur | null>(null);

  const handleOpenIncomingDonationModal = (partenaire?: PartenaireDonneur) => {
    setPreselectedPartnerForDonation(partenaire?.id);
    setIsIncomingDonationModalOpen(true);
  };

  const handleOpenSendAidAppeal = (partenaire?: PartenaireDonneur, patientCandidate?: PatientCandidate) => {
    setPreselectedPartnerForAppeal(partenaire?.id);
    setPreselectedPatientForAppeal(patientCandidate);
    setIsSendAidAppealModalOpen(true);
  };

  const handleOpenPartnerDetail = (partenaire: PartenaireDonneur) => {
    setSelectedPartnerForDetail(partenaire);
    setIsPartnerDetailModalOpen(true);
  };

  const handleSubmitAidAppeal = (newAppel: AppelAideCasGrave, immediateApprove: boolean = true) => {
    // Appel API Partenaires
    partnerApi.sendPartnerAidAppeal(newAppel).catch(console.warn);

    setAppelsAideCasGraves((prev) => [newAppel, ...prev]);

    if (immediateApprove && newAppel.montantNecessaire) {
      // Débiter le solde du partenaire conformément à debiter(montant) du diagramme Mermaid
      setPartenairesList((prev) =>
        prev.map((p) =>
          p.id === newAppel.partenaireCibleId
            ? {
                ...p,
                soldeDisponible: Math.max(0, p.soldeDisponible - newAppel.montantNecessaire),
                nombrePatientesParrainees: p.nombrePatientesParrainees + 1,
              }
            : p
        )
      );

      setFondsSolidarite((prev) => ({
        ...prev,
        nombreAidesAttribuees: prev.nombreAidesAttribuees + 1,
        montantEngage: prev.montantEngage + newAppel.montantNecessaire,
        montantDisponible: Math.max(0, prev.montantDisponible - newAppel.montantNecessaire),
      }));

      showToast(
        `💖 Parrainage validé par ${newAppel.partenaireCibleNom} ! Bon de santé ${newAppel.bonSanteCode} émis.`
      );
    } else {
      showToast(
        `Dossier d'urgence ${newAppel.codeDossier} transmis à ${newAppel.partenaireCibleNom} pour examen.`
      );
    }
  };

  const handleConfirmIncomingDonation = (newDon: DonTransaction) => {
    // Appel API Webhook
    partnerApi.simulateWebhookDonation(newDon).catch(console.warn);

    setDonsTransactions((prev) => [newDon, ...prev]);
    setPartenairesList((prev) =>
      prev.map((p) =>
        p.id === newDon.partenaireId
          ? {
              ...p,
              totalDonsVerses: p.totalDonsVerses + newDon.montant,
              soldeDisponible: p.soldeDisponible + newDon.montant,
            }
          : p
      )
    );
    setFondsSolidarite((prev) => ({
      ...prev,
      dotationTotale: prev.dotationTotale + newDon.montant,
      montantDisponible: prev.montantDisponible + newDon.montant,
    }));
    showToast(
      `⚡ Webhook B2B reçu : +${newDon.montant.toLocaleString('fr-FR')} FCFA crédités sur ${newDon.partenaireNom} !`
    );
  };

  // Handlers pour le Module 4
  const handleCreateAidRequest = (newDemande: DemandeAide) => {
    // Appel API Solidarité
    solidarityApi.createDemandeAide(newDemande).catch(console.warn);

    setDemandesAide([newDemande, ...demandesAide]);
    setFondsSolidarite((prev) => ({
      ...prev,
      nombreDemandesTotal: prev.nombreDemandesTotal + 1,
      demandesEnAttente: prev.demandesEnAttente + 1,
    }));
    setSolidarityView('dashboard');
    showToast(`Demande d'aide ${newDemande.codeDossier} enregistrée avec succès !`);
  };

  const handleAidValidationDecision = (
    updatedDemande: DemandeAide,
    decision: 'approuvee' | 'refusee'
  ) => {
    // Appel API Validation
    solidarityApi
      .validateDemandeAide(updatedDemande.id, {
        statut: updatedDemande.statut,
        montantAccorde: updatedDemande.montantAccorde,
      })
      .catch(console.warn);

    setDemandesAide((prev) =>
      prev.map((d) => (d.id === updatedDemande.id ? updatedDemande : d))
    );

    if (decision === 'approuvee') {
      const montant = updatedDemande.montantAccorde || updatedDemande.coutEstime;
      setFondsSolidarite((prev) => ({
        ...prev,
        montantEngage: prev.montantEngage + montant,
        montantDisponible: Math.max(0, prev.montantDisponible - montant),
        demandesEnAttente: Math.max(0, prev.demandesEnAttente - 1),
      }));
      showToast(
        `Prise en charge ${updatedDemande.codeDossier} approuvée (${montant.toLocaleString('fr-FR')} FCFA) !`
      );
    } else {
      setFondsSolidarite((prev) => ({
        ...prev,
        demandesEnAttente: Math.max(0, prev.demandesEnAttente - 1),
      }));
      showToast(`Demande ${updatedDemande.codeDossier} refusée. Motif consigné.`);
    }

    setSolidarityView('dashboard');
    setSelectedAidRequest(null);
  };

  const handleOrangeMoneyPaymentSuccess = (updatedDemande: DemandeAide) => {
    // Appel API Orange Money
    solidarityApi
      .executeOrangeMoneyPayment({
        demandeId: updatedDemande.id,
        centreImagerieCompteOM: '+226 70 00 11 22',
        montantFCFA: updatedDemande.montantAccorde,
        beneficiaireRef: updatedDemande.codeDossier,
      })
      .catch(console.warn);

    setDemandesAide((prev) =>
      prev.map((d) => (d.id === updatedDemande.id ? updatedDemande : d))
    );
    setFondsSolidarite((prev) => ({
      ...prev,
      nombreAidesAttribuees: prev.nombreAidesAttribuees + 1,
    }));
    showToast(
      `Paiement Orange Money de ${updatedDemande.montantAccorde.toLocaleString('fr-FR')} FCFA transféré ! Reçu officiel disponible.`
    );
  };

  // État des données du Module Bénéficiaires & Patientes
  const [beneficiairesList, setBeneficiairesList] = useState<Beneficiaire[]>(MOCK_BENEFICIAIRES);
  const [beneficiairesKpis, setBeneficiairesKpis] = useState<BeneficiairesKPIs>(
    MOCK_BENEFICIAIRES_KPIS
  );
  const [beneficiaryView, setBeneficiaryView] = useState<
    'dashboard' | 'triage' | 'create' | 'detail'
  >('dashboard');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiaire | null>(null);

  // Hydratation initiale depuis l'API Spring Boot (avec Graceful Fallback)
  useEffect(() => {
    let isMounted = true;
    async function hydrateData() {
      try {
        const [loadedCampagnes, loadedPatients, loadedDemandes, loadedPartenaires] =
          await Promise.all([
            campaignApi.getCampagnes(),
            patientApi.getPatientes(),
            solidarityApi.getDemandesAide(),
            partnerApi.getPartenaires(),
          ]);

        if (isMounted) {
          if (loadedCampagnes?.length) setCampagnes(loadedCampagnes);
          if (loadedPatients?.length) setBeneficiairesList(loadedPatients);
          if (loadedDemandes?.length) setDemandesAide(loadedDemandes);
          if (loadedPartenaires?.length) setPartenairesList(loadedPartenaires);
        }
      } catch (err) {
        console.warn('[App] Mode fallback local actif pour l\'hydratation', err);
      }
    }
    hydrateData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers pour les Bénéficiaires
  const handleRegisterNewPatient = (newPatient: Beneficiaire) => {
    // Appel du service API Spring Boot (avec synchronisation automatique offline)
    patientApi.registerPatiente(newPatient).catch(console.warn);

    setBeneficiairesList([newPatient, ...beneficiairesList]);
    setBeneficiairesKpis((prev) => ({
      ...prev,
      totalPatientes: prev.totalPatientes + 1,
      depistagesEffectues:
        newPatient.derniereEvaluation || newPatient.dernierTriage
          ? prev.depistagesEffectues + 1
          : prev.depistagesEffectues,
      casRisqueEleve:
        newPatient.derniereEvaluation?.niveauRisque === 'ELEVE' ||
        newPatient.dernierTriage?.niveauSuspicion === 'eleve'
          ? prev.casRisqueEleve + 1
          : prev.casRisqueEleve,
      casRisqueModere:
        newPatient.derniereEvaluation?.niveauRisque === 'MODERE' ||
        newPatient.dernierTriage?.niveauSuspicion === 'modere'
          ? prev.casRisqueModere + 1
          : prev.casRisqueModere,
      femmesPdiOuVulnerables:
        newPatient.statutVulnerabilite !== 'Standard'
          ? prev.femmesPdiOuVulnerables + 1
          : prev.femmesPdiOuVulnerables,
    }));
    setBeneficiaryView('dashboard');
    if (newPatient.derniereEvaluation?.niveauRisque === 'ELEVE') {
      showToast(
        `Patiente ${newPatient.nom} ${newPatient.prenom} enregistrée · Score IA : ${newPatient.derniereEvaluation.scoreIA}% (RISQUE ÉLEVÉ) — Bon de Santé prioritaire recommandé !`
      );
    } else if (newPatient.derniereEvaluation) {
      showToast(
        `Patiente ${newPatient.nom} ${newPatient.prenom} enregistrée · Score IA : ${newPatient.derniereEvaluation.scoreIA}% (${newPatient.derniereEvaluation.niveauRisque})`
      );
    } else {
      showToast(`Patiente ${newPatient.nom} ${newPatient.prenom} enregistrée avec succès !`);
    }
  };

  const handleSavePatientTriage = (updatedPatient: Beneficiaire) => {
    // Appel API Patiente & Triage
    patientApi.updatePatiente(updatedPatient.id, updatedPatient).catch(console.warn);

    setBeneficiairesList((prev) =>
      prev.map((b) => (b.id === updatedPatient.id ? updatedPatient : b))
    );
    setBeneficiairesKpis((prev) => ({
      ...prev,
      depistagesEffectues: prev.depistagesEffectues + 1,
      casRisqueEleve:
        updatedPatient.dernierTriage?.niveauSuspicion === 'eleve'
          ? prev.casRisqueEleve + 1
          : prev.casRisqueEleve,
    }));
    setBeneficiaryView('dashboard');
    setSelectedBeneficiary(null);
    showToast(
      `Triage clinique de ${updatedPatient.nom} ${updatedPatient.prenom} enregistré (Score : ${updatedPatient.dernierTriage?.scoreCalcule}%) !`
    );
  };

  const handleRequestSolidarityForPatient = (patient: Beneficiaire) => {
    setActiveTab('impact');
    setSolidarityView('create');
    showToast(
      `Redirection vers le Fonds de Solidarité Orange Money pour ${patient.nom} ${patient.prenom}.`
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Synchronisation de l'URL du navigateur avec l'état actif (HTML5 History API)
  const navigateToTab = useCallback((tabId: string, replace = false) => {
    setActiveTab(tabId);
    if (tabId === 'impact') {
      setSolidarityView('dashboard');
    }
    if (tabId === 'beneficiaries') {
      setBeneficiaryView('dashboard');
    }

    if (typeof window !== 'undefined') {
      const targetPath = TAB_PATH_MAP[tabId] || '/dashboard';
      if (window.location.pathname !== targetPath) {
        if (replace) {
          window.history.replaceState({ tab: tabId, view: 'dashboard' }, '', targetPath);
        } else {
          window.history.pushState({ tab: tabId, view: 'dashboard' }, '', targetPath);
        }
      }
    }
  }, []);

  const navigateToView = useCallback((view: 'dashboard' | 'login', replace = false) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const targetPath = view === 'login' ? '/login' : (TAB_PATH_MAP[activeTab] || '/dashboard');
      if (window.location.pathname !== targetPath) {
        if (replace) {
          window.history.replaceState({ tab: activeTab, view }, '', targetPath);
        } else {
          window.history.pushState({ tab: activeTab, view }, '', targetPath);
        }
      }
    }
  }, [activeTab]);

  // Écouter les boutons Précédent / Suivant du navigateur
  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setCurrentView(route.view);
      setActiveTab(route.tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tabId: string) => {
    navigateToTab(tabId);
  };

  const handleDeployMobileClinic = (regionNom: string) => {
    showToast(`🚐 Ordre de mission validé ! Clinique Mobile Orange déployée vers la région : ${regionNom}.`);

    const mobileCampaign: Campagne = {
      id: `camp-mobile-${Date.now()}`,
      titre: `Mission Clinique Mobile Orange — ${regionNom}`,
      nom: `Mission Clinique Mobile Orange — ${regionNom}`,
      description: `Déploiement d'urgence d'une unité mobile de mammographie suite à un pic de suspicion clinique dans la région ${regionNom}.`,
      commune: regionNom,
      secteurCible: `Districts ruraux (${regionNom})`,
      secteurs: [regionNom, 'Villages périphériques'],
      message: `Campagne gratuite de dépistage par mammographie mobile Orange dans votre localité (${regionNom}). Rendez-vous au camion médicalisé.`,
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString().split('T')[0],
      horaires: '08:00 - 16:30',
      centreId: currentUser.centreId || 'centre-mobile-1',
      centreNom: `Unité Mobile Orange — ${regionNom}`,
      statut: 'EN_COURS',
      creeParId: currentUser.id,
      creeParNom: `${currentUser.prenom} ${currentUser.nom}`,
      dateCreation: new Date().toISOString().split('T')[0],
      agentsMobilisesIds: ['agent-1', 'agent-2'],
      objectifFemmes: 1500,
      totalSmsEnvoyes: 450,
      activerPushSms: true,
      historique: [
        {
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          auteurNom: `${currentUser.prenom} ${currentUser.nom}`,
          auteurRole: currentUser.roleTitre,
          action: 'creation',
          commentaire: `Déploiement algorithmique automatisé sur hotspot épidémiologique (${regionNom}) via Orange Data for Good.`,
        },
      ],
    };

    setCampagnes((prev) => [mobileCampaign, ...prev]);
  };

  const handleLogout = () => {
    showToast('Déconnexion en cours...');
    setTimeout(() => {
      navigateToView('login');
    }, 400);
  };

  // 1. Création ou modification de campagne
  const handleSaveCampaign = (
    campaignData: Omit<Campagne, 'id' | 'historique'>,
    targetStatut: 'brouillon' | 'en_attente'
  ) => {
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (editingCampaign) {
      // Mise à jour API
      campaignApi
        .updateCampagne(editingCampaign.id, {
          ...campaignData,
          statut: targetStatut === 'en_attente' ? 'en_attente' : undefined,
        })
        .catch(console.warn);

      const updatedList = campagnes.map((c) => {
        if (c.id === editingCampaign.id) {
          const newStatus =
            c.statut === 'a_corriger' && targetStatut === 'en_attente'
              ? 'en_attente'
              : c.statut;

          return {
            ...c,
            ...campaignData,
            statut: newStatus,
            historique: [
              ...c.historique,
              {
                date: dateStr,
                auteurNom: `${currentUser.prenom} ${currentUser.nom}`,
                auteurRole: currentUser.roleTitre,
                action: 'modification' as const,
                commentaire:
                  targetStatut === 'en_attente'
                    ? 'Campagne mise à jour et retransmise pour validation.'
                    : 'Modifications enregistrées.',
              },
            ],
          };
        }
        return c;
      });

      setCampagnes(updatedList);
      showToast(
        targetStatut === 'en_attente'
          ? `Campagne "${campaignData.nom}" retransmise pour validation !`
          : `Modifications enregistrées pour "${campaignData.nom}".`
      );
      setEditingCampaign(null);
    } else {
      // Nouvelle campagne
      const newCampagne: Campagne = {
        id: `camp-${Date.now()}`,
        ...campaignData,
        statut: targetStatut,
        historique: [
          {
            date: dateStr,
            auteurNom: `${currentUser.prenom} ${currentUser.nom}`,
            auteurRole: currentUser.roleTitre,
            action: targetStatut === 'en_attente' ? 'soumission' : 'creation',
            commentaire:
              targetStatut === 'en_attente'
                ? 'Campagne préparée et soumise au responsable pour approbation.'
                : 'Projet de campagne sauvegardé en brouillon.',
          },
        ],
      };

      // Appel API Création
      campaignApi.createCampagne(newCampagne).catch(console.warn);

      setCampagnes([newCampagne, ...campagnes]);
      showToast(
        targetStatut === 'en_attente'
          ? `Nouvelle campagne transmise pour validation !`
          : `Brouillon de campagne sauvegardé avec succès.`
      );
      setIsCreateModalOpen(false);
    }
  };

  // 2. Décision de validation par le responsable
  const handleValidationDecision = (
    campagneId: string,
    decision: 'approuvee' | 'a_corriger' | 'refusee',
    motif?: string
  ) => {
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Appel API Décision
    campaignApi
      .updateCampagne(campagneId, {
        statut: decision as StatutCampagne,
        motifValidation: motif,
      })
      .catch(console.warn);

    const updated = campagnes.map((c) => {
      if (c.id === campagneId) {
        return {
          ...c,
          statut: decision as StatutCampagne,
          motifValidation: motif,
          historique: [
            ...c.historique,
            {
              date: dateStr,
              auteurNom: `${currentUser.prenom} ${currentUser.nom}`,
              auteurRole: currentUser.roleTitre,
              action:
                decision === 'approuvee'
                  ? ('approbation' as const)
                  : decision === 'a_corriger'
                    ? ('demande_correction' as const)
                    : ('rejet' as const),
              commentaire: motif || 'Validation médicale confirmée.',
            },
          ],
        };
      }
      return c;
    });

    setCampagnes(updated);

    if (decision === 'approuvee') {
      showToast(
        `Campagne approuvée ! Notifications automatiques envoyées aux agents mobilisés.`
      );
    } else if (decision === 'a_corriger') {
      showToast(`Consignes de correction enregistrées et renvoyées à l'agent.`);
    } else {
      showToast(`Campagne refusée avec motif consigné.`);
    }

    setValidatingCampaign(null);
  };

  // 3. Ajout d'une personne sensibilisée
  const handleAddPersonne = (data: Omit<PersonneSensibilisee, 'id'>) => {
    const newPersonne: PersonneSensibilisee = {
      id: `pers-${Date.now()}`,
      ...data,
    };

    setPersonnes([newPersonne, ...personnes]);

    // Raccrocher à la campagne
    setCampagnes((prev) =>
      prev.map((c) => {
        if (c.id === data.campagneId) {
          return {
            ...c,
            personnesSensibiliseesIds: [
              ...(c.personnesSensibiliseesIds || []),
              newPersonne.id,
            ],
          };
        }
        return c;
      })
    );

    // Synchronisation automatique dans le registre des bénéficiaires (Module 2)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ev = data.derniereEvaluation;

    // Déduction du triage compatible
    const compatTriage: ExamenCliniqueDetails | undefined = ev
      ? {
          id: `exam-${Date.now()}`,
          dateExamen: ev.dateEvaluation.split('T')[0],
          soignantNom: ev.utilisateurNom || `${currentUser.prenom} ${currentUser.nom}`,
          soignantRole: currentUser.roleTitre || 'Sage-femme',
          seinConcerne: (ev.autresIndicateurs.seinConcerne === 'aucun' ? 'droit' : ev.autresIndicateurs.seinConcerne) as any || 'droit',
          quadrant: ev.autresIndicateurs.quadrant || 'supero_externe',
          nodulePalpable: ev.nodule,
          consistanceNodule: ev.autresIndicateurs.consistanceNodule || 'aucun',
          tailleNoduleCm: ev.autresIndicateurs.tailleNoduleCm,
          ecoulementMamelonnaire: Boolean(ev.autresIndicateurs.ecoulementMamelonnaire),
          typeEcoulement: ev.autresIndicateurs.typeEcoulement || 'aucun',
          retractionCutanee: Boolean(ev.autresIndicateurs.retractionCutanee),
          peauOrange: ev.peauOrange,
          adenopathieAxillaire: Boolean(ev.autresIndicateurs.adenopathieAxillaire),
          modificationTailleForme: Boolean(ev.autresIndicateurs.modificationTailleForme),
          pointsObtenus: ev.pointsObtenus,
          antecedentsFamiliauxCancer: Boolean(ev.autresIndicateurs.antecedentsFamiliaux),
          douleurMammaire: Boolean(ev.autresIndicateurs.douleurMammaire),
          observationsVocales: ev.autresIndicateurs.observationsVocales,
          scoreCalcule: ev.scoreIA,
          niveauSuspicion: ev.niveauRisque.toLowerCase() as any,
          conduiteATenir: ev.conduiteATenir,
          besoinMammographieUrgence: ev.niveauRisque === 'ELEVE',
        }
      : undefined;

    const newBeneficiaire: Beneficiaire = {
      id: `pat-${Date.now()}`,
      numeroDossier: `PAT-BF-2026-${randomSuffix}`,
      campagneId: data.campagneId,
      nom: data.nom,
      prenom: data.prenom,
      age: data.age,
      telephone: data.telephone,
      languePreferee: data.languePreferee,
      commune: data.commune,
      secteur: data.secteur,
      statutVulnerabilite: ev?.bonSanteDeclenche ? 'Vulnerable' : 'Standard',
      centreSuiviId: currentUser.centreId || 'centre-1',
      centreSuiviNom: currentUser.centreNom || 'CSPS Schiphra',
      dateSensibilisation: data.dateSensibilisation,
      statutDepistage: data.statutDepistage,
      agentContactNom: data.agentContactNom,
      derniereEvaluation: ev,
      evaluations: data.evaluations || (ev ? [ev] : []),
      dernierTriage: compatTriage,
      historiqueExamens: compatTriage ? [compatTriage] : [],
    };

    setBeneficiairesList((prev) => [newBeneficiaire, ...prev]);
    setBeneficiairesKpis((prev) => ({
      ...prev,
      totalPatientes: prev.totalPatientes + 1,
      depistagesEffectues: ev ? prev.depistagesEffectues + 1 : prev.depistagesEffectues,
      casRisqueEleve: ev?.niveauRisque === 'ELEVE' ? prev.casRisqueEleve + 1 : prev.casRisqueEleve,
      casRisqueModere: ev?.niveauRisque === 'MODERE' ? prev.casRisqueModere + 1 : prev.casRisqueModere,
    }));

    if (ev?.niveauRisque === 'ELEVE') {
      showToast(
        `Patiente ${data.prenom} ${data.nom} enregistrée · Score IA : ${ev.scoreIA}% (RISQUE ÉLEVÉ) — Bon de Santé recommandé !`
      );
    } else if (ev) {
      showToast(
        `Patiente ${data.prenom} ${data.nom} enregistrée · Score IA : ${ev.scoreIA}% (${ev.niveauRisque})`
      );
    } else {
      showToast(
        `Patiente ${data.prenom} ${data.nom} enregistrée (${data.languePreferee} - ${data.statutDepistage}) !`
      );
    }
  };

  // 4. Déclenchement d'un Push SMS Orange (méthode envoyerRappels() du diagramme de classes)
  const handleTriggerPushSms = (
    campagneId: string,
    langue: LanguePatiente,
    customMessage?: string
  ) => {
    const targetCamp = campagnes.find((c) => c.id === campagneId);
    if (!targetCamp) return;

    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const dateShort = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const defaultMsg =
      customMessage ||
      targetCamp.messageLangues?.[
        langue === 'Mooré'
          ? 'moore'
          : langue === 'Dioula'
          ? 'dioula'
          : langue === 'Fulfuldé'
          ? 'fulfulde'
          : 'francais'
      ] ||
      targetCamp.message ||
      'Dépistage précoce gratuit du cancer du sein disponible dans votre centre de santé.';

    // Génération réaliste de logs SMS Orange pour les femmes cibles du secteur
    const generatedLogs: SmsLog[] = [
      {
        id: `sms-${Date.now()}-1`,
        campagneId: targetCamp.id,
        campagneTitre: targetCamp.titre || targetCamp.nom,
        destinataireNom: `Abonnée Orange (${targetCamp.secteurCible || 'Secteur local'})`,
        destinataireTelephone: `+226 70 ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)}`,
        langue,
        contenu: defaultMsg,
        dateEnvoi: dateStr,
        statut: 'ENVOYE',
        operateur: 'Orange BF',
      },
      {
        id: `sms-${Date.now()}-2`,
        campagneId: targetCamp.id,
        campagneTitre: targetCamp.titre || targetCamp.nom,
        destinataireNom: 'Patiente relais communautaire',
        destinataireTelephone: `+226 76 ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)}`,
        langue,
        contenu: defaultMsg,
        dateEnvoi: dateStr,
        statut: 'ENVOYE',
        operateur: 'Orange BF',
      },
      {
        id: `sms-${Date.now()}-3`,
        campagneId: targetCamp.id,
        campagneTitre: targetCamp.titre || targetCamp.nom,
        destinataireNom: 'Contact secteur GSM',
        destinataireTelephone: `+226 77 ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)}`,
        langue,
        contenu: defaultMsg,
        dateEnvoi: dateStr,
        statut: 'ENVOYE',
        operateur: 'Orange BF',
      },
    ];

    setSmsLogs((prev) => [...generatedLogs, ...prev]);

    // Mettre à jour la campagne : totalSmsEnvoyes, statut si PLANIFIEE -> EN_COURS, historique
    setCampagnes((prev) =>
      prev.map((c) => {
        if (c.id === campagneId) {
          const newTotal = (c.totalSmsEnvoyes || 0) + 48; // incrément réaliste de diffusion
          const updatedStatut = c.statut === 'PLANIFIEE' ? 'EN_COURS' : c.statut;
          const updatedCamp = {
            ...c,
            totalSmsEnvoyes: newTotal,
            statut: updatedStatut,
            historique: [
              ...c.historique,
              {
                date: dateShort,
                auteurNom: `${currentUser.prenom} ${currentUser.nom}`,
                auteurRole: currentUser.roleTitre,
                action: 'modification' as const,
                commentaire: `Diffusion Push SMS Orange déclenchée en langue ${langue} sur ${c.secteurCible || c.secteurs.join(', ')} via la passerelle GSM Orange BF (envoyerRappels()).`,
              },
            ],
          };
          if (viewingCampaign && viewingCampaign.id === campagneId) {
            setViewingCampaign(updatedCamp);
          }
          return updatedCamp;
        }
        return c;
      })
    );

    // Appel API Push SMS Orange Gateway
    campaignApi
      .sendPushSms({
        campagneId,
        message: defaultMsg,
        langue,
        commune: targetCamp.commune,
        ciblesCount: 48,
      })
      .catch(console.warn);

    showToast(
      `⚡ Push SMS Orange envoyé avec succès en ${langue} (${targetCamp.secteurCible || targetCamp.commune}) !`
    );
  };

  // 5. Bascule Actif/Inactif d'une règle d'automatisation par âge
  const handleToggleAutomationRule = (ruleId: string) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, actif: !r.actif } : r))
    );
    const rule = automationRules.find((r) => r.id === ruleId);
    showToast(
      `Règle "${rule?.nom.split(':')[0] || 'Automatisation'}" : ${!rule?.actif ? 'activée' : 'mise en pause'}`
    );
  };

  // 6. Déclenchement d'une vague mensuelle/semestrielle selon l'âge (ex: 20 ans, 40 ans)
  const handleTriggerAgeWave = (rule: RegleAutomatisationAge) => {
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Filtrer les patientes enregistrées dans cette tranche d'âge
    const eligiblePatients = beneficiairesList.filter(
      (b) => b.age >= rule.ageMin && b.age <= rule.ageMax
    );

    const count = eligiblePatients.length > 0 ? eligiblePatients.length : 3;
    const sampleNames = eligiblePatients.length > 0
      ? eligiblePatients
      : [
          { nom: 'Kaboré', prenom: 'Rasmata', telephone: '+226 70 12 34 56', languePreferee: 'Mooré' as LanguePatiente, age: 22 },
          { nom: 'Ouattara', prenom: 'Aïcha', telephone: '+226 76 98 76 54', languePreferee: 'Dioula' as LanguePatiente, age: 24 },
          { nom: 'Diallo', prenom: 'Fatoumata', telephone: '+226 77 11 22 33', languePreferee: 'Fulfuldé' as LanguePatiente, age: 28 },
        ];

    const generatedLogs: SmsLog[] = sampleNames.map((p, idx) => {
      const langKey = p.languePreferee === 'Mooré'
        ? 'moore'
        : p.languePreferee === 'Dioula'
        ? 'dioula'
        : p.languePreferee === 'Fulfuldé'
        ? 'fulfulde'
        : 'francais';
      const template = rule.messages[langKey] || rule.messages.francais;
      const text = template.replace('{prenom}', p.prenom);

      return {
        id: `sms-age-${Date.now()}-${idx}`,
        destinataireNom: `${p.prenom} ${p.nom} (${p.age} ans)`,
        destinataireTelephone: p.telephone,
        langue: p.languePreferee,
        contenu: text,
        dateEnvoi: dateStr,
        statut: 'ENVOYE',
        operateur: 'Orange BF',
        typeMessage: 'RAPPEL_AGE_AUTOPALPATION',
        ageCible: p.age,
      };
    });

    setSmsLogs((prev) => [...generatedLogs, ...prev]);

    // Mettre à jour la règle
    setAutomationRules((prev) =>
      prev.map((r) =>
        r.id === rule.id
          ? {
              ...r,
              totalEnvoyes: r.totalEnvoyes + count,
              derniereExecution: dateStr.substring(0, 16),
            }
          : r
      )
    );

    showToast(
      `⚡ Vague mensuelle Orange SMS (${rule.ageMin}-${rule.ageMax} ans) diffusée avec succès auprès de ${count} femmes !`
    );
  };

  // 7. Déclenchement de relances post-campagne dans la langue maternelle des femmes
  const handleTriggerPostCampaignFollowup = (
    campagneId: string,
    targetFilter: 'A_ORIENTER' | 'EFFECTUE' | 'TOUTES',
    messages: {
      moore: string;
      dioula: string;
      fulfulde: string;
      francais: string;
    }
  ) => {
    const targetCamp = campagnes.find((c) => c.id === campagneId);
    if (!targetCamp) return;

    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const campPersonnes = personnes.filter((p) => p.campagneId === campagneId);
    const targeted = campPersonnes.filter((p) => {
      if (targetFilter === 'A_ORIENTER') return p.statutDepistage === 'À orienter';
      if (targetFilter === 'EFFECTUE') return p.statutDepistage === 'Effectué';
      return true;
    });

    const listToNotify = targeted.length > 0 ? targeted : [
      { id: 'rel-1', nom: 'Sawadogo', prenom: 'Bibata', telephone: '+226 70 88 44 22', languePreferee: 'Mooré' as LanguePatiente },
      { id: 'rel-2', nom: 'Sanogo', prenom: 'Minata', telephone: '+226 76 55 11 00', languePreferee: 'Dioula' as LanguePatiente },
    ];

    const generatedLogs: SmsLog[] = listToNotify.map((p, idx) => {
      const langKey = p.languePreferee === 'Mooré'
        ? 'moore'
        : p.languePreferee === 'Dioula'
        ? 'dioula'
        : p.languePreferee === 'Fulfuldé'
        ? 'fulfulde'
        : 'francais';
      const template = messages[langKey] || messages.francais;
      const text = template.replace('{prenom}', p.prenom);

      return {
        id: `sms-followup-${Date.now()}-${idx}`,
        campagneId: targetCamp.id,
        campagneTitre: targetCamp.titre || targetCamp.nom,
        destinataireNom: `${p.prenom} ${p.nom}`,
        destinataireTelephone: p.telephone,
        langue: p.languePreferee,
        contenu: text,
        dateEnvoi: dateStr,
        statut: 'ENVOYE',
        operateur: 'Orange BF',
        typeMessage: 'RELANCE_POST_CAMPAGNE',
      };
    });

    setSmsLogs((prev) => [...generatedLogs, ...prev]);

    // Mettre à jour la campagne
    setCampagnes((prev) =>
      prev.map((c) =>
        c.id === campagneId
          ? {
              ...c,
              totalSmsEnvoyes: (c.totalSmsEnvoyes || 0) + listToNotify.length,
            }
          : c
      )
    );

    showToast(
      `📢 Relance post-campagne diffusée en langues locales auprès de ${listToNotify.length} patientes !`
    );
  };

  // 8. Envoi rapide d'un Push SMS d'alerte immédiate sur un secteur
  const handleSendQuickPush = (
    commune: string,
    secteur: string,
    langue: LanguePatiente,
    contenu: string,
    estimatedCount: number
  ) => {
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: SmsLog = {
      id: `sms-quick-${Date.now()}`,
      destinataireNom: `Contacts géociblés (${secteur}, ${commune})`,
      destinataireTelephone: `+226 70 ${Math.floor(10 + Math.random() * 89)} XX XX`,
      langue,
      contenu,
      dateEnvoi: dateStr,
      statut: 'ENVOYE',
      operateur: 'Orange BF',
      typeMessage: 'ALERTE_IMMEDIATE',
    };

    setSmsLogs((prev) => [newLog, ...prev]);
    showToast(
      `⚡ Alerte Push SMS Orange diffusée sur ${secteur} (${commune}) auprès de ~${estimatedCount} téléphones !`
    );
  };

  // If current view is login, display the full LoginPage
  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => {
          navigateToView('dashboard');
          showToast('Bienvenue ! Vous êtes connecté.');
        }}
      />
    );
  }

  return (
    <div className="scene-wrapper">
      {/* Mobile Topbar */}
      <MobileNavTopbar onOpenMenu={() => setIsMobileMenuOpen(true)} />

      <div className="scene-layout">
        {/* Sidebar Navbar (Sticky on desktop, sliding drawer on mobile) */}
        <SidebarNavbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />

        {/* Content View Area */}
        <div className="scene-content-area">
          {/* Top Bar avec Statut Réseau Orange & Synchronisation (Module 3) */}
          <header className="flex items-center justify-between px-6 py-2.5 bg-white/90 backdrop-blur-md border-b border-[#D6E8E8] sticky top-0 z-30 shadow-[0_1px_4px_rgba(23,52,59,0.03)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#007599]" />
              <span className="text-xs font-semibold text-[#17343B]">
                Plateforme Nationale « Soutien Rose BFK » · CSPS & Centres Référents
              </span>
            </div>

            <NetworkStatusBadge
              isOnline={isOnline}
              isSimulatedOffline={isSimulatedOffline}
              backendAvailable={backendAvailable}
              backendLatencyMs={backendLatencyMs}
              pendingSyncCount={pendingSyncCount}
              isSyncing={isSyncing}
              onToggleSimulatedOffline={() => {
                toggleSimulatedOffline();
                showToast(
                  !isSimulatedOffline
                    ? 'Mode Hors-Ligne activé (Simulation mission rurale).'
                    : 'Réseau Orange 4G rétabli !'
                );
              }}
              onSyncNow={async () => {
                const res = await syncNow();
                showToast(`Synchronisation terminée : ${res.success} élément(s) transmis vers Spring Boot.`);
              }}
            />
          </header>

          {!isOnline && (
            <div className="mx-6 mt-3.5 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📡</span>
                <div>
                  <strong>Mode Mission Rurale Déconnectée (Module 3) :</strong> Toutes vos saisies (patientes, évaluations IA, demandes d'aide) sont persistées localement dans IndexedDB.
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSimulatedOffline}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 transition-colors"
              >
                Rétablir Réseau Orange
              </button>
            </div>
          )}

          <main className="scene-content" aria-label="Espace de travail">
            {activeTab === 'campaigns' ? (
              /* Module 1 : Gestion des campagnes de sensibilisation */
              <CampaignList
                campagnes={campagnes}
                centres={MOCK_CENTRES}
                agents={MOCK_AGENTS}
                currentUser={currentUser}
                onSwitchUser={(u) => {
                  setCurrentUser(u);
                  showToast(`Profil actif : ${u.prenom} ${u.nom} (${u.roleTitre})`);
                }}
                availableUsers={PROFILES_DEMO}
                onCreateCampaign={() => {
                  setEditingCampaign(null);
                  setIsCreateModalOpen(true);
                }}
                onViewDetails={(camp) => setViewingCampaign(camp)}
                onEditCampaign={(camp) => {
                  setEditingCampaign(camp);
                  setIsCreateModalOpen(true);
                }}
                onValidateCampaign={(camp) => setValidatingCampaign(camp)}
              />
            ) : activeTab === 'my_campaigns' ? (
              /* Espace Agent : Mes Campagnes & Fiche de création patiente */
              <AgentMyCampaignsView
                campagnes={campagnes}
                personnes={personnes}
                allAgents={MOCK_AGENTS}
                currentUser={currentUser}
                onAddPersonne={handleAddPersonne}
                onViewCampaignDetails={(camp) => setViewingCampaign(camp)}
                onSwitchUser={(u) => {
                  setCurrentUser(u);
                  showToast(`Profil actif : ${u.prenom} ${u.nom} (${u.roleTitre})`);
                }}
                availableUsers={PROFILES_DEMO}
              />
            ) : activeTab === 'impact' ? (
              /* Module 4 : Solidarité et pilotage statistique */
              <>
                {solidarityView === 'dashboard' && (
                  <SolidarityDashboard
                    demandes={demandesAide}
                    fonds={fondsSolidarite}
                    indicateursRegions={MOCK_INDICATEURS_REGIONS_BF}
                    currentUser={currentUser}
                    onCreateAidRequest={() => setSolidarityView('create')}
                    onViewDetail={(demande) => {
                      setSelectedAidRequest(demande);
                      setSolidarityView('validate');
                    }}
                    onValidate={(demande) => {
                      setSelectedAidRequest(demande);
                      setSolidarityView('validate');
                    }}
                    onPayOrangeMoney={(demande) => {
                      setSelectedAidRequest(demande);
                      setSolidarityView('pay_om');
                    }}
                    activeSectionTab={activeSolidarityTab}
                    onSectionTabChange={(tab) => setActiveSolidarityTab(tab)}
                    partenaires={partenairesList}
                    donsTransactions={donsTransactions}
                    appelsAideCasGraves={appelsAideCasGraves}
                    onSimulateDonation={(partenaire) => {
                      handleOpenIncomingDonationModal(partenaire);
                    }}
                    onNewAidAppeal={() => {
                      handleOpenSendAidAppeal();
                    }}
                    onViewPartnerDetail={(partenaire) => {
                      handleOpenPartnerDetail(partenaire);
                    }}
                    onSponsorPatient={(partenaire) => {
                      handleOpenSendAidAppeal(partenaire);
                    }}
                    onApproveAppeal={(appel) => {
                      const codeBon = `BON-OM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                      setAppelsAideCasGraves((prev) =>
                        prev.map((a) =>
                          a.id === appel.id
                            ? {
                                ...a,
                                statut: 'parraine',
                                bonSanteCode: codeBon,
                                dateReponsePartenaire: new Date().toISOString(),
                                reponseCommentaire: `Prise en charge validée par ${a.partenaireCibleNom}. Bon émis.`,
                              }
                            : a
                        )
                      );
                      showToast(`Accord mécène validé pour ${appel.patienteCodeAnonymise} ! Bon : ${codeBon}`);
                    }}
                  />
                )}

                {solidarityView === 'create' && (
                  <AidRequestFormView
                    currentUser={currentUser}
                    onBack={() => setSolidarityView('dashboard')}
                    onSubmit={handleCreateAidRequest}
                  />
                )}

                {solidarityView === 'validate' && selectedAidRequest && (
                  <AidValidationView
                    demande={selectedAidRequest}
                    currentUser={currentUser}
                    onBack={() => {
                      setSelectedAidRequest(null);
                      setSolidarityView('dashboard');
                    }}
                    onConfirmDecision={handleAidValidationDecision}
                  />
                )}

                {solidarityView === 'pay_om' && selectedAidRequest && (
                  <OrangeMoneyPaymentView
                    demande={selectedAidRequest}
                    currentUser={currentUser}
                    onBack={() => {
                      setSelectedAidRequest(null);
                      setSolidarityView('dashboard');
                    }}
                    onPaymentSuccess={handleOrangeMoneyPaymentSuccess}
                  />
                )}
              </>
            ) : activeTab === 'beneficiaries' ? (
              /* Module 2 : Bénéficiaires & Triage Clinique par IA */
              <>
                {beneficiaryView === 'dashboard' && (
                  <BeneficiariesDashboard
                    beneficiaires={beneficiairesList}
                    kpis={beneficiairesKpis}
                    currentUser={currentUser}
                    onRegisterNewPatient={() => setBeneficiaryView('create')}
                    onStartTriage={(patient) => {
                      setSelectedBeneficiary(patient);
                      setBeneficiaryView('triage');
                    }}
                    onViewProfile={(patient) => {
                      setSelectedBeneficiary(patient);
                      setBeneficiaryView('detail');
                    }}
                    onRequestSolidarity={handleRequestSolidarityForPatient}
                  />
                )}

                {beneficiaryView === 'triage' && selectedBeneficiary && (
                  <PatientTriageView
                    patient={selectedBeneficiary}
                    currentUser={currentUser}
                    onBack={() => {
                      setSelectedBeneficiary(null);
                      setBeneficiaryView('dashboard');
                    }}
                    onSaveTriage={handleSavePatientTriage}
                    onRequestSolidarity={handleRequestSolidarityForPatient}
                  />
                )}

                {beneficiaryView === 'create' && (
                  <NewPatientRegistrationView
                    currentUser={currentUser}
                    onBack={() => setBeneficiaryView('dashboard')}
                    onSubmit={handleRegisterNewPatient}
                  />
                )}

                {beneficiaryView === 'detail' && selectedBeneficiary && (
                  <PatientProfileView
                    patient={selectedBeneficiary}
                    onBack={() => {
                      setSelectedBeneficiary(null);
                      setBeneficiaryView('dashboard');
                    }}
                    onStartTriage={(patient) => {
                      setSelectedBeneficiary(patient);
                      setBeneficiaryView('triage');
                    }}
                    onRequestSolidarity={handleRequestSolidarityForPatient}
                    onRequestPartnerSponsorship={(patient) => {
                      handleOpenSendAidAppeal(undefined, {
                        id: patient.id,
                        nom: patient.nom,
                        prenom: patient.prenom,
                        age: patient.age,
                        commune: patient.commune,
                        region: patient.secteur || 'Centre',
                        scoreIA: patient.derniereEvaluation?.scoreIA || 85,
                        descriptionClinique:
                          patient.derniereEvaluation?.conduiteATenir ||
                          'Cas à risque élevé détecté lors du dépistage communautaire.',
                        vulnerabilite: patient.statutVulnerabilite,
                        centreNom: patient.centreSuiviNom,
                      });
                    }}
                  />
                )}
              </>
            ) : activeTab === 'dashboard' ? (
              /* Vue d'ensemble fidèle à dashboard-maquette.html */
              <DashboardView
                currentUser={currentUser}
                campagnes={campagnes}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  if (tab === 'beneficiaries') setBeneficiaryView('dashboard');
                  if (tab === 'solidarity' || tab === 'impact') setSolidarityView('dashboard');
                }}
                onCreateCampaign={() => {
                  setActiveTab('campaigns');
                  setIsCreateModalOpen(true);
                }}
                onViewCampaign={(campagneId) => {
                  setActiveTab('campaigns');
                  const found = campagnes.find((c) => c.id === campagneId);
                  if (found) setViewingCampaign(found);
                }}
                onExportReport={() => {
                  showToast("Votre rapport d'impact et d'activité est prêt à être exporté !");
                }}
                onViewReport={() => {
                  showToast("Rapport d'impact : +18% de femmes accompagnées ce mois-ci.");
                }}
              />
            ) : activeTab === 'messages' ? (
              /* Hub de Messagerie Orange SMS, Automatisation par Âge & Relances */
              <PushSmsMessagingView
                campagnes={campagnes}
                allPersonnes={personnes}
                smsLogs={smsLogs}
                automationRules={automationRules}
                currentUser={currentUser}
                onToggleRule={handleToggleAutomationRule}
                onTriggerAgeWave={handleTriggerAgeWave}
                onTriggerPostCampaignFollowup={handleTriggerPostCampaignFollowup}
                onSendQuickPush={handleSendQuickPush}
              />
            ) : activeTab === 'predictive' ? (
              /* Tableau de Bord Prédictif National pour le Ministère de la Santé (Data for Good) */
              <PredictiveHealthDashboard
                indicateursRegions={MOCK_INDICATEURS_REGIONS_BF}
                onDeployMobileClinic={handleDeployMobileClinic}
                onFilterByRegion={(regionNom) => {
                  setActiveTab('impact');
                  setActiveSolidarityTab('requests');
                  showToast(`Filtre activé sur les dossiers de la région : ${regionNom}`);
                }}
              />
            ) : (
              /* Autres onglets (Paramètres, Aide) */
              <div className="scene-welcome-card">
                <div className="content-eyebrow">
                  <span className="eyebrow-pill" />
                  <span>ESPACE PERSONNEL · BURKINA FASO</span>
                </div>

                <h1 className="content-title">
                  {activeTab === 'settings' && 'Paramètres du Centre'}
                  {activeTab === 'help' && 'Centre d’Aide & Support'}
                </h1>

                <p className="content-description">
                  {activeTab === 'settings' &&
                    'Configurez vos identifiants, vos notifications et les droits d’accès de votre centre de santé.'}
                  {activeTab === 'help' &&
                    'Besoin d’assistance ? Notre équipe d’experts en santé communautaire est disponible 24/7.'}
                </p>

                <div className="content-badge-row mt-4 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('campaigns')}
                    className="btn-primary-filled"
                  >
                    Module 1 : Gestion des Campagnes →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('beneficiaries');
                      setBeneficiaryView('dashboard');
                    }}
                    className="btn-primary-filled"
                    style={{ background: '#007599' }}
                  >
                    Module 2 : Bénéficiaires & Triage IA →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('impact');
                      setSolidarityView('dashboard');
                    }}
                    className="btn-primary-filled"
                    style={{ background: '#FF7900' }}
                  >
                    Module 4 : Solidarité & Orange Money →
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('predictive')}
                    className="btn-primary-filled"
                    style={{ background: '#17343B' }}
                  >
                    Pilotage Ministère (Data) →
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="quick-login-link ml-1"
                  >
                    Déconnexion →
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* MODAL 1 : Création / Édition de campagne */}
      <CampaignFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCampaign(null);
        }}
        onSubmit={handleSaveCampaign}
        centres={MOCK_CENTRES}
        allAgents={MOCK_AGENTS}
        currentUser={currentUser}
        initialData={editingCampaign}
      />

      {/* MODAL 2 : Validation du Responsable */}
      <CampaignValidationModal
        isOpen={!!validatingCampaign}
        campagne={validatingCampaign}
        allAgents={MOCK_AGENTS}
        currentUser={currentUser}
        onClose={() => setValidatingCampaign(null)}
        onDecision={handleValidationDecision}
      />

      {/* MODAL 3 : Fiche détaillée & Suivi patientes */}
      <CampaignDetailModal
        isOpen={!!viewingCampaign}
        campagne={viewingCampaign}
        allAgents={MOCK_AGENTS}
        allPersonnes={personnes}
        allSmsLogs={smsLogs}
        currentUser={currentUser}
        onClose={() => setViewingCampaign(null)}
        onAddPersonne={handleAddPersonne}
        onTriggerPushSms={handleTriggerPushSms}
      />

      {/* MODAL 4 : Simulateur de Don Entrant Webhook Partenaire (Module 4) */}
      <IncomingDonationApiModal
        isOpen={isIncomingDonationModalOpen}
        onClose={() => setIsIncomingDonationModalOpen(false)}
        partenaires={partenairesList}
        preselectedPartnerId={preselectedPartnerForDonation}
        onConfirmDonation={handleConfirmIncomingDonation}
      />

      {/* MODAL 5 : Envoi d'Appel à l'Aide / Parrainage Cas Graves (Module 4) */}
      <SendPartnerAidRequestModal
        isOpen={isSendAidAppealModalOpen}
        onClose={() => setIsSendAidAppealModalOpen(false)}
        partenaires={partenairesList}
        preselectedPartnerId={preselectedPartnerForAppeal}
        preselectedPatient={preselectedPatientForAppeal}
        onSubmitAppeal={handleSubmitAidAppeal}
      />

      {/* MODAL 6 : Fiche Détaillée & Contrat Partenaire (Module 4) */}
      <PartnerDetailModal
        isOpen={isPartnerDetailModalOpen}
        onClose={() => {
          setIsPartnerDetailModalOpen(false);
          setSelectedPartnerForDetail(null);
        }}
        partenaire={selectedPartnerForDetail}
        dons={donsTransactions}
        appelsAide={appelsAideCasGraves}
        onSimulateDonation={(partenaire) => handleOpenIncomingDonationModal(partenaire)}
        onSponsorPatient={(partenaire) => handleOpenSendAidAppeal(partenaire)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="floating-toast" role="status" aria-live="polite">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
