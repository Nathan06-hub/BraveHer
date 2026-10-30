import React from 'react';

export type LogoVariant = 'teal' | 'rose' | 'on-dark' | 'outline' | 'monochrome';
export type LogoLayout = 'horizontal' | 'vertical' | 'icon-only' | 'text-only';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LogoShape = 'squircle' | 'circle';

export interface LogoProps {
  variant?: LogoVariant;
  layout?: LogoLayout;
  size?: LogoSize;
  shape?: LogoShape;
  title?: string;
  subtitle?: string;
  badge?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'teal',
  layout = 'horizontal',
  size = 'md',
  shape = 'squircle',
  title = 'Brave_her',
  subtitle = 'Burkina Faso',
  badge,
  href,
  onClick,
  className = '',
  'aria-label': customAriaLabel,
}) => {
  // Sizing definitions
  const sizeStyles: Record<
    LogoSize,
    {
      mark: string;
      title: string;
      subtitle: string;
      badge: string;
      gap: string;
      verticalGap: string;
    }
  > = {
    xs: {
      mark: 'w-7 h-7 text-[15px]',
      title: 'text-[11px] leading-tight',
      subtitle: 'text-[8px] tracking-[0.08em]',
      badge: 'text-[8px] px-1 py-0.2',
      gap: 'gap-1.5',
      verticalGap: 'gap-1',
    },
    sm: {
      mark: 'w-[34px] h-[34px] text-[18px]',
      title: 'text-[13px] leading-tight',
      subtitle: 'text-[9px] tracking-[0.1em]',
      badge: 'text-[9px] px-1.5 py-0.5',
      gap: 'gap-2',
      verticalGap: 'gap-1.5',
    },
    md: {
      mark: 'w-[42px] h-[42px] text-[22px]',
      title: 'text-[15px] leading-snug',
      subtitle: 'text-[10px] tracking-[0.12em]',
      badge: 'text-[10px] px-2 py-0.5',
      gap: 'gap-2.5',
      verticalGap: 'gap-2',
    },
    lg: {
      mark: 'w-[50px] h-[50px] text-[26px]',
      title: 'text-[18px] leading-snug',
      subtitle: 'text-[11px] tracking-[0.14em]',
      badge: 'text-[11px] px-2.5 py-0.5',
      gap: 'gap-3',
      verticalGap: 'gap-2.5',
    },
    xl: {
      mark: 'w-[64px] h-[64px] text-[34px]',
      title: 'text-[22px] leading-tight',
      subtitle: 'text-[12px] tracking-[0.16em]',
      badge: 'text-[12px] px-3 py-1',
      gap: 'gap-4',
      verticalGap: 'gap-3',
    },
  };

  // Shape definitions
  const shapeStyles: Record<LogoShape, Record<LogoSize, string>> = {
    squircle: {
      xs: 'rounded-[8px]',
      sm: 'rounded-[10px]',
      md: 'rounded-[14px]',
      lg: 'rounded-[16px]',
      xl: 'rounded-[20px]',
    },
    circle: {
      xs: 'rounded-full',
      sm: 'rounded-full',
      md: 'rounded-full',
      lg: 'rounded-full',
      xl: 'rounded-full',
    },
  };

  // Variant & Color definitions
  const variantStyles: Record<
    LogoVariant,
    {
      mark: string;
      title: string;
      subtitle: string;
      badge: string;
    }
  > = {
    teal: {
      mark: 'bg-[var(--teal)] text-[var(--paper)] shadow-[0_2px_8px_rgba(0,117,153,0.22)]',
      title: 'text-[var(--ink)] font-bold',
      subtitle: 'text-[var(--muted)]',
      badge: 'bg-[var(--teal)]/10 text-[var(--teal-dark)] border border-[var(--teal)]/20',
    },
    rose: {
      mark: 'bg-[var(--rose)] text-[var(--paper)] shadow-[0_2px_8px_rgba(243,162,190,0.35)]',
      title: 'text-[var(--teal-dark)] font-bold',
      subtitle: 'text-[var(--muted)]',
      badge: 'bg-[var(--rose-soft)] text-[var(--rose)] border border-[var(--rose)]/30',
    },
    'on-dark': {
      mark: 'bg-[var(--paper)] text-[var(--teal)] shadow-sm',
      title: 'text-[var(--paper)] font-bold',
      subtitle: 'text-[#D5EEF2]',
      badge: 'bg-white/20 text-[var(--paper)] border border-white/30',
    },
    outline: {
      mark: 'bg-transparent border-2 border-[var(--line)] text-[var(--ink)]',
      title: 'text-[var(--ink)] font-bold',
      subtitle: 'text-[var(--muted)]',
      badge: 'bg-[var(--cream)] text-[var(--ink)] border border-[var(--line)]',
    },
    monochrome: {
      mark: 'bg-neutral-900 text-white',
      title: 'text-neutral-900 font-bold',
      subtitle: 'text-neutral-500',
      badge: 'bg-neutral-100 text-neutral-800 border border-neutral-300',
    },
  };

  const currentSize = sizeStyles[size];
  const currentShape = shapeStyles[shape][size];
  const currentVariant = variantStyles[variant];

  const fullLabel = customAriaLabel || `${title}${subtitle ? `, ${subtitle}` : ''}`;

  // Render Mark ("R" inside stylized container)
  const renderMark = () => (
    <span
      className={`brand-mark grid place-items-center font-serif font-bold shrink-0 transition-transform duration-200 select-none ${currentSize.mark} ${currentShape} ${currentVariant.mark}`}
      aria-hidden="true"
    >
      R
    </span>
  );

  // Render Typography (Title, Subtitle & optional badge)
  const renderTypography = () => (
    <span className={`brand-text flex flex-col justify-center ${layout === 'vertical' ? 'items-center text-center' : 'text-left'}`}>
      <span className="flex items-center gap-1.5">
        <span className={`tracking-[-0.015em] ${currentSize.title} ${currentVariant.title}`}>
          {title}
        </span>
        {badge && (
          <span className={`font-sans font-bold uppercase rounded-full leading-none tracking-wider ${currentSize.badge} ${currentVariant.badge}`}>
            {badge}
          </span>
        )}
      </span>
      {subtitle && (
        <small className={`font-sans font-semibold uppercase block mt-[2px] ${currentSize.subtitle} ${currentVariant.subtitle}`}>
          {subtitle}
        </small>
      )}
    </span>
  );

  const isInteractive = Boolean(href || onClick);
  const interactiveClasses = isInteractive
    ? 'cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/30 rounded-lg p-0.5'
    : '';

  // Layout rendering
  let content: React.ReactNode;
  if (layout === 'icon-only') {
    content = renderMark();
  } else if (layout === 'text-only') {
    content = renderTypography();
  } else if (layout === 'vertical') {
    content = (
      <div className={`inline-flex flex-col items-center ${currentSize.verticalGap}`}>
        {renderMark()}
        {renderTypography()}
      </div>
    );
  } else {
    // Default: 'horizontal'
    content = (
      <div className={`inline-flex items-center ${currentSize.gap}`}>
        {renderMark()}
        {renderTypography()}
      </div>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`brand-logo-root inline-block select-none ${interactiveClasses} ${className}`}
        aria-label={fullLabel}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`brand-logo-root inline-block bg-transparent border-0 select-none text-left ${interactiveClasses} ${className}`}
        aria-label={fullLabel}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`brand-logo-root inline-block select-none ${className}`}
      aria-label={fullLabel}
    >
      {content}
    </div>
  );
};

export default Logo;
