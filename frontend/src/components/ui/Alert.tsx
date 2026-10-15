import React from 'react';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const variantStyles: Record<AlertVariant, { container: string; icon: string; defaultTitle: string }> = {
  error: {
    container: 'bg-[var(--paper)] border-[var(--red)] text-[var(--red)] shadow-[0_2px_8px_rgba(198,40,40,0.08)]',
    icon: 'text-[var(--red)]',
    defaultTitle: 'Erreur',
  },
  success: {
    container: 'bg-[var(--paper)] border-[var(--green)] text-[var(--green)] shadow-[0_2px_8px_rgba(46,125,50,0.08)]',
    icon: 'text-[var(--green)]',
    defaultTitle: 'Succès',
  },
  warning: {
    container: 'bg-[var(--paper)] border-[var(--orange)] text-[var(--orange)] shadow-[0_2px_8px_rgba(237,139,0,0.08)]',
    icon: 'text-[var(--orange)]',
    defaultTitle: 'Attention',
  },
  info: {
    container: 'bg-[var(--paper)] border-[var(--teal)] text-[var(--teal)] shadow-[0_2px_8px_rgba(0,117,153,0.08)]',
    icon: 'text-[var(--teal)]',
    defaultTitle: 'Information',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
  onClose,
}) => {
  const currentVariant = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`p-3.5 rounded-[9px] border text-sm font-medium flex items-start gap-2.5 transition-all duration-200 ${currentVariant.container} ${className}`}
    >
      <div className={`shrink-0 mt-0.5 ${currentVariant.icon}`}>
        {variant === 'error' && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {variant === 'success' && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {variant === 'warning' && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {variant === 'info' && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      <div className="flex-1 text-[var(--ink)]">
        {title && <div className="font-semibold mb-0.5 text-[13px]">{title}</div>}
        <div className="text-[13px] leading-relaxed">{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded hover:bg-black/5 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
