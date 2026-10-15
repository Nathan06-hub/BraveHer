import React from 'react';

interface LoginHeroBannerProps {
  quote?: string;
  quoteAuthor?: string;
}

export const LoginHeroBanner: React.FC<LoginHeroBannerProps> = ({
  quote = '« Soyez attentives à votre corps ; cela peut vous sauver la vie ! »',
  quoteAuthor = 'Rosalie Ziba',
}) => {
  return (
    <aside
      className="story relative overflow-hidden flex flex-col justify-between w-full h-full text-white bg-[#007599] select-none"
      style={{
        padding: '42px clamp(38px, 6vw, 92px) 38px',
      }}
      aria-label="Présentation de Soutien Rose BFK"
    >
      {/* Decorative concentric circles in CSS pure matching login-maquette.html */}
      <div
        className="pointer-events-none absolute rounded-full border border-white/15"
        style={{
          width: '580px',
          height: '580px',
          right: '-270px',
          top: '18%',
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full border border-white/15"
        style={{
          width: '420px',
          height: '420px',
          right: '-185px',
          top: '27%',
        }}
      />

      {/* Brand Header */}
      <div className="brand relative z-10 flex items-center gap-3 font-bold tracking-[0.01em]">
        <span className="brand-mark w-[42px] h-[42px] grid place-items-center rounded-[14px] bg-white text-[#007599] font-serif text-[23px] shrink-0 shadow-sm">
          R
        </span>
        <span className="leading-tight text-white font-bold text-base">
          Soutien Rose
          <small className="block mt-[3px] text-[#D5EEF2] text-[11px] font-medium tracking-[0.12em] uppercase">
            Burkina Faso
          </small>
        </span>
      </div>

      {/* Story Copy */}
      <div className="story-copy relative z-10 max-w-[500px] my-[74px] mb-[60px]">
        {/* Eyebrow */}
        <div className="eyebrow flex items-center gap-[9px] text-[#E4F5F6] text-[12px] font-[650] tracking-[0.14em] uppercase">
          <span className="w-6 h-[1px] bg-[#F3A2BE] inline-block shrink-0" />
          <span>Prendre soin, ensemble</span>
        </div>

        {/* Title */}
        <h1 className="my-[22px] mb-[18px] max-w-[470px] font-serif font-[500] text-white leading-[1.04] tracking-[-0.035em] text-[clamp(42px,5vw,66px)]">
          Chaque geste compte. Chaque femme aussi.
        </h1>

        {/* Description */}
        <p className="max-w-[400px] m-0 text-[#E5F2F4] text-[16px] leading-[1.75]">
          Un espace de confiance pour les équipes de santé qui accompagnent le dépistage et la prévention du cancer du sein.
        </p>

        {/* Quote */}
        <div className="quote mt-[52px] p-[18px_20px] max-w-[410px] border-l-2 border-[#F3A2BE] text-white font-serif text-[16px] leading-[1.5]">
          {quote}
          {quoteAuthor && (
            <span className="block mt-[9px] text-[#D5EEF2] font-sans text-[12px]">
              {quoteAuthor}
            </span>
          )}
        </div>
      </div>

      {/* Story Foot */}
      <div className="story-foot relative z-10 text-[#D5EEF2] text-[12px]">
        Une initiative au service de la santé des femmes au Burkina Faso
      </div>
    </aside>
  );
};
