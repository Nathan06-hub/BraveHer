import React from 'react';

export interface LoginFooterLinksProps {
  onContactAdmin?: () => void;
  onContactSupport?: () => void;
}

export const LoginFooterLinks: React.FC<LoginFooterLinksProps> = ({
  onContactAdmin,
  onContactSupport,
}) => {
  return (
    <>
      <div className="support mt-[30px] pt-[20px] border-t border-[var(--line)] text-[var(--muted)] text-center text-[13px]">
        Vous n’avez pas encore de compte ?{' '}
        <button
          type="button"
          onClick={onContactAdmin}
          className="text-[var(--teal-dark)] hover:text-[#a82d58] font-[650] hover:underline cursor-pointer bg-transparent border-0 p-0 inline transition-colors"
        >
          Contacter l’administrateur
        </button>
      </div>

      <div className="help mt-[28px] text-[var(--muted)]/80 text-center text-[11px]" id="aide">
        Besoin d’aide ?{' '}
        <button
          type="button"
          onClick={onContactSupport}
          className="hover:underline hover:text-[#a82d58] text-[var(--muted)]/80 cursor-pointer bg-transparent border-0 p-0 inline transition-colors"
        >
          Contactez le support de votre centre de santé.
        </button>
      </div>
    </>
  );
};
