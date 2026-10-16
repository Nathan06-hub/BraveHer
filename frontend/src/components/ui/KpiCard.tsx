import React from 'react';

export type KpiCardVariant = 'teal' | 'amber' | 'rose' | 'purple' | 'blue';

export interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  variant?: KpiCardVariant;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const VARIANT_CONFIGS: Record<
  KpiCardVariant,
  {
    borderLeft: string;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    indicatorColor: string;
  }
> = {
  teal: {
    borderLeft: '#007599',
    iconBg: '#E0F3F5',
    iconColor: '#007599',
    valueColor: '#17343B',
    indicatorColor: '#007599',
  },
  amber: {
    borderLeft: '#D97706',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    valueColor: '#92400E',
    indicatorColor: '#D97706',
  },
  rose: {
    borderLeft: '#E11D48',
    iconBg: '#FFE4E6',
    iconColor: '#E11D48',
    valueColor: '#BE123C',
    indicatorColor: '#E11D48',
  },
  purple: {
    borderLeft: '#7E22CE',
    iconBg: '#F3E8FF',
    iconColor: '#7E22CE',
    valueColor: '#581C87',
    indicatorColor: '#7E22CE',
  },
  blue: {
    borderLeft: '#2563EB',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    valueColor: '#1E40AF',
    indicatorColor: '#2563EB',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: IconComponent,
  variant = 'teal',
  subtitle,
  badge,
  onClick,
  className = '',
}) => {
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.teal;
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-4 border border-[#D6E8E8] shadow-[0_2px_8px_rgba(23,52,59,0.04)] overflow-hidden transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
      style={{
        borderLeft: `4px solid ${config.borderLeft}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          {title}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform"
          style={{
            backgroundColor: config.iconBg,
            color: config.iconColor,
          }}
        >
          <IconComponent className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div
          className="text-2xl font-bold font-serif tracking-tight"
          style={{ color: config.valueColor }}
        >
          {value}
        </div>
        {badge && <div className="ml-auto">{badge}</div>}
      </div>

      {subtitle && (
        <div className="text-[11px] text-[#64748B] mt-1 line-clamp-1 leading-relaxed">
          {subtitle}
        </div>
      )}
    </div>
  );
};
