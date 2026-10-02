import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'positive' | 'negative' | 'warning' | 'info' | 'neutral' | 'peach' | 'mint' | 'blue';
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
    positive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium',
    negative: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-medium',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium',
    neutral: 'bg-surface-strong text-text-secondary border border-border-default font-medium',
    peach: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-medium',
    mint: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium',
  };

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap select-none transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
