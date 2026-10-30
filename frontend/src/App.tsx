import { useState, useEffect, useMemo, useCallback } from 'react';
import { SidebarNavbar, MobileNavTopbar } from './components/navigation';
import { LoginPage } from './pages/loginPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignDetailModal } from './components/campaigns';
import { MOCK_REGLES_AUTOMATISATION_AGE } from './data/mockCampaignData';
import type {
  Campagne,
  CentreSante,
  AgentSante,
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
  MOCK_FONDS_SOLIDARITE,
  MOCK_INDICATEURS_REGIONS_BF,
} from './data/mockSolidarityData';
import type {
  PartenaireDonneur,
  DonTransaction,
  AppelAideCasGrave,
} from './types/partner';
import type { DemandeAide, FondsSolidariteSummary } from './types/solidarity';
import { PatientsPage, PushSmsPage } from './pages';
import type { Beneficiaire, BeneficiairesKPIs, ExamenCliniqueDetails } from './types/beneficiary';
import { DashboardView } from './components/dashboard';
import { AgentMyCampaignsView } from './components/agentCampaigns';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import {
  campaignApi,
  centreApi,
  patientApi,
  solidarityApi,
  partnerApi,
  authApi,
  statsApi,
  mapBackendUserToContext,
  type BackendUser,
} from './services/api';
import { PredictiveHealthDashboard } from './components/predictive';
import { AdminCentreTeamView } from './components/admin/AdminCentreTeamView';
import './App.css';

const TAB_PATH_MAP: Record<string, string> = {
  dashboard: '/dashboard',
  campaigns: '/campaigns',
  my_campaigns: '/my-campaigns',
  beneficiaries: '/beneficiaries',
  messages: '/messages',
  impact: '/solidarity',
  centre_admin: '/centre-admin',
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
  '/centre-admin': 'centre_admin',
  '/predictive': 'predictive',
  '/settings': 'settings',
  '/help': 'help',
};

function getInitialRoute(): { view: 'dashboard' | 'login'; tab: string } {
  if (typeof window === 'undefined') {
    return { view: 'login', tab: 'dashboard' };
  }
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const hasToken = !!localStorage.getItem('auth_token');

  // Si aucun jeton n'est présent ou si route /login, affichage obligatoire de la page de connexion
  if (!hasToken || path === '/login') {
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
    toggleSimulatedOffline,
  } = useNetworkStatus();

  // État des données du Module 1 (Campagnes réelles du Backend Spring Boot et Logs SMS)
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [centresList, setCentresList] = useState<CentreSante[]>([]);
  const [agentsList] = useState<AgentSante[]>([]);
  const [personnes, setPersonnes] = useState<PersonneSensibilisee[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);

  // Nombre réel de campagnes actives (statut EN_COURS) issues du Backend Spring Boot
  const activeCampaignsCount = useMemo(() => {
    return campagnes.filter(
      (c) => c.statut === 'EN_COURS' || c.statut === 'en_cours'
    ).length;
  }, [campagnes]);
  const [automationRules, setAutomationRules] = useState<RegleAutomatisationAge[]>(
    MOCK_REGLES_AUTOMATISATION_AGE
  );

  // Utilisateur connecté au Backend Spring Boot (restauré depuis la session ou null)
  const [currentUser, setCurrentUser] = useState<CurrentUserContext | null>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        try {
          const u = JSON.parse(stored) as BackendUser;
          return mapBackendUserToContext(u);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Modals d'interaction
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campagne | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<Campagne | null>(null);

  // État des données du Fonds de Solidarité & Pilotage Statistique
  const [demandesAide, setDemandesAide] = useState<DemandeAide[]>([]);
  const [fondsSolidarite, setFondsSolidarite] = useState<FondsSolidariteSummary>(
    MOCK_FONDS_SOLIDARITE
  );
  const [solidarityView, setSolidarityView] = useState<
    'dashboard' | 'create' | 'validate' | 'pay_om'
  >('dashboard');
  const [activeSolidarityTab, setActiveSolidarityTab] = useState<SolidaritySectionTab>('requests');
  const [selectedAidRequest, setSelectedAidRequest] = useState<DemandeAide | null>(null);
  const [selectedPatientForAid, setSelectedPatientForAid] = useState<Beneficiaire | null>(null);

  // Données Partenaires & Parrainages (Étape 2 & 3)
  const [partenairesList, setPartenairesList] = useState<PartenaireDonneur[]>([]);
  const [donsTransactions, setDonsTransactions] = useState<DonTransaction[]>([]);
  const [appelsAideCasGraves, setAppelsAideCasGraves] = useState<AppelAideCasGrave[]>([]);
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

  // Handlers pour le Fonds de Solidarité & Mécénat
  const handleCreateAidRequest = (newDemande: DemandeAide) => {
    // Appel API Solidarité
    solidarityApi.createDemandeAide(newDemande).catch(console.warn);

    setDemandesAide([newDemande, ...demandesAide]);
    setFondsSolidarite((prev) => ({
      ...prev,
      nombreDemandesTotal: prev.nombreDemandesTotal + 1,
      demandesEnAttente: prev.demandesEnAttente + 1,
    }));

    if (selectedPatientForAid) {
      setBeneficiairesList((prev) =>
        prev.map((b) =>
          b.id === selectedPatientForAid.id
            ? {
                ...b,
                demandeAideId: newDemande.id,
                demandeAideCode: newDemande.codeDossier,
                statutAideFonds: 'EN_ATTENTE',
              }
            : b
        )
      );
    }

    setSelectedPatientForAid(null);
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
      `Simulation terminée pour ${updatedDemande.montantAccorde.toLocaleString('fr-FR')} FCFA. Aucun transfert réel n’a été effectué.`
    );
  };

  // État des données réelles du Module Patientes (chargées depuis PostgreSQL via patientApi)
  const [beneficiairesList, setBeneficiairesList] = useState<Beneficiaire[]>([]);
  const [beneficiairesKpis, setBeneficiairesKpis] = useState<BeneficiairesKPIs>({
    totalPatientes: 0,
    depistagesEffectues: 0,
    casRisqueEleve: 0,
    casRisqueModere: 0,
    femmesPdiOuVulnerables: 0,
    aidesAttribueesCount: 0,
  });

  // Liste dynamique des patientes candidates au parrainage à partir de la patientèle réelle
  const candidatePatientsList = useMemo<PatientCandidate[] | undefined>(() => {
    const list = beneficiairesList.map((b) => ({
      id: b.id,
      nom: b.nom,
      prenom: b.prenom,
      age: b.age,
      commune: b.commune,
      region: b.secteur || 'Burkina Faso',
      scoreIA: b.dernierTriage?.scoreCalcule || b.derniereEvaluation?.scoreIA || 75,
      descriptionClinique:
        b.dernierTriage?.observationsVocales ||
        b.dernierTriage?.conduiteATenir ||
        b.derniereEvaluation?.conduiteATenir ||
        'Patiente prioritaire identifiée lors des campagnes de dépistage terrain.',
      vulnerabilite: b.statutVulnerabilite,
      centreNom: b.centreSuiviNom,
    }));
    return list.length > 0 ? list : undefined;
  }, [beneficiairesList]);

  // Vérification de la session auprès du Backend Spring Boot
  useEffect(() => {
    let isMounted = true;
    async function verifyBackendSession() {
      const token = authApi.getToken();
      if (!token) {
        if (isMounted) {
          setCurrentUser(null);
          setCurrentView('login');
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        const user = await authApi.getCurrentUser();
        if (!isMounted) return;
        if (user) {
          setCurrentUser(mapBackendUserToContext(user));
        } else {
          setCurrentUser(null);
          setCurrentView('login');
        }
      } catch (err) {
        console.warn('[App] Erreur lors de la validation du jeton backend :', err);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    }

    verifyBackendSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Hydratation initiale depuis l'API Spring Boot (avec Graceful Fallback)
  useEffect(() => {
    let isMounted = true;
    async function hydrateData() {
      try {
        const [
          loadedCampagnes,
          loadedCentres,
          loadedPatients,
          loadedDemandes,
          loadedPartenaires,
          loadedSmsLogs,
          loadedStats,
        ] = await Promise.all([
          campaignApi.getCampagnes(),
          centreApi.getCentres(),
          patientApi.getPatientes(),
          solidarityApi.getDemandesAide(),
          partnerApi.getPartenaires(),
          campaignApi.getSmsLogs().catch(() => []),
          statsApi.getDashboard().catch(() => null),
        ]);

        if (isMounted) {
          if (Array.isArray(loadedCampagnes)) {
            setCampagnes(loadedCampagnes);
          }
          if (Array.isArray(loadedCentres)) {
            setCentresList(loadedCentres);
          }
          if (Array.isArray(loadedPatients)) {
            setBeneficiairesList(loadedPatients);
          }
          if (Array.isArray(loadedDemandes)) {
            setDemandesAide(loadedDemandes);
          }
          if (Array.isArray(loadedPartenaires)) {
            setPartenairesList(loadedPartenaires);
          }
          if (Array.isArray(loadedSmsLogs)) {
            setSmsLogs(loadedSmsLogs);
          }
          if (loadedStats) {
            setBeneficiairesKpis({
              totalPatientes: loadedStats.totalPatientes,
              depistagesEffectues: loadedStats.totalEvaluations,
              casRisqueEleve: loadedStats.totalCasEleves,
              casRisqueModere: loadedStats.totalCasModeres,
              femmesPdiOuVulnerables: (loadedPatients || []).filter(
                (p) => p.statutVulnerabilite === 'PDI' || p.statutVulnerabilite === 'Vulnerable'
              ).length || 2,
              aidesAttribueesCount: loadedStats.totalBonsEmis,
            });
            setFondsSolidarite((prev) => ({
              ...prev,
              montantDisponible: loadedStats.totalFondsDisponiblesXof || prev.montantDisponible,
              nombreAidesAttribuees: loadedStats.totalBonsEmis,
            }));
          } else if (Array.isArray(loadedPatients) && loadedPatients.length > 0) {
            setBeneficiairesKpis({
              totalPatientes: loadedPatients.length,
              depistagesEffectues: loadedPatients.filter(
                (p) => p.derniereEvaluation || p.dernierTriage
              ).length,
              casRisqueEleve: loadedPatients.filter(
                (p) =>
                  p.dernierTriage?.niveauSuspicion === 'eleve' ||
                  p.derniereEvaluation?.niveauRisque === 'ELEVE'
              ).length,
              casRisqueModere: loadedPatients.filter(
                (p) =>
                  p.dernierTriage?.niveauSuspicion === 'modere' ||
                  p.derniereEvaluation?.niveauRisque === 'MODERE'
              ).length,
              femmesPdiOuVulnerables: loadedPatients.filter(
                (p) => p.statutVulnerabilite === 'PDI' || p.statutVulnerabilite === 'Vulnerable'
              ).length,
              aidesAttribueesCount: loadedPatients.filter(
                (p) => p.demandeAideId || p.statutAideFonds === 'APPROUVEE' || p.statutAideFonds === 'PAYEE'
              ).length,
            });
          }
        }
      } catch (err) {
        console.warn('[App] Mode fallback local actif pour l\'hydratation', err);
      }
    }
    hydrateData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Handlers pour les Bénéficiaires
  const handleRegisterNewPatient = (newPatient: Beneficiaire) => {
    let patientToStore = { ...newPatient };

    const isUrgent =
      newPatient.derniereEvaluation?.niveauRisque === 'ELEVE' ||
      newPatient.dernierTriage?.niveauSuspicion === 'eleve';

    if (newPatient.derniereEvaluation) {
      showToast(
        `Patiente ${newPatient.nom} ${newPatient.prenom} enregistrée · Repérage à faire vérifier par un professionnel de santé`
      );
    } else {
      showToast(`Patiente ${newPatient.nom} ${newPatient.prenom} enregistrée avec succès !`);
    }

    // Appel du service API Spring Boot (avec synchronisation automatique offline)
    patientApi.registerPatiente(patientToStore).catch(console.warn);

    setBeneficiairesList([patientToStore, ...beneficiairesList]);
    setBeneficiairesKpis((prev) => ({
      ...prev,
      totalPatientes: prev.totalPatientes + 1,
      depistagesEffectues:
        newPatient.derniereEvaluation || newPatient.dernierTriage
          ? prev.depistagesEffectues + 1
          : prev.depistagesEffectues,
      casRisqueEleve: isUrgent ? prev.casRisqueEleve + 1 : prev.casRisqueEleve,
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
  };

  const handleSavePatientTriage = (updatedPatient: Beneficiaire) => {
    let finalPatient = { ...updatedPatient };
    const isUrgent = updatedPatient.derniereEvaluation?.niveauRisque === 'ELEVE' ||
      updatedPatient.dernierTriage?.niveauSuspicion === 'eleve';
    showToast(
      `Repérage enregistré pour ${finalPatient.nom} ${finalPatient.prenom}; vérification par un professionnel requise.`
    );

    // Appel API Patiente & Triage
    patientApi.updatePatiente(finalPatient.id, finalPatient).catch(console.warn);

    setBeneficiairesList((prev) =>
      prev.map((b) => (b.id === finalPatient.id ? finalPatient : b))
    );
    setBeneficiairesKpis((prev) => ({
      ...prev,
      depistagesEffectues: prev.depistagesEffectues + 1,
      casRisqueEleve: isUrgent ? prev.casRisqueEleve + 1 : prev.casRisqueEleve,
    }));
  };

  const handleRequestSolidarityForPatient = (patient: Beneficiaire) => {
    setSelectedPatientForAid(patient);
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
      setSelectedPatientForAid(null);
      setSolidarityView('dashboard');
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

  // Synchronisation des données réelles du backend Spring Boot (centres et campagnes)
  useEffect(() => {
    let isMounted = true;

    // Charger les centres de santé officiels (/api/centres)
    centreApi
      .getCentres()
      .then((centres) => {
        if (isMounted && Array.isArray(centres) && centres.length > 0) {
          setCentresList(centres);
        }
      })
      .catch((err) => console.warn('Erreur chargement centres backend:', err));

    // Charger les campagnes réelles (/api/campagnes) si authentifié
    if (currentUser) {
      campaignApi
        .getCampagnes()
        .then((backendCamps) => {
          if (isMounted && Array.isArray(backendCamps)) {
            setCampagnes(backendCamps);
          }
        })
        .catch((err) => console.warn('Erreur chargement campagnes backend:', err));
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleTabChange = (tabId: string) => {
    navigateToTab(tabId);
  };

  const handleDeployMobileClinic = (regionNom: string) => {
    if (!currentUser) return;
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

  // 1. Création ou modification de campagne
  const handleSaveCampaign = (
    campaignData: Omit<Campagne, 'id' | 'historique'>,
    targetStatut: 'brouillon' | 'en_attente',
    editing?: Campagne | null
  ) => {
    if (!currentUser) return;
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetEditing = editing !== undefined ? editing : editingCampaign;

    if (targetEditing) {
      // Mise à jour API
      campaignApi
        .updateCampagne(targetEditing.id, {
          ...campaignData,
          statut: targetStatut === 'en_attente' ? 'en_attente' : undefined,
        })
        .catch(console.warn);

      const updatedList = campagnes.map((c) => {
        if (c.id === targetEditing.id) {
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
      const tempId = `camp-${Date.now()}`;
      const newCampagne: Campagne = {
        id: tempId,
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

      // Insertion optimiste immédiate dans l'état pour une réactivité UI maximale
      setCampagnes((prev) => [newCampagne, ...prev]);
      setIsCreateModalOpen(false);

      showToast(
        targetStatut === 'en_attente'
          ? `Transmission de la campagne au backend Spring Boot en cours...`
          : `Sauvegarde du brouillon en cours...`
      );

      // Appel asynchrone au backend Spring Boot (POST /api/campagnes)
      campaignApi
        .createCampagne(newCampagne)
        .then((savedCampagne) => {
          // Remplacement immédiat par l'entité officielle du backend (avec son véritable UUID)
          setCampagnes((prev) =>
            prev.map((c) => (c.id === tempId ? savedCampagne : c))
          );
          showToast(
            `✅ Campagne "${savedCampagne.titre || savedCampagne.nom}" enregistrée avec succès dans le backend !`
          );
        })
        .catch((err) => {
          console.warn('Persistance backend en attente (hors-ligne ou erreur) :', err);
          showToast(`Campagne enregistrée localement (mode hors-ligne).`);
        });
    }
  };

  // 2. Décision de validation par le responsable
  const handleValidationDecision = (
    campagneId: string,
    decision: 'approuvee' | 'a_corriger' | 'refusee',
    motif?: string
  ) => {
    if (!currentUser) return;
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
  };

  // 3. Ajout d'une personne sensibilisée
  const handleAddPersonne = (data: Omit<PersonneSensibilisee, 'id'>) => {
    if (!currentUser) return;
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
        `Patiente ${data.prenom} ${data.nom} enregistrée · Score de triage : ${ev.scoreIA}/100 (RISQUE ÉLEVÉ) — Bon de Santé recommandé !`
      );
    } else if (ev) {
      showToast(
        `Patiente ${data.prenom} ${data.nom} enregistrée · Score de triage : ${ev.scoreIA}/100 (${ev.niveauRisque})`
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
    if (!currentUser) return;
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
      `Simulation de diffusion SMS en ${langue} terminée. Aucun SMS réel n’a été envoyé.`
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

  // 6. Déclenchement d'une vague selon l'âge (20, 35, 40, 50 ans)
  const handleTriggerAgeWave = (rule: RegleAutomatisationAge) => {
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Filtrer les patientes réelles du backend dans cette tranche d'âge
    const eligiblePatients = beneficiairesList.filter(
      (b) => b.age >= rule.ageMin && b.age <= rule.ageMax
    );

    if (eligiblePatients.length === 0) {
      showToast(
        `Aucune patiente enregistrée dans la tranche d'âge ${rule.ageMin}-${rule.ageMax} ans.`
      );
      return;
    }

    const generatedLogs: SmsLog[] = eligiblePatients.map((p, idx) => {
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
              totalEnvoyes: r.totalEnvoyes + eligiblePatients.length,
              derniereExecution: dateStr.substring(0, 16),
            }
          : r
      )
    );

    showToast(
      `⚡ Rappels automatiques (${rule.ageMin}-${rule.ageMax} ans) diffusés auprès de ${eligiblePatients.length} femmes !`
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

    if (targeted.length === 0) {
      showToast(
        `Aucune patiente ciblée pour cette campagne.`
      );
      return;
    }

    const generatedLogs: SmsLog[] = targeted.map((p, idx) => {
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
              totalSmsEnvoyes: (c.totalSmsEnvoyes || 0) + targeted.length,
            }
          : c
      )
    );

    showToast(
      `📢 Relance post-campagne diffusée en langues locales auprès de ${targeted.length} patientes !`
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
      destinataireNom: `Diffusion de proximité (${secteur}, ${commune})`,
      destinataireTelephone: `Commune de ${commune}`,
      langue,
      contenu,
      dateEnvoi: dateStr,
      statut: 'ENVOYE',
      typeMessage: 'ALERTE_IMMEDIATE',
    };

    setSmsLogs((prev) => [newLog, ...prev]);
    showToast(
      `⚡ Alerte SMS diffusée sur ${secteur} (${commune}) auprès de ~${estimatedCount} téléphones !`
    );
  };

  const handleLoginSuccess = useCallback((user?: BackendUser) => {
    if (user) {
      setCurrentUser(mapBackendUserToContext(user));
    } else {
      authApi.getCurrentUser().then((u) => {
        if (u) {
          setCurrentUser(mapBackendUserToContext(u));
        }
      });
    }

    // Rafraîchir les campagnes, centres et patientes depuis le Backend PostgreSQL
    Promise.all([
      campaignApi.getCampagnes(),
      centreApi.getCentres(),
      patientApi.getPatientes(),
    ])
      .then(([camps, centres, patients]) => {
        if (Array.isArray(camps)) setCampagnes(camps);
        if (Array.isArray(centres) && centres.length > 0) setCentresList(centres);
        if (Array.isArray(patients)) setBeneficiairesList(patients);
      })
      .catch(console.warn);

    navigateToView('dashboard');
    showToast('Bienvenue ! Connexion réussie au backend.');
  }, [navigateToView]);

  const handleLogout = useCallback(() => {
    authApi.logout();
    setCurrentUser(null);
    navigateToView('login');
    showToast('Session fermée. Vous avez été déconnecté.');
  }, [navigateToView]);

  // Si l'utilisateur est sur la page de connexion ou n'est pas authentifié
  if (currentView === 'login' || !currentUser) {
    if (isAuthLoading && authApi.getToken()) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F9F9] text-[#17343B]">
          <div className="w-10 h-10 border-4 border-[#007599]/30 border-t-[#007599] rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold tracking-wide">Validation de votre session sécurisée auprès du Backend...</p>
        </div>
      );
    }
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
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
          currentUser={currentUser}
          activeCampaignsCount={activeCampaignsCount}
        />

        {/* Content View Area */}
        <div className="scene-content-area">

          {!isOnline && (
            <div className="mx-6 mt-3.5 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📡</span>
                <div>
                  <strong>Mode Mission Rurale Déconnectée (Module 3) :</strong> Toutes vos saisies (patientes, évaluations cliniques, demandes d'aide) sont persistées localement dans IndexedDB.
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
              /* Module 1 : Gestion des campagnes de sensibilisation (Réservé Administrateur) */
              (currentUser?.role === 'responsable' || currentUser?.roleTitre?.toLowerCase().includes('sage-femme')) ? (
                <div className="scene-welcome-card" style={{ padding: '36px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#17343B', marginBottom: '8px' }}>
                    Accès Réservé à l'Administration
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px auto' }}>
                    La planification et la création des campagnes de dépistage sont gérées par l'Administrateur du centre.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('beneficiaries')}
                    className="btn-create-campaign"
                    style={{ margin: '0 auto' }}
                  >
                    Accéder aux Dossiers Patientes & Triage →
                  </button>
                </div>
              ) : (
                <CampaignsPage
                  campagnes={campagnes}
                  centres={centresList}
                  agents={agentsList}
                  currentUser={currentUser}
                  personnes={personnes}
                  smsLogs={smsLogs}
                  onSaveCampaign={handleSaveCampaign}
                  onValidationDecision={handleValidationDecision}
                  onAddPersonne={handleAddPersonne}
                  onTriggerPushSms={handleTriggerPushSms}
                  initialCreateOpen={isCreateModalOpen}
                  onCloseInitialCreate={() => setIsCreateModalOpen(false)}
                  initialViewingCampaign={viewingCampaign}
                  onCloseInitialViewing={() => setViewingCampaign(null)}
                />
              )
            ) : activeTab === 'my_campaigns' ? (
              /* Espace Agent : Mes Campagnes & Fiche de création patiente */
              <AgentMyCampaignsView
                campagnes={campagnes}
                personnes={personnes}
                allAgents={agentsList}
                currentUser={currentUser}
                centres={centresList}
                allBeneficiaires={beneficiairesList}
                onAddPersonne={handleAddPersonne}
                onRegisterBeneficiaire={handleRegisterNewPatient}
                onViewCampaignDetails={(camp) => setViewingCampaign(camp)}
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
                    onCreateAidRequest={() => {
                      setSelectedPatientForAid(null);
                      setSolidarityView('create');
                    }}
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
                    initialPatient={selectedPatientForAid}
                    onBack={() => {
                      setSelectedPatientForAid(null);
                      setSolidarityView('dashboard');
                    }}
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
              /* Module 2 : Dossiers & Suivi des Patientes */
              <PatientsPage
                beneficiaires={beneficiairesList}
                kpis={beneficiairesKpis}
                currentUser={currentUser}
                centres={centresList}
                campagnes={campagnes}
                onRegisterNewPatient={handleRegisterNewPatient}
                onSavePatientTriage={handleSavePatientTriage}
                onRequestSolidarity={handleRequestSolidarityForPatient}
                onRequestPartnerSponsorship={(candidate) =>
                  handleOpenSendAidAppeal(undefined, candidate)
                }
              />
            ) : activeTab === 'dashboard' ? (
              /* Vue d'ensemble fidèle à dashboard-maquette.html */
              <DashboardView
                currentUser={currentUser}
                campagnes={campagnes}
                beneficiairesList={beneficiairesList}
                beneficiairesKpis={beneficiairesKpis}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
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
              <PushSmsPage
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
            ) : activeTab === 'centre_admin' ? (
              /* Espace Contrôle Administrateur de Centre : Gestion Sages-Femmes & Dotations */
              <AdminCentreTeamView
                currentUser={currentUser}
                centres={centresList}
                onShowToast={showToast}
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
                    }}
                    className="btn-primary-filled"
                    style={{ background: '#007599' }}
                  >
                    Dossiers Bénéficiaires & Triage à règles →
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
                    Fonds de Solidarité & Mécénat →
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

      {/* MODAL Fiche détaillée pour l'espace Agent (si ouvert hors onglet campagnes) */}
      {activeTab !== 'campaigns' && viewingCampaign && (
        <CampaignDetailModal
          isOpen={!!viewingCampaign}
          campagne={viewingCampaign}
          allAgents={agentsList}
          allPersonnes={personnes}
          allSmsLogs={smsLogs}
          currentUser={currentUser}
          onClose={() => setViewingCampaign(null)}
          onAddPersonne={handleAddPersonne}
          onTriggerPushSms={handleTriggerPushSms}
        />
      )}

      {/* MODAL 4 : Simulateur de Don Entrant Webhook Partenaire */}
      <IncomingDonationApiModal
        isOpen={isIncomingDonationModalOpen}
        onClose={() => setIsIncomingDonationModalOpen(false)}
        partenaires={partenairesList}
        preselectedPartnerId={preselectedPartnerForDonation}
        onConfirmDonation={handleConfirmIncomingDonation}
      />

      {/* MODAL 5 : Envoi d'Appel à l'Aide / Parrainage Cas Graves */}
      <SendPartnerAidRequestModal
        isOpen={isSendAidAppealModalOpen}
        onClose={() => {
          setIsSendAidAppealModalOpen(false);
          setPreselectedPatientForAppeal(undefined);
          setPreselectedPartnerForAppeal(undefined);
        }}
        partenaires={partenairesList}
        preselectedPartnerId={preselectedPartnerForAppeal}
        preselectedPatient={preselectedPatientForAppeal}
        patientsCandidats={candidatePatientsList}
        onSubmitAppeal={handleSubmitAidAppeal}
      />

      {/* MODAL 6 : Fiche Détaillée & Contrat Partenaire */}
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
