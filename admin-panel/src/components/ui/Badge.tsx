import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'positive' | 'negative' | 'warning' | 'info' | 'neutral' | 'peach' | 'mint';
  ariaLabel?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = 'neutral',
  ariaLabel,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const variantStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium',
    negative: 'bg-rose-50 text-rose-700 border border-rose-200/80 font-medium',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80 font-medium',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/80 font-medium',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200 font-medium',
    peach: 'bg-amber-50 text-amber-900 border border-amber-200 font-semibold',
    mint: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
  };

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs tracking-tight select-none transition-fast ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
