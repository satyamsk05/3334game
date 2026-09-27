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
    positive: 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/30 font-medium',
    negative: 'bg-rose-950/30 text-rose-400 border border-rose-800/30 font-medium',
    warning: 'bg-amber-950/30 text-amber-400 border border-amber-800/30 font-medium',
    info: 'bg-sky-950/30 text-sky-400 border border-sky-800/30 font-medium',
    neutral: 'bg-zinc-900 text-zinc-400 border border-white/[0.08] font-medium',
    peach: 'bg-amber-950/30 text-amber-400 border border-amber-800/30 font-medium',
    mint: 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/30 font-medium',
  };

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs select-none transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
