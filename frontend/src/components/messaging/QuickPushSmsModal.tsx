import React, { useState } from 'react';
import type { LanguePatiente } from '../../types/campaign';
import { COMMUNES_BF } from '../../data/mockCampaignData';
import {
  X,
  Send,
  Radio,
  Smartphone,
} from 'lucide-react';

interface QuickPushSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQuickPush: (
    commune: string,
    secteur: string,
    langue: LanguePatiente,
    contenu: string,
    estimatedCount: number
  ) => void;
}

export const QuickPushSmsModal: React.FC<QuickPushSmsModalProps> = ({
  isOpen,
  onClose,
  onSendQuickPush,
}) => {
  if (!isOpen) return null;

  const [commune, setCommune] = useState('Ouagadougou');
  const [secteur, setSecteur] = useState('Secteur 22');
  const [langue, setLangue] = useState<LanguePatiente>('Mooré');
  const [contenu, setContenu] = useState(
    'Yaa yéelé ! Dépistage gratuit du cancer du sein ce samedi au CSPS. Venez nombreuses protéger votre santé.'
  );

  const handleTemplate = (lang: LanguePatiente) => {
    setLangue(lang);
    if (lang === 'Mooré') {
      setContenu(
        'Yaa yéelé ! Dépistage gratuit du cancer du sein ce samedi au CSPS. Venez nombreuses protéger votre santé.'
      );
    } else if (lang === 'Dioula') {
      setContenu(
        'Aw bismila ! Dépistage gbansan cancer du sein kɔnɔ bi sibiridon CSPS la. Kɛnɛya ye foyi tɛmɛ.'
      );
    } else if (lang === 'Fulfuldé') {
      setContenu(
        'Jam waali ! Depistage preveentif gratuit cancer suudu cellal. War to do cellal maada.'
      );
    } else {
      setContenu(
        'Alerte Prévention Soutien Rose : Dépistage gratuit et confidentiel du cancer du sein ce week-end dans votre CSPS.'
      );
    }
  };

  const handleSend = () => {
    if (!contenu.trim()) return;
    const estimated = Math.floor(250 + Math.random() * 200);
    onSendQuickPush(commune, secteur, langue, contenu.trim(), estimated);
    onClose();
  };

  return (
    <div className="modal-backdrop z-[110]" role="dialog" aria-modal="true">
      <div className="modal-content max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-[#FFD8B8] space-y-4 animate-in fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FF7900] text-white flex items-center justify-center font-bold">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17343B]">
                ⚡ Alerte Push SMS Orange Immédiate
              </h3>
              <span className="text-[11px] text-[#536B70]">
                Diffusion GSM instantanée par secteur géographique
              </span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-[#FFF9F5] p-3 rounded-xl border border-[#FFD8B8]">
          <div>
            <label className="text-[11px] font-bold text-[#536B70] uppercase tracking-wide block mb-1">
              Commune :
            </label>
            <select
              className="form-input text-xs"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
            >
              {COMMUNES_BF.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#536B70] uppercase tracking-wide block mb-1">
              Secteur / Quartier :
            </label>
            <input
              type="text"
              className="form-input text-xs"
              value={secteur}
              onChange={(e) => setSecteur(e.target.value)}
              placeholder="Ex : Secteur 22"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#536B70] uppercase tracking-wide block mb-1.5">
            Langue locale de diffusion :
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Mooré', 'Dioula', 'Fulfuldé', 'Français'] as LanguePatiente[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => handleTemplate(l)}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                  langue === l
                    ? 'bg-[#FF7900] text-white border-[#FF7900] shadow-sm'
                    : 'bg-[#F8FAFB] text-[#17343B] border-[#D6E8E8] hover:bg-[#F1F5F9]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[#17343B]">
              Texte du SMS ({langue}) :
            </label>
            <span
              className={`text-[11px] font-mono ${
                contenu.length > 160 ? 'text-amber-600 font-bold' : 'text-[#536B70]'
              }`}
            >
              {contenu.length} / 160 caractères
            </span>
          </div>
          <textarea
            rows={3}
            className="form-input text-xs font-mono resize-none leading-relaxed w-full"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[#536B70] bg-[#F8FAFB] p-2.5 rounded-lg border border-[#D6E8E8]">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-[#FF7900]" />
            <span>Passerelle GSM Orange BF</span>
          </span>
          <span>~ 300 à 450 téléphones cibles</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6E8E8]">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF7900] hover:bg-[#E06A00] transition-colors shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Diffuser immédiatement via Orange BF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
