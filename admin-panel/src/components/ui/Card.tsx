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
    default: 'bg-white shadow-card hover:shadow-1 transition-fast',
    raised: 'bg-white shadow-floating transition-fast',
    urgent: 'bg-white shadow-card border-l-2 border-l-amber-500',
    positive: 'bg-white shadow-card border-l-2 border-l-emerald-500',
    subtle: 'bg-surface-muted shadow-card',
  };

  return (
    <Component
      className={`rounded-lg p-5 sm:p-6 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
