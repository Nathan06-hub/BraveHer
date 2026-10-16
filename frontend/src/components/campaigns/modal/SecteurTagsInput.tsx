import React from 'react';
import { MapPin, X } from 'lucide-react';

interface SecteurTagsInputProps {
  secteurs: string[];
  newSecteurInput: string;
  onInputChange: (value: string) => void;
  onAddSecteur: (secteurToAdd?: string) => void;
  onRemoveSecteur: (secteurToRemove: string) => void;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  'Secteur 1',
  'Secteur 2',
  'Secteur 21',
  'Secteur 22',
  'Grand Marché',
  'Zone Périurbaine',
];

export const SecteurTagsInput: React.FC<SecteurTagsInputProps> = ({
  secteurs,
  newSecteurInput,
  onInputChange,
  onAddSecteur,
  onRemoveSecteur,
  suggestions = DEFAULT_SUGGESTIONS,
}) => {
  return (
    <div className="form-group">
      <label className="form-label required">
        Secteurs et quartiers d'intervention ({secteurs.length})
      </label>
      <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[42px] items-center">
        {secteurs.map((sec) => (
          <span
            key={sec}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#E0F3F5] text-[#005C75] border border-[#B3DFE5]"
          >
            <MapPin className="w-3 h-3 text-[#007599]" />
            <span>{sec}</span>
            <button
              type="button"
              onClick={() => onRemoveSecteur(sec)}
              className="text-[#005C75] hover:text-red-600 transition-colors cursor-pointer"
              title="Supprimer ce secteur"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        <div className="flex items-center gap-1 flex-1 min-w-[150px]">
          <input
            type="text"
            className="text-xs bg-transparent border-none outline-none focus:ring-0 w-full placeholder-gray-400 py-1 px-1"
            placeholder="Ajouter un secteur (Entrée)..."
            value={newSecteurInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddSecteur();
              }
            }}
          />
          {newSecteurInput.trim() && (
            <button
              type="button"
              className="text-xs px-2 py-0.5 rounded bg-[#007599] text-white shrink-0 hover:bg-[#005C75] cursor-pointer"
              onClick={() => onAddSecteur()}
            >
              + Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Suggestions rapides de secteurs */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <span className="text-[11px] text-[#536B70] self-center">Suggestions :</span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => onAddSecteur(sug)}
            >
              + {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
