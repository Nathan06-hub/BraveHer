import React, { useState } from 'react';
import type { DemandeAide, TransactionOrangeMoney } from '../../types/solidarity';
import type { CurrentUserContext } from '../../types/campaign';
import { MOCK_CENTRES_IMAGERIE } from '../../data/mockSolidarityData';
import {
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Building,
  User,
  Clock,
  Sparkles,
  QrCode,
  AlertCircle,
} from 'lucide-react';

interface OrangeMoneyPaymentViewProps {
  demande: DemandeAide;
  currentUser: CurrentUserContext;
  onBack: () => void;
  onPaymentSuccess: (updatedDemande: DemandeAide) => void;
}

export const OrangeMoneyPaymentView: React.FC<OrangeMoneyPaymentViewProps> = ({
  demande,
  currentUser,
  onBack,
  onPaymentSuccess,
}) => {
  // Finding the imaging center
  const centre =
    MOCK_CENTRES_IMAGERIE.find((c) => c.id === demande.centreImagerieId) ||
    MOCK_CENTRES_IMAGERIE[0];

  const montant = demande.montantAccorde > 0 ? demande.montantAccorde : demande.coutEstime;
  const compteMarchand = centre.compteOrangeMoney || '+226 76 00 22 11';

  // State of simulation
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<TransactionOrangeMoney | null>(
    demande.transactionOM || null
  );

  const handleExecutePayment = () => {
    setIsProcessing(true);

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const authCode = Math.floor(100000 + Math.random() * 900000);
    const refOM = `OM-BF-2026-${randomSuffix}`;

    setTimeout(() => {
      const tx: TransactionOrangeMoney = {
        id: `tx-${Date.now()}`,
        reference: refOM,
        montant,
        date: new Date().toISOString(),
        destinataireNom: centre.nom,
        destinataireCompte: compteMarchand,
        statut: 'reussi',
        codeAutorisation: `AUTH-OM-${authCode}`,
        fraisTransaction: 0,
      };

      const updatedDemande: DemandeAide = {
        ...demande,
        statut: 'aide_attribuee',
        montantAccorde: montant,
        transactionOM: tx,
      };

      setCompletedTransaction(tx);
      setIsProcessing(false);
      onPaymentSuccess(updatedDemande);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="inpage-view-container">
      {/* En-tête In-Page sans modal */}
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
            <div className="flex items-center gap-2">
              <span className="om-badge-logo">
                <Smartphone className="w-4 h-4" />
                Orange Money Burkina
              </span>
              <span className="modal-eyebrow">MODE SIMULATION — AUCUN TRANSFERT RÉEL</span>
            </div>
            <h2 className="text-xl font-bold text-[#17343B] font-serif mt-1">
              Règlement de la Prise en Charge Solidaire — Dossier #{demande.codeDossier}
            </h2>
          </div>
        </div>

        {completedTransaction ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            Simulation de paiement terminée
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-[#C2410C] rounded-full text-xs font-bold">
            <Clock className="w-4 h-4" />
            Simulation non exécutée
          </span>
        )}
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Détails et Simulation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synthèse de l'opération */}
          <div className="inpage-card">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D6E8E8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF7900] flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17343B]">
                    Ordre de Virement Mobile Money
                  </h3>
                  <span className="text-xs text-[#64748B]">
                    Partenariat Orange Burkina Faso & Programme Brave_her
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#FF7900] bg-orange-50 px-2.5 py-1 rounded-md">
                Frais affichés en simulation : 0 FCFA
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[#64748B] block mb-1 font-medium">Compte Émetteur</span>
                <strong className="text-sm text-[#17343B] block">
                  Fonds de Solidarité Brave_her
                </strong>
                <span className="text-[11px] text-[#007599] font-mono mt-0.5 block">
                  OM Entreprise : +226 76 99 88 00
                </span>
                <span className="text-[11px] text-[#64748B] block mt-1">
                  Opérateur : {currentUser.prenom} {currentUser.nom} ({currentUser.roleTitre})
                </span>
              </div>

              <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-200">
                <span className="text-[#C2410C] block mb-1 font-medium">Compte Destinataire (Marchand)</span>
                <strong className="text-sm text-[#17343B] block">
                  {centre.nom}
                </strong>
                <span className="text-[11px] text-[#C2410C] font-mono font-bold mt-0.5 block">
                  N° Marchand OM : {compteMarchand}
                </span>
                <span className="text-[11px] text-[#64748B] block mt-1">
                  Localisation : {centre.commune} · Tél : {centre.telephone}
                </span>
              </div>
            </div>

            {/* Récapitulatif Patiente */}
            <div className="mt-4 p-3.5 bg-[#F0F9F8] rounded-xl border border-[#D6E8E8] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#007599] text-white flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#007599] font-bold uppercase tracking-wider block">
                    Bénéficiaire de l'examen
                  </span>
                  <strong className="text-sm text-[#17343B]">
                    {demande.patienteNom} {demande.patientePrenom} ({demande.patienteAge} ans)
                  </strong>
                  <span className="text-xs text-[#536B70] block">
                    Tél : {demande.patienteTelephone} · {demande.commune}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#64748B] block">Montant conventionné</span>
                <strong className="text-lg font-bold text-[#007599]">
                  {montant.toLocaleString('fr-FR')} FCFA
                </strong>
              </div>
            </div>

            {/* Action de paiement si non encore réalisé */}
            {!completedTransaction && (
              <div className="mt-6 pt-4 border-t border-[#D6E8E8] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#536B70]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Simulation locale. Aucun appel à l’API Orange Money ni SMS réel n’est envoyé.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecutePayment}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#FF7900' }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? 'Simulation en cours…'
                      : `Simuler un transfert de ${montant.toLocaleString('fr-FR')} FCFA`}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Reçu de démonstration uniquement */}
          {completedTransaction && (
            <div className="om-receipt-card animate-fadeIn">
              <div className="flex items-start justify-between border-b-2 border-dashed border-[#FED7AA] pb-4 mb-4">
                <div>
                  <span className="om-badge-logo">
                    <Smartphone className="w-4 h-4" />
                    Orange Money BF
                  </span>
                  <h4 className="text-base font-bold text-[#17343B] mt-2">
                    Reçu de simulation — sans valeur de paiement
                  </h4>
                  <span className="text-xs text-[#64748B]">
                    Réf Transaction : <strong className="font-mono text-[#17343B]">{completedTransaction.reference}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <QrCode className="w-12 h-12 text-[#17343B]" />
                  </div>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[#17343B] text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                <div>
                  <span className="text-[#64748B] block">Code Autorisation</span>
                  <strong className="font-mono text-[#C2410C] font-bold">
                    {completedTransaction.codeAutorisation}
                  </strong>
                </div>
                <div>
                  <span className="text-[#64748B] block">Date et Heure</span>
                  <strong className="text-[#17343B]">
                    {new Date(completedTransaction.date).toLocaleDateString('fr-FR')} à {new Date(completedTransaction.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </strong>
                </div>
                <div>
                  <span className="text-[#64748B] block">Statut</span>
                  <strong className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Succès (Validé)
                  </strong>
                </div>
                <div>
                  <span className="text-[#64748B] block">Montant Réglé</span>
                  <strong className="text-base font-bold text-[#FF7900]">
                    {completedTransaction.montant.toLocaleString('fr-FR')} FCFA
                  </strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                <strong>Bon de prise en charge valide :</strong> La patiente <strong>{demande.patienteNom} {demande.patientePrenom}</strong> peut se présenter au <strong>{centre.nom}</strong> munie de sa pièce d'identité ou du SMS de confirmation Orange Money pour effectuer sa mammographie sans aucun frais à sa charge.
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite (1/3) : Informations Centre & Partenaire */}
        <div className="space-y-6">
          <div className="inpage-card">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#D6E8E8]">
              <Building className="w-4 h-4 text-[#007599]" />
              <h4 className="text-xs font-bold text-[#17343B] uppercase tracking-wider">
                Centre Partenaire Agréé
              </h4>
            </div>

            <div className="space-y-2.5 text-xs text-[#475569]">
              <div>
                <strong className="block text-sm text-[#17343B] mb-0.5">{centre.nom}</strong>
                <span>{centre.commune}, Burkina Faso</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Délai moyen examen</span>
                <strong className="text-[#17343B]">{centre.delaiMoyenJours} jours</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Compte marchand OM</span>
                <strong className="font-mono text-[#C2410C]">{centre.compteOrangeMoney}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Contact téléphonique</span>
                <strong className="text-[#17343B]">{centre.telephone}</strong>
              </div>
            </div>
          </div>

          <div className="inpage-card bg-[#FFFDF9] border border-amber-200">
            <div className="flex items-start gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Mode démonstration :</strong> cet écran simule le parcours de paiement. Aucun transfert ni fonds de dotation ne sont configurés ici.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
