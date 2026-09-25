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
    positive: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold',
    negative: 'bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200/70 font-medium',
    peach: 'bg-[#ffedd5] text-[#ea580c] font-bold border-transparent',
    mint: 'bg-[#dcfce7] text-[#15803d] font-bold border-transparent',
  };

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs tracking-tight select-none transition-fast ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
