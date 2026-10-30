import React, { useState, useEffect } from 'react';
import type {
  DemandeAide,
  NiveauPriorite,
} from '../../types/solidarity';
import type { CurrentUserContext } from '../../types/campaign';
import type { Beneficiaire } from '../../types/beneficiary';
import { MOCK_CENTRES_IMAGERIE } from '../../data/mockSolidarityData';
import {
  ArrowLeft,
  User,
  HeartHandshake,
  Building,
  AlertTriangle,
  Coins,
  CheckCircle2,
  Phone,
  MapPin,
} from 'lucide-react';

interface AidRequestFormViewProps {
  currentUser: CurrentUserContext;
  onBack: () => void;
  onSubmit: (demande: DemandeAide) => void;
  initialPatient?: Beneficiaire | null;
}

const deriveMotifClinique = (p?: Beneficiaire | null): string => {
  if (!p) {
    return 'Présence d’un nodule palpable découvert lors du dépistage. Absence de moyens financiers pour honorer la mammographie.';
  }
  const triage = p.dernierTriage;
  const ev = p.derniereEvaluation;
  const signs: string[] = [];
  if (triage?.nodulePalpable || ev?.nodule) {
    signs.push(`Nodule palpable au sein ${triage?.seinConcerne || ev?.autresIndicateurs?.seinConcerne || 'droit'}${triage?.tailleNoduleCm ? ` (~${triage.tailleNoduleCm} cm)` : ''}`);
  }
  if (triage?.peauOrange || ev?.peauOrange) signs.push("aspect peau d'orange");
  if (triage?.ecoulementMamelonnaire || ev?.autresIndicateurs?.ecoulementMamelonnaire) signs.push("écoulement mamelonnaire");
  if (triage?.adenopathieAxillaire || ev?.autresIndicateurs?.adenopathieAxillaire) signs.push("adénopathie axillaire");
  if (triage?.observationsVocales || ev?.autresIndicateurs?.observationsVocales) {
    signs.push(`Observations : ${triage?.observationsVocales || ev?.autresIndicateurs?.observationsVocales}`);
  }

  if (signs.length > 0) {
    return `Suspicion clinique détectée lors du dépistage (${signs.join(', ')}). Examen échomammographique d'urgence recommandé pour confirmation diagnostique.`;
  }
  return `Patiente vulnérable (${p.statutVulnerabilite}) de ${p.age} ans nécessitant un bilan sénologique complet dans le cadre du dépistage précoce.`;
};

const derivePriorite = (p?: Beneficiaire | null): NiveauPriorite => {
  if (!p) return 'urgent';
  if (p.dernierTriage?.niveauSuspicion === 'eleve' || p.derniereEvaluation?.niveauRisque === 'ELEVE') return 'urgent';
  if (p.dernierTriage?.niveauSuspicion === 'modere' || p.derniereEvaluation?.niveauRisque === 'MODERE') return 'eleve';
  return 'standard';
};

export const AidRequestFormView: React.FC<AidRequestFormViewProps> = ({
  currentUser,
  onBack,
  onSubmit,
  initialPatient,
}) => {
  // Form states pré-remplis automatiquement si une patiente est sélectionnée
  const [patienteNom, setPatienteNom] = useState(initialPatient?.nom || '');
  const [patientePrenom, setPatientePrenom] = useState(initialPatient?.prenom || '');
  const [patienteAge, setPatienteAge] = useState<number>(initialPatient?.age || 42);
  const [patienteTelephone, setPatienteTelephone] = useState(initialPatient?.telephone || '+226 ');
  const [patienteLangue, setPatienteLangue] = useState<string>(initialPatient?.languePreferee || 'Mooré');
  const [commune, setCommune] = useState(initialPatient?.commune || 'Ouagadougou');
  const [secteur, setSecteur] = useState(initialPatient?.secteur || 'Secteur 28');

  // Centre demandeur
  const [centreDemandeurNom, setCentreDemandeurNom] = useState(
    initialPatient?.centreSuiviNom || currentUser.centreNom || 'CSPS Kossodo — Ouagadougou'
  );

  // Centre imagerie réalisateur
  const [selectedCentreId, setSelectedCentreId] = useState<string>(
    MOCK_CENTRES_IMAGERIE[0].id
  );

  // Motif et priorité clinique dérivés automatiquement
  const [motifClinique, setMotifClinique] = useState(deriveMotifClinique(initialPatient));
  const [niveauPriorite, setNiveauPriorite] = useState<NiveauPriorite>(derivePriorite(initialPatient));

  // Coût estimé
  const [coutEstime, setCoutEstime] = useState<number>(
    MOCK_CENTRES_IMAGERIE[0].tarifStandardFCFA
  );

  // Synchronisation automatique si la patiente sélectionnée change
  useEffect(() => {
    if (initialPatient) {
      setPatienteNom(initialPatient.nom || '');
      setPatientePrenom(initialPatient.prenom || '');
      setPatienteAge(initialPatient.age || 42);
      setPatienteTelephone(initialPatient.telephone || '+226 ');
      setPatienteLangue(initialPatient.languePreferee || 'Mooré');
      setCommune(initialPatient.commune || 'Ouagadougou');
      setSecteur(initialPatient.secteur || 'Secteur 28');
      if (initialPatient.centreSuiviNom) setCentreDemandeurNom(initialPatient.centreSuiviNom);
      setMotifClinique(deriveMotifClinique(initialPatient));
      setNiveauPriorite(derivePriorite(initialPatient));
    }
  }, [initialPatient]);

  // Erreurs
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update cost when imaging center changes
  const handleCentreChange = (centreId: string) => {
    setSelectedCentreId(centreId);
    const centre = MOCK_CENTRES_IMAGERIE.find((c) => c.id === centreId);
    if (centre) {
      setCoutEstime(centre.tarifStandardFCFA);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!patienteNom.trim()) errs.patienteNom = 'Le nom de famille est obligatoire.';
    if (!patientePrenom.trim()) errs.patientePrenom = 'Le prénom est obligatoire.';
    if (!patienteTelephone.trim() || patienteTelephone.length < 8) {
      errs.patienteTelephone = 'Un numéro de téléphone valide est requis pour le suivi.';
    }
    if (!commune.trim()) errs.commune = 'La commune de résidence est obligatoire.';
    if (!motifClinique.trim() || motifClinique.length < 15) {
      errs.motifClinique = 'Veuillez détailler le motif clinique (au moins 15 caractères).';
    }
    if (coutEstime <= 0) {
      errs.coutEstime = 'Le coût estimé doit être supérieur à 0 FCFA.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const centreImagerie =
      MOCK_CENTRES_IMAGERIE.find((c) => c.id === selectedCentreId) ||
      MOCK_CENTRES_IMAGERIE[0];

    // Générer un code dossier unique
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCode = `AIDE-2026-${randomSuffix}`;

    const newDemande: DemandeAide = {
      id: `aide-${Date.now()}`,
      codeDossier: newCode,
      patienteId: initialPatient?.id || `pat-${Date.now()}`,
      patienteNom: patienteNom.trim().toUpperCase(),
      patientePrenom: patientePrenom.trim(),
      patienteAge: Number(patienteAge),
      patienteTelephone: patienteTelephone.trim(),
      patienteLangue,
      commune: commune.trim(),
      secteur: secteur.trim(),
      centreDemandeurId: 'centre-dem-user',
      centreDemandeurNom,
      centreImagerieId: centreImagerie.id,
      centreImagerieNom: centreImagerie.nom,
      motifClinique: motifClinique.trim(),
      niveauPriorite,
      coutEstime: Number(coutEstime),
      montantAccorde: 0,
      statut: 'a_examiner',
      dateDemande: new Date().toISOString().split('T')[0],
      agentDemandeurNom: `${currentUser.prenom} ${currentUser.nom}`,
      agentDemandeurId: currentUser.id,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(newDemande);
    }, 350);
  };

  const selectedCentre = MOCK_CENTRES_IMAGERIE.find(
    (c) => c.id === selectedCentreId
  );

  return (
    <div className="inpage-view-container">
      {/* En-tête In-Page avec bouton retour sans modal */}
      <div className="inpage-header">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inpage-back-btn"
            onClick={onBack}
            aria-label="Retour à la liste"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux demandes</span>
          </button>
          <div>
            <span className="modal-eyebrow">INSTRUCTION D'AIDE SOLIDARITÉ</span>
            <h2 className="text-xl font-bold text-[#17343B] font-serif">
              Nouvelle Demande de Prise en Charge Solidaire
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
            Statut initial : À examiner
          </span>
        </div>
      </div>

      {/* Bannière explicative */}
      <div className="p-4 bg-gradient-to-r from-[#E6F4F7] to-[#FDF2F6] rounded-xl border border-[#D6E8E8] flex items-start gap-3">
        <HeartHandshake className="w-5 h-5 text-[#007599] shrink-0 mt-0.5" />
        <div className="text-xs text-[#17343B] leading-relaxed">
          <strong>Prise en charge financière directe :</strong> En tant qu'agent de santé autorisé, vous soumettez une demande de mammographie pour une femme vulnérable ne pouvant pas assumer le coût de l'examen. Après validation par le médecin responsable, le règlement sera effectué directement au centre d'imagerie via <strong>Orange Money Burkina Faso</strong>.
        </div>
      </div>

      {/* Formulaire complet */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* SECTION 1 : PATIENTE & VULNÉRABILITÉ */}
        <div className="inpage-card">
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#D6E8E8]">
            <div className="w-8 h-8 rounded-lg bg-[#E6F4F7] text-[#007599] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17343B]">
                1. Identité & Coordonnées de la Patiente
              </h3>
              <p className="text-xs text-[#64748B]">
                Données d'identification protégées réservées aux professionnels de santé.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Nom de famille <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                placeholder="Ex: OUÉDRAOGO"
                value={patienteNom}
                onChange={(e) => setPatienteNom(e.target.value)}
              />
              {errors.patienteNom && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.patienteNom}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Prénom(s) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                placeholder="Ex: Fatimata"
                value={patientePrenom}
                onChange={(e) => setPatientePrenom(e.target.value)}
              />
              {errors.patientePrenom && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.patientePrenom}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Âge de la patiente (ans) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min={18}
                max={99}
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                value={patienteAge}
                onChange={(e) => setPatienteAge(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Téléphone pour joindre la patiente <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                <input
                  type="tel"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                  placeholder="+226 70 XX XX XX"
                  value={patienteTelephone}
                  onChange={(e) => setPatienteTelephone(e.target.value)}
                />
              </div>
              {errors.patienteTelephone && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.patienteTelephone}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Langue locale privilégiée
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599] bg-white"
                value={patienteLangue}
                onChange={(e) => setPatienteLangue(e.target.value)}
              >
                <option value="Mooré">Mooré</option>
                <option value="Dioula">Dioula</option>
                <option value="Fulfuldé">Fulfuldé</option>
                <option value="Gourmantché">Gourmantché</option>
                <option value="Français">Français</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Commune de résidence <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                  placeholder="Ex: Ouagadougou, Bobo, Koudougou..."
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                />
              </div>
              {errors.commune && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.commune}
                </span>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Secteur, quartier ou village
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                placeholder="Ex: Secteur 28, Karpala, proximité marché"
                value={secteur}
                onChange={(e) => setSecteur(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2 : STRUCTURE DEMANDERESSE & CENTRE D'IMAGERIE */}
        <div className="inpage-card">
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#D6E8E8]">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17343B]">
                2. Structures Sanitaires & Orientation
              </h3>
              <p className="text-xs text-[#64748B]">
                Centre demandeur (CSPS/CMA) et centre partenaire réalisant la mammographie.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Centre de santé demandeur (Origine)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                value={centreDemandeurNom}
                onChange={(e) => setCentreDemandeurNom(e.target.value)}
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Agent demandeur : <strong>{currentUser.prenom} {currentUser.nom}</strong> ({currentUser.roleTitre || currentUser.role})
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Centre d'imagerie réalisant la mammographie <span className="text-rose-600">*</span>
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599] bg-white font-medium"
                value={selectedCentreId}
                onChange={(e) => handleCentreChange(e.target.value)}
              >
                {MOCK_CENTRES_IMAGERIE.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.commune}) — Tarif solidaire : {c.tarifStandardFCFA.toLocaleString('fr-FR')} FCFA
                  </option>
                ))}
              </select>

              {selectedCentre && (
                <div className="mt-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs text-[#475569] flex items-center justify-between">
                  <span>Délai moyen de RDV : <strong>{selectedCentre.delaiMoyenJours} jours</strong></span>
                  <span>Compte Orange Money : <strong className="text-[#C2410C]">{selectedCentre.compteOrangeMoney}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3 : MOTIF CLINIQUE & NIVEAU DE PRIORITÉ */}
        <div className="inpage-card">
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#D6E8E8]">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17343B]">
                3. Motif Médical & Niveau de Priorité
              </h3>
              <p className="text-xs text-[#64748B]">
                Indiquez les constatations de la palpation clinique pour justifier l'urgence.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-2">
                Niveau de priorité clinique <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label
                  className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
                    niveauPriorite === 'urgent'
                      ? 'border-red-500 bg-red-50/60 ring-2 ring-red-400'
                      : 'border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="priorite"
                    value="urgent"
                    checked={niveauPriorite === 'urgent'}
                    onChange={() => setNiveauPriorite('urgent')}
                    className="mt-1"
                  />
                  <div>
                    <strong className="block text-xs text-red-900">Priorité à confirmer rapidement</strong>
                    <span className="text-[11px] text-red-700 leading-tight block mt-0.5">
                      Signes rapportés dans la demande. Un professionnel de santé confirme la priorité et le délai selon le protocole en vigueur.
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
                    niveauPriorite === 'eleve'
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400'
                      : 'border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="priorite"
                    value="eleve"
                    checked={niveauPriorite === 'eleve'}
                    onChange={() => setNiveauPriorite('eleve')}
                    className="mt-1"
                  />
                  <div>
                    <strong className="block text-xs text-amber-900">Suivi prioritaire à confirmer</strong>
                    <span className="text-[11px] text-amber-700 leading-tight block mt-0.5">
                      Les signes renseignés sont à faire évaluer par un professionnel, qui détermine l’orientation et le délai.
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
                    niveauPriorite === 'standard'
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-400'
                      : 'border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="priorite"
                    value="standard"
                    checked={niveauPriorite === 'standard'}
                    onChange={() => setNiveauPriorite('standard')}
                    className="mt-1"
                  />
                  <div>
                    <strong className="block text-xs text-blue-900">Suivi courant à confirmer</strong>
                    <span className="text-[11px] text-blue-700 leading-tight block mt-0.5">
                      Choix administratif indicatif; il ne remplace pas l’évaluation clinique ni le protocole national.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Constatations cliniques & Motif de la demande <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                placeholder="Détaillez les observations : taille de la lésion, quadrant du sein, adénopathies axillaires..."
                value={motifClinique}
                onChange={(e) => setMotifClinique(e.target.value)}
              />
              {errors.motifClinique && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.motifClinique}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4 : ÉVALUATION FINANCIÈRE */}
        <div className="inpage-card">
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#D6E8E8]">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17343B]">
                4. Coût Estimé de l'Examen (FCFA)
              </h3>
              <p className="text-xs text-[#64748B]">
                Tarif conventionné de la mammographie bilatérale prise en charge à 100%.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1">
                Montant estimé de l'examen <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={500}
                  className="w-full px-3 py-2 text-base font-bold text-[#17343B] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                  value={coutEstime}
                  onChange={(e) => setCoutEstime(Number(e.target.value))}
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-[#64748B]">
                  FCFA
                </span>
              </div>
              {errors.coutEstime && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.coutEstime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D6E8E8]">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-[#64748B] hover:text-[#17343B] rounded-lg transition-colors"
            onClick={onBack}
          >
            Annuler et retourner
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-create-campaign"
            style={{ padding: '0.65rem 1.75rem' }}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isSubmitting
                ? 'Enregistrement en cours...'
                : "Enregistrer la demande d'aide"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
