import React, { useState, useEffect } from 'react';
import type {
  Campagne,
  CentreSante,
  AgentSante,
  CurrentUserContext,
  PersonneSensibilisee,
  SmsLog,
  LanguePatiente,
} from '../types/campaign';
import { CampaignList } from '../components/campaigns/CampaignList';
import { CampaignFormModal } from '../components/campaigns/CampaignFormModal';
import { CampaignValidationModal } from '../components/campaigns/CampaignValidationModal';
import { CampaignDetailModal } from '../components/campaigns/CampaignDetailModal';

export interface CampaignsPageProps {
  campagnes: Campagne[];
  centres: CentreSante[];
  agents: AgentSante[];
  currentUser: CurrentUserContext;
  personnes: PersonneSensibilisee[];
  smsLogs: SmsLog[];
  onSaveCampaign: (
    campaignData: Omit<Campagne, 'id' | 'historique'>,
    targetStatut: 'brouillon' | 'en_attente',
    editingCampaign?: Campagne | null
  ) => void;
  onValidationDecision: (
    campagneId: string,
    decision: 'approuvee' | 'a_corriger' | 'refusee',
    motif?: string
  ) => void;
  onAddPersonne: (data: Omit<PersonneSensibilisee, 'id'>) => void;
  onTriggerPushSms: (campagneId: string, langue: LanguePatiente) => void;
  initialCreateOpen?: boolean;
  onCloseInitialCreate?: () => void;
  initialViewingCampaign?: Campagne | null;
  onCloseInitialViewing?: () => void;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({
  campagnes,
  centres,
  agents,
  currentUser,
  personnes,
  smsLogs,
  onSaveCampaign,
  onValidationDecision,
  onAddPersonne,
  onTriggerPushSms,
  initialCreateOpen = false,
  onCloseInitialCreate,
  initialViewingCampaign = null,
  onCloseInitialViewing,
}) => {
  // Modal states encapsulated within CampaignsPage
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialCreateOpen);
  const [editingCampaign, setEditingCampaign] = useState<Campagne | null>(null);
  const [validatingCampaign, setValidatingCampaign] = useState<Campagne | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<Campagne | null>(initialViewingCampaign);

  // Sync props when opening from navigation (e.g. dashboard quick actions)
  useEffect(() => {
    if (initialCreateOpen) {
      setIsCreateModalOpen(true);
      setEditingCampaign(null);
    }
  }, [initialCreateOpen]);

  useEffect(() => {
    if (initialViewingCampaign) {
      setViewingCampaign(initialViewingCampaign);
    }
  }, [initialViewingCampaign]);

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (camp: Campagne) => {
    setEditingCampaign(camp);
    setIsCreateModalOpen(true);
  };

  const handleView = (camp: Campagne) => {
    setViewingCampaign(camp);
  };

  const handleValidate = (camp: Campagne) => {
    setValidatingCampaign(camp);
  };

  const handleCloseCreate = () => {
    setIsCreateModalOpen(false);
    setEditingCampaign(null);
    if (onCloseInitialCreate) onCloseInitialCreate();
  };

  const handleCloseViewing = () => {
    setViewingCampaign(null);
    if (onCloseInitialViewing) onCloseInitialViewing();
  };

  const handleSubmitForm = (
    data: Omit<Campagne, 'id' | 'historique'>,
    targetStatut: 'brouillon' | 'en_attente'
  ) => {
    onSaveCampaign(data, targetStatut, editingCampaign);
    setIsCreateModalOpen(false);
    setEditingCampaign(null);
    if (onCloseInitialCreate) onCloseInitialCreate();
  };

  return (
    <div className="campaigns-page">
      {/* Liste principale des campagnes */}
      <CampaignList
        campagnes={campagnes}
        centres={centres}
        agents={agents}
        currentUser={currentUser}
        personnes={personnes}
        onCreateCampaign={handleOpenCreate}
        onViewDetails={handleView}
        onEditCampaign={handleEdit}
        onValidateCampaign={handleValidate}
      />

      {/* Modal 1 : Création / Édition de campagne */}
      <CampaignFormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        onSubmit={handleSubmitForm}
        centres={centres}
        allAgents={agents}
        currentUser={currentUser}
        initialData={editingCampaign}
      />

      {/* Modal 2 : Validation du Responsable */}
      <CampaignValidationModal
        isOpen={!!validatingCampaign}
        campagne={validatingCampaign}
        allAgents={agents}
        currentUser={currentUser}
        onClose={() => setValidatingCampaign(null)}
        onDecision={onValidationDecision}
      />

      {/* Modal 3 : Fiche détaillée & Suivi patientes */}
      <CampaignDetailModal
        isOpen={!!viewingCampaign}
        campagne={viewingCampaign}
        allAgents={agents}
        allPersonnes={personnes}
        allSmsLogs={smsLogs}
        currentUser={currentUser}
        onClose={handleCloseViewing}
        onAddPersonne={onAddPersonne}
        onTriggerPushSms={onTriggerPushSms}
      />
    </div>
  );
};
