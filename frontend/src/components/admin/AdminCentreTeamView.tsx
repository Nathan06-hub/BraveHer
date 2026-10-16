import React, { useState } from 'react';
import type { CurrentUserContext, CentreSante } from '../../types/campaign';
import {
  Users,
  Building2,
  Coins,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Award,
  Smartphone,
  Landmark,
  X,
  Activity,
} from 'lucide-react';

export interface SageFemmeCompte {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  centreId: string;
  centreNom: string;
  statut: 'ACTIF' | 'EN_MISSION' | 'SUSPENDU';
  dateCreation: string;
  depistagesRealises: number;
  bonsEmis: number;
}

export interface DotationStructure {
  id: string;
  structureNom: 'Fondation Orange Burkina Faso' | 'Fondation Coris Bank International' | string;
  typeStructure: 'TELECOM' | 'BANQUE' | 'ONG' | 'ETAT';
  montantTotal: number;
  montantRestant: number;
  annee: number;
  intitule: string;
  coutUnitaireBon: number; // Ex: 25 000 FCFA mammographie
  canalPaiement: 'Orange Money Corporate B2B' | 'Virement Bancaire Coris' | string;
  dateEnregistrement: string;
  referenceConvention: string;
}

interface AdminCentreTeamViewProps {
  currentUser: CurrentUserContext | null;
  centres?: CentreSante[];
  onShowToast?: (msg: string) => void;
}

export const AdminCentreTeamView: React.FC<AdminCentreTeamViewProps> = ({
  currentUser,
  centres: _centres = [],
  onShowToast,
}) => {
  const currentCentreNom = currentUser?.centreNom || 'CSPS de Tanghin (Ouagadougou)';
  const currentCentreId = currentUser?.centreId || 'centre-tanghin';

  // État des sages-femmes du centre (persisté en local)
  const [sagesFemmes, setSagesFemmes] = useState<SageFemmeCompte[]>(() => {
    const saved = localStorage.getItem(`admin_sages_femmes_${currentCentreId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'sf-1',
        nom: 'Ouédraogo',
        prenom: 'Awa',
        telephone: '+226 70 00 00 02',
        email: 'awa.ouedraogo@soutienrose.bf',
        centreId: currentCentreId,
        centreNom: currentCentreNom,
        statut: 'ACTIF',
        dateCreation: '2026-09-15',
        depistagesRealises: 48,
        bonsEmis: 12,
      },
      {
        id: 'sf-2',
        nom: 'Compaoré',
        prenom: 'Fatimata',
        telephone: '+226 70 00 00 06',
        email: 'fatimata.compaore@soutienrose.bf',
        centreId: currentCentreId,
        centreNom: currentCentreNom,
        statut: 'EN_MISSION',
        dateCreation: '2026-10-01',
        depistagesRealises: 31,
        bonsEmis: 7,
      },
      {
        id: 'sf-3',
        nom: 'Sawadogo',
        prenom: 'Mariam',
        telephone: '+226 76 11 22 33',
        email: 'mariam.sawadogo@soutienrose.bf',
        centreId: currentCentreId,
        centreNom: currentCentreNom,
        statut: 'ACTIF',
        dateCreation: '2026-10-10',
        depistagesRealises: 19,
        bonsEmis: 4,
      },
    ];
  });

  // État des dotations annuelles des structures partenaires (Orange, Coris Bank)
  const [dotations, setDotations] = useState<DotationStructure[]>(() => {
    const saved = localStorage.getItem(`admin_dotations_${currentCentreId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'dot-orange-2026',
        structureNom: 'Fondation Orange Burkina Faso',
        typeStructure: 'TELECOM',
        montantTotal: 5000000,
        montantRestant: 3750000,
        annee: 2026,
        intitule: 'Dotation Annuelle Octobre Rose 2026 — Prise en charge Mammographies d\'urgence',
        coutUnitaireBon: 25000,
        canalPaiement: 'Orange Money Corporate B2B',
        dateEnregistrement: '2026-10-01',
        referenceConvention: 'CONV-OM-BFK-2026-089',
      },
      {
        id: 'dot-coris-2026',
        structureNom: 'Fondation Coris Bank International',
        typeStructure: 'BANQUE',
        montantTotal: 2500000,
        montantRestant: 1800000,
        annee: 2026,
        intitule: 'Fonds Inclusion & Santé Maternelle — Subventions Échographies et Soins',
        coutUnitaireBon: 25000,
        canalPaiement: 'Virement Bancaire Coris',
        dateEnregistrement: '2026-10-05',
        referenceConvention: 'CBI-RSE-SANTE-2026-14',
      },
    ];
  });

  const [activeSubTab, setActiveSubTab] = useState<'sages_femmes' | 'dotations_bons'>('sages_femmes');

  // Modals
  const [isAddMidwifeModalOpen, setIsAddMidwifeModalOpen] = useState(false);
  const [isAddGrantModalOpen, setIsAddGrantModalOpen] = useState(false);

  // Formulaire Sage-Femme
  const [sfNom, setSfNom] = useState('');
  const [sfPrenom, setSfPrenom] = useState('');
  const [sfTelephone, setSfTelephone] = useState('+226 ');
  const [sfEmail, setSfEmail] = useState('');
  const [sfPassword, setSfPassword] = useState('Demo@2026');

  // Formulaire Dotation
  const [grantStructure, setGrantStructure] = useState<'Orange' | 'Coris' | 'Autre'>('Orange');
  const [grantStructureNom, setGrantStructureNom] = useState('Fondation Orange Burkina Faso');
  const [grantMontant, setGrantMontant] = useState<number>(5000000);
  const [grantAnnee, setGrantAnnee] = useState<number>(2026);
  const [grantIntitule, setGrantIntitule] = useState('Dotation Annuelle Octobre Rose 2026');
  const [grantRef, setGrantRef] = useState(`CONV-${Date.now().toString().slice(-6)}`);

  // Sauvegarde persistante
  const saveSagesFemmes = (newList: SageFemmeCompte[]) => {
    setSagesFemmes(newList);
    localStorage.setItem(`admin_sages_femmes_${currentCentreId}`, JSON.stringify(newList));
  };

  const saveDotations = (newList: DotationStructure[]) => {
    setDotations(newList);
    localStorage.setItem(`admin_dotations_${currentCentreId}`, JSON.stringify(newList));
  };

  // Création Sage-Femme
  const handleCreateSageFemme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sfNom.trim() || !sfPrenom.trim() || !sfEmail.trim()) {
      alert('Veuillez renseigner au moins le nom, prénom et l\'adresse e-mail.');
      return;
    }

    const newSf: SageFemmeCompte = {
      id: `sf-${Date.now()}`,
      nom: sfNom.trim().toUpperCase(),
      prenom: sfPrenom.trim(),
      telephone: sfTelephone.trim() || '+226 70 00 00 00',
      email: sfEmail.trim().toLowerCase(),
      centreId: currentCentreId,
      centreNom: currentCentreNom,
      statut: 'ACTIF',
      dateCreation: new Date().toISOString().split('T')[0],
      depistagesRealises: 0,
      bonsEmis: 0,
    };

    const updated = [newSf, ...sagesFemmes];
    saveSagesFemmes(updated);
    setIsAddMidwifeModalOpen(false);

    // Reset form
    setSfNom('');
    setSfPrenom('');
    setSfTelephone('+226 ');
    setSfEmail('');
    setSfPassword('Demo@2026');

    if (onShowToast) {
      onShowToast(`Compte créé avec succès pour la sage-femme ${newSf.prenom} ${newSf.nom} !`);
    } else {
      alert(`Compte créé avec succès ! Identifiant : ${newSf.email} | Mot de passe : ${sfPassword}`);
    }
  };

  // Enregistrement Dotation
  const handleCreateDotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (grantMontant <= 0) {
      alert('Le montant de la dotation doit être supérieur à 0.');
      return;
    }

    let partnerName = grantStructureNom;
    let partnerType: DotationStructure['typeStructure'] = 'TELECOM';
    let canal = 'Orange Money Corporate B2B';

    if (grantStructure === 'Orange') {
      partnerName = 'Fondation Orange Burkina Faso';
      partnerType = 'TELECOM';
      canal = 'Orange Money Corporate B2B';
    } else if (grantStructure === 'Coris') {
      partnerName = 'Fondation Coris Bank International';
      partnerType = 'BANQUE';
      canal = 'Virement Bancaire Coris';
    }

    const newDotation: DotationStructure = {
      id: `dot-${Date.now()}`,
      structureNom: partnerName,
      typeStructure: partnerType,
      montantTotal: Number(grantMontant),
      montantRestant: Number(grantMontant),
      annee: Number(grantAnnee),
      intitule: grantIntitule.trim(),
      coutUnitaireBon: 25000,
      canalPaiement: canal,
      dateEnregistrement: new Date().toISOString().split('T')[0],
      referenceConvention: grantRef.trim(),
    };

    const updated = [newDotation, ...dotations];
    saveDotations(updated);
    setIsAddGrantModalOpen(false);

    if (onShowToast) {
      onShowToast(`Dotation de ${Number(grantMontant).toLocaleString('fr-FR')} FCFA enregistrée pour ${partnerName} !`);
    } else {
      alert(`Dotation de ${Number(grantMontant).toLocaleString('fr-FR')} FCFA enregistrée avec succès.`);
    }
  };

  // Calculs totaux
  const totalFondsAlloues = dotations.reduce((acc, d) => acc + d.montantTotal, 0);
  const totalFondsRestants = dotations.reduce((acc, d) => acc + d.montantRestant, 0);
  const totalBonsDisponibles = Math.floor(totalFondsRestants / 25000);
  const totalBonsEmis = sagesFemmes.reduce((acc, sf) => acc + sf.bonsEmis, 0);
  const totalDepistagesCentre = sagesFemmes.reduce((acc, sf) => acc + sf.depistagesRealises, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête Espace Administrateur */}
      <div className="bg-gradient-to-r from-[#17343B] via-[#0F4A57] to-[#007599] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 backdrop-blur-3xl -skew-x-12 transform translate-x-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-[#7DE2D1] border border-white/20 uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Espace Contrôle Administrateur
              </span>
              <span className="text-xs text-white/80 font-mono">
                Session active : {currentUser?.prenom || 'Admin'} {currentUser?.nom || 'Kaboré'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-serif flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-[#7DE2D1]" />
              <span>{currentCentreNom}</span>
            </h1>
            <p className="text-sm text-white/85 max-w-2xl leading-relaxed">
              Supervision du personnel médical de terrain et gestion des dotations financières annuelles allouées par les partenaires (Orange, Coris Bank) pour les bons de santé.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddMidwifeModalOpen(true)}
              className="px-4 py-2.5 bg-white text-[#17343B] hover:bg-slate-50 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#007599]" />
              <span>+ Nouvelle Sage-Femme</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddGrantModalOpen(true)}
              className="px-4 py-2.5 bg-[#007599] hover:bg-[#005C75] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Coins className="w-4 h-4" />
              <span>+ Enregistrer Dotation Annuelle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cartes KPIs Centre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Sages-Femmes Actives */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
              Sages-Femmes du Centre
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#17343B]">{sagesFemmes.length}</span>
              <span className="text-xs text-emerald-600 font-bold">actives</span>
            </div>
            <span className="text-[11px] text-slate-400">Rattachées au {currentCentreNom}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#007599]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 : Bons de Mammographie Disponibles */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
              Bons de Santé Prêts à Émettre
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#007599]">{totalBonsDisponibles}</span>
              <span className="text-xs text-slate-500">bons (25 000 F)</span>
            </div>
            <span className="text-[11px] text-slate-400">Financés par Orange & Coris</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#007599]">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 : Trésorerie Dotations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
              Dotations Annuelles 2026
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-[#17343B]">
                {totalFondsRestants.toLocaleString('fr-FR')}
              </span>
              <span className="text-xs text-slate-500 font-semibold">FCFA</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Sur {totalFondsAlloues.toLocaleString('fr-FR')} FCFA alloués
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 : Dépistages & Prises en Charge */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
              Impact Clinique Réalisé
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#17343B]">{totalDepistagesCentre}</span>
              <span className="text-xs text-rose-600 font-bold">{totalBonsEmis} bons émis</span>
            </div>
            <span className="text-[11px] text-slate-400">Femmes dépistées et orientées</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barre de navigation d'onglets Admin */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('sages_femmes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'sages_femmes'
              ? 'bg-[#17343B] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestion des Sages-Femmes ({sagesFemmes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('dotations_bons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'dotations_bons'
              ? 'bg-[#17343B] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Dotations Annuelles des Partenaires ({dotations.length})</span>
        </button>
      </div>

      {/* CONTENU ONGLET 1 : GESTION DES SAGES-FEMMES */}
      {activeSubTab === 'sages_femmes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-[#17343B] m-0">
                Personnel de Dépistage Rattaché au Centre
              </h2>
              <p className="text-xs text-slate-500 m-0">
                Chaque sage-femme enregistrée dispose de ses identifiants uniques pour accéder à la dictée vocale, émettre des bons et inscrire les patientes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddMidwifeModalOpen(true)}
              className="px-3.5 py-2 bg-[#007599] hover:bg-[#005f7c] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer un Compte Sage-Femme</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="p-3.5">Sage-Femme</th>
                    <th className="p-3.5">Identifiants Connexion</th>
                    <th className="p-3.5">Centre Médical</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-center">Dépistages Réalisés</th>
                    <th className="p-3.5 text-center">Bons de Santé Émis</th>
                    <th className="p-3.5 text-right">Date Inscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {sagesFemmes.map((sf) => (
                    <tr key={sf.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 text-[#007599] font-bold flex items-center justify-center text-xs shadow-inner">
                            {sf.prenom[0]}
                            {sf.nom[0]}
                          </div>
                          <div>
                            <span className="font-bold text-[#17343B] block">
                              Mme {sf.prenom} {sf.nom}
                            </span>
                            <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                              Sage-Femme Diplômée d'État
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sf.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sf.telephone}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#007599]" />
                          <span>{sf.centreNom}</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        {sf.statut === 'ACTIF' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Active (Au centre)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            En Mission Rurale
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="font-bold text-[#17343B] text-sm">
                          {sf.depistagesRealises}
                        </span>
                        <span className="text-[10px] text-slate-400 block">patientes</span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="font-bold text-[#007599] text-sm">
                          {sf.bonsEmis}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Orange / Coris</span>
                      </td>

                      <td className="p-3.5 text-right font-mono text-slate-500 text-[11px]">
                        {sf.dateCreation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 2 : DOTATIONS ANNUELLES ET BONS */}
      {activeSubTab === 'dotations_bons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-[#17343B] m-0">
                Dotations Annuelles Reçues des Mécènes (Orange & Coris Bank)
              </h2>
              <p className="text-xs text-slate-500 m-0">
                Ces montants alimentent directement la réserve financière permettant aux sages-femmes d'émettre des bons de mammographie (25 000 FCFA/bon) sans avance de frais.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddGrantModalOpen(true)}
              className="px-3.5 py-2 bg-[#007599] hover:bg-[#005C75] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enregistrer une Dotation Annuelle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dotations.map((dot) => {
              const totalBonsDotation = Math.floor(dot.montantTotal / dot.coutUnitaireBon);
              const bonsRestants = Math.floor(dot.montantRestant / dot.coutUnitaireBon);
              const percentUtilise = Math.round(
                ((dot.montantTotal - dot.montantRestant) / dot.montantTotal) * 100
              );

              const isOrange = dot.typeStructure === 'TELECOM';

              return (
                <div
                  key={dot.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm space-y-4 transition-all hover:shadow-md ${
                    isOrange ? 'border-teal-200' : 'border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                          isOrange ? 'bg-[#007599]' : 'bg-[#004B87]'
                        }`}
                      >
                        {isOrange ? (
                          <Smartphone className="w-6 h-6" />
                        ) : (
                          <Landmark className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Édition Annuelle {dot.annee}
                        </span>
                        <h3 className="text-base font-bold text-[#17343B] leading-snug">
                          {dot.structureNom}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isOrange
                          ? 'bg-teal-50 text-[#005C75] border border-teal-200'
                          : 'bg-blue-50 text-[#004B87] border border-blue-200'
                      }`}
                    >
                      {dot.canalPaiement}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {dot.intitule}
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Bons de santé engagés</span>
                      <span className="font-bold text-[#17343B]">
                        {totalBonsDotation - bonsRestants} / {totalBonsDotation} bons ({percentUtilise}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOrange ? 'bg-[#007599]' : 'bg-[#004B87]'
                        }`}
                        style={{ width: `${percentUtilise}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Montant Initial Alloué</span>
                      <strong className="text-sm font-bold text-[#17343B]">
                        {dot.montantTotal.toLocaleString('fr-FR')} FCFA
                      </strong>
                    </div>

                    <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                      <span className="text-emerald-700 text-[10px] font-semibold block">
                        Solde Disponible
                      </span>
                      <strong className="text-sm font-bold text-emerald-800">
                        {dot.montantRestant.toLocaleString('fr-FR')} FCFA
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="font-mono">Réf: {dot.referenceConvention}</span>
                    <span>Enregistré le {dot.dateEnregistrement}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1 : CRÉATION SAGE-FEMME */}
      {isAddMidwifeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#007599] uppercase tracking-wider block">
                  Administration Médicale
                </span>
                <h3 className="text-lg font-bold text-[#17343B] font-serif">
                  Créer un Compte Sage-Femme
                </h3>
                <span className="text-xs text-slate-500">
                  Rattachement automatique au {currentCentreNom}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMidwifeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSageFemme} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={sfPrenom}
                    onChange={(e) => setSfPrenom(e.target.value)}
                    placeholder="Ex: Awa"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#007599]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={sfNom}
                    onChange={(e) => setSfNom(e.target.value)}
                    placeholder="Ex: Ouédraogo"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#007599]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse e-mail professionnelle *
                </label>
                <input
                  type="email"
                  required
                  value={sfEmail}
                  onChange={(e) => setSfEmail(e.target.value)}
                  placeholder="awa.ouedraogo@soutienrose.bf"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#007599]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Numéro de téléphone (+226) *
                </label>
                <input
                  type="text"
                  required
                  value={sfTelephone}
                  onChange={(e) => setSfTelephone(e.target.value)}
                  placeholder="+226 70 00 00 00"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#007599]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mot de passe initial de connexion
                </label>
                <input
                  type="text"
                  value={sfPassword}
                  onChange={(e) => setSfPassword(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono bg-slate-50 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  La sage-femme pourra modifier son mot de passe lors de sa première connexion.
                </span>
              </div>

              <div className="bg-teal-50 p-3 rounded-xl border border-teal-100 text-xs text-teal-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Ce compte permettra à la sage-femme d'enregistrer des patientes, de dicter des évaluations médicales et d'émettre des bons de mammographie prépayés par Orange et Coris.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMidwifeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#007599] hover:bg-[#005f7c] rounded-lg shadow-sm"
                >
                  Créer et Activer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : ENREGISTRER UNE DOTATION ANNUELLE (ORANGE / CORIS) */}
      {isAddGrantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#007599] uppercase tracking-wider block">
                  Financement & Solidarité
                </span>
                <h3 className="text-lg font-bold text-[#17343B] font-serif">
                  Enregistrer une Dotation Annuelle
                </h3>
                <span className="text-xs text-slate-500">
                  Octroi de fonds par les structures mécènes (Orange, Coris Bank)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddGrantModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDotation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Structure Partenaire Donatrice *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGrantStructure('Orange');
                      setGrantStructureNom('Fondation Orange Burkina Faso');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      grantStructure === 'Orange'
                        ? 'border-[#007599] bg-teal-50 text-[#005C75] font-bold ring-2 ring-teal-200'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-[#007599]" />
                    <span className="text-xs">Fondation Orange BF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGrantStructure('Coris');
                      setGrantStructureNom('Fondation Coris Bank International');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      grantStructure === 'Coris'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-200'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Landmark className="w-5 h-5 text-[#004B87]" />
                    <span className="text-xs">Coris Bank Fondation</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Montant total de la dotation (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  min={100000}
                  step={50000}
                  value={grantMontant}
                  onChange={(e) => setGrantMontant(Number(e.target.value))}
                  className="w-full text-sm font-bold p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#007599]"
                />
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                  Permet de financer environ {Math.floor(grantMontant / 25000)} bons de mammographie d'urgence (à 25 000 FCFA/bon).
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Année d'exercice *</label>
                  <input
                    type="number"
                    value={grantAnnee}
                    onChange={(e) => setGrantAnnee(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Réf Convention</label>
                  <input
                    type="text"
                    value={grantRef}
                    onChange={(e) => setGrantRef(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intitulé du programme / action</label>
                <input
                  type="text"
                  value={grantIntitule}
                  onChange={(e) => setGrantIntitule(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddGrantModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#007599] hover:bg-[#005C75] rounded-lg shadow-sm"
                >
                  Enregistrer la Dotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCentreTeamView;
