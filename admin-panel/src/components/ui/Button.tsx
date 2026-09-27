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

  const hasIcon = Boolean(icon || isSpinning);
  const sizeStyles = {
    sm: `h-8 ${hasIcon && children ? 'ps-2.5 pe-3' : 'px-3'} text-xs gap-1.5 rounded-md`,
    md: `h-9 ${hasIcon && children ? 'ps-3 pe-3.5' : 'px-3.5'} text-xs gap-2 rounded-md`,
    lg: `h-10 ${hasIcon && children ? 'ps-3.5 pe-4' : 'px-4'} text-sm gap-2.5 rounded-lg`,
  };

  const variantStyles = {
    primary:
      'bg-white text-black font-medium hover:bg-zinc-200 border border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
    dark:
      'bg-zinc-900 text-white font-medium hover:bg-zinc-800 border border-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
    secondary:
      'bg-[#0c0c0e] text-zinc-300 font-medium hover:bg-[#141417] hover:text-white border border-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
    danger:
      'bg-rose-950/30 text-rose-300 font-medium hover:bg-rose-950/50 border border-rose-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
    ghost:
      'bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
  };

  const tapScale = !isStatic ? 'active:not-disabled:scale-[0.96]' : '';

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
