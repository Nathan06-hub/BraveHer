import React from 'react';
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';

export type FormStep = 'mission' | 'equipe' | 'communication';

interface CampaignModalFooterProps {
  activeStep: FormStep;
  onClose: () => void;
  onPrev: () => void;
  onNextToEquipe: () => void;
  onNextToCommunication: () => void;
  onSave: (targetStatut: 'brouillon' | 'en_attente') => void;
}

export const CampaignModalFooter: React.FC<CampaignModalFooterProps> = ({
  activeStep,
  onClose,
  onPrev,
  onNextToEquipe,
  onNextToCommunication,
  onSave,
}) => {
  return (
    <div className="modal-footer">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-modal-cancel"
          onClick={onClose}
        >
          Annuler
        </button>

        {activeStep === 'equipe' && (
          <button
            type="button"
            className="btn-modal-draft"
            onClick={onPrev}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Précédent : Mission</span>
          </button>
        )}

        {activeStep === 'communication' && (
          <button
            type="button"
            className="btn-modal-draft"
            onClick={onPrev}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Précédent : Équipe</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {activeStep === 'mission' && (
          <>
            <button
              type="button"
              className="btn-modal-draft"
              onClick={() => onSave('brouillon')}
              title="Enregistrer le projet en brouillon"
            >
              <Save className="w-4 h-4" />
              <span>Brouillon</span>
            </button>
            <button
              type="button"
              className="btn-modal-submit"
              onClick={onNextToEquipe}
            >
              <span>Suivant : Équipe de santé</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {activeStep === 'equipe' && (
          <>
            <button
              type="button"
              className="btn-modal-draft"
              onClick={() => onSave('brouillon')}
              title="Enregistrer le projet en brouillon"
            >
              <Save className="w-4 h-4" />
              <span>Brouillon</span>
            </button>
            <button
              type="button"
              className="btn-modal-submit"
              onClick={onNextToCommunication}
            >
              <span>Suivant : SMS Orange</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {activeStep === 'communication' && (
          <>
            <button
              type="button"
              className="btn-modal-draft"
              onClick={() => onSave('brouillon')}
              title="Enregistrer pour modification ultérieure"
            >
              <Save className="w-4 h-4" />
              <span>Sauvegarder en brouillon</span>
            </button>

            <button
              type="button"
              className="btn-modal-submit"
              onClick={() => onSave('en_attente')}
              title="Valider et transmettre la campagne"
            >
              <Send className="w-4 h-4" />
              <span>Transmettre la campagne</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
