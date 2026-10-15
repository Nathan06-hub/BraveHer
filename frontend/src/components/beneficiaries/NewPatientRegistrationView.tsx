import React, { useState, useMemo } from 'react';
import type {
  Beneficiaire,
  StatutVulnerabilite,
  StatutDepistage,
  ExamenCliniqueDetails,
  QuadrantSein,
} from '../../types/beneficiary';
import type { CurrentUserContext, LanguePatiente } from '../../types/campaign';
import type { Evaluation, AutresIndicateursEvaluation } from '../../types/evaluation';
import { calculerScoreEvaluation } from '../../types/evaluation';
import { DicteeVocale, type DetectedIndicators } from '../common/DicteeVocale';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  Building,
  Stethoscope,
  Sparkles,
  AlertTriangle,
  Activity,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface NewPatientRegistrationViewProps {
  currentUser: CurrentUserContext;
  onBack: () => void;
  onSubmit: (patient: Beneficiaire) => void;
}

export const NewPatientRegistrationView: React.FC<NewPatientRegistrationViewProps> = ({
  currentUser,
  onBack,
  onSubmit,
}) => {
  // 1. Identité
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [age, setAge] = useState<number>(40);
  const [telephone, setTelephone] = useState('+226 ');
  const [languePreferee, setLanguePreferee] = useState<LanguePatiente>('Mooré');
  const [commune, setCommune] = useState('Ouagadougou');
  const [secteur, setSecteur] = useState('Secteur 28');

  // 2. Vulnérabilité & Établissement
  const [statutVulnerabilite, setStatutVulnerabilite] = useState<StatutVulnerabilite>('Standard');
  const [statutDepistage, setStatutDepistage] = useState<StatutDepistage>('Effectué');

  // 3. Évaluation clinique initiale (Activable)
  const [activerEvaluationInitiale, setActiverEvaluationInitiale] = useState<boolean>(true);

  const [nodule, setNodule] = useState<boolean>(false);
  const [consistanceNodule, setConsistanceNodule] = useState<
    'dur_adherent' | 'ferme' | 'mobile_elastique' | 'aucun'
  >('ferme');
  const [tailleNoduleCm, setTailleNoduleCm] = useState<number>(1.5);
  const [seinConcerne, setSeinConcerne] = useState<'gauche' | 'droit' | 'bilateral' | 'aucun'>('droit');
  const [quadrant, setQuadrant] = useState<QuadrantSein>('supero_externe');

  const [peauOrange, setPeauOrange] = useState<boolean>(false);
  const [retractionCutanee, setRetractionCutanee] = useState<boolean>(false);
  const [ecoulementMamelonnaire, setEcoulementMamelonnaire] = useState<boolean>(false);
  const [typeEcoulement, setTypeEcoulement] = useState<'sanglant' | 'sereux' | 'purulent' | 'aucun'>('sanglant');
  const [adenopathieAxillaire, setAdenopathieAxillaire] = useState<boolean>(false);
  const [douleurMammaire, setDouleurMammaire] = useState<boolean>(false);
  const [antecedentsFamiliaux, setAntecedentsFamiliaux] = useState<boolean>(false);
  const [modificationTailleForme, setModificationTailleForme] = useState<boolean>(false);

  // 4. Dictée Vocale & Notes
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronisation avec la dictée vocale
  const handleDetectedIndicators = (detected: DetectedIndicators) => {
    if (detected.nodule !== undefined) setNodule(detected.nodule);
    if (detected.consistanceNodule) setConsistanceNodule(detected.consistanceNodule);
    if (detected.tailleNoduleCm) setTailleNoduleCm(detected.tailleNoduleCm);
    if (detected.peauOrange !== undefined) setPeauOrange(detected.peauOrange);
    if (detected.retractionCutanee !== undefined) setRetractionCutanee(detected.retractionCutanee);
    if (detected.ecoulementMamelonnaire !== undefined) setEcoulementMamelonnaire(detected.ecoulementMamelonnaire);
    if (detected.typeEcoulement) setTypeEcoulement(detected.typeEcoulement);
    if (detected.adenopathieAxillaire !== undefined) setAdenopathieAxillaire(detected.adenopathieAxillaire);
    if (detected.seinConcerne) setSeinConcerne(detected.seinConcerne);
    if (detected.quadrant) setQuadrant(detected.quadrant);
    if (detected.douleurMammaire !== undefined) setDouleurMammaire(detected.douleurMammaire);
    if (detected.antecedentsFamiliaux !== undefined) setAntecedentsFamiliaux(detected.antecedentsFamiliaux);
    if (detected.modificationTailleForme !== undefined) setModificationTailleForme(detected.modificationTailleForme);
  };

  // Calcul dynamique et réactif du Score IA
  const evalResult = useMemo(() => {
    const autres: AutresIndicateursEvaluation = {
      seinConcerne,
      quadrant,
      consistanceNodule: nodule ? consistanceNodule : 'aucun',
      tailleNoduleCm: nodule ? tailleNoduleCm : undefined,
      ecoulementMamelonnaire,
      typeEcoulement: ecoulementMamelonnaire ? typeEcoulement : 'aucun',
      retractionCutanee,
      adenopathieAxillaire,
      modificationTailleForme,
      agePatiente: Number(age) || 0,
      douleurMammaire,
      antecedentsFamiliaux,
      observationsVocales: observations.trim() || undefined,
    };

    return calculerScoreEvaluation(nodule, peauOrange, autres);
  }, [
    nodule,
    consistanceNodule,
    tailleNoduleCm,
    seinConcerne,
    quadrant,
    peauOrange,
    retractionCutanee,
    ecoulementMamelonnaire,
    typeEcoulement,
    adenopathieAxillaire,
    modificationTailleForme,
    age,
    douleurMammaire,
    antecedentsFamiliaux,
    observations,
  ]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nom.trim()) errs.nom = 'Le nom de famille est obligatoire.';
    if (!prenom.trim()) errs.prenom = 'Le prénom est obligatoire.';
    if (!telephone.trim() || telephone.length < 8) {
      errs.telephone = 'Le numéro de téléphone est requis pour le suivi et les SMS de rappel.';
    }
    if (!commune.trim()) errs.commune = 'La commune est obligatoire.';
    if (age < 15 || age > 105) errs.age = 'L’âge doit être valide (15 à 105 ans).';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `PAT-BF-2026-${randomSuffix}`;

    // Déclenchement Bon de Santé si risque élevé et vulnérabilité
    const bonSanteDeclenche =
      activerEvaluationInitiale &&
      evalResult.niveauRisque === 'ELEVE' &&
      (statutVulnerabilite === 'PDI' || statutVulnerabilite === 'Vulnerable');

    // Création de l'Évaluation officielle Mermaid si activée
    let evaluationOfficielle: Evaluation | undefined = undefined;
    let triageDetails: ExamenCliniqueDetails | undefined = undefined;

    if (activerEvaluationInitiale) {
      evaluationOfficielle = {
        id: `eval-${Date.now()}`,
        dateEvaluation: new Date().toISOString(),
        patienteNom: `${prenom.trim()} ${nom.trim().toUpperCase()}`,
        utilisateurId: currentUser.id,
        utilisateurNom: `${currentUser.prenom} ${currentUser.nom}`,
        nodule,
        peauOrange,
        autresIndicateurs: {
          seinConcerne,
          quadrant,
          consistanceNodule: nodule ? consistanceNodule : 'aucun',
          tailleNoduleCm: nodule ? Number(tailleNoduleCm) : undefined,
          ecoulementMamelonnaire,
          typeEcoulement: ecoulementMamelonnaire ? typeEcoulement : 'aucun',
          retractionCutanee,
          adenopathieAxillaire,
          modificationTailleForme,
          agePatiente: Number(age) || 0,
          douleurMammaire,
          antecedentsFamiliaux,
          observationsVocales: observations.trim() || undefined,
        },
        scoreIA: evalResult.scoreIA,
        niveauRisque: evalResult.niveauRisque,
        conduiteATenir: evalResult.conduiteATenir,
        bonSanteDeclenche,
        dicteeVocaleUtilisee: Boolean(observations.trim()),
        pointsObtenus: evalResult.pointsObtenus,
        pointsMax: evalResult.pointsMax,
      };

      triageDetails = {
        id: `exam-${Date.now()}`,
        dateExamen: new Date().toISOString().split('T')[0],
        soignantNom: `${currentUser.prenom} ${currentUser.nom}`,
        soignantRole: currentUser.roleTitre || 'Sage-femme',
        seinConcerne: (seinConcerne === 'aucun' ? 'droit' : seinConcerne) as any,
        quadrant,
        nodulePalpable: nodule,
        consistanceNodule: nodule ? consistanceNodule : 'aucun',
        tailleNoduleCm: nodule ? Number(tailleNoduleCm) : undefined,
        ecoulementMamelonnaire,
        typeEcoulement: ecoulementMamelonnaire ? typeEcoulement : 'aucun',
        retractionCutanee,
        peauOrange,
        adenopathieAxillaire,
        modificationTailleForme,
        pointsObtenus: evalResult.pointsObtenus,
        antecedentsFamiliauxCancer: antecedentsFamiliaux,
        douleurMammaire,
        observationsVocales: observations.trim() || undefined,
        scoreCalcule: evalResult.scoreIA,
        niveauSuspicion: evalResult.niveauRisque.toLowerCase() as any,
        conduiteATenir: evalResult.conduiteATenir,
        besoinMammographieUrgence: evalResult.niveauRisque === 'ELEVE',
      };
    }

    const newPat: Beneficiaire = {
      id: `pat-${Date.now()}`,
      numeroDossier: code,
      nom: nom.trim().toUpperCase(),
      prenom: prenom.trim(),
      age: Number(age),
      telephone: telephone.trim(),
      languePreferee,
      commune: commune.trim(),
      secteur: secteur.trim(),
      statutVulnerabilite,
      centreSuiviId: currentUser.centreId || 'centre-1',
      centreSuiviNom: currentUser.centreNom || 'CSPS Kossodo — Ouagadougou',
      dateSensibilisation: new Date().toISOString().split('T')[0],
      statutDepistage: activerEvaluationInitiale
        ? evalResult.niveauRisque === 'ELEVE'
          ? 'À orienter'
          : 'Effectué'
        : statutDepistage,
      agentContactNom: `${currentUser.prenom} ${currentUser.nom}`,
      dernierTriage: triageDetails,
      derniereEvaluation: evaluationOfficielle,
      evaluations: evaluationOfficielle ? [evaluationOfficielle] : [],
      historiqueExamens: triageDetails ? [triageDetails] : [],
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(newPat);
    }, 300);
  };

  return (
    <div className="inpage-view-container">
      {/* En-tête In-Page */}
      <div className="inpage-header">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inpage-back-btn"
            onClick={onBack}
            aria-label="Retour aux bénéficiaires"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux bénéficiaires</span>
          </button>
          <div>
            <span className="modal-eyebrow">ENRÔLEMENT CSPS & TRIAGE IA</span>
            <h2 className="text-xl font-bold text-[#17343B] font-serif">
              Enregistrer une Nouvelle Patiente avec Évaluation Clinique
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 : État civil */}
        <div className="inpage-card">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#D6E8E8]">
            <User className="w-4 h-4 text-[#007599]" />
            <h3 className="text-sm font-bold text-[#17343B]">
              1. Identité & État Civil
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#17343B] mb-1">
                Nom de famille <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: OUÉDRAOGO"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
              />
              {errors.nom && (
                <span className="text-rose-600 font-bold mt-1 block">{errors.nom}</span>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#17343B] mb-1">
                Prénom(s) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Alimata"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
              />
              {errors.prenom && (
                <span className="text-rose-600 font-bold mt-1 block">{errors.prenom}</span>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#17343B] mb-1">
                Âge de la femme (ans) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min={15}
                max={100}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
              />
              {errors.age && (
                <span className="text-rose-600 font-bold mt-1 block">{errors.age}</span>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#17343B] mb-1">
                Numéro de téléphone <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="+226 70 XX XX XX"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                />
              </div>
              {errors.telephone && (
                <span className="text-rose-600 font-bold mt-1 block">{errors.telephone}</span>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#17343B] mb-1">
                Langue locale d'échange
              </label>
              <select
                value={languePreferee}
                onChange={(e) => setLanguePreferee(e.target.value as LanguePatiente)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white"
              >
                <option value="Mooré">Mooré</option>
                <option value="Dioula">Dioula</option>
                <option value="Fulfuldé">Fulfuldé</option>
                <option value="Français">Français</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#17343B] mb-1">
                Commune de résidence <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Ex: Ouagadougou, Bobo, Kaya..."
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                />
              </div>
              {errors.commune && (
                <span className="text-rose-600 font-bold mt-1 block">{errors.commune}</span>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-[#17343B] mb-1">
                Secteur, quartier ou village
              </label>
              <input
                type="text"
                placeholder="Ex: Secteur 14, Zone non lotie, Quartier Tampouy..."
                value={secteur}
                onChange={(e) => setSecteur(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 2 : Vulnérabilité & Établissement de suivi */}
        <div className="inpage-card">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#D6E8E8]">
            <HeartHandshake className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-[#17343B]">
              2. Vulnérabilité & Établissement Sanitaire
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#17343B] mb-2">
                Statut de vulnérabilité économique & sociale
              </label>
              <div className="space-y-2">
                <label className="p-3 rounded-lg border border-[#CBD5E1] hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="vuln"
                    checked={statutVulnerabilite === 'PDI'}
                    onChange={() => setStatutVulnerabilite('PDI')}
                    className="mt-0.5"
                  />
                  <div>
                    <strong className="block text-purple-900">
                      PDI — Personne Déplacée Interne
                    </strong>
                    <span className="text-[11px] text-[#64748B]">
                      Femme déplacée ayant fui l'insécurité. Éligible d'office au Bon de Santé Orange Money en cas d'anomalie.
                    </span>
                  </div>
                </label>

                <label className="p-3 rounded-lg border border-[#CBD5E1] hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="vuln"
                    checked={statutVulnerabilite === 'Vulnerable'}
                    onChange={() => setStatutVulnerabilite('Vulnerable')}
                    className="mt-0.5"
                  />
                  <div>
                    <strong className="block text-rose-900">
                      Femme en situation de grande précarité
                    </strong>
                    <span className="text-[11px] text-[#64748B]">
                      Revenus insuffisants pour honorer les frais de mammographie (25 000 FCFA).
                    </span>
                  </div>
                </label>

                <label className="p-3 rounded-lg border border-[#CBD5E1] hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="vuln"
                    checked={statutVulnerabilite === 'Standard'}
                    onChange={() => setStatutVulnerabilite('Standard')}
                    className="mt-0.5"
                  />
                  <div>
                    <strong className="block text-[#17343B]">
                      Résidente standard
                    </strong>
                    <span className="text-[11px] text-[#64748B]">
                      Dépistage de proximité sans vulnérabilité financière déclarée.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-[#17343B] mb-1">
                  Centre de santé de suivi (CSPS / CMA)
                </label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#007599]" />
                  <div>
                    <strong className="text-xs text-[#17343B] block">
                      {currentUser.centreNom || 'CSPS Kossodo — Ouagadougou'}
                    </strong>
                    <span className="text-[11px] text-[#64748B]">
                      Agent référent : {currentUser.prenom} {currentUser.nom}
                    </span>
                  </div>
                </div>
              </div>

              {!activerEvaluationInitiale && (
                <div>
                  <label className="block font-bold text-[#17343B] mb-1">
                    Statut initial du dépistage
                  </label>
                  <select
                    value={statutDepistage}
                    onChange={(e) => setStatutDepistage(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white"
                  >
                    <option value="Planifié">Rendez-vous planifié</option>
                    <option value="Effectué">Effectué précédemment</option>
                    <option value="À orienter">À orienter</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3 : Évaluation clinique initiale de dépistage (Entité Evaluation Mermaid) */}
        <div className="inpage-card border-2 border-[#B2DDDD]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#D6E8E8]">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#007599]" />
              <div>
                <h3 className="text-sm font-bold text-[#17343B] m-0">
                  3. Évaluation Clinique Initiale de Dépistage & Calcul Score IA
                </h3>
                <span className="text-[11px] text-[#536B70]">
                  Conforme à l'entité Evaluation du diagramme de classes (Palpation, scoreIA, conduiteATenir)
                </span>
              </div>
            </div>

            {/* Switch Réaliser l'évaluation */}
            <button
              type="button"
              onClick={() => setActiverEvaluationInitiale(!activerEvaluationInitiale)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activerEvaluationInitiale
                  ? 'bg-[#007599] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {activerEvaluationInitiale ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-300" />
                  <span>Évaluation clinique active (Recommandé)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>Différer l'évaluation clinique</span>
                </>
              )}
            </button>
          </div>

          {activerEvaluationInitiale ? (
            <div className="space-y-4">
              {/* Grille des critères */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* 1. Nodule */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    nodule ? 'bg-rose-50/70 border-rose-300 shadow-sm' : 'bg-white border-[#D6E8E8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#17343B]">
                      Nodule palpable ?
                    </span>
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setNodule(false)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          !nodule ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Non
                      </button>
                      <button
                        type="button"
                        onClick={() => setNodule(true)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          nodule ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Oui
                      </button>
                    </div>
                  </div>

                  {nodule && (
                    <div className="space-y-2 pt-2 border-t border-rose-200/60 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-rose-950 mb-0.5">
                          Consistance du nodule
                        </label>
                        <select
                          value={consistanceNodule}
                          onChange={(e) => setConsistanceNodule(e.target.value as any)}
                          className="w-full text-xs p-1.5 rounded border border-rose-300 bg-white"
                        >
                          <option value="dur_adherent">Dur & adhérent (Fortement suspect +35 pts)</option>
                          <option value="ferme">Ferme (+18 pts)</option>
                          <option value="mobile_elastique">Mobile / Élastique (+8 pts)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-rose-950 mb-0.5">
                            Taille (cm)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="10"
                            value={tailleNoduleCm}
                            onChange={(e) => setTailleNoduleCm(Number(e.target.value))}
                            className="w-full text-xs p-1.5 rounded border border-rose-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-rose-950 mb-0.5">
                            Sein
                          </label>
                          <select
                            value={seinConcerne}
                            onChange={(e) => setSeinConcerne(e.target.value as any)}
                            className="w-full text-xs p-1.5 rounded border border-rose-300 bg-white"
                          >
                            <option value="droit">Droit</option>
                            <option value="gauche">Gauche</option>
                            <option value="bilateral">Bilatéral</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-rose-950 mb-0.5">
                          Quadrant mammaire
                        </label>
                        <select
                          value={quadrant}
                          onChange={(e) => setQuadrant(e.target.value as any)}
                          className="w-full text-xs p-1.5 rounded border border-rose-300 bg-white"
                        >
                          <option value="supero_externe">Supéro-externe (QSE)</option>
                          <option value="supero_interne">Supéro-interne (QSI)</option>
                          <option value="infero_externe">Inféro-externe (QIE)</option>
                          <option value="infero_interne">Inféro-interne (QII)</option>
                          <option value="retro_areolaire">Rétro-aréolaire</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Peau d'orange & Rétraction */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    peauOrange || retractionCutanee
                      ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                      : 'bg-white border-[#D6E8E8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#17343B]">
                      Peau d'orange ?
                    </span>
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPeauOrange(false)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          !peauOrange ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Non
                      </button>
                      <button
                        type="button"
                        onClick={() => setPeauOrange(true)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          peauOrange ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Oui
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#17343B]">
                      <input
                        type="checkbox"
                        checked={retractionCutanee}
                        onChange={(e) => setRetractionCutanee(e.target.checked)}
                        className="rounded text-[#007599]"
                      />
                      <span>Rétraction cutanée ou mamelon (+20 pts)</span>
                    </label>
                  </div>
                </div>

                {/* 3. Écoulement Mamelonnaire */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    ecoulementMamelonnaire
                      ? 'bg-rose-50/70 border-rose-300 shadow-sm'
                      : 'bg-white border-[#D6E8E8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#17343B]">
                      Écoulement mamelon ?
                    </span>
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setEcoulementMamelonnaire(false)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          !ecoulementMamelonnaire ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Non
                      </button>
                      <button
                        type="button"
                        onClick={() => setEcoulementMamelonnaire(true)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          ecoulementMamelonnaire ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Oui
                      </button>
                    </div>
                  </div>

                  {ecoulementMamelonnaire && (
                    <div className="pt-2 border-t border-rose-200/60 text-xs">
                      <label className="block text-[11px] font-semibold text-rose-950 mb-0.5">
                        Type d'écoulement
                      </label>
                      <select
                        value={typeEcoulement}
                        onChange={(e) => setTypeEcoulement(e.target.value as any)}
                        className="w-full text-xs p-1.5 rounded border border-rose-300 bg-white"
                      >
                        <option value="sanglant">Sanglant / Hémorragique (+25 pts)</option>
                        <option value="sereux">Séreux (+15 pts)</option>
                        <option value="purulent">Purulent (+10 pts)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* 4. Ganglion Axillaire */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    adenopathieAxillaire
                      ? 'bg-rose-50/70 border-rose-300 shadow-sm'
                      : 'bg-white border-[#D6E8E8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17343B]">
                      Adénopathie axillaire ?
                    </span>
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAdenopathieAxillaire(false)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          !adenopathieAxillaire ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Non
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdenopathieAxillaire(true)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          adenopathieAxillaire ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Oui
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#536B70] mt-1.5 mb-0">
                    Ganglion palpable aisselle homolatérale (+15 pts).
                  </p>
                </div>

                {/* 5. Modification de taille/forme (Asymétrie récente) — Grille officielle +2 pts */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    modificationTailleForme
                      ? 'bg-rose-50/70 border-rose-300 shadow-sm'
                      : 'bg-white border-[#D6E8E8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#17343B] block">
                        Modification de taille ou forme ?
                      </span>
                      <span className="text-[11px] text-[#536B70]">
                        Asymétrie récente (+2 pts)
                      </span>
                    </div>
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setModificationTailleForme(false)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          !modificationTailleForme ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Non
                      </button>
                      <button
                        type="button"
                        onClick={() => setModificationTailleForme(true)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          modificationTailleForme ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Oui
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6. Antécédents Familiaux — Grille officielle +1 pt */}
                <div className="p-3 rounded-xl border border-[#D6E8E8] bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17343B]">
                      Antécédents familiaux ?
                    </span>
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAntecedentsFamiliaux(false)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          !antecedentsFamiliaux ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Non
                      </button>
                      <button
                        type="button"
                        onClick={() => setAntecedentsFamiliaux(true)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          antecedentsFamiliaux ? 'bg-[#007599] text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Oui
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#536B70] mt-1.5 mb-0">
                    Facteur de prédisposition génétique (+1 pt).
                  </p>
                </div>

                {/* 7. Douleur persistante — Grille officielle +1 pt */}
                <div className="p-3 rounded-xl border border-[#D6E8E8] bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17343B]">
                      Douleur mammaire persistante ?
                    </span>
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setDouleurMammaire(false)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          !douleurMammaire ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Non
                      </button>
                      <button
                        type="button"
                        onClick={() => setDouleurMammaire(true)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-colors ${
                          douleurMammaire ? 'bg-[#007599] text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Oui
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#536B70] mt-1.5 mb-0">
                    Mastodynie non cyclique (+1 pt).
                  </p>
                </div>

                {/* 8. Indicateur automatique d'âge >= 40 ans (+1 pt) */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#17343B] block">
                      Critère statistique : Âge de la patiente ({age || 0} ans)
                    </span>
                    <span className="text-[11px] text-[#536B70]">
                      Pic d’incidence statistique (+1 pt si $\ge$ 40 ans)
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      age >= 40
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {age >= 40 ? '✓ Appliqué (+1 pt)' : 'Non appliqué (< 40 ans)'}
                  </span>
                </div>
              </div>

              {/* Dictée Vocale */}
              <DicteeVocale
                observations={observations}
                onObservationsChange={setObservations}
                onDetectedIndicators={handleDetectedIndicators}
                label="Dictée Vocale Speech-to-Text de l'examen clinique"
                placeholder="Dictez votre compte-rendu : ex. Palpation d'une masse dure au niveau du quadrant supéro-externe droit avec peau d'orange..."
              />

              {/* Résultat Score IA */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  evalResult.niveauRisque === 'ELEVE'
                    ? 'bg-rose-50 border-rose-300'
                    : evalResult.niveauRisque === 'MODERE'
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-emerald-50 border-emerald-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className={`w-5 h-5 ${
                        evalResult.niveauRisque === 'ELEVE'
                          ? 'text-rose-600'
                          : evalResult.niveauRisque === 'MODERE'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#17343B] m-0">
                        Score IA Clinique : {evalResult.scoreIA}% ({evalResult.pointsObtenus} / {evalResult.pointsMax} pts)
                      </h4>
                      <span className="text-[11px] text-[#536B70]">
                        Grille Médicale Officielle (15 pts) · calculerScore() Mermaid
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {evalResult.niveauRisque === 'ELEVE' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">
                        <AlertTriangle size={13} />
                        <span>RISQUE ÉLEVÉ</span>
                      </span>
                    )}
                    {evalResult.niveauRisque === 'MODERE' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
                        <Activity size={13} />
                        <span>RISQUE MODÉRÉ</span>
                      </span>
                    )}
                    {evalResult.niveauRisque === 'FAIBLE' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                        <CheckCircle2 size={13} />
                        <span>RISQUE FAIBLE</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden mb-3 border border-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      evalResult.scoreIA >= 70
                        ? 'bg-rose-600'
                        : evalResult.scoreIA >= 35
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${evalResult.scoreIA}%` }}
                  />
                </div>

                <div className="bg-white/90 p-3 rounded-lg border border-slate-200/80 text-xs mb-3">
                  <strong className="block text-[#17343B] font-bold mb-1">
                    Conduite à tenir recommandée :
                  </strong>
                  <p className="text-[#334155] leading-relaxed m-0">
                    {evalResult.conduiteATenir}
                  </p>
                </div>

                {/* Détail des 8 critères de la grille médicale officielle (WhatsApp Image) */}
                <div className="bg-white/90 p-3 rounded-lg border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#17343B]">
                      Grille médicale de référence (Barème officiel : 15 points)
                    </span>
                    <span className="font-bold text-[#007599] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Total : {evalResult.pointsObtenus} / 15 pts
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {evalResult.detailsBareme.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-md border flex items-center justify-between transition-colors ${
                          item.detecte
                            ? 'bg-rose-50/80 border-rose-300 text-rose-950 font-medium'
                            : 'bg-slate-50/60 border-slate-200/70 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <span className={`text-xs ${item.detecte ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                            {item.detecte ? '✓' : '○'}
                          </span>
                          <div className="truncate">
                            <span className="block truncate text-[11px] leading-tight">
                              {item.symptome}
                            </span>
                            <span className="block text-[10px] text-slate-400 truncate leading-tight">
                              {item.justification}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                            item.detecte
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          +{item.poids}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {evalResult.niveauRisque === 'ELEVE' && (statutVulnerabilite === 'PDI' || statutVulnerabilite === 'Vulnerable') && (
                  <div className="mt-3 p-3 rounded-lg bg-white border border-rose-200 flex items-start gap-2.5">
                    <HeartHandshake className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-rose-900 block font-bold">
                        Bon de Santé Immédiat Déclenché (Solidarité Orange Money 25 000 FCFA)
                      </strong>
                      <p className="text-slate-600 mt-0.5 mb-0">
                        Cette patiente vulnérable sera directement orientée pour l'émission d'un Bon de Santé prioritaire afin de réaliser sa mammographie d'urgence sans avance de frais.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-[#536B70]">
              L'évaluation clinique initiale sera reportée. Le statut de dépistage est fixé à <b>Planifié</b>.
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-between pt-3 border-t border-[#D6E8E8]">
          <button
            type="button"
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
            onClick={onBack}
          >
            Annuler et retourner
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-create-campaign text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Enregistrement...'
                : activerEvaluationInitiale
                ? `Enregistrer avec Évaluation (Score ${evalResult.scoreIA}%)`
                : 'Enregistrer la patiente'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
