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
    positive: 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 font-medium',
    negative: 'bg-rose-950/50 text-rose-400 border border-rose-800/40 font-medium',
    warning: 'bg-amber-950/50 text-amber-400 border border-amber-800/40 font-medium',
    info: 'bg-sky-950/50 text-sky-400 border border-sky-800/40 font-medium',
    neutral: 'bg-zinc-800/60 text-zinc-300 border border-white/[0.08] font-medium',
    peach: 'bg-amber-950/60 text-amber-300 border border-amber-800/50 font-semibold',
    mint: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 font-semibold',
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
