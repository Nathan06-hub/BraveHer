import React from 'react';
import type { StatutVulnerabilite } from '../../../types/beneficiary';
import type { CentreSante } from '../../../types/campaign';
import { MapPin, Building2, ShieldAlert, Heart, User } from 'lucide-react';

interface PatientStepLocationProps {
  commune: string;
  onCommuneChange: (val: string) => void;
  secteur: string;
  onSecteurChange: (val: string) => void;
  centreSuiviId: string;
  onCentreSuiviIdChange: (val: string) => void;
  centres: CentreSante[];
  statutVulnerabilite: StatutVulnerabilite;
  onStatutVulnerabiliteChange: (val: StatutVulnerabilite) => void;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
}

const BURKINA_COMMUNES = [
  'Ouagadougou',
  'Bobo-Dioulasso',
  'Koudougou',
  'Ouahigouya',
  'Banfora',
  'Dédougou',
  'Kaya',
  'Fada N’Gourma',
  'Tenkodogo',
  'Dori',
  'Djibo',
];

const SECTEUR_SUGGESTIONS = [
  'Secteur 1',
  'Secteur 2',
  'Secteur 21',
  'Secteur 28 (Karpala)',
  'Zone Périurbaine',
  'Grand Marché',
];

export const PatientStepLocation: React.FC<PatientStepLocationProps> = ({
  commune,
  onCommuneChange,
  secteur,
  onSecteurChange,
  centreSuiviId,
  onCentreSuiviIdChange,
  centres,
  statutVulnerabilite,
  onStatutVulnerabiliteChange,
  errors,
  onClearError,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Commune & Secteur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="form-group mb-0">
          <label htmlFor="patient-commune" className="form-label required text-xs">
            Commune burkinabè de résidence
          </label>
          <div className="relative">
            <MapPin className="form-field-icon" />
            <select
              id="patient-commune"
              className="form-input with-icon text-xs"
              value={commune}
              onChange={(e) => {
                onCommuneChange(e.target.value);
                if (errors.commune) onClearError('commune');
              }}
            >
              {BURKINA_COMMUNES.map((com) => (
                <option key={com} value={com}>
                  {com}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group mb-0">
          <label htmlFor="patient-secteur" className="form-label required text-xs">
            Secteur, quartier ou village
          </label>
          <input
            id="patient-secteur"
            type="text"
            className={`form-input text-xs ${errors.secteur ? 'input-error' : ''}`}
            placeholder="Ex: Secteur 28 (Karpala)"
            value={secteur}
            onChange={(e) => {
              onSecteurChange(e.target.value);
              if (errors.secteur) onClearError('secteur');
            }}
          />
          {errors.secteur && <span className="form-error">{errors.secteur}</span>}
        </div>
      </div>

      {/* Suggestions rapides de secteurs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-[#536B70]">Suggestions rapides :</span>
        {SECTEUR_SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            type="button"
            className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[#17343B] font-medium transition-colors cursor-pointer"
            onClick={() => onSecteurChange(sug)}
          >
            + {sug}
          </button>
        ))}
      </div>

      {/* Centre de santé référent / CSPS de suivi */}
      <div className="form-group mb-0 pt-1">
        <label htmlFor="patient-centre" className="form-label required text-xs">
          Centre de santé responsable & suivi du carnet
        </label>
        <div className="relative">
          <Building2 className="form-field-icon" />
          <select
            id="patient-centre"
            className="form-input with-icon text-xs"
            value={centreSuiviId}
            onChange={(e) => onCentreSuiviIdChange(e.target.value)}
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} — {c.commune}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Situation de Vulnérabilité & Inclusion Sociale */}
      <div className="form-group mb-0 pt-1">
        <label className="form-label required text-xs">
          Situation de vulnérabilité & Éligibilité au Fonds de Solidarité
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1">
          {/* Standard */}
          <label
            className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
              statutVulnerabilite === 'Standard'
                ? 'bg-[#EEF7F7] border-[#007599] shadow-xs'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="vulnerabilite"
              checked={statutVulnerabilite === 'Standard'}
              onChange={() => onStatutVulnerabiliteChange('Standard')}
              className="sr-only"
            />
            <div className="flex items-center gap-2 mb-1.5">
              <User className="w-4 h-4 text-slate-500" />
              <strong className="text-xs font-bold text-[#17343B]">Standard</strong>
            </div>
            <p className="text-[11px] text-[#64748B] leading-tight m-0">
              Résidente standard avec carnet de santé classique.
            </p>
          </label>

          {/* Vulnérable */}
          <label
            className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
              statutVulnerabilite === 'Vulnerable'
                ? 'bg-rose-50 border-rose-400 shadow-xs'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="vulnerabilite"
              checked={statutVulnerabilite === 'Vulnerable'}
              onChange={() => onStatutVulnerabiliteChange('Vulnerable')}
              className="sr-only"
            />
            <div className="flex items-center gap-2 mb-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <strong className="text-xs font-bold text-rose-900">Femme Vulnérable</strong>
            </div>
            <p className="text-[11px] text-rose-700 leading-tight m-0">
              Difficultés économiques. Soutien pour les transports & examens.
            </p>
          </label>

          {/* PDI */}
          <label
            className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
              statutVulnerabilite === 'PDI'
                ? 'bg-purple-50 border-purple-400 shadow-xs'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="vulnerabilite"
              checked={statutVulnerabilite === 'PDI'}
              onChange={() => onStatutVulnerabiliteChange('PDI')}
              className="sr-only"
            />
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <strong className="text-xs font-bold text-purple-900">PDI (Déplacée Interne)</strong>
            </div>
            <p className="text-[11px] text-purple-700 leading-tight m-0">
              Priorité absolue : Prise en charge 100% via Bons de Santé Orange Money.
            </p>
          </label>
        </div>
      </div>
    </div>
  );
};
