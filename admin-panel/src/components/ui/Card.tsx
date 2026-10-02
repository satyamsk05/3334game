import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'urgent' | 'positive' | 'subtle';
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
    default: 'bg-surface-raised border border-border-default shadow-xs hover:border-border-strong transition-all',
    raised: 'bg-surface-strong border border-border-default shadow-sm transition-all',
    urgent: 'bg-surface-raised border border-border-default border-l-4 border-l-amber-500 shadow-xs',
    positive: 'bg-surface-raised border border-border-default border-l-4 border-l-emerald-500 shadow-xs',
    subtle: 'bg-surface-strong/40 border border-border-subtle',
  };

  return (
    <Component
      className={`rounded-xl p-5 sm:p-6 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
