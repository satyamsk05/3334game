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
    default: 'bg-white border border-gray-100/90 shadow-soft hover:shadow-card hover:border-gray-200/80',
    urgent: 'bg-white border border-amber-200/80 shadow-[0_4px_24px_rgba(245,158,11,0.08)]',
    positive: 'bg-white border border-emerald-200/70 shadow-soft',
    subtle: 'bg-surface-muted/80 border border-gray-200/60',
  };

  return (
    <Component
      className={`rounded-3xl p-6 sm:p-7 transition-all duration-150 ease-out ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
