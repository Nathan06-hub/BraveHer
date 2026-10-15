import React, { useState, useMemo } from 'react';
import type {
  Beneficiaire,
  BeneficiairesKPIs,
  NiveauSuspicion,
  StatutVulnerabilite,
  StatutDepistage,
} from '../../types/beneficiary';
import type { CurrentUserContext } from '../../types/campaign';
import {
  SuspicionBadge,
  VulnerabilityBadge,
  ScreeningStatusBadge,
} from './BeneficiaryBadges';
import './beneficiaries.css';
import {
  Users,
  HeartHandshake,
  AlertTriangle,
  Activity,
  Search,
  X,
  Plus,
  Stethoscope,
  Phone,
  MapPin,
  Calendar,
  Eye,
  CreditCard,
} from 'lucide-react';

interface BeneficiariesDashboardProps {
  beneficiaires: Beneficiaire[];
  kpis: BeneficiairesKPIs;
  currentUser: CurrentUserContext;
  onRegisterNewPatient: () => void;
  onStartTriage: (patient: Beneficiaire) => void;
  onViewProfile: (patient: Beneficiaire) => void;
  onRequestSolidarity: (patient: Beneficiaire) => void;
}

export const BeneficiariesDashboard: React.FC<BeneficiariesDashboardProps> = ({
  beneficiaires,
  kpis,
  currentUser,
  onRegisterNewPatient,
  onStartTriage,
  onViewProfile,
  onRequestSolidarity,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<NiveauSuspicion | 'tous'>('tous');
  const [selectedVulnerability, setSelectedVulnerability] = useState<
    StatutVulnerabilite | 'tous'
  >('tous');
  const [selectedLanguage, setSelectedLanguage] = useState<string | 'tous'>('tous');
  const [selectedStatus, setSelectedStatus] = useState<StatutDepistage | 'tous'>('tous');

  // Filtrage multi-critères
  const filteredBeneficiaires = useMemo(() => {
    return beneficiaires.filter((b) => {
      if (selectedRisk !== 'tous') {
        const risk = b.dernierTriage ? b.dernierTriage.niveauSuspicion : 'non_evalue';
        if (risk !== selectedRisk) return false;
      }

      if (selectedVulnerability !== 'tous' && b.statutVulnerabilite !== selectedVulnerability) {
        return false;
      }

      if (selectedLanguage !== 'tous' && b.languePreferee !== selectedLanguage) {
        return false;
      }

      if (selectedStatus !== 'tous' && b.statutDepistage !== selectedStatus) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = `${b.prenom} ${b.nom}`.toLowerCase().includes(q);
        const matchCode = b.numeroDossier.toLowerCase().includes(q);
        const matchTel = b.telephone.includes(q);
        const matchCommune = b.commune.toLowerCase().includes(q);
        const matchCentre = b.centreSuiviNom.toLowerCase().includes(q);

        if (!matchName && !matchCode && !matchTel && !matchCommune && !matchCentre) {
          return false;
        }
      }

      return true;
    });
  }, [
    beneficiaires,
    selectedRisk,
    selectedVulnerability,
    selectedLanguage,
    selectedStatus,
    search,
  ]);

  const highRiskCount = beneficiaires.filter(
    (b) => b.dernierTriage?.niveauSuspicion === 'eleve'
  ).length;

  const pdiCount = beneficiaires.filter(
    (b) => b.statutVulnerabilite === 'PDI' || b.statutVulnerabilite === 'Vulnerable'
  ).length;

  return (
    <div className="beneficiaries-container">
      {/* En-tête */}
      <div className="beneficiaries-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="modal-eyebrow">MODULE 2 · TRIAGE CLINIQUE & SUIVI TERRAIN</span>
            <span className="text-[11px] text-[#007599] font-medium bg-[#EEF7F7] px-2 py-0.5 rounded-full">
              Agent actif : {currentUser.prenom} {currentUser.nom}
            </span>
          </div>
          <h2 className="beneficiaries-title font-serif">
            Bénéficiaires & Suivi des Patientes
          </h2>
          <p className="beneficiaries-subtitle">
            Triage clinique intelligent par IA, enregistrement mobile en langues locales (Mooré, Dioula, Fulfuldé) et continuité de soins pour les femmes du Burkina Faso.
          </p>
        </div>

        <button
          type="button"
          className="btn-create-campaign"
          onClick={onRegisterNewPatient}
        >
          <Plus className="w-5 h-5" />
          <span>Enregistrer une Patiente</span>
        </button>
      </div>

      {/* Cartes KPI */}
      <div className="beneficiaries-kpi-grid">
        {/* KPI 1 : Total Patientes */}
        <div className="beneficiaries-kpi-card teal">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Patientes Suivies
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F4F7] text-[#007599] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#17343B]">
            {beneficiaires.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">
            {kpis.totalPatientes} répertoriées au niveau national
          </span>
        </div>

        {/* KPI 2 : Dépistages Effectués */}
        <div className="beneficiaries-kpi-card amber">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Dépistages Faits
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-800">
            {beneficiaires.filter((b) => b.statutDepistage === 'Effectué').length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">
            Palpation clinique bilatérale réalisée
          </span>
        </div>

        {/* KPI 3 : Cas Suspects Élevés */}
        <div className="beneficiaries-kpi-card rose">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Cas Risque Élevé
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {highRiskCount} cas
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">
            Orientation mammographie sous 72h
          </span>
        </div>

        {/* KPI 4 : Femmes PDI / Vulnérables */}
        <div className="beneficiaries-kpi-card purple">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Femmes PDI / Vulnérables
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {pdiCount}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">
            Éligibles au Fonds de Solidarité Orange Money
          </span>
        </div>
      </div>

      {/* Barre de Recherche et Filtres Avancés */}
      <div className="p-4 bg-white rounded-xl border border-[#D6E8E8] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par nom, N° dossier, téléphone, commune, CSPS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap">
            {filteredBeneficiaires.length} patiente{filteredBeneficiaires.length > 1 ? 's' : ''} trouvée{filteredBeneficiaires.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Filtres par tags */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] mb-1">
              Suspicion Clinique (Triage)
            </label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#007599] bg-white font-medium"
            >
              <option value="tous">Tous les niveaux</option>
              <option value="eleve">🔴 Risque Élevé</option>
              <option value="modere">🟡 Vigilance (Modéré)</option>
              <option value="faible">🟢 Normal (Faible)</option>
              <option value="non_evalue">⚪ Non évalué</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] mb-1">
              Vulnérabilité / Situation
            </label>
            <select
              value={selectedVulnerability}
              onChange={(e) => setSelectedVulnerability(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#007599] bg-white font-medium"
            >
              <option value="tous">Toutes situations</option>
              <option value="PDI">PDI (Déplacée Interne)</option>
              <option value="Vulnerable">Femme Vulnérable</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] mb-1">
              Langue locale
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#007599] bg-white font-medium"
            >
              <option value="tous">Toutes les langues</option>
              <option value="Mooré">Mooré</option>
              <option value="Dioula">Dioula</option>
              <option value="Fulfuldé">Fulfuldé</option>
              <option value="Français">Français</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] mb-1">
              Statut Dépistage
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#007599] bg-white font-medium"
            >
              <option value="tous">Tous statuts</option>
              <option value="Effectué">Effectué</option>
              <option value="Planifié">Planifié</option>
              <option value="À orienter">À orienter</option>
              <option value="Refusé">Refusé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des Patientes */}
      <div className="patient-table-wrapper">
        <table className="patient-table">
          <thead>
            <tr>
              <th>Patiente & N° Dossier</th>
              <th>Contact & Langue</th>
              <th>Situation</th>
              <th>Centre de Suivi</th>
              <th>Dépistage</th>
              <th>Triage Clinique IA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBeneficiaires.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500 text-xs">
                  Aucune patiente ne correspond aux filtres appliqués.
                </td>
              </tr>
            ) : (
              filteredBeneficiaires.map((pat) => {
                const triage = pat.dernierTriage;
                const evaluation = pat.derniereEvaluation;
                const isHighRisk =
                  evaluation?.niveauRisque === 'ELEVE' || triage?.niveauSuspicion === 'eleve';
                const riskLevel: any = evaluation
                  ? (evaluation.niveauRisque.toLowerCase() as any)
                  : triage?.niveauSuspicion;
                const scoreValue = evaluation ? evaluation.scoreIA : triage?.scoreCalcule;

                return (
                  <tr
                    key={pat.id}
                    className={isHighRisk ? 'row-high-risk' : ''}
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-[#EEF7F7] text-[#007599]'
                          }`}
                        >
                          {pat.prenom.charAt(0)}
                          {pat.nom.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-xs text-[#17343B] block">
                            {pat.nom} {pat.prenom}
                          </strong>
                          <span className="text-[11px] text-[#64748B] font-mono block">
                            {pat.numeroDossier} · {pat.age} ans
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="text-xs">
                        <span className="flex items-center gap-1 text-[#17343B] font-medium">
                          <Phone className="w-3 h-3 text-[#007599]" />
                          {pat.telephone}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-[#64748B] flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {pat.commune}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                            {pat.languePreferee}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <VulnerabilityBadge statut={pat.statutVulnerabilite} />
                    </td>

                    <td>
                      <span className="text-xs text-[#17343B] block font-medium">
                        {pat.centreSuiviNom}
                      </span>
                      {pat.campagneNom && (
                        <span className="text-[10px] text-[#007599] block">
                          {pat.campagneNom}
                        </span>
                      )}
                    </td>

                    <td>
                      <ScreeningStatusBadge statut={pat.statutDepistage} />
                      <span className="text-[10px] text-[#64748B] block mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {pat.dateSensibilisation}
                      </span>
                    </td>

                    <td>
                      {riskLevel || scoreValue !== undefined ? (
                        <div className="space-y-1">
                          <SuspicionBadge
                            niveau={riskLevel || 'faible'}
                            size="sm"
                          />
                          <div className="text-[10px] text-[#64748B] flex items-center gap-1">
                            <span>Score IA :</span>
                            <strong
                              className={`font-mono ${
                                (scoreValue ?? 0) >= 70
                                  ? 'text-rose-700'
                                  : (scoreValue ?? 0) >= 35
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {scoreValue ?? 0}/100
                            </strong>
                          </div>
                          {evaluation?.bonSanteDeclenche && (
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 border border-orange-200">
                              Bon Santé
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Non examiné
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Bouton Triage Clinique IA */}
                        <button
                          type="button"
                          className="btn-triage-action"
                          onClick={() => onStartTriage(pat)}
                          title="Effectuer ou réviser l'examen de triage clinique par IA"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Triage IA</span>
                        </button>

                        {/* Bouton Passerelle Solidarité Orange Money si cas suspect */}
                        {(isHighRisk || pat.statutVulnerabilite === 'PDI' || pat.statutVulnerabilite === 'Vulnerable') && (
                          <button
                            type="button"
                            className="btn-solidarity-action"
                            onClick={() => onRequestSolidarity(pat)}
                            title="Créer une demande d'aide financière Orange Money pour mammographie"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Aide OM</span>
                          </button>
                        )}

                        {/* Bouton Profil complet */}
                        <button
                          type="button"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                          onClick={() => onViewProfile(pat)}
                          title="Consulter la fiche patiente complète"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
