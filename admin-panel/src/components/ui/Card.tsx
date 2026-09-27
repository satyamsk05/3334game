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
    default: 'bg-[#0c0c0e] border border-white/[0.08] shadow-card hover:border-white/[0.14] transition-fast',
    raised: 'bg-[#141417] border border-white/[0.12] shadow-floating transition-fast',
    urgent: 'bg-[#0c0c0e] border border-white/[0.08] border-l-2 border-l-amber-500 shadow-card',
    positive: 'bg-[#0c0c0e] border border-white/[0.08] border-l-2 border-l-emerald-500 shadow-card',
    subtle: 'bg-[#18181b]/50 border border-white/[0.05] shadow-card',
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
