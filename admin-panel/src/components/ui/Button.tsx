import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'dark';
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
    sm: 'h-8 px-3.5 text-xs gap-1.5 rounded-xl',
    md: 'h-9 px-4 text-sm gap-2 rounded-xl',
    lg: 'h-11 px-5 text-base gap-2.5 rounded-2xl',
  };

  const variantStyles = {
    primary:
      'bg-accent-primary text-white font-semibold hover:bg-blue-700 shadow-sm active:scale-[0.98]',
    dark:
      'bg-gray-900 text-white font-semibold hover:bg-black shadow-sm active:scale-[0.98]',
    secondary:
      'bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:text-gray-900 shadow-sm active:scale-[0.98]',
    danger:
      'bg-rose-50 border border-rose-200 text-rose-700 font-semibold hover:bg-rose-100 active:scale-[0.98]',
    ghost:
      'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isSpinning}
      className={`inline-flex items-center justify-center font-sans font-medium transition-fast select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
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
