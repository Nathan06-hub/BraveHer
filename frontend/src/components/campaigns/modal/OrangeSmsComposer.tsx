import React from 'react';
import type { GenreCible, TrancheAgeCible } from '../../../types/campaign';
import { Radio, Info } from 'lucide-react';

interface OrangeSmsComposerProps {
  activerPushSms: boolean;
  onTogglePushSms: (active: boolean) => void;
  message: string;
  onMessageChange: (msg: string) => void;
  genreCible: GenreCible;
  onGenreCibleChange: (genre: GenreCible) => void;
  trancheAgeCible: TrancheAgeCible;
  onTrancheAgeCibleChange: (tranche: TrancheAgeCible) => void;
  // Données pour le récapitulatif
  nom: string;
  centreNom: string;
  commune: string;
  dateDebut: string;
  dateFin: string;
  nbAgentsMobilises: number;
}

const TEMPLATES_LANGUES = [
  {
    langue: 'Mooré',
    texte: 'Yaa yéelé ! Dépistage précoce gratuit du cancer du sein dans votre secteur avec Soutien Rose. Protégez votre santé !',
  },
  {
    langue: 'Dioula',
    texte: 'Aw bismila ! Dépistage gratuit cancer du sein dans votre commune avec Soutien Rose. Kene ya ye foyi tèmè.',
  },
  {
    langue: 'Français',
    texte: 'Dépistage précoce gratuit du cancer du sein avec Soutien Rose. Rendez-vous dans votre centre de santé dès demain.',
  },
  {
    langue: 'Fulfuldé',
    texte: 'Jam waali ! Kuje cellal rewbe e Soutien Rose. War to do ngam depistage précoce gratuit.',
  },
];

export const OrangeSmsComposer: React.FC<OrangeSmsComposerProps> = ({
  activerPushSms,
  onTogglePushSms,
  message,
  onMessageChange,
  genreCible,
  onGenreCibleChange,
  trancheAgeCible,
  onTrancheAgeCibleChange,
  nom,
  centreNom,
  commune,
  dateDebut,
  dateFin,
  nbAgentsMobilises,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Information protocole linguistique */}
      <div className="info-banner-patient-lang py-2.5 px-3 rounded-xl bg-[#F0F9F8] border border-[#B3DFE5] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#007599] shrink-0 mt-0.5" />
        <p className="text-xs text-[#17343B] leading-relaxed m-0">
          <strong>Langues nationales automatiques :</strong> Le système de passerelle Orange adapte la langue maternelle des relances (<em>Mooré</em>, <em>Dioula</em>, <em>Fulfuldé</em>, <em>Français</em>) selon le dossier de chaque patiente.
        </p>
      </div>

      {/* Bloc Diffusion Push SMS Orange (DÉSACTIVÉ PAR DÉFAUT) */}
      <div className="p-4 bg-[#FFF9F5] border border-[#FED7AA] rounded-xl space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF7900] text-white flex items-center justify-center font-bold shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-bold text-[#17343B] block">
                Diffuser un Push SMS Orange lors du lancement
              </strong>
              <span className="text-[11px] text-[#536B70]">
                Diffusion géociblée sur les secteurs via la passerelle GSM Orange BF (désactivé par défaut)
              </span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activerPushSms}
              onChange={(e) => onTogglePushSms(e.target.checked)}
              className="w-4 h-4 text-[#FF7900] rounded border-gray-300 focus:ring-[#FF7900] cursor-pointer"
            />
            <span className={`text-xs font-bold ${activerPushSms ? 'text-[#FF7900]' : 'text-[#536B70]'}`}>
              {activerPushSms ? 'Activé' : 'Désactivé'}
            </span>
          </label>
        </div>

        {activerPushSms ? (
          <div className="space-y-3 pt-2 border-t border-[#FED7AA]/60">
            {/* Modèles en 1 clic */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#C2410C]">
                Modèles rapides en langues nationales :
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {message.length} / 160 car. (1 SMS)
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES_LANGUES.map((tmpl) => (
                <button
                  key={tmpl.langue}
                  type="button"
                  className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#FED7AA] text-[#C2410C] hover:bg-[#FFF2EA] cursor-pointer"
                  onClick={() => onMessageChange(tmpl.texte)}
                >
                  {tmpl.langue}
                </button>
              ))}
            </div>

            {/* Zone de texte du message */}
            <div className="form-group mb-0">
              <textarea
                className="form-textarea font-mono text-xs bg-white"
                rows={3}
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="Rédigez le message SMS d'alerte..."
              />
            </div>

            {/* Paramètres de ciblage démographique */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-[#17343B] block mb-1">
                  Audience ciblée
                </label>
                <select
                  className="form-input text-xs"
                  value={genreCible}
                  onChange={(e) => onGenreCibleChange(e.target.value as GenreCible)}
                >
                  <option value="FEMMES_UNIQUEMENT">Femmes uniquement (Priorité absolue)</option>
                  <option value="TOUS_PUBLICS">Tous publics (Sensibilisation large)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#17343B] block mb-1">
                  Tranche d'âge cible
                </label>
                <select
                  className="form-input text-xs"
                  value={trancheAgeCible}
                  onChange={(e) => onTrancheAgeCibleChange(e.target.value as TrancheAgeCible)}
                >
                  <option value="25-49">25 à 49 ans (Dépistage prioritaire)</option>
                  <option value="15-25">15 à 25 ans (Sensibilisation & auto-palpation)</option>
                  <option value="50+">50 ans et plus (Surveillance accrue)</option>
                  <option value="TOUTES">Toutes tranches d'âge</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-white/70 rounded-lg border border-dashed border-[#FED7AA] text-xs text-[#536B70]">
            Aucune diffusion SMS ne sera déclenchée lors de la création. Vous pourrez toujours activer la campagne SMS ultérieurement depuis le tableau de bord des messages.
          </div>
        )}
      </div>

      {/* Récapitulatif de la mission */}
      <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
        <strong className="text-xs font-bold text-[#17343B] block">
          Récapitulatif de la mission prête à être transmise :
        </strong>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[#536B70] pt-1">
          <div>Titre : <strong className="text-[#17343B]">{nom || 'Non renseigné'}</strong></div>
          <div>Centre : <strong className="text-[#17343B]">{centreNom || 'Centre'}</strong></div>
          <div>Commune : <strong className="text-[#17343B]">{commune}</strong></div>
          <div>Dates : <strong className="text-[#17343B]">{dateDebut} au {dateFin}</strong></div>
          <div>Personnel : <strong className="text-[#17343B]">{nbAgentsMobilises} mobilisé(s)</strong></div>
          <div>Push SMS : <strong className={activerPushSms ? 'text-[#FF7900]' : 'text-gray-500'}>{activerPushSms ? 'Oui' : 'Non'}</strong></div>
        </div>
      </div>
    </div>
  );
};
