import React, { useState, useMemo, useEffect } from 'react';
import type {
  PartenaireDonneur,
  AppelAideCasGrave,
} from '../../types/partner';
import {
  X,
  Heart,
  Send,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export interface PatientCandidate {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  commune: string;
  region: string;
  scoreIA: number;
  descriptionClinique: string;
  vulnerabilite?: string;
  centreNom?: string;
}

interface SendPartnerAidRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  partenaires: PartenaireDonneur[];
  preselectedPartnerId?: string;
  preselectedPatient?: PatientCandidate;
  patientsCandidats?: PatientCandidate[];
  onSubmitAppeal: (newAppel: AppelAideCasGrave, immediateApprove?: boolean) => void;
}

// Échantillon de patientes à risque élevé éligibles au parrainage d'urgence
const DEFAULT_CANDIDATES: PatientCandidate[] = [
  {
    id: 'cand-1',
    nom: 'Ouédraogo',
    prenom: 'Fatoumata',
    age: 42,
    commune: 'Kaya (Site PDI Secteur 4)',
    region: 'Centre-Nord',
    scoreIA: 88,
    descriptionClinique:
      'Nodule dur rétro-aréolaire droit de 3.2 cm, peau d’orange débutante et adénopathie axillaire homolatérale.',
    vulnerabilite: 'Femme déplacée interne (PDI), cheffe de ménage sans ressources',
    centreNom: 'CMA de Kaya',
  },
  {
    id: 'cand-2',
    nom: 'Diallo',
    prenom: 'Mariam',
    age: 36,
    commune: 'Ouagadougou (Secteur 29)',
    region: 'Centre',
    scoreIA: 79,
    descriptionClinique:
      'Masse suspecte du quadrant supéro-externe gauche apparue il y a 3 mois, antécédents familiaux maternels de cancer du sein.',
    vulnerabilite: 'Veuve, vendeuse ambulante, 3 enfants à charge',
    centreNom: 'CSPS Schiphra',
  },
  {
    id: 'cand-3',
    nom: 'Sawadogo',
    prenom: 'Assetou',
    age: 51,
    commune: 'Bobo-Dioulasso (Do)',
    region: 'Hauts-Bassins',
    scoreIA: 94,
    descriptionClinique:
      'Écoulement mamelonnaire séro-hémorragique spontané unilatéral avec rétraction du mamelon gauche.',
    vulnerabilite: 'Grande précarité économique, aucune couverture sociale',
    centreNom: 'CSPS Colma 2',
  },
  {
    id: 'cand-4',
    nom: 'Ilboudo',
    prenom: 'Rasmata',
    age: 47,
    commune: 'Fada N’Gourma (Secteur 1)',
    region: 'Est',
    scoreIA: 82,
    descriptionClinique:
      'Induration étendue du quadrant inféro-interne droit avec douleurs intermittentes et méplat cutané.',
    vulnerabilite: 'Zone rurale enclavée, famille d’accueil PDI',
    centreNom: 'CHR de Fada N’Gourma',
  },
];

export const SendPartnerAidRequestModal: React.FC<SendPartnerAidRequestModalProps> = ({
  isOpen,
  onClose,
  partenaires,
  preselectedPartnerId,
  preselectedPatient,
  patientsCandidats = DEFAULT_CANDIDATES,
  onSubmitAppeal,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatient?.id || patientsCandidats[0]?.id || ''
  );

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    preselectedPartnerId || partenaires[0]?.id || ''
  );

  // Synchronisation dynamique dès que la patiente ou le partenaire pré-sélectionné change
  useEffect(() => {
    if (preselectedPatient?.id) {
      setSelectedPatientId(preselectedPatient.id);
    } else if (patientsCandidats.length > 0 && !patientsCandidats.some((p) => p.id === selectedPatientId)) {
      setSelectedPatientId(patientsCandidats[0].id);
    }
  }, [preselectedPatient, patientsCandidats]);

  useEffect(() => {
    if (preselectedPartnerId) {
      setSelectedPartnerId(preselectedPartnerId);
    }
  }, [preselectedPartnerId]);

  const [montant, setMontant] = useState<number>(25000);
  const [message, setMessage] = useState<string>(
    'Dossier prioritaire détecté lors du dépistage communautaire. Sollicitation d’un Bon de Santé Orange Money pour mammographie et échographie bilatérale d’urgence.'
  );
  const [autoApproveSimulation, setAutoApproveSimulation] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Patiente active
  const currentPatient = useMemo(() => {
    if (preselectedPatient) {
      return preselectedPatient;
    }
    return (
      patientsCandidats.find((p) => p.id === selectedPatientId) ||
      patientsCandidats[0] ||
      DEFAULT_CANDIDATES[0]
    );
  }, [patientsCandidats, preselectedPatient, selectedPatientId]);

  // Partenaire actif
  const currentPartner = useMemo(() => {
    return (
      partenaires.find((p) => p.id === selectedPartnerId) || partenaires[0]
    );
  }, [partenaires, selectedPartnerId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient || !currentPartner) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const codeRand = Math.floor(1000 + Math.random() * 9000);
      const codeDossier = `SOL-URG-2026-${codeRand}`;
      const codeBon = `BON-OM-2026-${codeRand}`;

      const newAppel: AppelAideCasGrave = {
        id: `appel-${Date.now()}`,
        codeDossier,
        patienteId: currentPatient.id,
        patienteCodeAnonymise: `PAT-BF-${currentPatient.region.substring(0, 3).toUpperCase()}-${codeRand}`,
        patienteAge: currentPatient.age,
        commune: currentPatient.commune,
        region: currentPatient.region,
        statutVulnerabilite: currentPatient.vulnerabilite || 'Précarité sociale confirmée',
        centreDemandeurNom: currentPatient.centreNom || 'Centre de Santé Communautaire',
        scoreIA: currentPatient.scoreIA,
        niveauRisque: 'ELEVE',
        descriptionMedicale: currentPatient.descriptionClinique,
        montantNecessaire: montant,
        partenaireCibleId: currentPartner.id,
        partenaireCibleNom: currentPartner.nom,
        messageAccompagnement: message,
        dateEnvoi: new Date().toISOString(),
        statut: autoApproveSimulation ? 'parraine' : 'emis',
        bonSanteGenereId: autoApproveSimulation ? `bon-${Date.now()}` : undefined,
        bonSanteCode: autoApproveSimulation ? codeBon : undefined,
        dateReponsePartenaire: autoApproveSimulation ? new Date().toISOString() : undefined,
        reponseCommentaire: autoApproveSimulation
          ? `Prise en charge intégrale validée par ${currentPartner.nom}. Bon de Santé de ${montant.toLocaleString('fr-FR')} FCFA généré.`
          : undefined,
      };

      onSubmitAppeal(newAppel, autoApproveSimulation);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#D6E8E8] w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* En-tête */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#D8638A] via-[#B8456C] to-[#17343B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#B8456C]">
                  Parrainage Direct
                </span>
                <span className="text-xs text-pink-100">Cas Clinique Grave (Score de triage &gt; 70%)</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Demande de Parrainage auprès d’un Mécène
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Avertissement déontologique */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-amber-900 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Protection des données médicales :</strong> Le dossier transmis au partenaire mécène est anonymisé conformément au RGPD de la santé. Seules les données cliniques, le score de triage et la commune sont partagés.
            </div>
          </div>

          {/* 1. Sélection de la patiente à parrainer */}
          <div>
            <label className="block text-xs font-bold text-[#17343B] mb-1.5">
              1. Patiente Prioritaire à Parrainer
            </label>

            {preselectedPatient ? (
              <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-[#17343B]">
                      {preselectedPatient.prenom} {preselectedPatient.nom}
                    </strong>
                    <span className="text-xs text-slate-500">
                      ({preselectedPatient.age} ans)
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      Score de triage : {preselectedPatient.scoreIA}/100
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 block mt-1">
                    📍 {preselectedPatient.commune} ({preselectedPatient.region})
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {patientsCandidats.map((c) => {
                  const isSelected = c.id === selectedPatientId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedPatientId(c.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-[#D8638A] bg-pink-50/50 shadow-sm ring-1 ring-[#D8638A]'
                          : 'border-[#D6E8E8] bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs font-bold text-[#17343B]">
                            {c.prenom} {c.nom}
                          </strong>
                          <span className="text-xs text-slate-500">({c.age} ans)</span>
                          <span className="text-[11px] px-2 py-0.2 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Score de triage : {c.scoreIA}/100
                          </span>
                          <span className="text-[11px] text-slate-500">📍 {c.commune}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                          🩺 {c.descriptionClinique}
                        </p>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#D8638A] shrink-0 ml-2 mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Sélection du Partenaire Mécène */}
          <div>
            <label className="block text-xs font-bold text-[#17343B] mb-1.5">
              2. Partenaire Mécène Ciblé
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {partenaires.map((p) => {
                const isSelected = p.id === currentPartner?.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPartnerId(p.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#007599] bg-teal-50/60 shadow-sm ring-1 ring-[#007599]'
                        : 'border-[#D6E8E8] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-[#007599] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.sigle.substring(0, 3)}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-[#17343B] block truncate">
                          {p.nom}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Solde : {p.soldeDisponible.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#007599] shrink-0 ml-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Montant du Bon de Santé sollicité */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1.5">
                Prestation Médicale Prise en Charge
              </label>
              <div className="flex flex-col gap-2">
                <label
                  onClick={() => setMontant(25000)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    montant === 25000
                      ? 'border-[#007599] bg-teal-50 text-[#007599] font-bold'
                      : 'border-[#D6E8E8] bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs">
                    <div>Mammographie Bilatérale</div>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Tarif subventionné CHU Yalgado / Bogodogo
                    </span>
                  </div>
                  <span className="text-xs font-bold">25 000 FCFA</span>
                </label>

                <label
                  onClick={() => setMontant(50000)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    montant === 50000
                      ? 'border-[#007599] bg-teal-50 text-[#007599] font-bold'
                      : 'border-[#D6E8E8] bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs">
                    <div>Bilan Sénologique Complet</div>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Mammographie + Échographie + Microbiopsie
                    </span>
                  </div>
                  <span className="text-xs font-bold">50 000 FCFA</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17343B] mb-1.5">
                Argumentaire & Message d'Accompagnement
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs rounded-xl border border-[#D6E8E8] p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#007599]/30 focus:border-[#007599]"
                placeholder="Précisez le contexte d'urgence, la vulnérabilité familiale ou le délai clinique requis..."
              />
            </div>
          </div>

          {/* Option Simulation de validation instantanée */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="autoApprove"
                checked={autoApproveSimulation}
                onChange={(e) => setAutoApproveSimulation(e.target.checked)}
                className="w-4 h-4 rounded text-[#007599] focus:ring-[#007599]"
              />
              <label htmlFor="autoApprove" className="text-xs text-slate-700 cursor-pointer">
                <strong>Simuler l'accord immédiat du partenaire</strong> (Génère instantanément le <em>Bon de Santé</em>)
              </label>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              Démo Hackathon
            </span>
          </div>
        </form>

        {/* Pied de page */}
        <div className="px-6 py-4 bg-[#FAFCFC] border-t border-[#D6E8E8] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D8638A] to-[#B8456C] hover:from-[#B8456C] hover:to-[#963454] text-white shadow-sm transition-all hover:shadow active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Envoi de l'appel...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  Transmettre l'Appel au Mécène ({montant.toLocaleString('fr-FR')} FCFA)
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
