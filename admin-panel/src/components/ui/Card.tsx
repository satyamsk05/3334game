import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'urgent' | 'positive' | 'subtle';
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  onSubmit?: React.FormEventHandler;
}

export function Card({
  variant = 'default',
  className = '',
  children,
  as: Component = 'div',
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-surface-raised border-border-default hover:border-border-muted',
    urgent: 'bg-surface-raised border-status-warning/50 shadow-[0_0_12px_rgba(245,158,11,0.08)]',
    positive: 'bg-surface-raised border-status-positive/40',
    subtle: 'bg-surface-subtle border-border-muted',
  };

  return (
    <Component
      className={`rounded-lg border p-space-6 transition-normal ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
