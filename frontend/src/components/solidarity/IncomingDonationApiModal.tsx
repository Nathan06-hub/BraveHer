import React, { useState, useMemo } from 'react';
import type {
  PartenaireDonneur,
  DonTransaction,
  TypeDon,
} from '../../types/partner';
import {
  X,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Coins,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface IncomingDonationApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  partenaires: PartenaireDonneur[];
  preselectedPartnerId?: string;
  onConfirmDonation: (newDon: DonTransaction) => void;
}

export const IncomingDonationApiModal: React.FC<IncomingDonationApiModalProps> = ({
  isOpen,
  onClose,
  partenaires,
  preselectedPartnerId,
  onConfirmDonation,
}) => {
  // Sélection initiale du partenaire
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    preselectedPartnerId || partenaires[0]?.id || ''
  );

  const [typeDon, setTypeDon] = useState<TypeDon>('api_automatique');
  const [montant, setMontant] = useState<number>(2500000);
  const [customMontant, setCustomMontant] = useState<string>('');
  const [affectation, setAffectation] = useState<
    'fonds_general' | 'cas_graves_specifiques' | 'octobre_rose_campagne'
  >('fonds_general');
  const [message, setMessage] = useState<string>(
    'Versement spontané d’appui au dépistage précoce du cancer du sein.'
  );

  // État de simulation d'envoi API
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'form' | 'payload'>('form');

  // Partenaire sélectionné
  const currentPartner = useMemo(() => {
    return (
      partenaires.find((p) => p.id === selectedPartnerId) || partenaires[0]
    );
  }, [partenaires, selectedPartnerId]);

  // Montant effectif (prédéfini ou personnalisé)
  const effectiveAmount = customMontant ? parseInt(customMontant, 10) || 0 : montant;

  // Référence unique générée
  const referenceGenerated = useMemo(() => {
    const prefix =
      typeDon === 'api_automatique'
        ? 'API-OM-CORP'
        : typeDon === 'orange_money_b2b'
        ? 'OM-B2B-TX'
        : typeDon === 'virement_bancaire'
        ? 'VIR-UEMOA'
        : 'GOV-SUB';
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-2026-${rand}`;
  }, [typeDon]);

  // Payload JSON simulé
  const generatedPayload = useMemo(() => {
    return {
      event: 'corporate.donation.received',
      gateway: 'Orange Money Corporate API v2.4 (Burkina Faso)',
      partner: {
        id: currentPartner?.id,
        name: currentPartner?.nom,
        acronym: currentPartner?.sigle,
        category: currentPartner?.categorie,
      },
      transaction: {
        reference: referenceGenerated,
        amount: effectiveAmount,
        currency: 'XOF (FCFA)',
        type: typeDon,
        affectation: affectation,
        timestamp: new Date().toISOString(),
      },
      security: {
        channel: 'REST Webhook Endpoint',
        signature: 'sha256_9b83f01c4a921d8b76c8e31a...',
        status: 'VERIFIED_AUTHORIZED',
      },
      metadata: {
        note: message,
        platform: 'Soutien Rose BFK — Hackathon Orange',
      },
    };
  }, [currentPartner, referenceGenerated, effectiveAmount, typeDon, affectation, message]);

  if (!isOpen) return null;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedPayload, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmount <= 0) return;

    setIsSimulating(true);

    // Simulation d'une latence réseau réaliste pour le webhook
    setTimeout(() => {
      const newDon: DonTransaction = {
        id: `don-${Date.now()}`,
        partenaireId: currentPartner.id,
        partenaireNom: currentPartner.nom,
        montant: effectiveAmount,
        date: new Date().toISOString(),
        typeDon: typeDon,
        referenceTransaction: referenceGenerated,
        statut: 'confirme',
        affectation: affectation,
        messagePartenaire: message,
        payloadApi: generatedPayload,
      };

      onConfirmDonation(newDon);
      setIsSimulating(false);
      onClose();
    }, 900);
  };

  const amountPresets = [500000, 1000000, 2500000, 5000000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#D6E8E8] w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* En-tête du Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#17343B] via-[#005C75] to-[#007599] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-900 font-bold">
                  B2B API / Webhook
                </span>
                <span className="text-xs text-teal-200">Simulation Hackathon</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Simulateur de Don Entrant Partenaire
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

        {/* Sous-onglets : Paramètres Formulaire vs JSON Payload */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-[#EEF5F5] bg-[#FAFCFC]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'form'
                  ? 'border-[#007599] text-[#007599]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Paramètres du Versement</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payload')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'payload'
                  ? 'border-[#007599] text-[#007599]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4 text-amber-600" />
              <span>Inspecteur Payload JSON Webhook</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            POST /api/v1/partners/donations/webhook
          </div>
        </div>

        {/* Corps du Modal */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* 1. Choix du Partenaire Émetteur */}
              <div>
                <label className="block text-xs font-bold text-[#17343B] mb-1.5">
                  Partenaire Mécène Donneur
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {partenaires.map((p) => {
                    const isSelected = p.id === currentPartner.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPartnerId(p.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
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
                              Solde : {p.soldeDisponible.toLocaleString('fr-FR')} F
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#007599] shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Canal de Versement / Type de Don */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#17343B] mb-1.5">
                    Canal & Passerelle API
                  </label>
                  <select
                    value={typeDon}
                    onChange={(e) => setTypeDon(e.target.value as TypeDon)}
                    className="w-full text-xs rounded-xl border border-[#D6E8E8] p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#007599]/30 focus:border-[#007599]"
                  >
                    <option value="api_automatique">
                      ⚡ Webhook Automatique (Orange Money Corporate)
                    </option>
                    <option value="orange_money_b2b">
                      📱 Orange Money B2B Direct
                    </option>
                    <option value="virement_bancaire">
                      🏦 Virement Bancaire (Coris Bank / UEMOA)
                    </option>
                    <option value="subvention_directe">
                      🏛️ Subvention Directe État / DSME
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17343B] mb-1.5">
                    Affectation du Don
                  </label>
                  <select
                    value={affectation}
                    onChange={(e) =>
                      setAffectation(
                        e.target.value as
                          | 'fonds_general'
                          | 'cas_graves_specifiques'
                          | 'octobre_rose_campagne'
                      )
                    }
                    className="w-full text-xs rounded-xl border border-[#D6E8E8] p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#007599]/30 focus:border-[#007599]"
                  >
                    <option value="fonds_general">Fonds Général de Solidarité</option>
                    <option value="cas_graves_specifiques">
                      🚨 Parrainage Urgent des Cas Graves
                    </option>
                    <option value="octobre_rose_campagne">
                      🌸 Campagne Nationale Octobre Rose
                    </option>
                  </select>
                </div>
              </div>

              {/* 3. Montant du don */}
              <div>
                <label className="block text-xs font-bold text-[#17343B] mb-1.5">
                  Montant du Versement (FCFA)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {amountPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setMontant(preset);
                        setCustomMontant('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        montant === preset && !customMontant
                          ? 'bg-[#007599] text-white shadow-sm'
                          : 'bg-[#FAFCFC] border border-[#D6E8E8] text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {(preset / 1000).toLocaleString('fr-FR')} k F
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    placeholder="Ou saisir un montant personnalisé en FCFA..."
                    value={customMontant}
                    onChange={(e) => setCustomMontant(e.target.value)}
                    className="w-full pl-3 pr-16 py-2.5 text-xs rounded-xl border border-[#D6E8E8] bg-white focus:outline-none focus:ring-2 focus:ring-[#007599]/30 focus:border-[#007599]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    FCFA
                  </span>
                </div>
              </div>

              {/* 4. Message / Note RSE */}
              <div>
                <label className="block text-xs font-bold text-[#17343B] mb-1.5">
                  Motif / Message d'Accompagnement Partenaire
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#D6E8E8] p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#007599]/30 focus:border-[#007599]"
                  placeholder="Ex : Financement exceptionnel pour la prise en charge de 100 mammographies..."
                />
              </div>

              {/* Aperçu de l'impact immédiat */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">
                      Crédit immédiat sur le Fonds de Parrainage
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Permettra de financer environ{' '}
                      <strong>{Math.floor(effectiveAmount / 25000)}</strong> bons de santé
                      (à 25 000 FCFA l'examen).
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Montant total
                  </span>
                  <div className="text-sm font-extrabold text-emerald-800">
                    +{effectiveAmount.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Onglet Inspecteur de Charge Utile JSON */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Généré en temps réel pour l'événement Webhook
                </span>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed shadow-inner max-h-[360px]">
                <pre>{JSON.stringify(generatedPayload, null, 2)}</pre>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Cette charge utile simule fidèlement le contrat d'API fourni par la passerelle Orange Money Corporate et les partenaires bancaires du Burkina Faso.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page du Modal avec boutons d'action */}
        <div className="px-6 py-4 bg-[#FAFCFC] border-t border-[#D6E8E8] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Annuler
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSimulating || effectiveAmount <= 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm transition-all hover:shadow active:scale-[0.98] disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Traitement Webhook...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Déclencher le Webhook (+{effectiveAmount.toLocaleString('fr-FR')} FCFA)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
