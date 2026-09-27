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
      'bg-gray-900 text-white font-medium hover:bg-black shadow-button border border-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900',
    dark:
      'bg-gray-900 text-white font-medium hover:bg-black shadow-button border border-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900',
    secondary:
      'bg-white text-gray-800 font-medium hover:bg-gray-50/90 shadow-card hover:border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-900',
    danger:
      'bg-rose-50 text-rose-700 font-medium hover:bg-rose-100/90 border border-rose-200/80 focus-visible:ring-2 focus-visible:ring-rose-600',
    ghost:
      'bg-transparent text-gray-600 hover:text-gray-950 hover:bg-gray-100/80 border border-transparent focus-visible:ring-2 focus-visible:ring-gray-900',
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
