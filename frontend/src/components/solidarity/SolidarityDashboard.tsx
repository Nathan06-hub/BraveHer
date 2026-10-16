import React from 'react';
import type {
  DemandeAide,
  FondsSolidariteSummary,
  IndicateurZoneBF,
} from '../../types/solidarity';
import type { CurrentUserContext } from '../../types/campaign';
import type {
  PartenaireDonneur,
  DonTransaction,
  AppelAideCasGrave,
} from '../../types/partner';
import { AidRequestsList } from './AidRequestsList';
import { BurkinaHeatmapView } from './BurkinaHeatmapView';
import { PartnersHubView } from './PartnersHubView';
import './solidarity.css';
import {
  Coins,
  ShieldCheck,
  CreditCard,
  Plus,
  Map,
  Lock,
  TrendingUp,
  Building2,
} from 'lucide-react';

export type SolidaritySectionTab = 'requests' | 'validations' | 'map' | 'partenaires';

interface SolidarityDashboardProps {
  demandes: DemandeAide[];
  fonds: FondsSolidariteSummary;
  indicateursRegions: IndicateurZoneBF[];
  currentUser: CurrentUserContext;
  onCreateAidRequest: () => void;
  onViewDetail: (demande: DemandeAide) => void;
  onValidate: (demande: DemandeAide) => void;
  onPayOrangeMoney: (demande: DemandeAide) => void;
  activeSectionTab: SolidaritySectionTab;
  onSectionTabChange: (tab: SolidaritySectionTab) => void;
  // Module Partenaires & Mécénat (Diagramme Mermaid & Module 4)
  partenaires?: PartenaireDonneur[];
  donsTransactions?: DonTransaction[];
  appelsAideCasGraves?: AppelAideCasGrave[];
  onSimulateDonation?: (partenaire?: PartenaireDonneur) => void;
  onNewAidAppeal?: () => void;
  onViewPartnerDetail?: (partenaire: PartenaireDonneur) => void;
  onSponsorPatient?: (partenaire: PartenaireDonneur) => void;
  onApproveAppeal?: (appel: AppelAideCasGrave) => void;
}

export const SolidarityDashboard: React.FC<SolidarityDashboardProps> = ({
  demandes,
  fonds,
  indicateursRegions,
  currentUser,
  onCreateAidRequest,
  onViewDetail,
  onValidate,
  onPayOrangeMoney,
  activeSectionTab,
  onSectionTabChange,
  partenaires = [],
  donsTransactions = [],
  appelsAideCasGraves = [],
  onSimulateDonation,
  onNewAidAppeal,
  onViewPartnerDetail,
  onSponsorPatient,
  onApproveAppeal,
}) => {
  const percentEngaged = Math.round((fonds.montantEngage / fonds.dotationTotale) * 100);

  // Demandes en attente d'arbitrage pour le responsable
  const pendingRequests = demandes.filter(
    (d) => d.statut === 'a_examiner' || d.statut === 'en_attente_decision'
  );

  return (
    <div className="solidarity-module-container">
      {/* En-tête du Module Solidarité */}
      <div className="solidarity-header-row">
        <div>
          <span className="modal-eyebrow">FONDS DE SOLIDARITÉ & MÉCÉNAT</span>
          <h2 className="solidarity-title font-serif">
            Solidarité Financière & Pilotage Statistique
          </h2>
          <p className="solidarity-subtitle">
            Prise en charge solidaire de mammographies pour les femmes vulnérables et suivi cartographique du dépistage au Burkina Faso.
          </p>
        </div>

        <button
          type="button"
          className="btn-create-campaign"
          onClick={onCreateAidRequest}
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Demande d'Aide</span>
        </button>
      </div>

      {/* Cartes KPI du Fonds de Solidarité */}
      <div className="campaign-stats-grid">
        {/* KPI 1 : Montant Disponible */}
        <div className="stat-card">
          <div className="stat-icon-wrap icon-teal">
            <Coins className="w-5 h-5 text-[#007599]" />
          </div>
          <div className="flex-1">
            <span className="stat-label">Fonds Disponible</span>
            <div className="stat-value text-[#007599]">
              {fonds.montantDisponible.toLocaleString('fr-FR')} FCFA
            </div>
            <span className="text-[11px] text-[#536B70]">
              Sur {fonds.dotationTotale.toLocaleString('fr-FR')} FCFA de dotation
            </span>
          </div>
        </div>

        {/* KPI 2 : Montant Engagé */}
        <div className="stat-card">
          <div className="stat-icon-wrap bg-rose-100">
            <TrendingUp className="w-5 h-5 text-[#D8638A]" />
          </div>
          <div className="flex-1">
            <span className="stat-label">Montant Engagé ({percentEngaged}%)</span>
            <div className="stat-value text-[#D8638A]">
              {fonds.montantEngage.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#007599] to-[#D8638A] h-full rounded-full"
                style={{ width: `${percentEngaged}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3 : Aides Attribuées */}
        <div className="stat-card">
          <div className="stat-icon-wrap bg-emerald-100">
            <CreditCard className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex-1">
            <span className="stat-label">Aides Attribuées</span>
            <div className="stat-value text-emerald-700">
              {fonds.nombreAidesAttribuees} femmes
            </div>
            <span className="text-[11px] text-[#536B70]">
              {fonds.nombreExamensRealises} mammographies réalisées
            </span>
          </div>
        </div>

        {/* KPI 4 : En attente */}
        <div className="stat-card">
          <div className="stat-icon-wrap icon-amber">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <span className="stat-label">Dossiers à instruire</span>
            <div className="stat-value text-amber-600">
              {pendingRequests.length} en attente
            </div>
            <span className="text-[11px] text-[#536B70]">
              Validation médicale prioritaire
            </span>
          </div>
        </div>
      </div>

      {/* Avertissement de confidentialité / Anonymisation */}
      <div className="confidentiality-notice">
        <Lock className="w-4 h-4 text-[#007599] shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-[#17343B]">
          <strong>Confidentialité des données médicales :</strong> Conformément au cahier des charges, les identités des patientes restent strictement protégées. Le tableau de bord statistique et la cartographie s'appuient exclusivement sur des données agrégées et anonymisées.
        </div>
      </div>

      {/* Onglets de sous-navigation du Module 4 */}
      <div className="solidarity-tabs-bar">
        <button
          type="button"
          className={`solidarity-tab-btn ${activeSectionTab === 'requests' ? 'active' : ''}`}
          onClick={() => onSectionTabChange('requests')}
        >
          <Coins className="w-4 h-4" />
          <span>Toutes les Demandes ({demandes.length})</span>
        </button>

        <button
          type="button"
          className={`solidarity-tab-btn ${activeSectionTab === 'validations' ? 'active' : ''}`}
          onClick={() => onSectionTabChange('validations')}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Validations des Aides ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          className={`solidarity-tab-btn ${activeSectionTab === 'map' ? 'active' : ''}`}
          onClick={() => onSectionTabChange('map')}
        >
          <Map className="w-4 h-4" />
          <span>Cartographie & Tendances Épidémiologiques BF</span>
        </button>

        <button
          type="button"
          className={`solidarity-tab-btn ${activeSectionTab === 'partenaires' ? 'active' : ''}`}
          onClick={() => onSectionTabChange('partenaires')}
        >
          <Building2 className="w-4 h-4 text-[#007599]" />
          <span>Partenaires & Dons (Mécénat)</span>
        </button>
      </div>

      {/* Contenu de la sous-section active */}
      <div className="solidarity-tab-content">
        {activeSectionTab === 'requests' && (
          <AidRequestsList
            demandes={demandes}
            currentUser={currentUser}
            onViewDetail={onViewDetail}
            onValidate={onValidate}
            onPayOrangeMoney={onPayOrangeMoney}
          />
        )}

        {activeSectionTab === 'validations' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#17343B]">
                  Dossiers en attente de décision médicale & financière
                </h3>
                <p className="text-xs text-[#536B70]">
                  Examinez les pièces médicales, allouez le montant ou justifiez le motif de refus.
                </p>
              </div>
            </div>

            <AidRequestsList
              demandes={pendingRequests}
              currentUser={currentUser}
              onViewDetail={onViewDetail}
              onValidate={onValidate}
              onPayOrangeMoney={onPayOrangeMoney}
            />
          </div>
        )}

        {activeSectionTab === 'map' && (
          <BurkinaHeatmapView
            indicateurs={indicateursRegions}
            onBack={() => onSectionTabChange('requests')}
            onFilterByRegion={() => onSectionTabChange('requests')}
          />
        )}

        {activeSectionTab === 'partenaires' && (
          <PartnersHubView
            partenaires={partenaires}
            dons={donsTransactions}
            appelsAide={appelsAideCasGraves}
            onSimulateDonation={onSimulateDonation || (() => {})}
            onNewAidAppeal={onNewAidAppeal || onCreateAidRequest}
            onViewPartnerDetail={onViewPartnerDetail || (() => {})}
            onSponsorPatient={onSponsorPatient || (() => {})}
            onApproveAppeal={onApproveAppeal}
          />
        )}
      </div>
    </div>
  );
};
