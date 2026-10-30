import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Volume2, RotateCcw, Check, AlertCircle } from 'lucide-react';

export interface DetectedIndicators {
  nodule?: boolean;
  consistanceNodule?: 'dur_adherent' | 'ferme' | 'mobile_elastique' | 'aucun';
  tailleNoduleCm?: number;
  peauOrange?: boolean;
  retractionCutanee?: boolean;
  ecoulementMamelonnaire?: boolean;
  typeEcoulement?: 'sanglant' | 'sereux' | 'purulent' | 'aucun';
  adenopathieAxillaire?: boolean;
  seinConcerne?: 'gauche' | 'droit' | 'bilateral' | 'aucun';
  quadrant?: 'supero_externe' | 'supero_interne' | 'infero_externe' | 'infero_interne' | 'retro_areolaire' | 'aucun';
  douleurMammaire?: boolean;
  modificationTailleForme?: boolean;
  antecedentsFamiliaux?: boolean;
}

interface DicteeVocaleProps {
  observations: string;
  onObservationsChange: (val: string) => void;
  onDetectedIndicators?: (indicators: DetectedIndicators) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
}

// Repérage déterministe de mots-clés, testable
export function extraireIndicateursCliniques(text: string): {
  detected: DetectedIndicators;
  badges: string[];
} {
  const lower = text.toLowerCase();
  const detected: DetectedIndicators = {};
  const badges: string[] = [];

  // Nodule & consistance
  if (
    lower.includes('nodule') ||
    lower.includes('masse') ||
    lower.includes('boule') ||
    lower.includes('tumeur')
  ) {
    detected.nodule = true;
    if (lower.includes('dur') || lower.includes('adhérent') || lower.includes('pierre')) {
      detected.consistanceNodule = 'dur_adherent';
      badges.push('Nodule dur/adhérent (+3 pts)');
    } else if (lower.includes('ferme')) {
      detected.consistanceNodule = 'ferme';
      badges.push('Nodule ferme (+3 pts)');
    } else if (lower.includes('mobile') || lower.includes('élastique') || lower.includes('kyste')) {
      detected.consistanceNodule = 'mobile_elastique';
      badges.push('Nodule mobile/kystique (+3 pts)');
    } else {
      badges.push('Nodule suspect (+3 pts)');
    }
  }

  // Taille
  const matchTaille = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:cm|centimètre|centimètres)/);
  if (matchTaille) {
    const cm = parseFloat(matchTaille[1].replace(',', '.'));
    if (!isNaN(cm)) {
      detected.tailleNoduleCm = cm;
      badges.push(`Taille estimée : ${cm} cm`);
    }
  }

  // Peau d'orange / Rétraction (+3 pts)
  if (lower.includes('peau d\'orange') || lower.includes('orange') || lower.includes('capiton')) {
    detected.peauOrange = true;
    badges.push('Peau d’orange (+3 pts)');
  }
  if (lower.includes('rétraction') || lower.includes('ombilication') || lower.includes('méplat')) {
    detected.retractionCutanee = true;
    badges.push('Rétraction cutanée (+3 pts)');
  }

  // Écoulement mamelonnaire (+2 pts)
  if (lower.includes('écoulement') || lower.includes('sécrétion') || lower.includes('saignement')) {
    detected.ecoulementMamelonnaire = true;
    if (lower.includes('sanglant') || lower.includes('rouge') || lower.includes('hémorragique')) {
      detected.typeEcoulement = 'sanglant';
      badges.push('Écoulement sanglant (+2 pts)');
    } else if (lower.includes('séreux') || lower.includes('jaune') || lower.includes('clair')) {
      detected.typeEcoulement = 'sereux';
      badges.push('Écoulement séreux (+2 pts)');
    } else {
      detected.typeEcoulement = 'purulent';
      badges.push('Écoulement mamelonnaire (+2 pts)');
    }
  }

  // Adénopathie axillaire (+2 pts)
  if (
    lower.includes('adénopathie') ||
    lower.includes('ganglion') ||
    lower.includes('aisselle') ||
    lower.includes('axillaire')
  ) {
    detected.adenopathieAxillaire = true;
    badges.push('Adénopathie axillaire (+2 pts)');
  }

  // Modification de taille/forme / Asymétrie récente (+2 pts)
  if (
    lower.includes('asymétrie') ||
    lower.includes('asymetrie') ||
    lower.includes('déformation') ||
    lower.includes('deformation') ||
    lower.includes('modification de taille') ||
    lower.includes('modification de forme') ||
    lower.includes('changement de taille') ||
    lower.includes('changement de forme')
  ) {
    detected.modificationTailleForme = true;
    badges.push('Modification taille/forme (+2 pts)');
  }

  // Côté
  if (lower.includes('sein gauche') || lower.includes('gauche')) {
    detected.seinConcerne = 'gauche';
    badges.push('Sein gauche');
  } else if (lower.includes('sein droit') || lower.includes('droit')) {
    detected.seinConcerne = 'droit';
    badges.push('Sein droit');
  } else if (lower.includes('bilatéral') || lower.includes('deux seins')) {
    detected.seinConcerne = 'bilateral';
    badges.push('Bilatéral');
  }

  // Antécédents familiaux (+1 pt)
  if (
    lower.includes('antécédent') ||
    lower.includes('mère') ||
    lower.includes('sœur') ||
    lower.includes('tante') ||
    lower.includes('famille')
  ) {
    detected.antecedentsFamiliaux = true;
    badges.push('Antécédents familiaux (+1 pt)');
  }

  // Douleur persistante (+1 pt)
  if (lower.includes('douleur') || lower.includes('douloureux') || lower.includes('mastodynie')) {
    detected.douleurMammaire = true;
    badges.push('Douleur persistante (+1 pt)');
  }

  return { detected, badges };
}

export const DicteeVocale: React.FC<DicteeVocaleProps> = ({
  observations,
  onObservationsChange,
  onDetectedIndicators,
  label = 'Dictée vocale et notes cliniques',
  placeholder = 'Parlez ou saisissez les observations : Ex. "Présence d\'un nodule dur adhérent de 2cm au sein droit avec rétraction cutanée et adénopathie axillaire..."',
  helperText = 'Des règles simples proposent des indicateurs à partir de mots-clés. Rien n’est appliqué avant votre confirmation; vérifiez chaque proposition.',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [detectedBadges, setDetectedBadges] = useState<string[]>([]);
  const [detectedIndicators, setDetectedIndicators] = useState<DetectedIndicators>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const analyzeClinicalText = (text: string) => {
    const { detected, badges } = extraireIndicateursCliniques(text);
    setDetectedBadges(badges);
    setDetectedIndicators(detected);
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'fr-FR';

      recog.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          const updated = observations ? `${observations} ${transcript}`.trim() : transcript.trim();
          onObservationsChange(updated);
          analyzeClinicalText(updated);
        }
      };

      recog.onerror = () => {
        setIsRecording(false);
        setFeedbackMsg('Dictée indisponible. Autorisez le microphone ou saisissez les observations.');
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recog;
    }
  }, [observations, onObservationsChange]);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
    } else {
      setFeedbackMsg(null);
      if (speechSupported && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch {
          setFeedbackMsg('La dictée n’a pas démarré. Vérifiez l’autorisation du microphone ou saisissez le texte.');
        }
      } else {
        setFeedbackMsg('La dictée vocale n’est pas prise en charge par ce navigateur. Saisissez le texte ou choisissez un exemple de démonstration.');
      }
    }
  };

  const triggerSimulatedVoice = (scenario: 1 | 2) => {
    setIsRecording(true);
    setFeedbackMsg('Exemple de démonstration prérempli; aucun audio n’est transcrit.');

    setTimeout(() => {
      let sample = '';
      if (scenario === 1) {
        sample =
          'Présence d’un nodule de consistance dure et adhérente mesurant environ 2.5 cm au niveau du sein droit, avec signe de peau d’orange naissant et adénopathie axillaire palpable homolatérale.';
      } else {
        sample =
          'Palpation mammaire bilatérale souple et homogène. Aucun nodule palpable, mamelons normaux sans écoulement, creux axillaires libres.';
      }

      const updated = observations ? `${observations} ${sample}`.trim() : sample;
      onObservationsChange(updated);
      analyzeClinicalText(updated);
      setIsRecording(false);
      setFeedbackMsg('Exemple chargé. Vérifiez et corrigez les indicateurs cliniques.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    }, 1200);
  };

  return (
    <div className="bg-[#F8FAFB] p-3.5 rounded-xl border border-[#D6E8E8] space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-[#17343B] flex items-center gap-1.5 m-0">
          <Sparkles className="w-3.5 h-3.5 text-[#007599]" />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-2">
          {/* Bouton Enregistrement Vocal */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-200'
                : 'bg-[#007599] hover:bg-[#005c78] text-white shadow-[#007599]/20'
            }`}
            title={isRecording ? 'Arrêter l’enregistrement' : 'Démarrer la dictée vocale'}
          >
            {isRecording ? (
              <>
                <MicOff className="w-3.5 h-3.5 animate-spin" />
                <span>Arrêter la dictée</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Dictée Vocale</span>
              </>
            )}
          </button>

          {/* Bouton Simulation Cas Alerte */}
          <button
            type="button"
            onClick={() => triggerSimulatedVoice(1)}
            className="text-[11px] font-semibold px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-md transition-colors"
            title="Charger un exemple de démonstration avec nodule suspect"
          >
            <Volume2 className="w-3 h-3 inline mr-1" />
            Ex. Cas Alerte
          </button>

          {/* Bouton Simulation Examen Normal */}
          <button
            type="button"
            onClick={() => triggerSimulatedVoice(2)}
            className="text-[11px] font-semibold px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md transition-colors"
            title="Charger un exemple de démonstration d’examen normal"
          >
            <Check className="w-3 h-3 inline mr-1" />
            Ex. Normal
          </button>

          {observations && (
            <button
              type="button"
              onClick={() => {
                onObservationsChange('');
                setDetectedBadges([]);
                setDetectedIndicators({});
              }}
              className="text-[11px] text-slate-500 hover:text-red-600 p-1"
              title="Effacer les notes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Message de notification d'état */}
      {feedbackMsg && (
        <div className="text-[11px] font-medium text-[#005C75] bg-[#E6F4F7] px-2.5 py-1 rounded-md flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#007599]" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Zone de texte */}
      <textarea
        rows={3}
        value={observations}
        onChange={(e) => {
          onObservationsChange(e.target.value);
          analyzeClinicalText(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full text-xs text-[#17343B] bg-white border border-[#CBD5E1] rounded-lg p-2.5 focus:outline-none focus:border-[#007599] focus:ring-1 focus:ring-[#007599] leading-relaxed resize-y"
      />

      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-[#536B70]">
        <span>{helperText}</span>
        {isRecording && (
          <span className="text-rose-600 font-bold flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
            Écoute active du microphone...
          </span>
        )}
      </div>

      {/* Indicateurs repérés par les règles locales */}
      {detectedBadges.length > 0 && (
        <div className="pt-2 border-t border-[#D6E8E8]/70">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#005c78] mb-1.5">
            <Sparkles className="w-3 h-3 text-[#007599]" />
            <span>Mots-clés repérés; vérifiez les indicateurs proposés :</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {detectedBadges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4F7] text-[#005C75] border border-[#B2DDDD]"
              >
                <Check className="w-2.5 h-2.5 text-[#007599]" />
                {badge}
              </span>
            ))}
          </div>
          {onDetectedIndicators && (
            <button
              type="button"
              className="mt-2 text-[11px] font-semibold underline"
              onClick={() => onDetectedIndicators(detectedIndicators)}
            >
              Appliquer ces suggestions aux champs — puis vérifier
            </button>
          )}
        </div>
      )}
    </div>
  );
};
