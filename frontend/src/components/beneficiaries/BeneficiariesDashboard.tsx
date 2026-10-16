import React, { useState, useMemo } from 'react';
import type {
  Beneficiaire,
  BeneficiairesKPIs,
} from '../../types/beneficiary';
import type { CurrentUserContext } from '../../types/campaign';
import {
  KpiCard,
  SearchInput,
  EmptyState,
  ClinicalRiskBadge,
  PatientVulnerabilityBadge,
} from '../ui';
import { PatientFilters, type PatientFilterTab } from './PatientFilters';
import './beneficiaries.css';
import {
  Users,
  HeartHandshake,
  AlertTriangle,
  Activity,
  Plus,
  Phone,
  MapPin,
  Eye,
  CreditCard,
  Building2,
} from 'lucide-react';

interface BeneficiariesDashboardProps {
  beneficiaires: Beneficiaire[];
  kpis: BeneficiairesKPIs;
  currentUser: CurrentUserContext;
  onRegisterNewPatient: () => void;
  onStartTriage?: (patient: Beneficiaire) => void;
  onViewProfile: (patient: Beneficiaire) => void;
  onRequestSolidarity: (patient: Beneficiaire) => void;
}

export const BeneficiariesDashboard: React.FC<BeneficiariesDashboardProps> = ({
  beneficiaires,
  kpis,
  currentUser,
  onRegisterNewPatient,
  onStartTriage: _onStartTriage,
  onViewProfile,
  onRequestSolidarity,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<PatientFilterTab>('tous');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('toutes');
  const [selectedCommune, setSelectedCommune] = useState<string>('toutes');

  // Liste unique des communes pour le filtre
  const communesList = useMemo(() => {
    const set = new Set<string>();
    beneficiaires.forEach((b) => {
      if (b.commune) set.add(b.commune);
    });
    return Array.from(set).sort();
  }, [beneficiaires]);

  // Calcul dynamique des compteurs de filtres
  const filterCounts = useMemo(() => {
    let risqueEleve = 0;
    let vigilance = 0;
    let vulnerables = 0;
    let depistees = 0;

    beneficiaires.forEach((b) => {
      const evaluation = b.derniereEvaluation;
      const triage = b.dernierTriage;
      const isHigh = evaluation?.niveauRisque === 'ELEVE' || triage?.niveauSuspicion === 'eleve';
      const isModere = evaluation?.niveauRisque === 'MODERE' || triage?.niveauSuspicion === 'modere';

      if (isHigh) risqueEleve++;
      if (isModere) vigilance++;
      if (b.statutVulnerabilite === 'PDI' || b.statutVulnerabilite === 'Vulnerable') {
        vulnerables++;
      }
      if (b.statutDepistage === 'Effectué') {
        depistees++;
      }
    });

    return {
      total: beneficiaires.length,
      risqueEleve,
      vigilance,
      vulnerables,
      depistees,
    };
  }, [beneficiaires]);

  // Filtrage combiné (Tab + Langue + Commune + Recherche)
  const filteredBeneficiaires = useMemo(() => {
    return beneficiaires.filter((b) => {
      const evaluation = b.derniereEvaluation;
      const triage = b.dernierTriage;
      const isHigh = evaluation?.niveauRisque === 'ELEVE' || triage?.niveauSuspicion === 'eleve';
      const isModere = evaluation?.niveauRisque === 'MODERE' || triage?.niveauSuspicion === 'modere';

      // Filtre d'onglet principal
      if (activeTab === 'risque_eleve' && !isHigh) return false;
      if (activeTab === 'vigilance' && !isModere) return false;
      if (
        activeTab === 'vulnerables' &&
        b.statutVulnerabilite !== 'PDI' &&
        b.statutVulnerabilite !== 'Vulnerable'
      ) {
        return false;
      }
      if (activeTab === 'depistees' && b.statutDepistage !== 'Effectué') {
        return false;
      }

      // Filtre langue
      if (selectedLanguage !== 'toutes' && b.languePreferee !== selectedLanguage) {
        return false;
      }

      // Filtre commune
      if (selectedCommune !== 'toutes' && b.commune !== selectedCommune) {
        return false;
      }

      // Recherche textuelle multi-champs
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = `${b.prenom} ${b.nom}`.toLowerCase().includes(q);
        const matchCode = (b.numeroDossier || '').toLowerCase().includes(q);
        const matchTel = (b.telephone || '').includes(q);
        const matchCommune = (b.commune || '').toLowerCase().includes(q);
        const matchCentre = (b.centreSuiviNom || '').toLowerCase().includes(q);

        if (!matchName && !matchCode && !matchTel && !matchCommune && !matchCentre) {
          return false;
        }
      }

      return true;
    });
  }, [beneficiaires, activeTab, selectedLanguage, selectedCommune, search]);

  const handleResetFilters = () => {
    setSearch('');
    setActiveTab('tous');
    setSelectedLanguage('toutes');
    setSelectedCommune('toutes');
  };

  return (
    <div className="beneficiaries-container">
      {/* En-tête de la page */}
      <div className="beneficiaries-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="modal-eyebrow">DOSSIERS PATIENTES & SUIVI CLINIQUE</span>
            <span className="text-[11px] text-[#007599] font-medium bg-[#EEF7F7] px-2.5 py-0.5 rounded-full border border-[#B3DFE5]">
              Praticien : {currentUser.prenom} {currentUser.nom} ({currentUser.roleTitre})
            </span>
          </div>
          <h2 className="beneficiaries-title font-serif">
            Dossiers & Suivi des Patientes
          </h2>
          <p className="beneficiaries-subtitle">
            Triage clinique intelligent par IA, enregistrement mobile en langues locales (Mooré, Dioula, Fulfuldé) et continuité des soins pour les femmes du Burkina Faso.
          </p>
        </div>

        <button
          type="button"
          className="btn-create-campaign cursor-pointer"
          onClick={onRegisterNewPatient}
        >
          <Plus className="w-5 h-5" />
          <span>Enregistrer une Patiente</span>
        </button>
      </div>

      {/* Cartes KPI réutilisables et harmonisées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Patientes Suivies"
          value={filterCounts.total}
          icon={Users}
          variant="teal"
          subtitle={
            kpis?.totalPatientes
              ? `${filterCounts.total} suivies sur le terrain (${kpis.totalPatientes} au total)`
              : 'Dossiers médicaux actifs répertoriés'
          }
          onClick={() => setActiveTab('tous')}
        />

        <KpiCard
          title="Dépistages Faits"
          value={filterCounts.depistees}
          icon={Activity}
          variant="amber"
          subtitle="Examens cliniques bilatéraux réalisés"
          onClick={() => setActiveTab('depistees')}
        />

        <KpiCard
          title="Cas Risque Élevé"
          value={`${filterCounts.risqueEleve} cas`}
          icon={AlertTriangle}
          variant="rose"
          subtitle="Orientation mammographie prioritaire sous 72h"
          onClick={() => setActiveTab('risque_eleve')}
        />

        <KpiCard
          title="PDI & Vulnérables"
          value={filterCounts.vulnerables}
          icon={HeartHandshake}
          variant="purple"
          subtitle="Éligibles au Fonds Solidarité Orange Money"
          onClick={() => setActiveTab('vulnerables')}
        />
      </div>

      {/* Barre de recherche et Filtres par pilules */}
      <div className="p-4 bg-white rounded-2xl border border-[#D6E8E8] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Rechercher par nom, N° dossier, téléphone, commune..."
            />
          </div>

          <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap self-end sm:self-center">
            <strong>{filteredBeneficiaires.length}</strong> patiente{filteredBeneficiaires.length > 1 ? 's' : ''} affichée{filteredBeneficiaires.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Pilules de filtrage interactives */}
        <PatientFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={filterCounts}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          selectedCommune={selectedCommune}
          onCommuneChange={setSelectedCommune}
          communesList={communesList}
        />
      </div>

      {/* Tableau des Patientes */}
      {filteredBeneficiaires.length === 0 ? (
        <EmptyState
          title="Aucune patiente ne correspond aux critères"
          description="Essayez de modifier votre recherche ou de réinitialiser les filtres pour afficher l'ensemble des dossiers."
          action={{
            label: 'Réinitialiser les filtres',
            onClick: handleResetFilters,
          }}
        />
      ) : (
        <div className="patient-table-wrapper">
          <table className="patient-table">
            <thead>
              <tr>
                <th>Patiente & N° Dossier</th>
                <th>Contact & Langue</th>
                <th>Situation</th>
                <th>Centre de Suivi</th>
                <th>Bilan Clinique & Risque IA</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeneficiaires.map((pat) => {
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
                    {/* Patiente & Dossier */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : 'bg-[#EEF7F7] text-[#007599] border border-[#B3DFE5]'
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

                    {/* Contact & Langue */}
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
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            {pat.languePreferee}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Situation de vulnérabilité */}
                    <td>
                      <PatientVulnerabilityBadge statut={pat.statutVulnerabilite} />
                    </td>

                    {/* Centre de suivi & Campagne */}
                    <td>
                      <span className="text-xs text-[#17343B] block font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {pat.centreSuiviNom}
                      </span>
                      {pat.campagneNom && (
                        <span className="text-[10px] text-[#007599] block mt-0.5 font-medium">
                          {pat.campagneNom}
                        </span>
                      )}
                    </td>

                    {/* Bilan Clinique & Triage IA combiné */}
                    <td>
                      {riskLevel || scoreValue !== undefined ? (
                        <div className="space-y-1">
                          <ClinicalRiskBadge
                            niveau={riskLevel || 'faible'}
                            size="sm"
                          />
                          <div className="text-[10px] text-[#64748B] flex items-center gap-1">
                            <span>Score IA :</span>
                            <strong
                              className={`font-mono font-bold ${
                                (scoreValue ?? 0) >= 70
                                  ? 'text-rose-700'
                                  : (scoreValue ?? 0) >= 35
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {scoreValue ?? 0}/100
                            </strong>
                            {pat.statutDepistage === 'Effectué' && (
                              <span className="text-[10px] text-slate-400">· Palpation OK</span>
                            )}
                          </div>
                          {(pat.demandeAideCode || pat.statutAideFonds === 'EN_ATTENTE' || (isHighRisk && pat.demandeAideId)) ? (
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                              Don Auto : {pat.demandeAideCode || 'Priorité Urgente'}
                            </span>
                          ) : evaluation?.bonSanteDeclenche ? (
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 border border-orange-200">
                              Bon Santé
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Non examiné
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Bouton Passerelle Solidarité Orange Money si cas suspect */}
                        {(isHighRisk || pat.statutVulnerabilite === 'PDI' || pat.statutVulnerabilite === 'Vulnerable') && (
                          <button
                            type="button"
                            className="btn-solidarity-action cursor-pointer"
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
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          onClick={() => onViewProfile(pat)}
                          title="Consulter la fiche patiente complète"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
