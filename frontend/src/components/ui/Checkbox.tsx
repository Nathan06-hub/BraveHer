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
        className={`remember inline-flex items-center gap-2 cursor-pointer select-none text-xs text-[#536B70] ${containerClassName}`}
      >
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={`w-[15px] h-[15px] rounded cursor-pointer accent-[#F3A2BE] ${className}`}
          {...props}
        />
        {label && <span className="hover:text-[#17343B] transition-colors">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
