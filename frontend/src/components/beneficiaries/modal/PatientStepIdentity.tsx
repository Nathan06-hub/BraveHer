import React from 'react';
import type { Campagne, LanguePatiente } from '../../../types/campaign';
import { User, Phone, MessageSquare, Smartphone, Sparkles, Megaphone } from 'lucide-react';

interface PatientStepIdentityProps {
  nom: string;
  onNomChange: (val: string) => void;
  prenom: string;
  onPrenomChange: (val: string) => void;
  age: number;
  onAgeChange: (val: number) => void;
  telephone: string;
  onTelephoneChange: (val: string) => void;
  utiliseWhatsApp: boolean;
  onUtiliseWhatsAppChange: (val: boolean) => void;
  languePreferee: LanguePatiente;
  onLanguePrefereeChange: (val: LanguePatiente) => void;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
  assignedCampagne?: Campagne | null;
}

const AGE_SUGGESTIONS = [25, 35, 45, 55, 65];

export const PatientStepIdentity: React.FC<PatientStepIdentityProps> = ({
  nom,
  onNomChange,
  prenom,
  onPrenomChange,
  age,
  onAgeChange,
  telephone,
  onTelephoneChange,
  utiliseWhatsApp,
  onUtiliseWhatsAppChange,
  languePreferee,
  onLanguePrefereeChange,
  errors,
  onClearError,
  assignedCampagne,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Information d'affectation campagne si présente */}
      {assignedCampagne && (
        <div className="p-3 bg-[#EEF7F7] border border-[#B3DFE5] rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#007599] text-white flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#005C75] uppercase block">
                Affectation Campagne Active
              </span>
              <strong className="text-xs text-[#17343B]">
                {assignedCampagne.nom || assignedCampagne.titre}
              </strong>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Campagne en cours
          </span>
        </div>
      )}

      {/* Information d'accueil */}
      <div className="p-3 bg-[#F0F9F8] border border-[#B3DFE5] rounded-xl flex items-center gap-2.5">
        <User className="w-4 h-4 text-[#007599] shrink-0" />
        <span className="text-xs text-[#005C75] font-medium leading-relaxed">
          Saisissez l'état civil de la patiente. Les rappels de dépistage lui seront transmis dans sa langue maternelle.
        </span>
      </div>

      {/* Nom & Prénom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="form-group mb-0">
          <label htmlFor="patient-nom" className="form-label required text-xs">
            Nom de famille
          </label>
          <input
            id="patient-nom"
            type="text"
            className={`form-input text-xs uppercase ${errors.nom ? 'input-error' : ''}`}
            placeholder="Ex: OUÉDRAOGO"
            value={nom}
            onChange={(e) => {
              onNomChange(e.target.value.toUpperCase());
              if (errors.nom) onClearError('nom');
            }}
            autoFocus
          />
          {errors.nom && <span className="form-error">{errors.nom}</span>}
        </div>

        <div className="form-group mb-0">
          <label htmlFor="patient-prenom" className="form-label required text-xs">
            Prénom(s)
          </label>
          <input
            id="patient-prenom"
            type="text"
            className={`form-input text-xs ${errors.prenom ? 'input-error' : ''}`}
            placeholder="Ex: Salimata"
            value={prenom}
            onChange={(e) => {
              onPrenomChange(e.target.value);
              if (errors.prenom) onClearError('prenom');
            }}
          />
          {errors.prenom && <span className="form-error">{errors.prenom}</span>}
        </div>
      </div>

      {/* Âge avec suggestions en 1 clic */}
      <div className="form-group mb-0">
        <div className="flex items-center justify-between">
          <label htmlFor="patient-age" className="form-label required text-xs">
            Âge de la patiente (ans)
          </label>
          <span className="text-[11px] text-[#536B70]">Cible prioritaire dépistage : 25 à 55 ans</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="patient-age"
            type="number"
            min={15}
            max={105}
            className={`form-input text-xs w-28 ${errors.age ? 'input-error' : ''}`}
            value={age || ''}
            onChange={(e) => {
              onAgeChange(Number(e.target.value));
              if (errors.age) onClearError('age');
            }}
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 self-center">Suggestions :</span>
            {AGE_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[#17343B] font-medium transition-colors cursor-pointer"
                onClick={() => {
                  onAgeChange(sug);
                  if (errors.age) onClearError('age');
                }}
              >
                {sug} ans
              </button>
            ))}
          </div>
        </div>
        {errors.age && <span className="form-error">{errors.age}</span>}
      </div>

      {/* Téléphone & Canal WhatsApp/SMS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div className="form-group mb-0">
          <label htmlFor="patient-tel" className="form-label required text-xs">
            Numéro de téléphone (+226 ...)
          </label>
          <div className="relative">
            <Phone className="form-field-icon" />
            <input
              id="patient-tel"
              type="tel"
              className={`form-input with-icon text-xs ${errors.telephone ? 'input-error' : ''}`}
              placeholder="+226 70 XX XX XX"
              value={telephone}
              onChange={(e) => {
                onTelephoneChange(e.target.value);
                if (errors.telephone) onClearError('telephone');
              }}
            />
          </div>
          {errors.telephone && <span className="form-error">{errors.telephone}</span>}
        </div>

        {/* Choix Canal : SMS vs WhatsApp */}
        <div className="form-group mb-0">
          <label className="form-label text-xs">Canal de notification privilégié</label>
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <button
              type="button"
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !utiliseWhatsApp
                  ? 'bg-[#EEF7F7] border-[#007599] text-[#005C75]'
                  : 'bg-white border-gray-200 text-[#536B70] hover:border-gray-300'
              }`}
              onClick={() => onUtiliseWhatsAppChange(false)}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SMS Standard</span>
            </button>

            <button
              type="button"
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                utiliseWhatsApp
                  ? 'bg-[#EBF7EE] border-[#16A34A] text-[#15803D]'
                  : 'bg-white border-gray-200 text-[#536B70] hover:border-gray-300'
              }`}
              onClick={() => onUtiliseWhatsAppChange(true)}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Langue locale */}
      <div className="form-group mb-0 pt-1">
        <label className="form-label required text-xs">
          Langue maternelle pour les relances vocales & SMS
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-0.5">
          {(['Mooré', 'Dioula', 'Fulfuldé', 'Français'] as LanguePatiente[]).map((lang) => (
            <label
              key={lang}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                languePreferee === lang
                  ? 'bg-[#F0F9F8] border-[#007599] text-[#005C75] shadow-xs'
                  : 'bg-white border-gray-200 text-[#536B70] hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="patient-langue"
                checked={languePreferee === lang}
                onChange={() => onLanguePrefereeChange(lang)}
                className="sr-only"
              />
              <Sparkles className={`w-3 h-3 ${languePreferee === lang ? 'text-[#007599]' : 'text-gray-400'}`} />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
