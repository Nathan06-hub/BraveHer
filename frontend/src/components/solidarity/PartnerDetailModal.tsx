import React, { useState } from 'react';
import type {
  PartenaireDonneur,
  DonTransaction,
  AppelAideCasGrave,
} from '../../types/partner';
import {
  X,
  Building2,
  CheckCircle2,
  Zap,
  Heart,
  Coins,
  Phone,
  Mail,
  Code2,
  FileText,
} from 'lucide-react';

interface PartnerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  partenaire: PartenaireDonneur | null;
  dons: DonTransaction[];
  appelsAide: AppelAideCasGrave[];
  onSimulateDonation: (partenaire: PartenaireDonneur) => void;
  onSponsorPatient: (partenaire: PartenaireDonneur) => void;
}

export const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({
  isOpen,
  onClose,
  partenaire,
  dons,
  appelsAide,
  onSimulateDonation,
  onSponsorPatient,
}) => {
  const [activeTab, setActiveTab] = useState<'convention' | 'dons' | 'patientes'>('convention');

  if (!isOpen || !partenaire) return null;

  // Filtrer les dons et appels pour ce partenaire
  const partnerDons = dons.filter((d) => d.partenaireId === partenaire.id);
  const partnerAppels = appelsAide.filter(
    (a) => a.partenaireCibleId === partenaire.id
  );

  const percentAvailable =
    partenaire.totalDonsVerses > 0
      ? Math.round((partenaire.soldeDisponible / partenaire.totalDonsVerses) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#D6E8E8] w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* En-tête de la fiche partenaire */}
        <div className="p-6 bg-gradient-to-r from-[#17343B] via-[#005C75] to-[#007599] text-white flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-extrabold text-white shadow-inner shrink-0">
                {partenaire.sigle.substring(0, 4)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-white">
                    {partenaire.nom}
                  </h3>
                  {partenaire.conventionActive && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Convention Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-teal-100">
                  <span className="capitalize">{partenaire.categorie.replace(/_/g, ' ')}</span>
                  <span>•</span>
                  <span>Partenaire depuis le {new Date(partenaire.datePartenariat).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Métriques clés en bandeau */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/15">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-semibold text-teal-200 block">
                Total Versé
              </span>
              <strong className="text-base font-bold text-white">
                {partenaire.totalDonsVerses.toLocaleString('fr-FR')} FCFA
              </strong>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-semibold text-teal-200 block">
                Solde Disponible
              </span>
              <strong className="text-base font-bold text-emerald-300">
                {partenaire.soldeDisponible.toLocaleString('fr-FR')} FCFA
              </strong>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-semibold text-teal-200 block">
                Patientes Parrainées
              </span>
              <strong className="text-base font-bold text-pink-200">
                {partenaire.nombrePatientesParrainees} femmes
              </strong>
            </div>
          </div>
        </div>

        {/* Sous-onglets de navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#EEF5F5] bg-[#FAFCFC]">
          <button
            type="button"
            onClick={() => setActiveTab('convention')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'convention'
                ? 'border-[#007599] text-[#007599]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Convention & Contact</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dons')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'dons'
                ? 'border-[#007599] text-[#007599]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Historique des Dons ({partnerDons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('patientes')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'patientes'
                ? 'border-[#007599] text-[#007599]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4 text-[#D8638A]" />
            <span>Appels & Parrainages ({partnerAppels.length})</span>
          </button>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'convention' && (
            <div className="flex flex-col gap-5">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-[#17343B] uppercase tracking-wider mb-1.5">
                  Mission & Périmètre du Partenariat
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-[#FAFCFC] p-3.5 rounded-2xl border border-[#EEF5F5]">
                  {partenaire.description}
                </p>
              </div>

              {/* Jauge financière */}
              <div className="bg-[#FAFCFC] p-4 rounded-2xl border border-[#EEF5F5]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-700">Taux d'utilisation du fonds</span>
                  <span className="font-bold text-[#007599]">{100 - percentAvailable}% engagé</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#007599] h-full rounded-full transition-all"
                    style={{ width: `${percentAvailable}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                  <span>Solde restant : {partenaire.soldeDisponible.toLocaleString('fr-FR')} FCFA</span>
                  <span>Dotation cumulée : {partenaire.totalDonsVerses.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Contact officiel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl border border-[#D6E8E8] bg-white">
                  <h4 className="text-xs font-bold text-[#17343B] mb-2 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#007599]" />
                    Interlocuteur Officiel
                  </h4>
                  <div className="text-xs text-slate-700 font-medium">
                    {partenaire.contactNom}
                  </div>
                  <div className="flex flex-col gap-1 text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {partenaire.contactTelephone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" /> {partenaire.contactEmail}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-[#D6E8E8] bg-white">
                  <h4 className="text-xs font-bold text-[#17343B] mb-2 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-amber-600" />
                    Intégration API & Passerelle
                  </h4>
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold">Endpoint : </span>
                    <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                      {partenaire.apiEndpoint || 'Webhook B2B non configuré'}
                    </code>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
                    <span>Clé API : <code>{partenaire.apiKeyPrefix || '••••••••'}</code></span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      REST / HMAC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dons' && (
            <div className="flex flex-col gap-3">
              {partnerDons.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Aucun don enregistré pour ce partenaire.
                </div>
              ) : (
                partnerDons.map((don) => (
                  <div
                    key={don.id}
                    className="p-3.5 rounded-2xl border border-[#D6E8E8] bg-white flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-800">
                          {don.referenceTransaction}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                          {don.typeDon.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {don.messagePartenaire || 'Versement d’appui'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        🕒 {new Date(don.date).toLocaleString('fr-FR')}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-emerald-700">
                        +{don.montant.toLocaleString('fr-FR')} FCFA
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">
                        ✓ Validé
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'patientes' && (
            <div className="flex flex-col gap-3">
              {partnerAppels.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Aucun appel d'aide n'a encore été transmis à ce partenaire.
                </div>
              ) : (
                partnerAppels.map((appel) => (
                  <div
                    key={appel.id}
                    className="p-4 rounded-2xl border border-[#D6E8E8] bg-white flex flex-col gap-2 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-[#17343B] text-white px-2 py-0.5 rounded">
                          {appel.codeDossier}
                        </span>
                        <strong className="text-xs text-slate-800">
                          {appel.patienteCodeAnonymise} ({appel.patienteAge} ans)
                        </strong>
                      </div>

                      <div className="text-xs font-bold text-[#007599]">
                        {appel.montantNecessaire.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">
                      🩺 {appel.descriptionMedicale}
                    </p>

                    {appel.bonSanteCode && (
                      <div className="mt-1 text-xs text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center justify-between">
                        <span>Bon de Santé émis : <strong>{appel.bonSanteCode}</strong></span>
                        <span className="text-[10px] uppercase font-bold text-emerald-600">Pris en charge 100%</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Pied de page du Modal avec actions directes */}
        <div className="px-6 py-4 bg-[#FAFCFC] border-t border-[#D6E8E8] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Fermer
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSimulateDonation(partenaire);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Tester Don API</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSponsorPatient(partenaire);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-[#D8638A] to-[#B8456C] hover:from-[#B8456C] hover:to-[#963454] text-white rounded-xl shadow-sm transition-all"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Parrainer un Cas Grave</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
