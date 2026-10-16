import React, { useState } from 'react';
import type { Beneficiaire, BeneficiairesKPIs } from '../types/beneficiary';
import type { CentreSante, CurrentUserContext, Campagne } from '../types/campaign';
import type { PatientCandidate } from '../components/solidarity';
import {
  BeneficiariesDashboard,
  PatientTriageView,
  NewPatientRegistrationView,
  PatientProfileView,
  PatientFormModal,
} from '../components/beneficiaries';

export type PatientSubView = 'dashboard' | 'triage' | 'create' | 'detail';

export interface PatientsPageProps {
  beneficiaires: Beneficiaire[];
  kpis: BeneficiairesKPIs;
  currentUser: CurrentUserContext;
  centres?: CentreSante[];
  onRegisterNewPatient: (patient: Beneficiaire) => void;
  onSavePatientTriage: (patient: Beneficiaire) => void;
  onRequestSolidarity: (patient: Beneficiaire) => void;
  onRequestPartnerSponsorship?: (patientCandidate: PatientCandidate) => void;
  initialView?: PatientSubView;
  initialSelectedPatientId?: string;
  campagnes?: Campagne[];
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  beneficiaires,
  kpis,
  currentUser,
  centres = [],
  onRegisterNewPatient,
  onSavePatientTriage,
  onRequestSolidarity,
  onRequestPartnerSponsorship,
  initialView = 'dashboard',
  initialSelectedPatientId,
  campagnes = [],
}) => {
  const [view, setView] = useState<PatientSubView>(initialView);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Beneficiaire | null>(() => {
    if (initialSelectedPatientId) {
      return beneficiaires.find((b) => b.id === initialSelectedPatientId) || null;
    }
    return null;
  });

  const handleRegisterSubmit = (newPatient: Beneficiaire) => {
    onRegisterNewPatient(newPatient);
    setIsCreateModalOpen(false);
    setView('dashboard');
    setSelectedPatient(null);
  };

  const handleSaveTriage = (updatedPatient: Beneficiaire) => {
    onSavePatientTriage(updatedPatient);
    setView('dashboard');
    setSelectedPatient(null);
  };

  const handleStartTriage = (patient: Beneficiaire) => {
    setSelectedPatient(patient);
    setView('triage');
  };

  const handleViewProfile = (patient: Beneficiaire) => {
    setSelectedPatient(patient);
    setView('detail');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedPatient(null);
  };

  return (
    <div className="patients-page">
      {view === 'dashboard' && (
        <BeneficiariesDashboard
          beneficiaires={beneficiaires}
          kpis={kpis}
          currentUser={currentUser}
          onRegisterNewPatient={() => setIsCreateModalOpen(true)}
          onStartTriage={handleStartTriage}
          onViewProfile={handleViewProfile}
          onRequestSolidarity={onRequestSolidarity}
        />
      )}

      {view === 'create' && (
        <NewPatientRegistrationView
          currentUser={currentUser}
          onBack={handleBackToDashboard}
          onSubmit={handleRegisterSubmit}
        />
      )}

      {view === 'triage' && selectedPatient && (
        <PatientTriageView
          patient={selectedPatient}
          currentUser={currentUser}
          onBack={handleBackToDashboard}
          onSaveTriage={handleSaveTriage}
          onRequestSolidarity={onRequestSolidarity}
        />
      )}

      {view === 'detail' && selectedPatient && (
        <PatientProfileView
          patient={selectedPatient}
          onBack={handleBackToDashboard}
          onStartTriage={handleStartTriage}
          onRequestSolidarity={onRequestSolidarity}
          onRequestPartnerSponsorship={(patient) => {
            if (onRequestPartnerSponsorship) {
              onRequestPartnerSponsorship({
                id: patient.id,
                nom: patient.nom,
                prenom: patient.prenom,
                age: patient.age,
                commune: patient.commune,
                region: patient.secteur || 'Centre',
                scoreIA: patient.dernierTriage?.scoreCalcule || patient.derniereEvaluation?.scoreIA || 85,
                descriptionClinique:
                  patient.dernierTriage?.observationsVocales ||
                  patient.dernierTriage?.conduiteATenir ||
                  patient.derniereEvaluation?.conduiteATenir ||
                  'Cas à risque élevé détecté lors du dépistage communautaire.',
                vulnerabilite: patient.statutVulnerabilite,
                centreNom: patient.centreSuiviNom,
              });
            }
          }}
        />
      )}

      {/* Modal moderne d'enregistrement de fiche patiente en 3 étapes */}
      <PatientFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleRegisterSubmit}
        centres={centres}
        currentUser={currentUser}
        allCampagnes={campagnes}
        allBeneficiaires={beneficiaires}
      />
    </div>
  );
};
