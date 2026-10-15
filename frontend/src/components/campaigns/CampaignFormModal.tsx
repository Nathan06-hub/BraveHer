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
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Info,
  Save,
  Send,
  Plus,
  Trash2,
  CheckCircle,
  Radio,
} from 'lucide-react';

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

  // Form states
  const [nom, setNom] = useState(initialData?.titre || initialData?.nom || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [message, setMessage] = useState(
    initialData?.message ||
      'Yaa yéelé ! Dépistage précoce gratuit du cancer du sein dans votre secteur. Protégez votre santé avec Soutien Rose.'
  );
  const [activerPushSms, setActiverPushSms] = useState<boolean>(
    initialData?.activerPushSms !== undefined ? initialData.activerPushSms : true
  );
  const [genreCible, setGenreCible] = useState<GenreCible>(
    initialData?.genreCible || 'FEMMES_UNIQUEMENT'
  );
  const [trancheAgeCible, setTrancheAgeCible] = useState<TrancheAgeCible>(
    initialData?.trancheAgeCible || '25-49'
  );
  const [commune, setCommune] = useState(
    initialData?.commune || (currentUser.centreNom.includes('Bobo') ? 'Bobo-Dioulasso' : 'Ouagadougou')
  );
  const [secteurs, setSecteurs] = useState<string[]>(
    initialData?.secteurs || ['Secteur 1']
  );
  const [newSecteurInput, setNewSecteurInput] = useState('');
  const [dateDebut, setDateDebut] = useState(initialData?.dateDebut || '');
  const [dateFin, setDateFin] = useState(initialData?.dateFin || '');
  const [horaires, setHoraires] = useState(initialData?.horaires || '08:00 - 15:30');
  const [centreId, setCentreId] = useState(
    initialData?.centreId || (currentUser.centreId !== 'all' ? currentUser.centreId : centres[0]?.id || '')
  );
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(
    initialData?.agentsMobilisesIds || [currentUser.id]
  );
  const [objectifFemmes, setObjectifFemmes] = useState<number>(
    initialData?.objectifFemmes || 300
  );

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtrer les agents par centre sélectionné (avec option de mobiliser des renforts)
  const agentsDuCentre = allAgents.filter((a) => a.centreId === centreId);
  const autresAgents = allAgents.filter((a) => a.centreId !== centreId);

  const selectedCentre = centres.find((c) => c.id === centreId);

  // Gestion des secteurs
  const handleAddSecteur = () => {
    const val = newSecteurInput.trim();
    if (!val) return;
    if (!secteurs.includes(val)) {
      setSecteurs([...secteurs, val]);
    }
    setNewSecteurInput('');
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

  // Validation du formulaire
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!nom.trim()) errs.nom = 'Le nom de la campagne est requis.';
    if (!description.trim()) errs.description = 'La description est requise.';
    if (!commune.trim()) errs.commune = 'Veuillez sélectionner une commune.';
    if (secteurs.length === 0) errs.secteurs = 'Veuillez indiquer au moins un secteur.';
    if (!dateDebut) errs.dateDebut = 'Date de début requise.';
    if (!dateFin) errs.dateFin = 'Date de fin requise.';
    if (dateDebut && dateFin && dateDebut > dateFin) {
      errs.dateFin = 'La date de fin doit être postérieure à la date de début.';
    }
    if (!centreId) errs.centreId = 'Veuillez sélectionner un centre de santé.';
    if (selectedAgentIds.length === 0) {
      errs.agents = 'Veuillez mobiliser au moins un agent de santé.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (targetStatut: 'brouillon' | 'en_attente') => {
    if (!validateForm()) return;

    const campaignData: Omit<Campagne, 'id' | 'historique'> = {
      titre: nom.trim(),
      nom: nom.trim(),
      description: description.trim(),
      secteurCible: secteurs.join(', '),
      secteurs,
      message: message.trim() || 'Dépistage précoce gratuit du cancer du sein.',
      commune,
      dateDebut,
      dateFin,
      horaires: horaires.trim(),
      centreId,
      centreNom: selectedCentre ? selectedCentre.nom : 'Centre de Santé',
      statut: (isEdit ? initialData.statut : targetStatut === 'en_attente' ? 'PLANIFIEE' : 'BROUILLON') as StatutCampagne,
      creeParId: initialData?.creeParId || currentUser.id,
      creeParNom: initialData?.creeParNom || `${currentUser.prenom} ${currentUser.nom}`,
      dateCreation: initialData?.dateCreation || new Date().toISOString().split('T')[0],
      agentsMobilisesIds: selectedAgentIds,
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
              {isEdit ? nom || 'Modifier la campagne' : 'Préparer une campagne de sensibilisation'}
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

        {/* Corps du modal */}
        <div className="modal-body space-y-5">
          {/* Alerte informative obligatoire sur la langue */}
          <div className="info-banner-patient-lang">
            <Info className="w-5 h-5 text-[#007599] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-[#17343B]">
              <strong>Attribution de la langue aux patientes :</strong> Conformément au protocole médical, la langue n'est pas sélectionnée lors de la création de la campagne. Elle est automatiquement extraite du dossier individuel de chaque femme sensibilisée (<em>Mooré</em>, <em>Dioula</em>, <em>Fulfuldé</em>, <em>Français</em>).
            </div>
          </div>

          {/* Section 1 : Informations Générales */}
          <div className="form-section">
            <h3 className="form-section-title">1. Informations générales</h3>
            
            <div className="form-group">
              <label htmlFor="camp-nom" className="form-label required">
                Nom de la campagne
              </label>
              <input
                id="camp-nom"
                type="text"
                className={`form-input ${errors.nom ? 'input-error' : ''}`}
                placeholder="Ex : Caravane Octobre Rose — Dépistage Précoce Secteur 22"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
              {errors.nom && <span className="error-message">{errors.nom}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="camp-desc" className="form-label required">
                Description et objectifs de terrain
              </label>
              <textarea
                id="camp-desc"
                rows={3}
                className={`form-input form-textarea ${errors.description ? 'input-error' : ''}`}
                placeholder="Objectifs de sensibilisation, publics prioritaires, ateliers d'auto-palpation et organisation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            {/* Message Push SMS Orange (Optionnel & Ciblage Démographique) */}
            <div className="mt-4 p-3.5 bg-[#FFF9F5] border border-[#FED7AA] rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-lg border border-[#FFE1CC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF7900] text-white flex items-center justify-center font-bold shrink-0">
                    <Radio className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#17343B] block">
                      Diffuser un Push SMS Orange lors du lancement de la campagne
                    </strong>
                    <span className="text-[11px] text-[#536B70] block">
                      Envoi d'un SMS de sensibilisation géociblé via la passerelle GSM Orange BF
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={activerPushSms}
                    onChange={(e) => setActiverPushSms(e.target.checked)}
                    className="w-4 h-4 text-[#FF7900] rounded border-gray-300 focus:ring-[#FF7900] cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${activerPushSms ? 'text-[#FF7900]' : 'text-[#536B70]'}`}>
                    {activerPushSms ? 'Activé' : 'Désactivé'}
                  </span>
                </label>
              </div>

              {activerPushSms ? (
                <div className="space-y-3 pt-1">
                  {/* Ciblage Genre & Tranche d'âge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-[#FFE1CC]">
                    <div>
                      <label className="text-[11px] font-bold text-[#536B70] uppercase tracking-wide block mb-1">
                        Public cible par Genre
                      </label>
                      <select
                        className="form-input text-xs"
                        value={genreCible}
                        onChange={(e) => setGenreCible(e.target.value as GenreCible)}
                      >
                        <option value="FEMMES_UNIQUEMENT">Femmes uniquement (15-55 ans — Recommandé)</option>
                        <option value="TOUS_PUBLICS">Tous publics de la zone (Sensibilisation générale)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#536B70] uppercase tracking-wide block mb-1">
                        Tranche d'âge prioritaire
                      </label>
                      <select
                        className="form-input text-xs"
                        value={trancheAgeCible}
                        onChange={(e) => setTrancheAgeCible(e.target.value as TrancheAgeCible)}
                      >
                        <option value="25-49">25 à 49 ans (Cœur de cible dépistage)</option>
                        <option value="15-25">15 à 25 ans (Jeunes femmes & autopalpation)</option>
                        <option value="50+">50 ans et plus (Surveillance renforcée)</option>
                        <option value="TOUTES">Toutes tranches d'âge confondues</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#C2410C]">
                      Texte du SMS de sensibilisation (Max 160 caractères) :
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        message.length > 160
                          ? 'bg-red-100 text-red-700 font-bold'
                          : 'bg-orange-100 text-orange-800 font-semibold'
                      }`}
                    >
                      {message.length} / 160 caractères {message.length > 160 ? `(${Math.ceil(message.length / 160)} SMS)` : '(1 SMS)'}
                    </span>
                  </div>

                  {/* Modèles en langues locales */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#FDBA74] text-[#C2410C] hover:bg-[#FFEDD5] font-semibold cursor-pointer"
                      onClick={() =>
                        setMessage(
                          'Yaa yéelé ! Dépistage précoce gratuit du cancer du sein dans votre secteur avec le centre de santé. Wa song b menga.'
                        )
                      }
                    >
                      Modèle Mooré
                    </button>
                    <button
                      type="button"
                      className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#FDBA74] text-[#C2410C] hover:bg-[#FFEDD5] font-semibold cursor-pointer"
                      onClick={() =>
                        setMessage(
                          'Aw bismila ! Dépistage gratuit cancer du sein kɛnɛya ye foyi tɛmɛ. Soutien Rose n’a ka soignants.'
                        )
                      }
                    >
                      Modèle Dioula
                    </button>
                    <button
                      type="button"
                      className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#FDBA74] text-[#C2410C] hover:bg-[#FFEDD5] font-semibold cursor-pointer"
                      onClick={() =>
                        setMessage(
                          'Jam waali ! Kuje cellal rewbe ngam depistage cancer. War to do cellal maada.'
                        )
                      }
                    >
                      Modèle Fulfuldé
                    </button>
                    <button
                      type="button"
                      className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#FDBA74] text-[#C2410C] hover:bg-[#FFEDD5] font-semibold cursor-pointer"
                      onClick={() =>
                        setMessage(
                          'Octobre Rose : Dépistage précoce gratuit du cancer du sein dans votre quartier. Venez nombreuses !'
                        )
                      }
                    >
                      Modèle Français
                    </button>
                  </div>

                  <textarea
                    id="camp-sms-msg"
                    rows={2}
                    className="form-input form-textarea font-mono text-xs bg-white w-full"
                    placeholder="Rédigez le SMS de sensibilisation..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg border border-dashed border-[#D6E8E8] text-xs text-[#536B70] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#007599] shrink-0" />
                  <span>
                    <strong>Option désactivée :</strong> Aucun SMS ne sera diffusé automatiquement au lancement. Vous pourrez déclencher des relances ou des diffusions ciblées à tout moment depuis la fiche détaillée de la campagne ou le Hub de Messagerie.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2 : Localisation géographique */}
          <div className="form-section">
            <h3 className="form-section-title">2. Commune & Secteurs concernés</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="camp-commune" className="form-label required">
                  Commune
                </label>
                <div className="relative">
                  <MapPin className="form-field-icon" />
                  <select
                    id="camp-commune"
                    className="form-input with-icon"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                  >
                    <option value="Ouagadougou">Ouagadougou</option>
                    <option value="Bobo-Dioulasso">Bobo-Dioulasso</option>
                    <option value="Koudougou">Koudougou</option>
                    <option value="Ouahigouya">Ouahigouya</option>
                    <option value="Banfora">Banfora</option>
                    <option value="Dédougou">Dédougou</option>
                    <option value="Kaya">Kaya</option>
                    <option value="Fada N’Gourma">Fada N’Gourma</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">
                  Secteurs concernés
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Ex : Secteur 22"
                    value={newSecteurInput}
                    onChange={(e) => setNewSecteurInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSecteur();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-add-tag"
                    onClick={handleAddSecteur}
                    title="Ajouter le secteur"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
                {errors.secteurs && <span className="error-message">{errors.secteurs}</span>}

                {/* Tags de secteurs */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {secteurs.map((sec) => (
                    <span key={sec} className="secteur-pill">
                      <span>{sec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSecteur(sec)}
                        className="hover:text-red-600"
                        title="Supprimer ce secteur"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 : Planning & Centre de Santé */}
          <div className="form-section">
            <h3 className="form-section-title">3. Calendrier & Centre responsable</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="camp-datedebut" className="form-label required">
                  Date de début
                </label>
                <div className="relative">
                  <Calendar className="form-field-icon" />
                  <input
                    id="camp-datedebut"
                    type="date"
                    className={`form-input with-icon ${errors.dateDebut ? 'input-error' : ''}`}
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                  />
                </div>
                {errors.dateDebut && <span className="error-message">{errors.dateDebut}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="camp-datefin" className="form-label required">
                  Date de fin
                </label>
                <div className="relative">
                  <Calendar className="form-field-icon" />
                  <input
                    id="camp-datefin"
                    type="date"
                    className={`form-input with-icon ${errors.dateFin ? 'input-error' : ''}`}
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                  />
                </div>
                {errors.dateFin && <span className="error-message">{errors.dateFin}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="camp-horaires" className="form-label required">
                  Horaires d'intervention
                </label>
                <div className="relative">
                  <Clock className="form-field-icon" />
                  <input
                    id="camp-horaires"
                    type="text"
                    className="form-input with-icon"
                    placeholder="Ex : 08:00 - 15:30"
                    value={horaires}
                    onChange={(e) => setHoraires(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="form-group">
                <label htmlFor="camp-centre" className="form-label required">
                  Centre de santé responsable
                </label>
                <div className="relative">
                  <Building2 className="form-field-icon" />
                  <select
                    id="camp-centre"
                    className="form-input with-icon"
                    value={centreId}
                    onChange={(e) => setCentreId(e.target.value)}
                  >
                    {centres.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom} ({c.commune} - {c.secteur || 'Centre'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="camp-objectif" className="form-label">
                  Objectif prévisionnel de femmes à sensibiliser
                </label>
                <input
                  id="camp-objectif"
                  type="number"
                  min="10"
                  step="10"
                  className="form-input"
                  placeholder="300"
                  value={objectifFemmes}
                  onChange={(e) => setObjectifFemmes(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Section 4 : Agents de santé mobilisés */}
          <div className="form-section">
            <div className="flex items-center justify-between mb-2">
              <h3 className="form-section-title mb-0">
                4. Agents de santé mobilisés ({selectedAgentIds.length} sélectionné{selectedAgentIds.length > 1 ? 's' : ''})
              </h3>
              <span className="text-xs text-[#536B70]">
                Cochez les agents assignés à cette campagne
              </span>
            </div>

            {errors.agents && <span className="error-message block mb-2">{errors.agents}</span>}

            <div className="agents-selection-grid">
              {/* Agents du centre responsable */}
              <div className="agents-group-col">
                <span className="agents-group-title">
                  Personnel du centre : {selectedCentre?.nom || 'Centre sélectionné'}
                </span>
                <div className="space-y-2">
                  {agentsDuCentre.map((agent) => {
                    const isSelected = selectedAgentIds.includes(agent.id);
                    return (
                      <label
                        key={agent.id}
                        className={`agent-select-card ${isSelected ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAgent(agent.id)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <div className={`agent-checkbox-pill ${isSelected ? 'checked' : ''}`}>
                            {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <strong className="block text-xs font-semibold text-[#17343B]">
                              {agent.prenom} {agent.nom}
                            </strong>
                            <span className="text-xs text-[#536B70]">{agent.roleFonction}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Renforts d'autres centres */}
              {autresAgents.length > 0 && (
                <div className="agents-group-col">
                  <span className="agents-group-title">
                    Renforts disponibles d'autres centres de santé
                  </span>
                  <div className="space-y-2">
                    {autresAgents.map((agent) => {
                      const isSelected = selectedAgentIds.includes(agent.id);
                      return (
                        <label
                          key={agent.id}
                          className={`agent-select-card ${isSelected ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAgent(agent.id)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className={`agent-checkbox-pill ${isSelected ? 'checked' : ''}`}>
                              {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <strong className="block text-xs font-semibold text-[#17343B]">
                                {agent.prenom} {agent.nom}
                              </strong>
                              <span className="text-xs text-[#536B70]">
                                {agent.roleFonction} · {agent.centreNom}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pied de page du modal avec actions de soumission */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Annuler
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-modal-draft"
              onClick={() => handleSave('brouillon')}
              title="Enregistrer pour modification ultérieure"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer en brouillon</span>
            </button>

            <button
              type="button"
              className="btn-modal-submit"
              onClick={() => handleSave('en_attente')}
              title="Soumettre pour approbation par le responsable"
            >
              <Send className="w-4 h-4" />
              <span>Transmettre pour validation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
