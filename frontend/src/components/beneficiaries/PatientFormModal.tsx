import React, { useState, useMemo } from 'react';
import type {
  Beneficiaire,
  StatutVulnerabilite,
  QuadrantSein,
  ExamenCliniqueDetails,
  StatutDepistage,
} from '../../types/beneficiary';
import type { CentreSante, CurrentUserContext, LanguePatiente, Campagne } from '../../types/campaign';
import {
  calculerScoreEvaluation,
  type ResultatScoreEvaluation,
  type Evaluation,
} from '../../types/evaluation';
import { X, User, MapPin, Stethoscope } from 'lucide-react';
import {
  PatientStepIdentity,
  PatientStepLocation,
  PatientStepClinical,
  PatientModalFooter,
  type PatientFormStep,
} from './modal';
import type { DetectedIndicators } from '../common/DicteeVocale';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patient: Beneficiaire) => void;
  centres: CentreSante[];
  currentUser: CurrentUserContext;
  initialData?: Beneficiaire | null;
  assignedCampagne?: Campagne | null;
  allCampagnes?: Campagne[];
  allBeneficiaires?: Beneficiaire[];
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  centres,
  currentUser,
  initialData,
  assignedCampagne,
  allCampagnes = [],
  allBeneficiaires = [],
}) => {
  if (!isOpen) return null;

  const isEdit = Boolean(initialData);

  // Étape active de l'assistant (1: Identité -> 2: Localisation -> 3: Clinique)
  const [activeStep, setActiveStep] = useState<PatientFormStep>('identity');

  // Centre par défaut : centre de l'agent ou premier centre disponible
  const defaultCentreId =
    initialData?.centreSuiviId ||
    centres.find((c) => c.id === currentUser.centreId)?.id ||
    centres[0]?.id ||
    '';

  // --- Étape 1 : Identité & Contact ---
  const [nom, setNom] = useState(initialData?.nom || '');
  const [prenom, setPrenom] = useState(initialData?.prenom || '');
  const [age, setAge] = useState<number>(initialData?.age || 38);
  const [telephone, setTelephone] = useState(initialData?.telephone || '+226 ');
  const [utiliseWhatsApp, setUtiliseWhatsApp] = useState<boolean>(
    initialData?.canalPrefere === 'WHATSAPP' || true
  );
  const [languePreferee, setLanguePreferee] = useState<LanguePatiente>(
    initialData?.languePreferee || 'Mooré'
  );

  // --- Étape 2 : Localisation & Structure de Santé ---
  const [commune, setCommune] = useState(
    initialData?.commune || (currentUser.centreNom?.includes('Bobo') ? 'Bobo-Dioulasso' : 'Ouagadougou')
  );
  const [secteur, setSecteur] = useState(initialData?.secteur || 'Secteur 1');
  const [centreSuiviId, setCentreSuiviId] = useState(defaultCentreId);
  const [statutVulnerabilite, setStatutVulnerabilite] = useState<StatutVulnerabilite>(
    initialData?.statutVulnerabilite || 'Standard'
  );

  // --- Étape 3 : Examen Clinique & Triage à règles Automatique ---
  const [activerEvaluationInitiale, setActiverEvaluationInitiale] = useState<boolean>(true);
  const [nodule, setNodule] = useState<boolean>(
    Boolean(initialData?.derniereEvaluation?.nodule || initialData?.dernierTriage?.nodulePalpable)
  );
  const [consistanceNodule, setConsistanceNodule] = useState<'dur_adherent' | 'ferme' | 'mobile_elastique' | 'aucun'>(
    initialData?.derniereEvaluation?.autresIndicateurs?.consistanceNodule ||
      initialData?.dernierTriage?.consistanceNodule ||
      'aucun'
  );
  const [tailleNoduleCm, setTailleNoduleCm] = useState<number>(
    initialData?.derniereEvaluation?.autresIndicateurs?.tailleNoduleCm ||
      initialData?.dernierTriage?.tailleNoduleCm ||
      0
  );
  const [seinConcerne, setSeinConcerne] = useState<'gauche' | 'droit' | 'bilateral' | 'aucun'>(
    initialData?.derniereEvaluation?.autresIndicateurs?.seinConcerne ||
      initialData?.dernierTriage?.seinConcerne ||
      'aucun'
  );
  const [quadrant, setQuadrant] = useState<QuadrantSein>(
    (initialData?.derniereEvaluation?.autresIndicateurs?.quadrant as QuadrantSein) ||
      initialData?.dernierTriage?.quadrant ||
      'aucun'
  );
  const [peauOrange, setPeauOrange] = useState<boolean>(
    Boolean(initialData?.derniereEvaluation?.peauOrange || initialData?.dernierTriage?.peauOrange)
  );
  const [retractionCutanee, setRetractionCutanee] = useState<boolean>(
    Boolean(
      initialData?.derniereEvaluation?.autresIndicateurs?.retractionCutanee ||
        initialData?.dernierTriage?.retractionCutanee
    )
  );
  const [ecoulementMamelonnaire, setEcoulementMamelonnaire] = useState<boolean>(
    Boolean(
      initialData?.derniereEvaluation?.autresIndicateurs?.ecoulementMamelonnaire ||
        initialData?.dernierTriage?.ecoulementMamelonnaire
    )
  );
  const [typeEcoulement, setTypeEcoulement] = useState<'sanglant' | 'sereux' | 'purulent' | 'aucun'>(
    initialData?.derniereEvaluation?.autresIndicateurs?.typeEcoulement ||
      initialData?.dernierTriage?.typeEcoulement ||
      'aucun'
  );
  const [adenopathieAxillaire, setAdenopathieAxillaire] = useState<boolean>(
    Boolean(
      initialData?.derniereEvaluation?.autresIndicateurs?.adenopathieAxillaire ||
        initialData?.dernierTriage?.adenopathieAxillaire
    )
  );
  const [douleurMammaire, setDouleurMammaire] = useState<boolean>(
    Boolean(
      initialData?.derniereEvaluation?.autresIndicateurs?.douleurMammaire ||
        initialData?.dernierTriage?.douleurMammaire
    )
  );
  const [antecedentsFamiliaux, setAntecedentsFamiliaux] = useState<boolean>(
    Boolean(
      initialData?.derniereEvaluation?.autresIndicateurs?.antecedentsFamiliaux ||
        initialData?.dernierTriage?.antecedentsFamiliauxCancer
    )
  );
  const [modificationTailleForme, setModificationTailleForme] = useState<boolean>(
    Boolean(
      initialData?.derniereEvaluation?.autresIndicateurs?.modificationTailleForme ||
        initialData?.dernierTriage?.modificationTailleForme
    )
  );
  const [observations, setObservations] = useState(
    initialData?.derniereEvaluation?.autresIndicateurs?.observationsVocales ||
      initialData?.dernierTriage?.observationsVocales ||
      ''
  );

  // Erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcul du score de triage en direct (barème de triage configuré à 15 points)
  const evalResult: ResultatScoreEvaluation = useMemo(() => {
    return calculerScoreEvaluation(nodule, peauOrange, {
      seinConcerne,
      quadrant,
      consistanceNodule,
      tailleNoduleCm,
      ecoulementMamelonnaire,
      typeEcoulement,
      retractionCutanee,
      adenopathieAxillaire,
      douleurMammaire,
      antecedentsFamiliaux,
      modificationTailleForme,
      agePatiente: age,
      observationsVocales: observations,
    });
  }, [
    nodule,
    peauOrange,
    seinConcerne,
    quadrant,
    consistanceNodule,
    tailleNoduleCm,
    ecoulementMamelonnaire,
    typeEcoulement,
    retractionCutanee,
    adenopathieAxillaire,
    douleurMammaire,
    antecedentsFamiliaux,
    modificationTailleForme,
    observations,
    age,
  ]);

  // Traitement automatique des indicateurs extraits de la dictée vocale
  const handleApplyDetectedIndicators = (detected: DetectedIndicators) => {
    if (detected.nodule !== undefined) {
      setNodule(detected.nodule);
      if (detected.nodule && seinConcerne === 'aucun') setSeinConcerne('droit');
    }
    if (detected.consistanceNodule !== undefined) {
      setConsistanceNodule(detected.consistanceNodule);
    }
    if (detected.tailleNoduleCm !== undefined) {
      setTailleNoduleCm(detected.tailleNoduleCm);
    }
    if (detected.peauOrange !== undefined) {
      setPeauOrange(detected.peauOrange);
    }
    if (detected.retractionCutanee !== undefined) {
      setRetractionCutanee(detected.retractionCutanee);
    }
    if (detected.ecoulementMamelonnaire !== undefined) {
      setEcoulementMamelonnaire(detected.ecoulementMamelonnaire);
      if (detected.ecoulementMamelonnaire && typeEcoulement === 'aucun') {
        setTypeEcoulement('sanglant');
      }
    }
    if (detected.adenopathieAxillaire !== undefined) {
      setAdenopathieAxillaire(detected.adenopathieAxillaire);
    }
    if (detected.douleurMammaire !== undefined) {
      setDouleurMammaire(detected.douleurMammaire);
    }
    if (detected.antecedentsFamiliaux !== undefined) {
      setAntecedentsFamiliaux(detected.antecedentsFamiliaux);
    }
    if (detected.modificationTailleForme !== undefined) {
      setModificationTailleForme(detected.modificationTailleForme);
    }

    // Activer automatiquement le module clinique lors de la détection de signes
    if (!activerEvaluationInitiale) {
      setActiverEvaluationInitiale(true);
    }
  };

  const handleClearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Validation étape 1
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nom.trim()) {
      errs.nom = 'Le nom de famille est obligatoire.';
    }
    if (!prenom.trim()) {
      errs.prenom = 'Le prénom est obligatoire.';
    }
    if (!age || age < 10 || age > 110) {
      errs.age = 'Veuillez saisir un âge valide (entre 10 et 110 ans).';
    }
    if (!telephone.trim() || telephone.trim().length < 8) {
      errs.telephone = 'Le numéro de téléphone est obligatoire pour les rappels de dépistage.';
    }

    // Règle métier : Ne pas être affectée à deux campagnes actives simultanément
    const targetCampId = assignedCampagne?.id || initialData?.campagneId;
    if (targetCampId && allBeneficiaires.length > 0) {
      const cleanTel = telephone.trim().replace(/[\s\-\.\(\)]/g, '');
      const cleanNom = nom.trim().toLowerCase();
      const cleanPrenom = prenom.trim().toLowerCase();

      const conflictingPatient = allBeneficiaires.find((b) => {
        if (b.id === initialData?.id) return false;
        const bTel = b.telephone.trim().replace(/[\s\-\.\(\)]/g, '');
        const sameTel = cleanTel.length >= 8 && bTel.length >= 8 && (cleanTel === bTel || cleanTel.endsWith(bTel.slice(-8)) || bTel.endsWith(cleanTel.slice(-8)));
        const sameIdentity = cleanNom.length > 1 && cleanPrenom.length > 1 && b.nom.toLowerCase() === cleanNom && b.prenom.toLowerCase() === cleanPrenom;
        
        if ((sameTel || sameIdentity) && b.campagneId && b.campagneId !== targetCampId) {
          const otherCamp = allCampagnes.find((c) => c.id === b.campagneId);
          return otherCamp && (otherCamp.statut === 'en_cours' || otherCamp.statut === 'EN_COURS');
        }
        return false;
      });

      if (conflictingPatient && conflictingPatient.campagneId) {
        const otherCamp = allCampagnes.find((c) => c.id === conflictingPatient.campagneId);
        const campNom = otherCamp ? (otherCamp.nom || otherCamp.titre) : 'autre campagne active';
        errs.telephone = `Cette patiente est déjà affectée à la campagne active « ${campNom} ». Une patiente ne peut pas être affectée à deux campagnes en même temps.`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validation étape 2
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!commune.trim()) {
      errs.commune = 'La commune de résidence est obligatoire.';
    }
    if (!secteur.trim()) {
      errs.secteur = 'Le secteur ou village est obligatoire.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextToLocation = () => {
    if (validateStep1()) {
      setActiveStep('location');
    }
  };

  const handleNextToClinical = () => {
    if (validateStep2()) {
      setActiveStep('clinical');
    }
  };

  // Soumission finale de la fiche patiente
  const handleSubmit = async () => {
    if (!validateStep1()) {
      setActiveStep('identity');
      return;
    }
    if (!validateStep2()) {
      setActiveStep('location');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCentre = centres.find((c) => c.id === centreSuiviId) || centres[0];

      const patientId = initialData?.id || `pat-${Date.now()}`;
      const numeroDossier =
        initialData?.numeroDossier ||
        `PAT-BF-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Construction de l'évaluation clinique si activée
      let derniereEval: Evaluation | undefined = undefined;
      let dernierTriage: ExamenCliniqueDetails | undefined = undefined;

      if (activerEvaluationInitiale) {
        derniereEval = {
          id: `eval-${Date.now()}`,
          dateEvaluation: new Date().toISOString(),
          patienteId: patientId,
          patienteNom: `${prenom.trim()} ${nom.trim()}`,
          utilisateurId: currentUser.id,
          utilisateurNom: `${currentUser.prenom} ${currentUser.nom}`,
          nodule,
          peauOrange,
          autresIndicateurs: {
            seinConcerne,
            quadrant,
            consistanceNodule,
            tailleNoduleCm,
            ecoulementMamelonnaire,
            typeEcoulement,
            retractionCutanee,
            adenopathieAxillaire,
            douleurMammaire,
            antecedentsFamiliaux,
            modificationTailleForme,
            agePatiente: age,
            observationsVocales: observations,
          },
          scoreIA: evalResult.scoreIA,
          niveauRisque: evalResult.niveauRisque,
          conduiteATenir: evalResult.conduiteATenir,
          bonSanteDeclenche: evalResult.alerteBonSante,
          pointsObtenus: evalResult.pointsObtenus,
          pointsMax: evalResult.pointsMax,
        };

        dernierTriage = {
          id: `triage-${Date.now()}`,
          dateExamen: new Date().toISOString(),
          soignantNom: `${currentUser.prenom} ${currentUser.nom}`,
          soignantRole: currentUser.roleTitre || 'Agent de Santé',
          seinConcerne,
          quadrant,
          nodulePalpable: nodule,
          consistanceNodule,
          tailleNoduleCm: tailleNoduleCm > 0 ? tailleNoduleCm : undefined,
          peauOrange,
          retractionCutanee,
          ecoulementMamelonnaire,
          typeEcoulement,
          adenopathieAxillaire,
          antecedentsFamiliauxCancer: antecedentsFamiliaux,
          douleurMammaire,
          modificationTailleForme,
          pointsObtenus: evalResult.pointsObtenus,
          observationsVocales: observations,
          scoreCalcule: evalResult.scoreIA,
          niveauSuspicion:
            evalResult.niveauRisque === 'ELEVE'
              ? 'eleve'
              : evalResult.niveauRisque === 'MODERE'
              ? 'modere'
              : 'faible',
          conduiteATenir: evalResult.conduiteATenir,
          besoinMammographieUrgence: evalResult.niveauRisque === 'ELEVE',
        };
      }

      const isSuspect =
        evalResult.niveauRisque === 'ELEVE' ||
        nodule ||
        peauOrange ||
        adenopathieAxillaire ||
        (ecoulementMamelonnaire && typeEcoulement === 'sanglant');

      const computedStatutDepistage: StatutDepistage = isSuspect ? 'À orienter' : 'Effectué';

      const targetCamp = assignedCampagne || allCampagnes.find((c) => c.id === initialData?.campagneId);

      const newPatient: Beneficiaire = {
        id: patientId,
        numeroDossier,
        campagneId: targetCamp?.id || initialData?.campagneId,
        campagneNom: targetCamp ? (targetCamp.nom || targetCamp.titre) : initialData?.campagneNom,
        nom: nom.trim().toUpperCase(),
        prenom: prenom.trim(),
        age: Number(age) || 35,
        telephone: telephone.trim(),
        languePreferee,
        canalPrefere: utiliseWhatsApp ? 'WHATSAPP' : 'SMS',
        commune,
        secteur,
        statutVulnerabilite,
        centreSuiviId,
        centreSuiviNom: selectedCentre ? selectedCentre.nom : currentUser.centreNom || 'Centre de Santé',
        dateSensibilisation: initialData?.dateSensibilisation || new Date().toISOString().split('T')[0],
        statutDepistage: computedStatutDepistage,
        agentContactNom: initialData?.agentContactNom || `${currentUser.prenom} ${currentUser.nom}`,
        derniereEvaluation: derniereEval || initialData?.derniereEvaluation,
        dernierTriage: dernierTriage || initialData?.dernierTriage,
        evaluations: derniereEval
          ? [derniereEval, ...(initialData?.evaluations || [])]
          : initialData?.evaluations || [],
        historiqueExamens: dernierTriage
          ? [dernierTriage, ...(initialData?.historiqueExamens || [])]
          : initialData?.historiqueExamens || [],
      };

      onSubmit(newPatient);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-patient-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="modal-content modal-large max-w-3xl">
        {/* En-tête du modal */}
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">
              BRAVE_HER BFK • DOSSIER PATIENTE
            </span>
            <h2 id="modal-patient-title" className="modal-title">
              {isEdit ? 'Modifier la Fiche Patiente' : 'Créer une Fiche Patiente'}
            </h2>
            <p className="text-xs text-[#536B70] mt-0.5">
              Enregistrement d'état civil, géolocalisation et examen de dépistage assisté par règles déterministes.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fermer le formulaire de création de patiente"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre d'onglets étapes (Wizard) */}
        <div className="modal-nav-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 'identity'}
            className={`modal-nav-tab ${activeStep === 'identity' ? 'active' : ''}`}
            onClick={() => setActiveStep('identity')}
          >
            <User className="w-4 h-4" />
            <span>1. Identité & Contact</span>
            {nom.trim() && prenom.trim() && (
              <span className="tab-badge completed text-[10px]">✓</span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 'location'}
            className={`modal-nav-tab ${activeStep === 'location' ? 'active' : ''}`}
            onClick={() => {
              if (validateStep1()) setActiveStep('location');
            }}
          >
            <MapPin className="w-4 h-4" />
            <span>2. Localisation & Centre</span>
            {commune.trim() && secteur.trim() && (
              <span className="tab-badge completed text-[10px]">✓</span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 'clinical'}
            className={`modal-nav-tab ${activeStep === 'clinical' ? 'active' : ''}`}
            onClick={() => {
              if (validateStep1() && validateStep2()) setActiveStep('clinical');
            }}
          >
            <Stethoscope className="w-4 h-4" />
            <span>3. Triage clinique par règles</span>
            {activerEvaluationInitiale && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  evalResult.niveauRisque === 'ELEVE'
                    ? 'bg-red-100 text-red-700'
                    : evalResult.niveauRisque === 'MODERE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                Score de triage : {evalResult.scoreIA}/100
              </span>
            )}
          </button>
        </div>

        {/* Corps du formulaire selon l'étape active */}
        <div className="modal-body max-h-[68vh] overflow-y-auto">
          {activeStep === 'identity' && (
            <PatientStepIdentity
              nom={nom}
              onNomChange={setNom}
              prenom={prenom}
              onPrenomChange={setPrenom}
              age={age}
              onAgeChange={setAge}
              telephone={telephone}
              onTelephoneChange={setTelephone}
              utiliseWhatsApp={utiliseWhatsApp}
              onUtiliseWhatsAppChange={setUtiliseWhatsApp}
              languePreferee={languePreferee}
              onLanguePrefereeChange={setLanguePreferee}
              errors={errors}
              onClearError={handleClearError}
              assignedCampagne={assignedCampagne}
            />
          )}

          {activeStep === 'location' && (
            <PatientStepLocation
              commune={commune}
              onCommuneChange={setCommune}
              secteur={secteur}
              onSecteurChange={setSecteur}
              centreSuiviId={centreSuiviId}
              onCentreSuiviIdChange={setCentreSuiviId}
              centres={centres}
              statutVulnerabilite={statutVulnerabilite}
              onStatutVulnerabiliteChange={setStatutVulnerabilite}
              errors={errors}
              onClearError={handleClearError}
            />
          )}

          {activeStep === 'clinical' && (
            <PatientStepClinical
              activerEvaluationInitiale={activerEvaluationInitiale}
              onActiverEvaluationInitialeChange={setActiverEvaluationInitiale}
              nodule={nodule}
              onNoduleChange={setNodule}
              consistanceNodule={consistanceNodule}
              onConsistanceNoduleChange={setConsistanceNodule}
              tailleNoduleCm={tailleNoduleCm}
              onTailleNoduleCmChange={setTailleNoduleCm}
              seinConcerne={seinConcerne}
              onSeinConcerneChange={setSeinConcerne}
              quadrant={quadrant}
              onQuadrantChange={setQuadrant}
              peauOrange={peauOrange}
              onPeauOrangeChange={setPeauOrange}
              retractionCutanee={retractionCutanee}
              onRetractionCutaneeChange={setRetractionCutanee}
              ecoulementMamelonnaire={ecoulementMamelonnaire}
              onEcoulementMamelonnaireChange={setEcoulementMamelonnaire}
              typeEcoulement={typeEcoulement}
              onTypeEcoulementChange={setTypeEcoulement}
              adenopathieAxillaire={adenopathieAxillaire}
              onAdenopathieAxillaireChange={setAdenopathieAxillaire}
              douleurMammaire={douleurMammaire}
              onDouleurMammaireChange={setDouleurMammaire}
              antecedentsFamiliaux={antecedentsFamiliaux}
              onAntecedentsFamiliauxChange={setAntecedentsFamiliaux}
              modificationTailleForme={modificationTailleForme}
              onModificationTailleFormeChange={setModificationTailleForme}
              observations={observations}
              onObservationsChange={setObservations}
              evalResult={evalResult}
              onApplyDetectedIndicators={handleApplyDetectedIndicators}
            />
          )}
        </div>

        {/* Pied de page avec actions et progression */}
        <PatientModalFooter
          activeStep={activeStep}
          onClose={onClose}
          onPrev={() => {
            if (activeStep === 'clinical') setActiveStep('location');
            else if (activeStep === 'location') setActiveStep('identity');
          }}
          onNextToLocation={handleNextToLocation}
          onNextToClinical={handleNextToClinical}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          canSaveWithoutClinical={true}
        />
      </div>
    </div>
  );
};
