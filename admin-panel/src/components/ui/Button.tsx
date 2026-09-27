import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'dark';
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

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
    md: 'h-9 px-3.5 text-sm gap-2 rounded-md',
    lg: 'h-10 px-4 text-md gap-2.5 rounded-lg',
  };

  const variantStyles = {
    primary:
      'bg-white text-black font-semibold hover:bg-zinc-200 shadow-button border border-white focus-visible:ring-2 focus-visible:ring-white',
    dark:
      'bg-zinc-800 text-white font-medium hover:bg-zinc-700 shadow-button border border-white/[0.08] focus-visible:ring-2 focus-visible:ring-white',
    secondary:
      'bg-[#141417] text-zinc-200 font-medium hover:bg-zinc-800 hover:text-white border border-white/[0.08] shadow-button focus-visible:ring-2 focus-visible:ring-white',
    danger:
      'bg-rose-950/40 text-rose-300 font-medium hover:bg-rose-900/50 border border-rose-800/50 focus-visible:ring-2 focus-visible:ring-rose-500',
    ghost:
      'bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent focus-visible:ring-2 focus-visible:ring-white',
  };

  const tapScale = !isStatic ? 'active:not-disabled:scale-[0.98]' : '';

  return (
    <button
      disabled={disabled || isSpinning}
      className={`inline-flex items-center justify-center font-sans transition-fast select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${tapScale} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isSpinning ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden="true" />
      ) : icon ? (
        <span className="shrink-0 transition-fast">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
