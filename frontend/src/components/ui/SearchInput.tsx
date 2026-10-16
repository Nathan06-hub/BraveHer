import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  id?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher...',
  onClear,
  className = '',
  autoFocus = false,
  disabled = false,
  id,
}) => {
  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none"
        aria-hidden="true"
      />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className="w-full pl-9 pr-8 py-2 text-xs bg-white text-[#17343B] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#007599] focus:ring-1 focus:ring-[#007599] placeholder-slate-400 transition-colors shadow-xs"
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Effacer la recherche"
          title="Effacer la recherche"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
