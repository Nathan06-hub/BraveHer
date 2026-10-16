import React, { useState, useMemo } from 'react';
import type { Campagne, CurrentUserContext, LanguePatiente, PersonneSensibilisee } from '../../types/campaign';
import type { Evaluation, AutresIndicateursEvaluation } from '../../types/evaluation';
import { calculerScoreEvaluation } from '../../types/evaluation';
import { DicteeVocale, type DetectedIndicators } from '../common/DicteeVocale';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Stethoscope,
  AlertTriangle,
  Sparkles,
  Activity,
  HeartHandshake,
} from 'lucide-react';

interface AgentPatientCreationFormProps {
  campagne: Campagne;
  currentUser: CurrentUserContext;
  onBack: () => void;
  onSubmit: (data: Omit<PersonneSensibilisee, 'id'>) => void;
}

export const AgentPatientCreationForm: React.FC<AgentPatientCreationFormProps> = ({
  campagne,
  currentUser,
  onBack,
  onSubmit,
}) => {
  // 1. Identité
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [age, setAge] = useState<number>(36);
  const [telephone, setTelephone] = useState('+226 ');
  const [languePreferee, setLanguePreferee] = useState<LanguePatiente>('Mooré');

  // 2. Localisation & Vulnérabilité
  const [secteur, setSecteur] = useState(campagne.secteurs[0] || 'Secteur 1');
  const [statutVulnerabilite, setStatutVulnerabilite] = useState<
    'Standard' | 'Modérée' | 'Élevée'
  >('Standard');

  // 3. Indicateurs cliniques de l'Évaluation (Conforme au Diagramme Mermaid)
  const [statutDepistage, setStatutDepistage] = useState<
    'Effectué' | 'À orienter' | 'Planifié' | 'Refusé'
  >('Effectué');

  const [nodule, setNodule] = useState<boolean>(false);
  const [consistanceNodule, setConsistanceNodule] = useState<
    'dur_adherent' | 'ferme' | 'mobile_elastique' | 'aucun'
  >('ferme');
  const [tailleNoduleCm, setTailleNoduleCm] = useState<number>(1.5);
  const [seinConcerne, setSeinConcerne] = useState<'gauche' | 'droit' | 'bilateral' | 'aucun'>('droit');
  const [quadrant, setQuadrant] = useState<
    'supero_externe' | 'supero_interne' | 'infero_externe' | 'infero_interne' | 'retro_areolaire' | 'aucun'
  >('supero_externe');

  const [peauOrange, setPeauOrange] = useState<boolean>(false);
  const [retractionCutanee, setRetractionCutanee] = useState<boolean>(false);
  const [ecoulementMamelonnaire, setEcoulementMamelonnaire] = useState<boolean>(false);
  const [typeEcoulement, setTypeEcoulement] = useState<'sanglant' | 'sereux' | 'purulent' | 'aucun'>('sanglant');
  const [adenopathieAxillaire, setAdenopathieAxillaire] = useState<boolean>(false);
  const [douleurMammaire, setDouleurMammaire] = useState<boolean>(false);
  const [antecedentsFamiliaux, setAntecedentsFamiliaux] = useState<boolean>(false);
  const [modificationTailleForme, setModificationTailleForme] = useState<boolean>(false);

  // 4. Observations & Dictée vocale
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronisation des indicateurs extraits par la dictée vocale
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
  const evaluationResult = useMemo(() => {
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
    if (!telephone.trim() || telephone.trim() === '+226') {
      errs.telephone = 'Le numéro de téléphone est requis pour le suivi et les rappels SMS.';
    }
    if (age < 15 || age > 100) {
      errs.age = 'L’âge doit être compris entre 15 et 100 ans.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Détermination de l'éligibilité au Bon de Santé (Fonds Solidarité Orange Money)
    const bonSanteDeclenche =
      evaluationResult.niveauRisque === 'ELEVE' &&
      (statutVulnerabilite === 'Modérée' || statutVulnerabilite === 'Élevée');

    // Création de l'entité Evaluation officielle Mermaid
    const nouvelleEvaluation: Evaluation = {
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
      scoreIA: evaluationResult.scoreIA,
      niveauRisque: evaluationResult.niveauRisque,
      conduiteATenir: evaluationResult.conduiteATenir,
      bonSanteDeclenche,
      dicteeVocaleUtilisee: Boolean(observations.trim()),
      pointsObtenus: evaluationResult.pointsObtenus,
      pointsMax: evaluationResult.pointsMax,
    };

    // Préparation des observations
    let observationComplete = observations.trim();
    if (evaluationResult.niveauRisque === 'ELEVE') {
      observationComplete = `[URGENCE IA : Risque élevé ${evaluationResult.scoreIA}% - ${evaluationResult.conduiteATenir}] ${observationComplete}`;
    } else if (evaluationResult.niveauRisque === 'MODERE') {
      observationComplete = `[VIGILANCE IA : Risque modéré ${evaluationResult.scoreIA}%] ${observationComplete}`;
    }

    if (bonSanteDeclenche) {
      observationComplete += ` — Bon de Santé prioritaire recommandé (Patiente vulnérable éligible au Fonds Orange Money).`;
    }

    const payload: Omit<PersonneSensibilisee, 'id'> = {
      campagneId: campagne.id,
      nom: nom.trim().toUpperCase(),
      prenom: prenom.trim(),
      age: Number(age),
      telephone: telephone.trim(),
      languePreferee,
      commune: campagne.commune,
      secteur,
      dateSensibilisation: new Date().toISOString().split('T')[0],
      statutDepistage:
        evaluationResult.niveauRisque === 'ELEVE' ? 'À orienter' : statutDepistage,
      agentContactNom: `${currentUser.prenom} ${currentUser.nom} (${currentUser.roleTitre.split('/')[0].trim()})`,
      observations: observationComplete || undefined,
      derniereEvaluation: nouvelleEvaluation,
      evaluations: [nouvelleEvaluation],
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(payload);
    }, 250);
  };

  return (
    <section className="agent-patient-form-view">
      {/* Barre de retour et contexte */}
      <div className="agent-form-nav-bar">
        <button
          type="button"
          className="agent-back-btn"
          onClick={onBack}
          aria-label="Retour à ma campagne"
        >
          <ArrowLeft size={14} />
          <span>Retour à ma campagne</span>
        </button>

        <span className="agent-campaign-context-badge">
          <span>Mission active : {campagne.nom}</span>
        </span>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#17343B] font-serif m-0">
          Enrôlement Patiente & Évaluation Clinique par IA
        </h2>
        <p className="text-xs text-[#536B70] mt-1">
          Saisie terrain assistée par IA avec dictée vocale et calcul instantané du score de risque par{' '}
          <b>
            {currentUser.prenom} {currentUser.nom}
          </b>{' '}
          au <b>{campagne.centreNom}</b>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="agent-form-grid-sections">
          {/* Bloc 1 : Identité & Contact */}
          <div className="agent-form-card-box">
            <h3 className="agent-form-card-title">
              <User size={16} className="text-[#007599]" />
              <span>1. Identité & Coordonnées</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="agent-input-group">
                <label htmlFor="patient-nom">
                  Nom de famille <span className="text-[#C62828]">*</span>
                </label>
                <input
                  id="patient-nom"
                  type="text"
                  placeholder="Ex : KABORÉ"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className={errors.nom ? 'border-red-500' : ''}
                />
                {errors.nom && <span className="text-[11px] text-red-600 font-semibold">{errors.nom}</span>}
              </div>

              <div className="agent-input-group">
                <label htmlFor="patient-prenom">
                  Prénom(s) <span className="text-[#C62828]">*</span>
                </label>
                <input
                  id="patient-prenom"
                  type="text"
                  placeholder="Ex : Rasmata"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className={errors.prenom ? 'border-red-500' : ''}
                />
                {errors.prenom && <span className="text-[11px] text-red-600 font-semibold">{errors.prenom}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="agent-input-group">
                <label htmlFor="patient-age">
                  Âge (années) <span className="text-[#C62828]">*</span>
                </label>
                <input
                  id="patient-age"
                  type="number"
                  min={15}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
                {errors.age && <span className="text-[11px] text-red-600 font-semibold">{errors.age}</span>}
              </div>

              <div className="agent-input-group">
                <label htmlFor="patient-langue">Langue locale préférée</label>
                <select
                  id="patient-langue"
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
            </div>

            <div className="agent-input-group">
              <label htmlFor="patient-tel">
                Numéro de téléphone (+226) <span className="text-[#C62828]">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#71888C]" />
                <input
                  id="patient-tel"
                  type="tel"
                  placeholder="+226 70 12 34 56"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className={errors.telephone ? 'border-red-500' : ''}
                />
              </div>
              {errors.telephone && (
                <span className="text-[11px] text-red-600 font-semibold">{errors.telephone}</span>
              )}
            </div>
          </div>

          {/* Bloc 2 : Localisation & Vulnérabilité */}
          <div className="agent-form-card-box">
            <h3 className="agent-form-card-title">
              <MapPin size={16} className="text-[#007599]" />
              <span>2. Localisation & Situation socio-économique</span>
            </h3>

            <div className="agent-input-group">
              <label htmlFor="patient-commune">Commune d'intervention</label>
              <input
                id="patient-commune"
                type="text"
                value={campagne.commune}
                disabled
                className="bg-[#EDF5F4] text-[#4A6468] cursor-not-allowed font-medium"
              />
              <span className="text-[10px] text-[#71888C] mt-0.5 block">
                Rattachée automatiquement au {campagne.centreNom}
              </span>
            </div>

            <div className="agent-input-group">
              <label htmlFor="patient-secteur">Secteur / Quartier de résidence</label>
              <select
                id="patient-secteur"
                value={secteur}
                onChange={(e) => setSecteur(e.target.value)}
              >
                {campagne.secteurs.map((sec, idx) => (
                  <option key={idx} value={sec}>
                    {sec} (Zone de la campagne)
                  </option>
                ))}
                <option value="Autre secteur">Autre secteur périphérique</option>
              </select>
            </div>

            <div className="agent-input-group">
              <label htmlFor="patient-vulnerabilite">Évaluation de vulnérabilité économique</label>
              <select
                id="patient-vulnerabilite"
                value={statutVulnerabilite}
                onChange={(e) =>
                  setStatutVulnerabilite(e.target.value as 'Standard' | 'Modérée' | 'Élevée')
                }
              >
                <option value="Standard">Standard — Prise en charge autonome possible</option>
                <option value="Modérée">Modérée — Difficultés financières ponctuelles</option>
                <option value="Élevée">Élevée — Prioritaire Fonds Solidarité Orange Money</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bloc 3 : Examen clinique & Signes de l'Évaluation */}
        <div className="agent-form-card-box border border-[#B2DDDD] bg-[#FAFCFD]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D6E8E8]">
            <h3 className="agent-form-card-title m-0">
              <Stethoscope size={18} className="text-[#007599]" />
              <span>3. Évaluation Clinique de Dépistage (Palpation & Signes)</span>
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#536B70]">Statut séance :</span>
              <select
                value={statutDepistage}
                onChange={(e) =>
                  setStatutDepistage(
                    e.target.value as 'Effectué' | 'À orienter' | 'Planifié' | 'Refusé'
                  )
                }
                className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#17343B]"
              >
                <option value="Effectué">Effectué (Palpation réalisée)</option>
                <option value="À orienter">À orienter vers CHU / Imagerie</option>
                <option value="Planifié">Planifié pour plus tard</option>
                <option value="Refusé">Refusé par la patiente</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {/* Grille des critères cliniques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* 1. Nodule Palpable */}
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
                        <option value="dur_adherent">Dur & adhérent (Fortement suspect)</option>
                        <option value="ferme">Ferme / Imprécis</option>
                        <option value="mobile_elastique">Mobile / Élastique (allure bénigne)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-rose-950 mb-0.5">
                          Taille estimée (cm)
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
                          Sein concerné
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
                    <span>Rétraction cutanée ou mamelonnaire</span>
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
                      Aspect de l'écoulement
                    </label>
                    <select
                      value={typeEcoulement}
                      onChange={(e) => setTypeEcoulement(e.target.value as any)}
                      className="w-full text-xs p-1.5 rounded border border-rose-300 bg-white"
                    >
                      <option value="sanglant">Sanglant / Hémorragique (+25 pts)</option>
                      <option value="sereux">Séreux / Liquide citrin (+15 pts)</option>
                      <option value="purulent">Purulent (+10 pts)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 4. Adénopathie axillaire */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  adenopathieAxillaire
                    ? 'bg-rose-50/70 border-rose-300 shadow-sm'
                    : 'bg-white border-[#D6E8E8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17343B]">
                    Ganglion axillaire palpable ?
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
                  Adénopathie unilatérale homolatérale suspecte.
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
                    Antécédents familiaux de cancer ?
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
                  Facteur génétique (+1 pt) : Mère, sœur ou tante.
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

            {/* Dictée Vocale Speech-to-Text */}
            <DicteeVocale
              observations={observations}
              onObservationsChange={setObservations}
              onDetectedIndicators={handleDetectedIndicators}
              label="Dictée Vocale Speech-to-Text (Pré-remplissage IA)"
              placeholder="Dictez la description de la palpation : ex. Nodule dur sein droit de 2cm, rétraction aréolaire, ganglion axillaire palpable..."
            />

            {/* Panneau Dynamique d'Évaluation du Risque IA & Conduite à Tenir */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                evaluationResult.niveauRisque === 'ELEVE'
                  ? 'bg-rose-50 border-rose-300'
                  : evaluationResult.niveauRisque === 'MODERE'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    className={`w-5 h-5 ${
                      evaluationResult.niveauRisque === 'ELEVE'
                        ? 'text-rose-600'
                        : evaluationResult.niveauRisque === 'MODERE'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#17343B] m-0">
                      Score IA : {evaluationResult.scoreIA}% ({evaluationResult.pointsObtenus} / {evaluationResult.pointsMax} pts)
                    </h4>
                    <span className="text-[11px] text-[#536B70]">
                      Grille Médicale Officielle (15 pts) · calculerScore() Mermaid
                    </span>
                  </div>
                </div>

                {/* Badge Risque */}
                <div className="flex items-center gap-2">
                  {evaluationResult.niveauRisque === 'ELEVE' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs animate-pulse">
                      <AlertTriangle size={13} />
                      <span>RISQUE ÉLEVÉ (Suspicion)</span>
                    </span>
                  )}
                  {evaluationResult.niveauRisque === 'MODERE' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                      <Activity size={13} />
                      <span>RISQUE MODÉRÉ (Vigilance)</span>
                    </span>
                  )}
                  {evaluationResult.niveauRisque === 'FAIBLE' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                      <CheckCircle2 size={13} />
                      <span>RISQUE FAIBLE (Rassurant)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Jauge visuelle */}
              <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden mb-3 border border-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    evaluationResult.scoreIA >= 70
                      ? 'bg-rose-600'
                      : evaluationResult.scoreIA >= 35
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${evaluationResult.scoreIA}%` }}
                />
              </div>

              {/* Conduite à tenir */}
              <div className="bg-white/90 p-3 rounded-lg border border-slate-200/80 text-xs mb-3">
                <strong className="block text-[#17343B] font-bold mb-1">
                  Conduite à tenir sénologique recommandée :
                </strong>
                <p className="text-[#334155] leading-relaxed m-0">
                  {evaluationResult.conduiteATenir}
                </p>
              </div>

              {/* Détail des 8 critères de la grille médicale officielle (WhatsApp Image) */}
              <div className="bg-white/90 p-3 rounded-lg border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#17343B]">
                    Grille médicale de référence (Barème officiel : 15 points)
                  </span>
                  <span className="font-bold text-[#007599] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Total : {evaluationResult.pointsObtenus} / 15 pts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {evaluationResult.detailsBareme.map((item, idx) => (
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

              {/* Alerte Bon de Santé Solidarité */}
              {evaluationResult.niveauRisque === 'ELEVE' && (
                <div className="mt-3 p-3 rounded-lg bg-white border border-rose-200 flex items-start gap-2.5">
                  <HeartHandshake className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-rose-900 block font-bold">
                      Déclenchement prioritaire du Bon de Santé (Fonds Orange Money)
                    </strong>
                    <p className="text-slate-600 mt-0.5 mb-0">
                      En cas de vulnérabilité confirmée ({statutVulnerabilite}), l'évaluation déclenchera automatiquement la proposition d'un Bon de Santé solidaire pour couvrir sans délai les examens d'urgence au CHU.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action en bas */}
        <div className="agent-form-actions-footer">
          <button
            type="button"
            className="agent-btn-cancel"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="agent-btn-submit"
            disabled={isSubmitting}
          >
            <CheckCircle2 size={16} />
            <span>
              {isSubmitting
                ? 'Enregistrement de l’évaluation...'
                : `Enregistrer la patiente · Score ${evaluationResult.scoreIA}%`}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
};
