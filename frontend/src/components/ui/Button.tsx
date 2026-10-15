import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-[9px] transition-all duration-150 outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer focus:ring-2 focus:ring-[var(--teal)]/25 focus:ring-offset-1';

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[var(--teal)] text-[var(--paper)] hover:bg-[var(--teal-dark)] active:scale-[0.99] border-0 shadow-[0_1px_3px_rgba(0,117,153,0.2)]',
    secondary:
      'bg-[var(--cream)] text-[var(--ink)] hover:bg-[#e1f3f1] active:bg-[#d0ecea] border border-[var(--line)]',
    outline:
      'border border-[var(--line)] text-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--cream)]',
    ghost:
      'text-[var(--teal-dark)] hover:bg-[var(--teal)]/10 active:bg-[var(--teal)]/20',
    danger:
      'bg-[var(--red)] text-[var(--paper)] hover:opacity-90 active:scale-[0.99]',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3.5 h-[38px] gap-1.5',
    md: 'text-[14px] px-4 h-[52px] gap-2',
    lg: 'text-base px-6 h-[56px] gap-2.5',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};
