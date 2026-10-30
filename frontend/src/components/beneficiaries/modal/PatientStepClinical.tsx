import React from 'react';
import type { QuadrantSein } from '../../../types/beneficiary';
import type { ResultatScoreEvaluation } from '../../../types/evaluation';
import { DicteeVocale, type DetectedIndicators } from '../../common/DicteeVocale';
import { ClinicalRiskBadge } from '../../ui';
import {
  Stethoscope,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface PatientStepClinicalProps {
  activerEvaluationInitiale: boolean;
  onActiverEvaluationInitialeChange: (val: boolean) => void;
  // Données de l'examen clinique
  nodule: boolean;
  onNoduleChange: (val: boolean) => void;
  consistanceNodule: 'dur_adherent' | 'ferme' | 'mobile_elastique' | 'aucun';
  onConsistanceNoduleChange: (val: 'dur_adherent' | 'ferme' | 'mobile_elastique' | 'aucun') => void;
  tailleNoduleCm: number;
  onTailleNoduleCmChange: (val: number) => void;
  seinConcerne: 'gauche' | 'droit' | 'bilateral' | 'aucun';
  onSeinConcerneChange: (val: 'gauche' | 'droit' | 'bilateral' | 'aucun') => void;
  quadrant: QuadrantSein;
  onQuadrantChange: (val: QuadrantSein) => void;
  peauOrange: boolean;
  onPeauOrangeChange: (val: boolean) => void;
  retractionCutanee: boolean;
  onRetractionCutaneeChange: (val: boolean) => void;
  ecoulementMamelonnaire: boolean;
  onEcoulementMamelonnaireChange: (val: boolean) => void;
  typeEcoulement: 'sanglant' | 'sereux' | 'purulent' | 'aucun';
  onTypeEcoulementChange: (val: 'sanglant' | 'sereux' | 'purulent' | 'aucun') => void;
  adenopathieAxillaire: boolean;
  onAdenopathieAxillaireChange: (val: boolean) => void;
  douleurMammaire: boolean;
  onDouleurMammaireChange: (val: boolean) => void;
  antecedentsFamiliaux: boolean;
  onAntecedentsFamiliauxChange: (val: boolean) => void;
  modificationTailleForme: boolean;
  onModificationTailleFormeChange: (val: boolean) => void;
  observations: string;
  onObservationsChange: (val: string) => void;
  evalResult: ResultatScoreEvaluation;
  onApplyDetectedIndicators: (detected: DetectedIndicators) => void;
}

export const PatientStepClinical: React.FC<PatientStepClinicalProps> = ({
  activerEvaluationInitiale,
  onActiverEvaluationInitialeChange,
  nodule,
  onNoduleChange,
  consistanceNodule,
  onConsistanceNoduleChange,
  tailleNoduleCm,
  onTailleNoduleCmChange,
  seinConcerne,
  onSeinConcerneChange,
  quadrant,
  onQuadrantChange,
  peauOrange,
  onPeauOrangeChange,
  retractionCutanee,
  onRetractionCutaneeChange,
  ecoulementMamelonnaire,
  onEcoulementMamelonnaireChange,
  typeEcoulement,
  onTypeEcoulementChange,
  adenopathieAxillaire,
  onAdenopathieAxillaireChange,
  douleurMammaire,
  onDouleurMammaireChange,
  antecedentsFamiliaux,
  onAntecedentsFamiliauxChange,
  modificationTailleForme,
  onModificationTailleFormeChange,
  observations,
  onObservationsChange,
  evalResult,
  onApplyDetectedIndicators,
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Toggle d'activation de l'examen immédiat */}
      <div className="p-3.5 bg-[#F0F9F8] border border-[#B3DFE5] rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#007599] text-white flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-xs font-bold text-[#005C75] block">
              Dépistage clinique & Triage assisté par règles déterministes
            </strong>
            <span className="text-[11px] text-[#536B70]">
              Activez pour renseigner la palpation et obtenir immédiatement le score de risque
            </span>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={activerEvaluationInitiale}
            onChange={(e) => onActiverEvaluationInitialeChange(e.target.checked)}
            className="w-4 h-4 text-[#007599] rounded border-gray-300 focus:ring-[#007599] cursor-pointer"
          />
          <span className={`text-xs font-bold ${activerEvaluationInitiale ? 'text-[#007599]' : 'text-slate-400'}`}>
            {activerEvaluationInitiale ? 'Actif' : 'Désactivé'}
          </span>
        </label>
      </div>

      {!activerEvaluationInitiale ? (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center space-y-1">
          <CheckCircle2 className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <strong className="text-xs font-semibold text-[#17343B] block">
            Enregistrement civil uniquement
          </strong>
          <p className="text-xs text-[#64748B] max-w-md mx-auto m-0">
            La patiente sera enregistrée dans le système avec le statut <em>« RDV Planifié »</em>. L'examen clinique et le calcul du score de triage pourront être réalisés ultérieurement sous la tente de consultation.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 pt-1">
          {/* Module Dictée Vocale */}
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
            <DicteeVocale
              observations={observations}
              onObservationsChange={onObservationsChange}
              onDetectedIndicators={onApplyDetectedIndicators}
              label="Dictée vocale et notes cliniques"
              placeholder="Décrivez les signes palpés (ex: Nodule dur de 2 cm dans le quadrant supéro-externe gauche, douleur persistante)..."
            />
          </div>

          {/* Examen Palpatoire */}
          <div className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-3 shadow-xs">
            <strong className="text-xs font-bold text-[#17343B] uppercase tracking-wide block">
              Palpation Mammaire & Nodule
            </strong>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nodule}
                  onChange={(e) => onNoduleChange(e.target.checked)}
                  className="w-4 h-4 text-[#007599] rounded border-gray-300 focus:ring-[#007599]"
                />
                <div>
                  <span className="text-xs font-bold text-[#17343B] block">
                    Nodule ou masse palpable (+3 pts)
                  </span>
                  <span className="text-[11px] text-[#536B70]">
                    Signe d'alerte prioritaire
                  </span>
                </div>
              </label>

              {nodule && (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">
                      Consistance
                    </label>
                    <select
                      className="form-input text-xs"
                      value={consistanceNodule}
                      onChange={(e) => onConsistanceNoduleChange(e.target.value as any)}
                    >
                      <option value="dur_adherent">Dur & Adhérent (+3 pts)</option>
                      <option value="ferme">Ferme (+3 pts)</option>
                      <option value="mobile_elastique">Mobile / Élastique (+3 pts)</option>
                      <option value="aucun">Non précisée</option>
                    </select>
                  </div>

                  <div className="w-24">
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">
                      Taille (cm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      className="form-input text-xs"
                      value={tailleNoduleCm || ''}
                      placeholder="Ex: 2.5"
                      onChange={(e) => onTailleNoduleCmChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>

            {nodule && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] block mb-1">
                    Sein concerné
                  </label>
                  <select
                    className="form-input text-xs"
                    value={seinConcerne}
                    onChange={(e) => onSeinConcerneChange(e.target.value as any)}
                  >
                    <option value="droit">Sein droit</option>
                    <option value="gauche">Sein gauche</option>
                    <option value="bilateral">Bilatéral</option>
                    <option value="aucun">Non précisé</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#64748B] block mb-1">
                    Quadrant
                  </label>
                  <select
                    className="form-input text-xs"
                    value={quadrant}
                    onChange={(e) => onQuadrantChange(e.target.value as any)}
                  >
                    <option value="supero_externe">Supéro-externe (Fréquent)</option>
                    <option value="supero_interne">Supéro-interne</option>
                    <option value="infero_externe">Inféro-externe</option>
                    <option value="infero_interne">Inféro-interne</option>
                    <option value="retro_areolaire">Rétro-aréolaire</option>
                    <option value="aucun">Non précisé</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Signes d'alerte cliniques */}
          <div className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-2.5 shadow-xs">
            <strong className="text-xs font-bold text-[#17343B] uppercase tracking-wide block">
              Signes d'Alerte Cutanés, Sécrétions & Antécédents
            </strong>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={peauOrange}
                  onChange={(e) => onPeauOrangeChange(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#007599] rounded"
                />
                <span className="text-[11px] font-semibold text-[#17343B]">Peau d'orange (+3)</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={retractionCutanee}
                  onChange={(e) => onRetractionCutaneeChange(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#007599] rounded"
                />
                <span className="text-[11px] font-semibold text-[#17343B]">Rétraction (+3)</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adenopathieAxillaire}
                  onChange={(e) => onAdenopathieAxillaireChange(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#007599] rounded"
                />
                <span className="text-[11px] font-semibold text-[#17343B]">Ganglion aisselle (+2)</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ecoulementMamelonnaire}
                  onChange={(e) => onEcoulementMamelonnaireChange(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#007599] rounded"
                />
                <span className="text-[11px] font-semibold text-[#17343B]">Écoulement (+2)</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modificationTailleForme}
                  onChange={(e) => onModificationTailleFormeChange(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#007599] rounded"
                />
                <span className="text-[11px] font-semibold text-[#17343B]">Asymétrie (+2)</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={antecedentsFamiliaux}
                  onChange={(e) => onAntecedentsFamiliauxChange(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#007599] rounded"
                />
                <span className="text-[11px] font-semibold text-[#17343B]">Antécédents (+1)</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer col-span-2 sm:col-span-1">
                <input
                  type="checkbox"
                  checked={douleurMammaire}
                  onChange={(e) => onDouleurMammaireChange(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#007599] rounded"
                />
                <span className="text-[11px] font-semibold text-[#17343B]">Douleur mammaire (+1)</span>
              </label>
            </div>

            {/* Précision du type d'écoulement si présent */}
            {ecoulementMamelonnaire && (
              <div className="pt-1.5 flex items-center gap-2">
                <label className="text-[11px] font-bold text-[#64748B] shrink-0">
                  Type d'écoulement :
                </label>
                <select
                  className="form-input text-xs py-1"
                  value={typeEcoulement}
                  onChange={(e) => onTypeEcoulementChange(e.target.value as any)}
                >
                  <option value="sanglant">Sanglant / Séro-sanglant</option>
                  <option value="sereux">Séreux</option>
                  <option value="purulent">Purulent</option>
                  <option value="aucun">Non précisé</option>
                </select>
              </div>
            )}
          </div>

          {/* Carte Score de triage en Direct */}
          <div className="p-3.5 bg-gradient-to-r from-[#F0F9F8] to-[#FFF8F5] border border-[#B3DFE5] rounded-xl flex items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#007599]" />
                <strong className="text-xs font-bold text-[#17343B]">
                  Diagnostic Assisté par règles déterministes (Triage)
                </strong>
                <ClinicalRiskBadge
                  niveau={evalResult.niveauRisque.toLowerCase() as any}
                  size="sm"
                />
              </div>
              <p className="text-[11px] text-[#536B70] m-0">
                {evalResult.conduiteATenir}
              </p>
              {evalResult.niveauRisque === 'ELEVE' && (
                <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 w-fit">
                  <span>Repérage à priorité élevée selon une règle non validée. Vérification clinique requise; aucune aide n’est déclenchée automatiquement.</span>
                </div>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-[#64748B] block font-medium">Score Calculé</span>
              <span
                className={`text-xl font-bold font-mono ${
                  evalResult.scoreIA >= 70
                    ? 'text-rose-700'
                    : evalResult.scoreIA >= 35
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {evalResult.scoreIA}/100
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
