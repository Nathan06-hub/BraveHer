import React from 'react';
import { Logo } from '../ui';

export interface LoginHeroBannerProps {
  quote?: string;
  quoteAuthor?: string;
  className?: string;
}

export const LoginHeroBanner: React.FC<LoginHeroBannerProps> = ({
  quote = '« Soyez attentives à votre corps ; cela peut vous sauver la vie ! »',
  quoteAuthor = 'Rosalie Ziba',
  className = '',
}) => {
  return (
    <aside
      className={`story relative overflow-hidden flex flex-col justify-between w-full h-full text-[var(--paper)] bg-[var(--teal)] select-none ${className}`}
      style={{
        padding: '42px clamp(38px, 6vw, 92px) 38px',
      }}
      aria-label="Présentation de Soutien Rose BFK"
    >
      {/* Decorative concentric circles & rose glow matching design system */}
      <div
        className="pointer-events-none absolute rounded-full border border-white/12"
        style={{
          width: '780px',
          height: '780px',
          right: '-350px',
          top: '9%',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute rounded-full border border-[var(--rose)]/35"
        style={{
          width: '620px',
          height: '620px',
          right: '-285px',
          top: '18%',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: '480px',
          height: '480px',
          right: '-200px',
          top: '22%',
          background: 'radial-gradient(circle, rgba(243, 162, 190, 0.22) 0%, rgba(0, 117, 153, 0) 70%)',
          filter: 'blur(35px)',
        }}
        aria-hidden="true"
      />

      {/* Brand Header using reusable Logo */}
      <div className="relative z-10">
        <Logo variant="on-dark" size="lg" layout="horizontal" />
      </div>

      {/* Story Copy */}
      <div className="story-copy relative z-10 max-w-[500px] my-[74px] mb-[60px]">
        {/* Eyebrow */}
        <div className="eyebrow flex items-center gap-[9px] text-[#E4F5F6] text-[10px] font-[650] tracking-[0.14em] uppercase">
          <span className="w-6 h-[3px] bg-[var(--rose)] inline-block shrink-0" />
          <span>Prendre soin, ensemble</span>
        </div>

        {/* Title */}
        <h1 className="my-[22px] mb-[18px] max-w-[470px] font-serif font-[500] text-[var(--paper)] leading-[1.04] tracking-[-0.035em] text-[clamp(42px,5vw,66px)]">
          Chaque geste compte.<br />
          <span className="text-[var(--rose)] font-semibold drop-shadow-[0_0_24px_rgba(243,162,190,0.4)]">
            Chaque femme aussi.
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-[400px] m-0 text-[#E5F2F4] text-[14px] leading-[1.75]">
          Un espace de confiance pour les équipes de santé qui accompagnent le dépistage et la prévention du cancer du sein.
        </p>

      </div>

      {/* Story Foot */}
      <div className="story-foot relative z-10 text-[#D5EEF2] text-[12px] tracking-wide">
        Une initiative au service de la santé des femmes au Burkina Faso
      </div>
    </aside>
  );
};
