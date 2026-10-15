import React, { forwardRef } from 'react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightElement,
      className = '',
      containerClassName = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`field mb-5 text-left w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-[13px] font-[650] text-[var(--ink)]"
          >
            {label}
            {required && <span className="text-[var(--red)] ml-0.5">*</span>}
          </label>
        )}

        <div className="input-wrap relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--muted)]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            className={`w-full h-[52px] bg-[var(--paper)] text-[var(--ink)] placeholder:text-[var(--muted)]/70 text-sm rounded-[9px] border transition-all duration-150 outline-none ${
              leftIcon ? 'pl-10' : 'px-[15px]'
            } ${rightElement ? 'pr-20' : 'pr-[15px]'} ${
              error
                ? 'border-[var(--red)] focus:border-[var(--red)] focus:ring-2 focus:ring-[var(--red)]/20 shadow-[0_0_0_1px_var(--red)]'
                : 'border-[var(--line)] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(0,117,153,0.12)]'
            } ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3.5 flex items-center">
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-[var(--red)] font-medium mt-1.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-[var(--muted)] mt-1.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
