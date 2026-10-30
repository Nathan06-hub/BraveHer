import React from 'react';
import { ArrowLeft, ArrowRight, Check, Save, Stethoscope, Loader2 } from 'lucide-react';

export type PatientFormStep = 'identity' | 'location' | 'clinical';

interface PatientModalFooterProps {
  activeStep: PatientFormStep;
  onClose: () => void;
  onPrev: () => void;
  onNextToLocation: () => void;
  onNextToClinical: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isEdit?: boolean;
  canSaveWithoutClinical?: boolean;
}

export const PatientModalFooter: React.FC<PatientModalFooterProps> = ({
  activeStep,
  onClose,
  onPrev,
  onNextToLocation,
  onNextToClinical,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
  canSaveWithoutClinical = true,
}) => {
  return (
    <div className="modal-footer">
      {/* Boutons de gauche (Navigation arrière / Annuler) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-modal-cancel"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </button>

        {activeStep === 'location' && (
          <button
            type="button"
            className="btn-modal-draft"
            onClick={onPrev}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Précédent : Identité</span>
          </button>
        )}

        {activeStep === 'clinical' && (
          <button
            type="button"
            className="btn-modal-draft"
            onClick={onPrev}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Précédent : Localisation</span>
          </button>
        )}
      </div>

      {/* Boutons de droite (Progression ou Validation) */}
      <div className="flex items-center gap-2.5">
        {activeStep === 'identity' && (
          <button
            type="button"
            className="btn-modal-submit"
            onClick={onNextToLocation}
          >
            <span>Suivant : Localisation & Centre</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {activeStep === 'location' && (
          <>
            {canSaveWithoutClinical && (
              <button
                type="button"
                className="btn-modal-draft"
                onClick={onSubmit}
                disabled={isSubmitting}
                title="Créer la fiche sans réaliser l'examen clinique immédiatement"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-[#007599]" />
                )}
                <span>Enregistrer sans examen</span>
              </button>
            )}

            <button
              type="button"
              className="btn-modal-submit"
              onClick={onNextToClinical}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Suivant : Triage clinique par règles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {activeStep === 'clinical' && (
          <button
            type="button"
            className="btn-modal-submit bg-gradient-to-r from-[#007599] to-[#005C75]"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement en cours...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEdit ? 'Mettre à jour la fiche' : 'Créer la Fiche Patiente'}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
