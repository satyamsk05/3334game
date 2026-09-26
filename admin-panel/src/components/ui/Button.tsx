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
    sm: 'h-8 px-3.5 text-xs gap-1.5 rounded-xl',
    md: 'h-9 px-4 text-sm gap-2 rounded-xl',
    lg: 'h-11 px-5 text-base gap-2.5 rounded-2xl',
  };

  const variantStyles = {
    primary:
      'bg-accent-primary text-white font-semibold hover:bg-blue-700 shadow-sm border border-transparent',
    dark:
      'bg-gray-900 text-white font-semibold hover:bg-black shadow-sm border border-transparent',
    secondary:
      'bg-white border border-gray-200/80 text-gray-700 font-semibold hover:bg-gray-50 hover:text-gray-900 shadow-sm',
    danger:
      'bg-rose-50 border border-rose-200/80 text-rose-700 font-semibold hover:bg-rose-100 hover:text-rose-800',
    ghost:
      'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 border border-transparent',
  };

  const tapScale = !isStatic ? 'active:not-disabled:scale-[0.96]' : '';

  return (
    <button
      disabled={disabled || isSpinning}
      className={`inline-flex items-center justify-center font-sans font-medium transition-all duration-150 ease-out select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${tapScale} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isSpinning ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden="true" />
      ) : icon ? (
        <span className="shrink-0 transition-transform duration-150">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
