import React from 'react';
import { FileSearch } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: IconComponent = FileSearch,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#EEF7F7] text-[#007599] flex items-center justify-center mb-3 shadow-xs">
        <IconComponent className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="text-sm font-bold text-[#17343B] mb-1 font-serif">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-[#64748B] max-w-sm mb-4 leading-relaxed m-0">
          {description}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#007599] text-white hover:bg-[#005C75] transition-colors cursor-pointer shadow-xs"
        >
          {action.icon && <action.icon className="w-3.5 h-3.5" />}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};
