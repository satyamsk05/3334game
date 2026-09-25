import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  isLoading = false,
  disabled = false,
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isSpinning = loading || isLoading;

  const sizeStyles = {
    sm: 'h-7 px-space-3 text-xs gap-space-2 rounded-xs',
    md: 'h-8 px-space-4 text-sm gap-space-2 rounded-sm',
    lg: 'h-10 px-space-5 text-md gap-space-3 rounded-md',
  };

  const variantStyles = {
    primary:
      'bg-accent-primary text-text-inverse font-medium hover:bg-accent-primary/90 active:scale-[0.98]',
    secondary:
      'bg-surface-raised border border-border-default text-text-secondary hover:text-text-primary hover:border-border-default/80 hover:bg-surface-subtle active:scale-[0.98]',
    danger:
      'bg-status-negative/10 border border-status-negative/30 text-status-negative hover:bg-status-negative/20 active:scale-[0.98]',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-raised active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isSpinning}
      className={`inline-flex items-center justify-center font-mono font-medium transition-fast select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isSpinning ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
