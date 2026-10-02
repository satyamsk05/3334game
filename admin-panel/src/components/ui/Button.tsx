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
  const sizeStyles = {
    sm: `h-8 ${hasIcon && children ? 'ps-2.5 pe-3' : 'px-3'} text-xs gap-1.5 rounded-xl`,
    md: `h-9 ${hasIcon && children ? 'ps-3 pe-3.5' : 'px-3.5'} text-xs gap-2 rounded-xl`,
    lg: `h-10 ${hasIcon && children ? 'ps-3.5 pe-4' : 'px-4'} text-sm gap-2.5 rounded-xl`,
  };

  const variantStyles = {
    primary:
      'bg-accent-primary text-text-inverse font-medium hover:opacity-90 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
    secondary:
      'bg-surface-strong text-text-primary font-medium hover:bg-surface-muted border border-border-default shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
    outline:
      'bg-transparent text-text-secondary font-medium hover:text-text-primary hover:bg-surface-strong border border-border-default focus-visible:outline-none',
    danger:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-500/20 border border-rose-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-strong border border-transparent focus-visible:outline-none',
    dark:
      'bg-zinc-900 text-white font-medium hover:bg-zinc-800 border border-white/[0.08] shadow-xs focus-visible:outline-none',
  };

  const tapScale = !isStatic ? 'active:not-disabled:scale-[0.97]' : '';

  return (
    <button
      disabled={disabled || isSpinning}
      className={`inline-flex items-center justify-center font-sans whitespace-nowrap transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${tapScale} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isSpinning ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden="true" strokeWidth={2} />
      ) : icon ? (
        <span className="shrink-0 transition-opacity flex items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
