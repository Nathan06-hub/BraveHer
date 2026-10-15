import React from 'react';

export const LoginTrustBadge: React.FC = () => {
  return (
    <div className="security flex items-start gap-[10px] mt-[18px] text-[#536B70] text-[12px] leading-[1.55] text-left">
      <span
        className="shield shrink-0 w-[19px] h-[19px] border-[1.5px] border-[#2E7D32] text-[#2E7D32] text-center text-[11px] leading-[16px] select-none font-bold"
        style={{
          borderRadius: '9px 9px 9px 9px',
        }}
      >
        ✓
      </span>
      <span>
        Vos informations de santé sont protégées et accessibles uniquement aux personnes autorisées.
      </span>
    </div>
  );
};
