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
            className="block mb-2 text-[13px] font-[650] text-[#17343B]"
          >
            {label}
          </label>
        )}

        <div className="input-wrap relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            className={`w-full h-[52px] bg-white text-[#17343B] placeholder:text-[#8AA2A6] text-sm rounded-[9px] border transition-all duration-150 outline-none ${
              leftIcon ? 'pl-10' : 'px-[15px]'
            } ${rightElement ? 'pr-20' : 'pr-[15px]'} ${
              error
                ? 'border-[#C62828] focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20'
                : 'border-[#D6E8E8] focus:border-[#007599] focus:shadow-[0_0_0_3px_rgba(0,117,153,0.12)]'
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
          <p className="text-xs text-[#C62828] font-medium mt-1.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#536B70] mt-1.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
