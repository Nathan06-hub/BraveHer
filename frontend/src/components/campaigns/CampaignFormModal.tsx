import React, { useState } from 'react';
import type {
  Campagne,
  CentreSante,
  AgentSante,
  CurrentUserContext,
  StatutCampagne,
  GenreCible,
  TrancheAgeCible,
} from '../../types/campaign';
import { X, FileText, Users, Radio } from 'lucide-react';
import {
  CampaignStepMission,
  AgentSelectionGrid,
  OrangeSmsComposer,
  CampaignModalFooter,
  type FormStep,
} from './modal';

interface CampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaignData: Omit<Campagne, 'id' | 'historique'>, action: 'brouillon' | 'en_attente') => void;
  centres: CentreSante[];
  allAgents: AgentSante[];
  currentUser: CurrentUserContext;
  initialData?: Campagne | null;
}

export const CampaignFormModal: React.FC<CampaignFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  centres,
  allAgents,
  currentUser,
  initialData,
}) => {
  if (!isOpen) return null;

  const isEdit = !!initialData;

  // Assistant 3 étapes : 'mission' -> 'equipe' -> 'communication'
  const [activeStep, setActiveStep] = useState<FormStep>('mission');

  // Dates par défaut intelligentes : demain et +3 semaines
  const defaultDateDebut = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const defaultDateFin = new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0];

  // Centre par défaut : centre de l'utilisateur ou premier centre de la liste
  const defaultCentreId =
    initialData?.centreId ||
    centres.find((c) => c.id === currentUser.centreId)?.id ||
    centres[0]?.id ||
    '';

  // États du formulaire
  const [nom, setNom] = useState(initialData?.titre || initialData?.nom || '');
  const [description, setDescription] = useState(
    initialData?.description ||
      'Sensibilisation de proximité, ateliers pratiques d’auto-palpation et dépistage précoce du cancer du sein.'
  );
  const [message, setMessage] = useState(
    initialData?.message ||
      'Yaa yéelé ! Dépistage précoce gratuit du cancer du sein dans votre secteur avec Brave_her. Protégez votre santé !'
  );
  // SMS Orange DÉSACTIVÉ par défaut conformément aux instructions
  const [activerPushSms, setActiverPushSms] = useState<boolean>(
    initialData?.activerPushSms !== undefined ? initialData.activerPushSms : false
  );
  const [genreCible, setGenreCible] = useState<GenreCible>(
    initialData?.genreCible || 'FEMMES_UNIQUEMENT'
  );
  const [trancheAgeCible, setTrancheAgeCible] = useState<TrancheAgeCible>(
    initialData?.trancheAgeCible || '25-49'
  );
  const [commune, setCommune] = useState(
    initialData?.commune || (currentUser.centreNom?.includes('Bobo') ? 'Bobo-Dioulasso' : 'Ouagadougou')
  );
  const [secteurs, setSecteurs] = useState<string[]>(
    initialData?.secteurs && initialData.secteurs.length > 0 ? initialData.secteurs : ['Secteur 1']
  );
  const [newSecteurInput, setNewSecteurInput] = useState('');
  const [dateDebut, setDateDebut] = useState(initialData?.dateDebut || defaultDateDebut);
  const [dateFin, setDateFin] = useState(initialData?.dateFin || defaultDateFin);
  const [horaires, setHoraires] = useState(initialData?.horaires || '08:00 - 15:30');
  const [centreId, setCentreId] = useState(defaultCentreId);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(
    initialData?.agentsMobilisesIds && initialData.agentsMobilisesIds.length > 0
      ? initialData.agentsMobilisesIds
      : [currentUser.id]
  );
  const [objectifFemmes, setObjectifFemmes] = useState<number>(
    initialData?.objectifFemmes || 250
  );

  // Recherche dans l'équipe
  const [agentSearch, setAgentSearch] = useState('');

  // Gestion des erreurs
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCentre = centres.find((c) => c.id === centreId) || centres[0];

  // Agents associés
  const agentsDuCentre = allAgents.filter((a) => a.centreId === centreId);
  const autresAgents = allAgents.filter((a) => a.centreId !== centreId);

  // Gestion des secteurs
  const handleAddSecteur = (secteurToAdd?: string) => {
    const val = (secteurToAdd || newSecteurInput).trim();
    if (!val) return;
    if (!secteurs.includes(val)) {
      setSecteurs([...secteurs, val]);
    }
    if (!secteurToAdd) setNewSecteurInput('');
  };

  const handleRemoveSecteur = (secToRemove: string) => {
    setSecteurs(secteurs.filter((s) => s !== secToRemove));
  };

  // Gestion de la sélection des agents
  const toggleAgent = (agentId: string) => {
    if (selectedAgentIds.includes(agentId)) {
      setSelectedAgentIds(selectedAgentIds.filter((id) => id !== agentId));
    } else {
      setSelectedAgentIds([...selectedAgentIds, agentId]);
    }
  };

  // Validation étape 1
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nom.trim()) {
      errs.nom = 'Le titre de la campagne est obligatoire.';
    }
    if (!dateDebut) {
      errs.dateDebut = 'La date de début est obligatoire.';
    }
    if (!dateFin) {
      errs.dateFin = 'La date de fin est obligatoire.';
    }
    if (dateDebut && dateFin && dateFin < dateDebut) {
      errs.dateFin = 'La date de fin doit être postérieure à la date de début.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextToEquipe = () => {
    if (validateStep1()) {
      if (newSecteurInput.trim() && !secteurs.includes(newSecteurInput.trim())) {
        setSecteurs([...secteurs, newSecteurInput.trim()]);
        setNewSecteurInput('');
      }
      setActiveStep('equipe');
    }
  };

  const handleNextToCommunication = () => {
    setActiveStep('communication');
  };

  // Soumission finale ou enregistrement en brouillon
  const handleSave = (targetStatut: 'brouillon' | 'en_attente') => {
    if (targetStatut === 'en_attente') {
      if (!validateStep1()) {
        setActiveStep('mission');
        return;
      }
    }

    const finalSecteurs =
      newSecteurInput.trim() && !secteurs.includes(newSecteurInput.trim())
        ? [...secteurs, newSecteurInput.trim()]
        : secteurs.length > 0
        ? secteurs
        : ['Secteur 1'];

    // Équipe mobilisée : au moins l'utilisateur connecté
    const finalAgentIds = selectedAgentIds.length > 0 ? selectedAgentIds : [currentUser.id];

    const campaignData: Omit<Campagne, 'id' | 'historique'> = {
      titre: nom.trim() || 'Campagne de sensibilisation',
      nom: nom.trim() || 'Campagne de sensibilisation',
      description: description.trim() || 'Sensibilisation et dépistage du cancer du sein.',
      secteurCible: finalSecteurs.join(', '),
      secteurs: finalSecteurs,
      message: message.trim() || 'Dépistage précoce gratuit du cancer du sein avec Brave_her.',
      commune,
      dateDebut,
      dateFin,
      horaires: horaires.trim() || '08:00 - 15:30',
      centreId,
      centreNom: selectedCentre ? selectedCentre.nom : currentUser.centreNom || 'Centre de Santé',
      statut: (isEdit ? initialData.statut : targetStatut === 'en_attente' ? 'PLANIFIEE' : 'BROUILLON') as StatutCampagne,
      creeParId: initialData?.creeParId || currentUser.id,
      creeParNom: initialData?.creeParNom || `${currentUser.prenom} ${currentUser.nom}`,
      dateCreation: initialData?.dateCreation || new Date().toISOString().split('T')[0],
      agentsMobilisesIds: finalAgentIds,
      objectifFemmes: Number(objectifFemmes) || 200,
      personnesSensibiliseesIds: initialData?.personnesSensibiliseesIds || [],
      totalSmsEnvoyes: initialData?.totalSmsEnvoyes || 0,
      activerPushSms,
      genreCible,
      trancheAgeCible,
    };

    onSubmit(campaignData, targetStatut);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content modal-large">
        {/* En-tête du modal */}
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">
              {isEdit ? 'MODIFICATION DE CAMPAGNE' : 'NOUVELLE CAMPAGNE DE DÉPISTAGE'}
            </span>
            <h2 id="modal-title" className="modal-title">
              {isEdit ? nom || 'Modifier la campagne' : 'Préparer une mission sur le territoire'}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation par onglets en 3 étapes */}
        <div className="modal-nav-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 'mission'}
            className={`modal-nav-tab ${activeStep === 'mission' ? 'active' : ''}`}
            onClick={() => setActiveStep('mission')}
          >
            <FileText className="w-4 h-4" />
            <span>1. Mission & Calendrier</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 'equipe'}
            className={`modal-nav-tab ${activeStep === 'equipe' ? 'active' : ''}`}
            onClick={() => {
              if (validateStep1()) setActiveStep('equipe');
            }}
          >
            <Users className="w-4 h-4" />
            <span>2. Équipe de Santé ({selectedAgentIds.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 'communication'}
            className={`modal-nav-tab ${activeStep === 'communication' ? 'active' : ''}`}
            onClick={() => {
              if (validateStep1()) setActiveStep('communication');
            }}
          >
            <Radio className="w-4 h-4" />
            <span>3. SMS Orange {activerPushSms ? '(Activé)' : '(Désactivé)'}</span>
          </button>
        </div>

        {/* Corps du formulaire orchestré par étapes */}
        <div className="modal-body">
          {activeStep === 'mission' && (
            <CampaignStepMission
              nom={nom}
              onNomChange={setNom}
              centreId={centreId}
              onCentreIdChange={setCentreId}
              centres={centres}
              commune={commune}
              onCommuneChange={setCommune}
              secteurs={secteurs}
              newSecteurInput={newSecteurInput}
              onNewSecteurInputChange={setNewSecteurInput}
              onAddSecteur={handleAddSecteur}
              onRemoveSecteur={handleRemoveSecteur}
              dateDebut={dateDebut}
              onDateDebutChange={setDateDebut}
              dateFin={dateFin}
              onDateFinChange={setDateFin}
              horaires={horaires}
              onHorairesChange={setHoraires}
              objectifFemmes={objectifFemmes}
              onObjectifFemmesChange={setObjectifFemmes}
              description={description}
              onDescriptionChange={setDescription}
              errors={errors}
              onClearError={(field) => {
                if (errors[field]) {
                  const updated = { ...errors };
                  delete updated[field];
                  setErrors(updated);
                }
              }}
            />
          )}

          {activeStep === 'equipe' && (
            <AgentSelectionGrid
              currentUser={currentUser}
              agentsDuCentre={agentsDuCentre}
              autresAgents={autresAgents}
              selectedAgentIds={selectedAgentIds}
              onToggleAgent={toggleAgent}
              agentSearch={agentSearch}
              onSearchChange={setAgentSearch}
            />
          )}

          {activeStep === 'communication' && (
            <OrangeSmsComposer
              activerPushSms={activerPushSms}
              onTogglePushSms={setActiverPushSms}
              message={message}
              onMessageChange={setMessage}
              genreCible={genreCible}
              onGenreCibleChange={setGenreCible}
              trancheAgeCible={trancheAgeCible}
              onTrancheAgeCibleChange={setTrancheAgeCible}
              nom={nom}
              centreNom={selectedCentre?.nom || currentUser.centreNom || 'Centre'}
              commune={commune}
              dateDebut={dateDebut}
              dateFin={dateFin}
              nbAgentsMobilises={selectedAgentIds.length}
            />
          )}
        </div>

        {/* Pied de page du modal modulaire */}
        <CampaignModalFooter
          activeStep={activeStep}
          onClose={onClose}
          onPrev={() => setActiveStep(activeStep === 'communication' ? 'equipe' : 'mission')}
          onNextToEquipe={handleNextToEquipe}
          onNextToCommunication={handleNextToCommunication}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};
