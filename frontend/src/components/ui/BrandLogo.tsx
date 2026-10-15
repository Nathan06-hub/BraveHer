import React from 'react';
import { Logo } from './Logo';
import type { LogoProps, LogoVariant, LogoLayout } from './Logo';

export type BrandLogoVariant = 'on-dark' | 'on-light' | 'compact' | LogoVariant;

export interface BrandLogoProps extends Omit<LogoProps, 'variant'> {
  variant?: BrandLogoVariant;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'on-light',
  layout,
  ...props
}) => {
  // Map legacy BrandLogo props to universal Logo props
  let resolvedVariant: LogoVariant = 'teal';
  let resolvedLayout: LogoLayout = layout || 'horizontal';

  if (variant === 'on-dark') {
    resolvedVariant = 'on-dark';
  } else if (variant === 'on-light') {
    resolvedVariant = 'rose';
  } else if (variant === 'compact') {
    resolvedVariant = 'rose';
    resolvedLayout = 'icon-only';
  } else {
    resolvedVariant = variant as LogoVariant;
  }

  return <Logo variant={resolvedVariant} layout={resolvedLayout} {...props} />;
};

export default BrandLogo;
