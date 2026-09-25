import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'positive' | 'negative' | 'warning' | 'info' | 'neutral';
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function Badge({
  variant = 'neutral',
  children,
  ariaLabel,
  className = '',
  ...props
}: BadgeProps) {
  const variantStyles = {
    positive: 'bg-status-positive/10 text-status-positive border-status-positive/25',
    negative: 'bg-status-negative/10 text-status-negative border-status-negative/25',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/25',
    info: 'bg-accent-primary/10 text-accent-primary border-accent-primary/25',
    neutral: 'bg-surface-muted text-text-secondary border-border-default',
  };

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-space-1.5 rounded-xs border px-space-2 py-0.5 text-xs font-mono font-medium leading-none whitespace-nowrap uppercase tracking-wider ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
