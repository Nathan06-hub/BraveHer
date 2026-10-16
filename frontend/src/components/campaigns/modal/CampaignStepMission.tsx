import React from 'react';
import type { CentreSante } from '../../../types/campaign';
import { Calendar, Clock, MapPin, Building2, Users, Sparkles } from 'lucide-react';
import { SecteurTagsInput } from './SecteurTagsInput';

interface CampaignStepMissionProps {
  nom: string;
  onNomChange: (val: string) => void;
  centreId: string;
  onCentreIdChange: (val: string) => void;
  centres: CentreSante[];
  commune: string;
  onCommuneChange: (val: string) => void;
  secteurs: string[];
  newSecteurInput: string;
  onNewSecteurInputChange: (val: string) => void;
  onAddSecteur: (secteurToAdd?: string) => void;
  onRemoveSecteur: (secToRemove: string) => void;
  dateDebut: string;
  onDateDebutChange: (val: string) => void;
  dateFin: string;
  onDateFinChange: (val: string) => void;
  horaires: string;
  onHorairesChange: (val: string) => void;
  objectifFemmes: number;
  onObjectifFemmesChange: (val: number) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
}

const QUICK_TITLE_SUGGESTIONS = [
  'Caravane Dépistage Octobre Rose',
  'Sensibilisation Communautaire & Auto-Palpation',
  'Mission Mobile Dépistage de Proximité',
];

export const CampaignStepMission: React.FC<CampaignStepMissionProps> = ({
  nom,
  onNomChange,
  centreId,
  onCentreIdChange,
  centres,
  commune,
  onCommuneChange,
  secteurs,
  newSecteurInput,
  onNewSecteurInputChange,
  onAddSecteur,
  onRemoveSecteur,
  dateDebut,
  onDateDebutChange,
  dateFin,
  onDateFinChange,
  horaires,
  onHorairesChange,
  objectifFemmes,
  onObjectifFemmesChange,
  description,
  onDescriptionChange,
  errors,
  onClearError,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Nom / Titre de la campagne */}
      <div className="form-group">
        <div className="flex items-center justify-between">
          <label htmlFor="camp-nom" className="form-label required">
            Titre ou Nom de la campagne
          </label>
          <span className="text-[11px] text-[#536B70]">
            Ex: Caravane Dépistage Octobre Rose
          </span>
        </div>
        <input
          id="camp-nom"
          type="text"
          className={`form-input font-medium ${errors.nom ? 'input-error' : ''}`}
          placeholder="Intitulé officiel de la mission..."
          value={nom}
          onChange={(e) => {
            onNomChange(e.target.value);
            if (errors.nom) onClearError('nom');
          }}
          autoFocus
        />
        {errors.nom && <span className="form-error">{errors.nom}</span>}

        {/* Suggestions rapides en 1 clic */}
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {QUICK_TITLE_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="text-[11px] px-2 py-0.5 rounded-full bg-[#F0F9F8] border border-[#B3DFE5] text-[#005C75] hover:bg-[#E0F3F5] transition-colors cursor-pointer flex items-center gap-1"
              onClick={() => onNomChange(suggestion)}
            >
              <Sparkles className="w-3 h-3 text-[#007599]" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Centre de santé responsable & Commune */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              onChange={(e) => {
                const newCentreId = e.target.value;
                onCentreIdChange(newCentreId);
                const c = centres.find((ct) => ct.id === newCentreId);
                if (c && c.commune) onCommuneChange(c.commune);
              }}
            >
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} ({c.commune})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="camp-commune" className="form-label required">
            Commune burkinabè
          </label>
          <div className="relative">
            <MapPin className="form-field-icon" />
            <select
              id="camp-commune"
              className="form-input with-icon"
              value={commune}
              onChange={(e) => onCommuneChange(e.target.value)}
            >
              <option value="Ouagadougou">Ouagadougou</option>
              <option value="Bobo-Dioulasso">Bobo-Dioulasso</option>
              <option value="Koudougou">Koudougou</option>
              <option value="Ouahigouya">Ouahigouya</option>
              <option value="Banfora">Banfora</option>
              <option value="Dédougou">Dédougou</option>
              <option value="Kaya">Kaya</option>
              <option value="Fada N’Gourma">Fada N’Gourma</option>
              <option value="Tenkodogo">Tenkodogo</option>
              <option value="Dori">Dori</option>
            </select>
          </div>
        </div>
      </div>

      {/* Secteurs & Quartiers ciblés */}
      <SecteurTagsInput
        secteurs={secteurs}
        newSecteurInput={newSecteurInput}
        onInputChange={onNewSecteurInputChange}
        onAddSecteur={onAddSecteur}
        onRemoveSecteur={onRemoveSecteur}
      />

      {/* Calendrier de déploiement */}
      <div className="p-3.5 bg-[#F0F9F8] border border-[#B3DFE5] rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#007599]" />
          <strong className="text-xs font-bold text-[#005C75] uppercase tracking-wide">
            Calendrier de la mission sur le terrain
          </strong>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-group mb-0">
            <label htmlFor="camp-date-debut" className="form-label required text-xs">
              Date de début
            </label>
            <input
              id="camp-date-debut"
              type="date"
              className={`form-input text-xs ${errors.dateDebut ? 'input-error' : ''}`}
              value={dateDebut}
              onChange={(e) => {
                onDateDebutChange(e.target.value);
                if (errors.dateDebut) onClearError('dateDebut');
              }}
            />
            {errors.dateDebut && <span className="form-error">{errors.dateDebut}</span>}
          </div>

          <div className="form-group mb-0">
            <label htmlFor="camp-date-fin" className="form-label required text-xs">
              Date de clôture
            </label>
            <input
              id="camp-date-fin"
              type="date"
              className={`form-input text-xs ${errors.dateFin ? 'input-error' : ''}`}
              value={dateFin}
              onChange={(e) => {
                onDateFinChange(e.target.value);
                if (errors.dateFin) onClearError('dateFin');
              }}
            />
            {errors.dateFin && <span className="form-error">{errors.dateFin}</span>}
          </div>

          <div className="form-group mb-0">
            <label htmlFor="camp-horaires" className="form-label text-xs">
              Horaires d'accueil
            </label>
            <div className="relative">
              <Clock className="form-field-icon" />
              <input
                id="camp-horaires"
                type="text"
                className="form-input with-icon text-xs"
                placeholder="Ex: 08:00 - 15:30"
                value={horaires}
                onChange={(e) => onHorairesChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Objectif de femmes & Description */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="form-group sm:col-span-1">
          <label htmlFor="camp-quota" className="form-label required">
            Objectif femmes ciblées
          </label>
          <div className="relative">
            <Users className="form-field-icon" />
            <input
              id="camp-quota"
              type="number"
              min={10}
              step={25}
              className="form-input with-icon"
              value={objectifFemmes}
              onChange={(e) => onObjectifFemmesChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="form-group sm:col-span-2">
          <label htmlFor="camp-desc" className="form-label">
            Description & Objectifs de santé
          </label>
          <textarea
            id="camp-desc"
            className="form-textarea text-xs"
            rows={2}
            placeholder="Objectifs de dépistage précoce, ateliers d’auto-palpation..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
