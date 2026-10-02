import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  isLoading?: boolean;
  static?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  isLoading = false,
  disabled = false,
  static: isStatic = false,
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isSpinning = loading || isLoading;
  const hasIcon = Boolean(icon || isSpinning);
  const isIconOnly = !children;

  const sizeStyles = {
    sm: `h-8 ${isIconOnly ? 'w-8 min-w-[32px] p-0' : (hasIcon ? 'ps-2.5 pe-3' : 'px-3')} text-xs gap-1.5 rounded-lg`,
    md: `h-10 ${isIconOnly ? 'w-10 min-w-[40px] p-0' : (hasIcon ? 'ps-3 pe-3.5' : 'px-4')} text-sm gap-2 rounded-lg`,
    lg: `h-11 ${isIconOnly ? 'w-11 min-w-[44px] p-0' : (hasIcon ? 'ps-3.5 pe-4' : 'px-5')} text-sm gap-2.5 rounded-lg`,
  };

  const variantStyles = {
    primary:
      'bg-accent-primary text-text-inverse font-medium hover:opacity-90 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base',
    secondary:
      'bg-surface-strong text-text-primary font-medium hover:bg-surface-muted border border-border-default shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base',
    outline:
      'bg-transparent text-text-secondary font-medium hover:text-text-primary hover:bg-surface-strong border border-border-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base',
    danger:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-500/20 border border-rose-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-strong border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base',
    dark:
      'bg-surface-base text-text-primary font-medium hover:bg-surface-muted border border-border-strong shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base',
  };

  const tapScale = !isStatic ? 'active:not-disabled:scale-[0.98]' : '';

  return (
    <button
      disabled={disabled || isSpinning}
      className={`inline-flex items-center justify-center font-sans whitespace-nowrap transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${tapScale} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isSpinning ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" strokeWidth={2} />
      ) : icon ? (
        <span className="shrink-0 transition-opacity flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
