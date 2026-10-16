import React from 'react';
import type { Beneficiaire } from '../../types/beneficiary';
import {
  SuspicionBadge,
  VulnerabilityBadge,
} from './BeneficiaryBadges';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Building,
  Stethoscope,
  Sparkles,
  CreditCard,
  Heart,
} from 'lucide-react';

interface PatientProfileViewProps {
  patient: Beneficiaire;
  onBack: () => void;
  onStartTriage: (patient: Beneficiaire) => void;
  onRequestSolidarity: (patient: Beneficiaire) => void;
  onRequestPartnerSponsorship?: (patient: Beneficiaire) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient,
  onBack,
  onStartTriage,
  onRequestSolidarity,
  onRequestPartnerSponsorship,
}) => {
  const triage = patient.dernierTriage;
  const evaluation = patient.derniereEvaluation;
  const isHighRisk =
    evaluation?.niveauRisque === 'ELEVE' || triage?.niveauSuspicion === 'eleve';
  const riskNiveau: any = evaluation
    ? (evaluation.niveauRisque.toLowerCase() as any)
    : triage?.niveauSuspicion;

  return (
    <div className="inpage-view-container">
      {/* En-tête In-Page sans modal */}
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
            <span className="modal-eyebrow">DOSSIER MÉDICAL & ADMINISTRATIF</span>
            <h2 className="text-xl font-bold text-[#17343B] font-serif">
              Fiche Patiente — {patient.nom} {patient.prenom}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {riskNiveau && <SuspicionBadge niveau={riskNiveau} />}
          <VulnerabilityBadge statut={patient.statutVulnerabilite} />
        </div>
      </div>

      {/* Grille d'Informations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Examen & Bilan Clinique */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fiche d'identification */}
          <div className="inpage-card">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#D6E8E8]">
              <User className="w-4 h-4 text-[#007599]" />
              <h3 className="text-sm font-bold text-[#17343B]">
                Coordonnées & Informations Générales
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#64748B] block mb-0.5">N° Dossier Unique</span>
                <strong className="text-sm font-mono text-[#007599]">
                  {patient.numeroDossier}
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Âge</span>
                <strong className="text-sm text-[#17343B]">
                  {patient.age} ans
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Téléphone direct</span>
                <strong className="text-xs text-[#17343B] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#007599]" />
                  {patient.telephone}
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Commune & Secteur</span>
                <strong className="text-xs text-[#17343B] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {patient.commune} ({patient.secteur})
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Langue d'échange</span>
                <strong className="text-xs text-[#17343B]">
                  {patient.languePreferee}
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Date de premier contact</span>
                <strong className="text-xs text-[#17343B] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {patient.dateSensibilisation}
                </strong>
              </div>
            </div>
          </div>

          {/* Dernier Triage Clinique */}
          <div className="inpage-card">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D6E8E8]">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#007599]" />
                <h3 className="text-sm font-bold text-[#17343B]">
                  Dernier Examen Clinique & Triage
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onStartTriage(patient)}
                className="btn-triage-action"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Nouveau Triage Clinique</span>
              </button>
            </div>

            {evaluation || triage ? (
              <div className="space-y-4 text-xs">
                {/* Carte de score officiel de l'Évaluation */}
                {evaluation && (
                  <div className="p-3 bg-gradient-to-r from-[#EEF7F7] to-[#E6F4F7] rounded-lg border border-[#B2DDDD] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#007599]" />
                      <div>
                        <strong className="text-xs text-[#17343B] block">
                          Évaluation Officielle Mermaid · Score IA : {evaluation.scoreIA}% {evaluation.pointsObtenus !== undefined ? `(${evaluation.pointsObtenus} / 15 pts)` : ''}
                        </strong>
                        <span className="text-[11px] text-[#536B70]">
                          Niveau de risque sénologique : <b>{evaluation.niveauRisque}</b> · Barème officiel 15 pts
                        </span>
                      </div>
                    </div>
                    {evaluation.bonSanteDeclenche && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FF7900] text-white shadow-xs">
                        Bon de Santé Éligible
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[#64748B] block">Date Examen</span>
                    <strong className="text-[#17343B]">
                      {evaluation ? evaluation.dateEvaluation.split('T')[0] : triage?.dateExamen}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Examinateur</span>
                    <strong className="text-[#17343B]">
                      {evaluation?.utilisateurNom || triage?.soignantNom || 'Sage-femme référente'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Sein examiné</span>
                    <strong className="text-[#007599] uppercase">
                      {evaluation?.autresIndicateurs.seinConcerne || triage?.seinConcerne || 'droit'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Quadrant</span>
                    <strong className="text-[#17343B]">
                      {evaluation?.autresIndicateurs.quadrant || triage?.quadrant || 'supéro-externe'}
                    </strong>
                  </div>
                </div>

                {/* Constatations */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17343B]">Palpation de nodule :</span>
                    <span className="font-semibold text-rose-700">
                      {evaluation
                        ? evaluation.nodule
                          ? `Oui (${evaluation.autresIndicateurs.consistanceNodule || 'présent'}${
                              evaluation.autresIndicateurs.tailleNoduleCm
                                ? `, ~${evaluation.autresIndicateurs.tailleNoduleCm} cm`
                                : ''
                            }) (+3 pts)`
                          : 'Non'
                        : triage?.nodulePalpable
                        ? `Oui (${triage.consistanceNodule}, ~${triage.tailleNoduleCm} cm) (+3 pts)`
                        : 'Non'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17343B]">Peau d'orange :</span>
                    <span className="font-semibold text-amber-700">
                      {evaluation?.peauOrange || triage?.peauOrange ? 'Oui (Capiton/rétraction) (+3 pts)' : 'Non'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17343B]">Écoulement mamelonnaire :</span>
                    <span className="font-semibold">
                      {evaluation?.autresIndicateurs.ecoulementMamelonnaire
                        ? `Oui (${evaluation.autresIndicateurs.typeEcoulement}) (+2 pts)`
                        : triage?.ecoulementMamelonnaire
                        ? `Oui (${triage.typeEcoulement}) (+2 pts)`
                        : 'Non'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17343B]">Ganglions axillaires :</span>
                    <span className="font-semibold">
                      {evaluation?.autresIndicateurs.adenopathieAxillaire || triage?.adenopathieAxillaire
                        ? 'Palpables (Adénopathie) (+2 pts)'
                        : 'Absents'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17343B]">Modification taille/forme (Asymétrie) :</span>
                    <span className="font-semibold">
                      {evaluation?.autresIndicateurs.modificationTailleForme || triage?.modificationTailleForme
                        ? 'Oui (+2 pts)'
                        : 'Non'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17343B]">Rétraction cutanée :</span>
                    <span className="font-semibold">
                      {evaluation?.autresIndicateurs.retractionCutanee || triage?.retractionCutanee ? 'Oui (+3 pts)' : 'Non'}
                    </span>
                  </div>
                </div>

                {/* Dictée vocale Speech-to-Text */}
                {(evaluation?.autresIndicateurs.observationsVocales || triage?.observationsVocales) && (
                  <div className="p-3 bg-[#EEF7F7] rounded-lg border border-[#B2DDDD]">
                    <div className="flex items-center gap-1.5 font-bold text-[#005C75] mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Compte-rendu dicté par le soignant (Speech-to-Text) :</span>
                    </div>
                    <p className="italic text-[#17343B] leading-relaxed m-0">
                      « {evaluation?.autresIndicateurs.observationsVocales || triage?.observationsVocales} »
                    </p>
                  </div>
                )}

                {/* Conduite à tenir */}
                <div className="p-3 bg-[#FFFDF9] rounded-lg border border-amber-200">
                  <strong className="block text-amber-900 mb-1">
                    Conduite à tenir recommandée :
                  </strong>
                  <p className="text-[#334155] m-0 leading-relaxed">
                    {evaluation?.conduiteATenir || triage?.conduiteATenir}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Aucun triage clinique enregistré pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite (1/3) : Statut Fonds de Solidarité Orange Money */}
        <div className="space-y-6">
          <div className="inpage-card border-2 border-orange-200">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#D6E8E8]">
              <CreditCard className="w-4 h-4 text-[#FF7900]" />
              <h3 className="text-sm font-bold text-[#17343B]">
                Prise en Charge Solidaire (M4)
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#64748B] block">Statut du Financement</span>
                <strong className="text-sm text-[#17343B]">
                  {patient.statutAideFonds ? (
                    <span className="text-emerald-700">Dossier #{patient.demandeAideCode}</span>
                  ) : (
                    <span className="text-slate-500">Aucune demande active</span>
                  )}
                </strong>
              </div>

              {(isHighRisk || patient.statutVulnerabilite === 'PDI' || patient.statutVulnerabilite === 'Vulnerable') && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-orange-900 leading-relaxed">
                  <strong>Éligibilité au Fonds :</strong> Cette patiente présente des critères prioritaires pour la prise en charge de ses examens par le Fonds de Solidarité & Mécénat.
                </div>
              )}

              <button
                type="button"
                onClick={() => onRequestSolidarity(patient)}
                className="w-full py-2.5 px-4 bg-[#FF7900] hover:bg-[#EA580C] text-white rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {patient.demandeAideCode
                    ? `Voir l'aide (${patient.demandeAideCode})`
                    : "Créer demande d'aide Orange Money"}
                </span>
              </button>

              {onRequestPartnerSponsorship && (isHighRisk || patient.statutVulnerabilite === 'PDI') && (
                <button
                  type="button"
                  onClick={() => onRequestPartnerSponsorship(patient)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#D8638A] to-[#B8456C] hover:from-[#B8456C] hover:to-[#963454] text-white rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all mt-1"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Parrainage d'Urgence Mécène (Cas Grave)</span>
                </button>
              )}
            </div>
          </div>

          <div className="inpage-card">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100">
              <Building className="w-4 h-4 text-[#007599]" />
              <h4 className="text-xs font-bold text-[#17343B]">Centre d'Attache</h4>
            </div>
            <p className="text-xs text-[#475569]">
              {patient.centreSuiviNom}
            </p>
            <span className="text-[11px] text-[#64748B] block mt-1">
              Agent référent : {patient.agentContactNom}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
