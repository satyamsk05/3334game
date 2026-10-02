import React from 'react';

interface VerticalBarChartProps {
  data?: number[];
  color?: 'emerald' | 'blue' | 'purple' | 'amber';
  height?: number;
}

export function VerticalBarChart({
  data = [35, 60, 45, 80, 50, 95, 70, 85, 40, 90, 65, 100],
  color = 'emerald',
  height = 42
}: VerticalBarChartProps) {
  const maxVal = Math.max(...data, 1);

  const colorMap = {
    emerald: {
      bar: 'fill-emerald-500 hover:fill-emerald-400',
      track: 'fill-emerald-500/10 dark:fill-emerald-500/15'
    },
    blue: {
      bar: 'fill-blue-500 hover:fill-blue-400',
      track: 'fill-blue-500/10 dark:fill-blue-500/15'
    },
    purple: {
      bar: 'fill-purple-500 hover:fill-purple-400',
      track: 'fill-purple-500/10 dark:fill-purple-500/15'
    },
    amber: {
      bar: 'fill-amber-500 hover:fill-amber-400',
      track: 'fill-amber-500/10 dark:fill-amber-500/15'
    }
  };

  const scheme = colorMap[color];
  const barWidth = 4.5;
  const barGap = 3.5;
  const totalWidth = data.length * (barWidth + barGap);

  return (
    <div className="w-full flex items-center justify-end overflow-hidden">
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[130px] h-[44px] overflow-visible"
        preserveAspectRatio="none"
      >
        {data.map((val, idx) => {
          const barHeight = Math.max((val / maxVal) * (height - 4), 4);
          const x = idx * (barWidth + barGap);
          const y = height - barHeight;

          return (
            <g key={idx}>
              {/* Background Track Pill */}
              <rect
                x={x}
                y={2}
                width={barWidth}
                height={height - 2}
                rx={barWidth / 2}
                className={`${scheme.track} transition-colors`}
              />
              {/* Dynamic Value Pill */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={barWidth / 2}
                className={`${scheme.bar} transition-all duration-300`}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
