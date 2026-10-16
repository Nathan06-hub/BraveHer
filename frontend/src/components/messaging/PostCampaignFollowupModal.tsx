import React, { useState } from 'react';
import type { Campagne, PersonneSensibilisee } from '../../types/campaign';
import {
  X,
  Send,
  Users,
  Radio,
} from 'lucide-react';

interface PostCampaignFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  campagnes: Campagne[];
  allPersonnes: PersonneSensibilisee[];
  onConfirmFollowup: (
    campagneId: string,
    targetFilter: 'A_ORIENTER' | 'EFFECTUE' | 'TOUTES',
    messages: {
      moore: string;
      dioula: string;
      fulfulde: string;
      francais: string;
    }
  ) => void;
}

export const PostCampaignFollowupModal: React.FC<PostCampaignFollowupModalProps> = ({
  isOpen,
  onClose,
  campagnes,
  allPersonnes,
  onConfirmFollowup,
}) => {
  if (!isOpen) return null;

  const [selectedCampagneId, setSelectedCampagneId] = useState<string>(
    campagnes[0]?.id || ''
  );
  const [targetFilter, setTargetFilter] = useState<'A_ORIENTER' | 'EFFECTUE' | 'TOUTES'>('A_ORIENTER');

  // Textes multilingues pré-rédigés
  const [messages, setMessages] = useState({
    moore:
      'Yaa yéelé {prenom} ! Tɩɩm tũub : segd n waan CSPS tɩ b maan echographie n kɩs sɩd. Soutien Rose be y sʋka.',
    dioula:
      'Aw bismila {prenom} ! I ka échographie kɛ dɔgɔtɔrɔso la jona jona. Kɛnɛya ye foyi tɛmɛ. Soutien Rose be yɛrɛ la.',
    fulfulde:
      'Jam waali {prenom} ! War to CSPS ngam ƴeewtindaade echographie. Cellal maada na heewi nafoore.',
    francais:
      'Bonjour {prenom} ! Suite à votre dépistage lors de la campagne, nous vous attendons au CSPS pour votre échographie de confirmation.',
  });

  const [activePreviewLang, setActivePreviewLang] = useState<'moore' | 'dioula' | 'fulfulde' | 'francais'>('moore');

  // Campagne sélectionnée et patientes cibles
  const selectedCamp = campagnes.find((c) => c.id === selectedCampagneId);
  const personnesCampagne = allPersonnes.filter((p) => p.campagneId === selectedCampagneId);

  const targetedPersonnes = personnesCampagne.filter((p) => {
    if (targetFilter === 'A_ORIENTER') return p.statutDepistage === 'À orienter';
    if (targetFilter === 'EFFECTUE') return p.statutDepistage === 'Effectué';
    return true;
  });

  const handleTemplateChange = (type: 'A_ORIENTER' | 'EFFECTUE' | 'TOUTES') => {
    setTargetFilter(type);
    if (type === 'A_ORIENTER') {
      setMessages({
        moore:
          'Yaa yéelé {prenom} ! Tɩɩm tũub : segd n waan CSPS tɩ b maan echographie n kɩs sɩd. Soutien Rose be y sʋka.',
        dioula:
          'Aw bismila {prenom} ! I ka échographie kɛ dɔgɔtɔrɔso la jona jona. Kɛnɛya ye foyi tɛmɛ. Soutien Rose be yɛrɛ la.',
        fulfulde:
          'Jam waali {prenom} ! War to CSPS ngam ƴeewtindaade echographie. Cellal maada na heewi nafoore.',
        francais:
          'Bonjour {prenom} ! Suite à votre dépistage lors de la campagne, nous vous attendons au CSPS pour votre échographie de confirmation.',
      });
    } else if (type === 'EFFECTUE') {
      setMessages({
        moore:
          'Bark wʋsgo {prenom} ! F dépistage zĩiga yaa songe. Ra yĩm f meng gesg kalo fãa ye. Yaa laafɩ !',
        dioula:
          'I ni ce {prenom} ! I ka dépistage kɛra koɲuman. I kana ɲinɛ i yɛrɛ sinsin kɔlɔsi kalo o kalo.',
        fulfulde:
          'A jaaraama {prenom} ! Kuje depistage maada no moƴƴi. Wata a yejjit ƴeewtindaade lewru fuu.',
        francais:
          "Merci {prenom} d'avoir participé au dépistage ! Votre examen est normal. Continuez votre autopalpation chaque mois.",
      });
    } else {
      setMessages({
        moore:
          'Yaa yéelé {prenom} ! Campagne de dépistage la keta. Sõng-y y taaba n wa CSPS. Soutien Rose Burkina Faso.',
        dioula:
          'Aw bismila {prenom} ! Dépistage bɛ ka taa fɛ. Aw ka na dɔgɔtɔrɔso la. Kɛnɛya ye foyi tɛmɛ.',
        fulfulde:
          'Jam waali {prenom} ! Depistage no heedi suudu lokkotoroo. War-en fuu ngam cellal.',
        francais:
          'Bonjour {prenom} ! La campagne de sensibilisation et dépistage continue au CSPS. Parlez-en à vos proches.',
      });
    }
  };

  const handleConfirm = () => {
    if (!selectedCampagneId) return;
    onConfirmFollowup(selectedCampagneId, targetFilter, messages);
    onClose();
  };

  return (
    <div className="modal-backdrop z-[110]" role="dialog" aria-modal="true">
      <div className="modal-content max-w-2xl bg-white rounded-2xl shadow-2xl p-6 border border-[#D6E8E8] space-y-4 animate-in fade-in">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#007599] text-white flex items-center justify-center font-bold shadow-sm">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17343B]">
                📢 Relance & Suivi Post-Campagne ciblée par Langue
              </h3>
              <p className="text-xs text-[#536B70]">
                Chaque patiente recevra le rappel dans la <strong>langue maternelle</strong> enregistrée dans son dossier.
              </p>
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

        {/* Sélection de la campagne */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F0F9F8] p-3 rounded-xl border border-[#D6E8E8]">
          <div>
            <label className="text-[11px] font-bold text-[#536B70] uppercase tracking-wide block mb-1">
              Campagne source :
            </label>
            <select
              className="form-input text-xs"
              value={selectedCampagneId}
              onChange={(e) => setSelectedCampagneId(e.target.value)}
            >
              {campagnes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titre || c.nom} ({c.commune})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#536B70] uppercase tracking-wide block mb-1">
              Groupe cible de patientes :
            </label>
            <select
              className="form-input text-xs"
              value={targetFilter}
              onChange={(e) => handleTemplateChange(e.target.value as any)}
            >
              <option value="A_ORIENTER">
                🚨 Patientes avec suspicion (À orienter pour échographie)
              </option>
              <option value="EFFECTUE">
                ✅ Patientes dépistées normales (Autopalpation mensuelle)
              </option>
              <option value="TOUTES">
                👥 Toutes les femmes sensibilisées sur cette campagne
              </option>
            </select>
          </div>
        </div>

        {/* Compteur de destinataires détectés */}
        <div className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-[#D6E8E8]">
          <span className="text-[#536B70] font-medium flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#007599]" />
            <span>Destinataires éligibles trouvées :</span>
          </span>
          <strong className="text-[#17343B] font-bold bg-[#F0F9F8] px-2 py-0.5 rounded text-xs">
            {targetedPersonnes.length} patientes ({selectedCamp?.secteurCible || 'Secteur'})
          </strong>
        </div>

        {/* Textes du SMS traduits */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="text-xs font-bold text-[#17343B]">
              Personnalisation des messages par langue :
            </span>

            <div className="flex items-center gap-1">
              {(['moore', 'dioula', 'fulfulde', 'francais'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActivePreviewLang(l)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-all capitalize ${
                    activePreviewLang === l
                      ? 'bg-[#007599] text-white'
                      : 'bg-[#F1F5F9] text-[#536B70] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {l === 'moore' ? 'Mooré' : l === 'dioula' ? 'Dioula' : l === 'fulfulde' ? 'Fulfuldé' : 'Français'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <textarea
              rows={3}
              className="form-input text-xs font-mono resize-none leading-relaxed w-full"
              value={messages[activePreviewLang]}
              onChange={(e) =>
                setMessages({ ...messages, [activePreviewLang]: e.target.value })
              }
            />
            <span className="text-[11px] text-[#536B70] block">
              💡 Le tag <code className="font-bold text-[#007599]">{'{prenom}'}</code> sera automatiquement remplacé par le prénom individuel de chaque patiente.
            </span>
          </div>
        </div>

        {/* Boutons d'action */}
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
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#007599] hover:bg-[#005C75] transition-colors shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Diffuser la relance ({targetedPersonnes.length} SMS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
