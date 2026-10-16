import React, { useState } from 'react';
import type { RegleAutomatisationAge } from '../../types/campaign';
import {
  Calendar,
  Send,
  Sparkles,
  Smartphone,
  Globe,
} from 'lucide-react';

interface SmsAutomationRulesCardProps {
  rules: RegleAutomatisationAge[];
  onToggleRule: (ruleId: string) => void;
  onTriggerRuleSimulation: (rule: RegleAutomatisationAge) => void;
}

export const SmsAutomationRulesCard: React.FC<SmsAutomationRulesCardProps> = ({
  rules,
  onToggleRule,
  onTriggerRuleSimulation,
}) => {
  const [selectedLangs, setSelectedLangs] = useState<Record<string, 'moore' | 'dioula' | 'fulfulde' | 'francais'>>({
    'regle-age-20': 'francais',
    'regle-age-35': 'francais',
    'regle-age-40': 'francais',
    'regle-age-50': 'francais',
  });

  const setRuleLang = (ruleId: string, lang: 'moore' | 'dioula' | 'fulfulde' | 'francais') => {
    setSelectedLangs((prev) => ({ ...prev, [ruleId]: lang }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-[var(--ink)]">
            Moteur de règles récurrentes selon l'âge (Cycle de vie féminin)
          </h3>
          <p className="text-xs text-[var(--muted)]">
            Sensibilisation continue sans connexion Internet : les rappels d'auto-examen et de dépistage sont envoyés automatiquement dans la langue maternelle de chaque femme.
          </p>
        </div>

        <span className="text-[11px] font-medium text-[var(--teal)] bg-[#E6F4F2] px-3 py-1 rounded-full border border-[#B2DFDB] flex items-center gap-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[var(--teal)]" />
          <span>4 protocoles cliniques actifs</span>
        </span>
      </div>

      <div className="automation-rules-grid">
        {rules.map((rule) => {
          const activeLang = selectedLangs[rule.id] || 'francais';
          const msgPreview = rule.messages[activeLang] || rule.messages.francais;

          return (
            <div
              key={rule.id}
              className={`automation-rule-card ${rule.actif ? 'active' : 'inactive'}`}
            >
              {/* En-tête de la règle */}
              <div className="rule-card-header">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rule-age-pill">
                      {rule.ageMin} - {rule.ageMax} ans
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[var(--muted)] uppercase">
                      {rule.frequence}
                    </span>
                  </div>
                  <h4 className="rule-title">{rule.nom}</h4>
                  <p className="rule-desc">{rule.description}</p>
                </div>

                {/* Switcher Actif / Inactif */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={rule.actif}
                    onChange={() => onToggleRule(rule.id)}
                    className="w-4 h-4 text-[var(--orange)] rounded border-gray-300 focus:ring-[var(--orange)] cursor-pointer"
                  />
                  <span className={`text-[11px] font-bold ${rule.actif ? 'text-[var(--orange)]' : 'text-[var(--muted)]'}`}>
                    {rule.actif ? 'Actif' : 'Pause'}
                  </span>
                </label>
              </div>

              {/* Onglets de langues pour prévisualisation */}
              <div className="rule-message-box space-y-2">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[var(--orange)]" />
                    <span>Aperçu du SMS dans la langue de la femme :</span>
                  </span>

                  <div className="flex items-center gap-1">
                    {(['moore', 'dioula', 'fulfulde', 'francais'] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setRuleLang(rule.id, l)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all capitalize ${
                          activeLang === l
                            ? 'bg-[var(--teal)] text-white shadow-xs'
                            : 'bg-white text-[var(--muted)] hover:bg-[var(--cream)] border border-[var(--line)]'
                        }`}
                      >
                        {l === 'moore' ? 'Mooré' : l === 'dioula' ? 'Dioula' : l === 'fulfulde' ? 'Fulfuldé' : 'Français'}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[var(--ink)] font-mono leading-relaxed bg-white p-2.5 rounded border border-[#FED7AA]">
                  {msgPreview}
                </p>

                <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                  <span>Personnalisé avec le prénom de la patiente</span>
                  <span>1 crédit SMS (160 car.)</span>
                </div>
              </div>

              {/* Métadonnées & Statistiques */}
              <div className="rule-meta-row">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[var(--orange)]" />
                  <span>
                    <strong>{rule.totalEnvoyes}</strong> SMS diffusés
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--teal)]" />
                  <span>
                    Prochaine vague : <strong>{rule.prochaineExecution.split(' ')[0]}</strong>
                  </span>
                </div>
              </div>

              {/* Bouton de déclenchement immédiat de simulation */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={!rule.actif}
                  onClick={() => onTriggerRuleSimulation(rule)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    rule.actif
                      ? 'bg-[var(--ink)] text-white hover:bg-[var(--teal)]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-[var(--orange)]" />
                  <span>⚡ Déclencher la vague ({rule.ageMin}-{rule.ageMax} ans) maintenant</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
