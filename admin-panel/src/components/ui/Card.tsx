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
    default: 'bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.14] transition-colors',
    raised: 'bg-[#141417] border border-white/[0.10] transition-colors',
    urgent: 'bg-[#0c0c0e] border border-white/[0.08] border-l-2 border-l-amber-500',
    positive: 'bg-[#0c0c0e] border border-white/[0.08] border-l-2 border-l-emerald-500',
    subtle: 'bg-[#141417]/50 border border-white/[0.06]',
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
