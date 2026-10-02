import React from 'react';

interface DonutProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function DonutProgressRing({
  percentage = 67,
  size = 52,
  strokeWidth = 5.5,
  color = '#10B981',
  label
}: DonutProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border-default/60 dark:text-zinc-800 fill-none"
        />
        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="fill-none transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-bold text-text-primary tabular-nums">
          {percentage}%
        </span>
        {label && (
          <span className="text-[8px] text-text-tertiary">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
