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
      <div className="support mt-[30px] pt-[20px] border-t border-[#D6E8E8] text-[#536B70] text-center text-[13px]">
        Vous n’avez pas encore de compte ?{' '}
        <button
          type="button"
          onClick={onContactAdmin}
          className="text-[#005C75] font-[650] hover:underline cursor-pointer bg-transparent border-0 p-0 inline font-inherit"
        >
          Contacter l’administrateur
        </button>
      </div>

      <div className="help mt-[32px] text-[#728A8F] text-center text-[11px]" id="aide">
        Besoin d’aide ?{' '}
        <button
          type="button"
          onClick={onContactSupport}
          className="hover:underline cursor-pointer bg-transparent border-0 p-0 inline text-inherit font-inherit"
        >
          Contactez le support de votre centre de santé.
        </button>
      </div>
    </>
  );
};
