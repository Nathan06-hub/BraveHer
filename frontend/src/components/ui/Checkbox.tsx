import React, { forwardRef } from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, containerClassName = '', id, className = '', ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={inputId}
        className={`remember inline-flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors ${containerClassName}`}
      >
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={`w-[16px] h-[16px] rounded cursor-pointer accent-[var(--rose)] focus:ring-2 focus:ring-[var(--rose)]/30 ${className}`}
          {...props}
        />
        {label && <span className="transition-colors leading-none">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
