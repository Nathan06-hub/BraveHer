import React, { useState } from 'react';
import type { DemandeAide, StatutAide } from '../../types/solidarity';
import type { CurrentUserContext } from '../../types/campaign';
import { AidStatusBadge, PriorityBadge } from './AidStatusBadge';
import { MOCK_CENTRES_IMAGERIE } from '../../data/mockSolidarityData';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface AidValidationViewProps {
  demande: DemandeAide;
  currentUser: CurrentUserContext;
  onBack: () => void;
  onConfirmDecision: (
    updatedDemande: DemandeAide,
    decision: 'approuvee' | 'refusee'
  ) => void;
}

export const AidValidationView: React.FC<AidValidationViewProps> = ({
  demande,
  currentUser,
  onBack,
  onConfirmDecision,
}) => {
  // Mode de décision
  const [decisionType, setDecisionType] = useState<'approuvee' | 'refusee'>('approuvee');

  // Champs modifiables par le responsable
  const [selectedCentreId, setSelectedCentreId] = useState<string>(
    demande.centreImagerieId || MOCK_CENTRES_IMAGERIE[0].id
  );
  const [montantAccorde, setMontantAccorde] = useState<number>(
    demande.montantAccorde > 0 ? demande.montantAccorde : demande.coutEstime
  );
  const [commentaire, setCommentaire] = useState<string>(
    'Dossier prioritaire validé. Prise en charge intégrale accordée au titre du Fonds de Solidarité Soutien Rose BFK.'
  );
  const [motifRefus, setMotifRefus] = useState<string>('');
  const [refusError, setRefusError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Changement de centre
  const handleCentreChange = (centreId: string) => {
    setSelectedCentreId(centreId);
    const centre = MOCK_CENTRES_IMAGERIE.find((c) => c.id === centreId);
    if (centre && decisionType === 'approuvee') {
      setMontantAccorde(centre.tarifStandardFCFA);
    }
  };

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (decisionType === 'refusee') {
      if (!motifRefus.trim() || motifRefus.trim().length < 10) {
        setRefusError('Le motif de refus doit être motivé et comporter au moins 10 caractères.');
        return;
      }
    }

    setRefusError('');
    setIsSubmitting(true);

    const centreImagerie =
      MOCK_CENTRES_IMAGERIE.find((c) => c.id === selectedCentreId) ||
      MOCK_CENTRES_IMAGERIE[0];

    const todayStr = new Date().toISOString().split('T')[0];
    const newStatut: StatutAide = decisionType === 'approuvee' ? 'approuvee' : 'refusee';

    const updated: DemandeAide = {
      ...demande,
      centreImagerieId: centreImagerie.id,
      centreImagerieNom: centreImagerie.nom,
      montantAccorde: decisionType === 'approuvee' ? Number(montantAccorde) : 0,
      statut: newStatut,
      responsableValidationNom: `${currentUser.prenom} ${currentUser.nom}`,
      dateDecision: todayStr,
      commentaireValidation: commentaire.trim() || undefined,
      motifRefus: decisionType === 'refusee' ? motifRefus.trim() : undefined,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmDecision(updated, decisionType);
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
            aria-label="Retour aux demandes"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux demandes</span>
          </button>
          <div>
            <span className="modal-eyebrow">MODULE 4 · ARBITRAGE ET DÉCISION MÉDICALE</span>
            <h2 className="text-xl font-bold text-[#17343B] font-serif">
              Instruction du Dossier #{demande.codeDossier}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priorite={demande.niveauPriorite} />
          <AidStatusBadge statut={demande.statut} />
        </div>
      </div>

      {/* Grille principale : Informations du dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Détails cliniques & Données administratives */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fiche Patiente */}
          <div className="inpage-card">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D6E8E8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E6F4F7] text-[#007599] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17343B]">
                    Identité & Situation de la Patiente
                  </h3>
                  <span className="text-xs text-[#64748B]">
                    Code patiente : {demande.patienteId}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-[#475569] rounded-full">
                Langue : {demande.patienteLangue}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#64748B] block mb-0.5">Nom et Prénom</span>
                <strong className="text-sm text-[#17343B]">
                  {demande.patienteNom} {demande.patientePrenom}
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Âge</span>
                <strong className="text-sm text-[#17343B]">
                  {demande.patienteAge} ans
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Téléphone direct</span>
                <strong className="text-sm text-[#17343B] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#007599]" />
                  {demande.patienteTelephone}
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Commune / Ville</span>
                <strong className="text-xs text-[#17343B] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#007599]" />
                  {demande.commune}
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Secteur / Quartier</span>
                <strong className="text-xs text-[#17343B]">
                  {demande.secteur || 'Non renseigné'}
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Date de soumission</span>
                <strong className="text-xs text-[#17343B] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                  {demande.dateDemande}
                </strong>
              </div>
            </div>
          </div>

          {/* Motif Clinique & Constatations */}
          <div className="inpage-card">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#D6E8E8]">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#17343B]">
                  Constatations Médicales & Motif de la Demande
                </h3>
                <span className="text-xs text-[#64748B]">
                  Établi par l'agent : {demande.agentDemandeurNom} ({demande.centreDemandeurNom})
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#FFF9F9] rounded-xl border border-rose-100 text-xs leading-relaxed text-[#17343B] mb-3">
              <strong className="text-rose-900 block mb-1">
                Motif transmis par le soignant :
              </strong>
              {demande.motifClinique}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#475569] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
              <AlertCircle className="w-4 h-4 text-[#007599] shrink-0" />
              <span>
                Priorité recommandée : <strong>{demande.niveauPriorite.toUpperCase()}</strong>. Examen requis : Mammographie bilatérale numérique avec clichés complémentaires si anomalie confirmée.
              </span>
            </div>
          </div>
        </div>

        {/* Colonne droite (1/3) : Panneau de décision & arbitrage */}
        <div className="space-y-6">
          <div className="inpage-card border-2 border-[#007599]/30">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#D6E8E8]">
              <div className="w-8 h-8 rounded-lg bg-[#E6F4F7] text-[#007599] flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#17343B]">
                  Arbitrage & Validation
                </h3>
                <span className="text-xs text-[#64748B]">
                  Responsable : {currentUser.prenom} {currentUser.nom}
                </span>
              </div>
            </div>

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              {/* Choix décision : Approuver ou Refuser */}
              <div>
                <label className="block text-xs font-bold text-[#17343B] mb-2">
                  Décision d'attribution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      decisionType === 'approuvee'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setDecisionType('approuvee')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approuver</span>
                  </button>

                  <button
                    type="button"
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      decisionType === 'refusee'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setDecisionType('refusee')}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Refuser</span>
                  </button>
                </div>
              </div>

              {/* Cas A : APPROBATION */}
              {decisionType === 'approuvee' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#17343B] mb-1">
                      Centre réalisateur (Ajustable si nécessaire)
                    </label>
                    <select
                      className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599] bg-white font-medium"
                      value={selectedCentreId}
                      onChange={(e) => handleCentreChange(e.target.value)}
                    >
                      {MOCK_CENTRES_IMAGERIE.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom} ({c.commune})
                        </option>
                      ))}
                    </select>
                    {selectedCentre && (
                      <span className="text-[11px] text-[#64748B] mt-1 block">
                        Délai moyen RDV : <strong>{selectedCentre.delaiMoyenJours} jours</strong>
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17343B] mb-1">
                      Montant accordé (Prise en charge FCFA)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={500}
                        className="w-full px-3 py-2 text-sm font-bold text-[#17343B] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                        value={montantAccorde}
                        onChange={(e) => setMontantAccorde(Number(e.target.value))}
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-[#64748B]">
                        FCFA
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17343B] mb-1">
                      Commentaire d'instruction (Optionnel)
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
                      placeholder="Commentaire de prise en charge..."
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                    <strong className="block mb-0.5">Autorisation financière :</strong>
                    L'approbation réservera <strong>{montantAccorde.toLocaleString('fr-FR')} FCFA</strong> sur le fonds. L'étape suivante permettra d'émettre le paiement Orange Money au centre d'imagerie.
                  </div>
                </div>
              )}

              {/* Cas B : REFUS */}
              {decisionType === 'refusee' && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      Conformément au cahier des charges, tout rejet doit faire l'objet d'un <strong>motif explicite</strong> notifié à l'agent demandeur.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-900 mb-1">
                      Motif de refus obligatoire <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg focus:outline-none focus:border-rose-600"
                      placeholder="Ex: Examen de mammographie déjà réalisé il y a moins de 6 mois sans nouvelle lésion suspecte, réorientation prescrite..."
                      value={motifRefus}
                      onChange={(e) => setMotifRefus(e.target.value)}
                    />
                    {refusError && (
                      <span className="text-[11px] text-rose-600 font-bold block mt-1">
                        {refusError}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Bouton de confirmation */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
                    decisionType === 'approuvee'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {decisionType === 'approuvee' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? 'Traitement...' : 'Valider la prise en charge'}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>{isSubmitting ? 'Traitement...' : 'Enregistrer le refus motivé'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
