import React from 'react';

interface MultiLineSplineChartProps {
  seriesA?: number[]; // e.g. Deposits
  seriesB?: number[]; // e.g. Withdrawals
  labels?: string[];
  height?: number;
}

export function MultiLineSplineChart({
  seriesA = [28, 42, 35, 65, 50, 75, 60, 88, 72, 95],
  seriesB = [18, 25, 30, 40, 32, 55, 45, 60, 52, 68],
  labels = ['02:00', '05:00', '08:00', '11:00', '14:00', '17:00', '20:00', '23:00'],
  height = 140
}: MultiLineSplineChartProps) {
  const width = 600;
  const paddingX = 20;
  const paddingY = 20;

  const maxVal = Math.max(...seriesA, ...seriesB, 100);

  const pointsToSvgPath = (points: number[]) => {
    const step = (width - paddingX * 2) / (points.length - 1);
    const coords = points.map((val, i) => {
      const x = paddingX + i * step;
      const y = height - paddingY - (val / maxVal) * (height - paddingY * 2);
      return { x, y };
    });

    if (coords.length < 2) return '';

    // Smooth Bezier Curve computation
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = i > 0 ? coords[i - 1] : coords[i];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = i < coords.length - 2 ? coords[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return { path, coords };
  };

  const lineA = pointsToSvgPath(seriesA);
  const lineB = pointsToSvgPath(seriesB);

  // Closed paths for area gradients
  const areaAPath = lineA && lineA.coords ? `${lineA.path} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z` : '';
  const areaBPath = lineB && lineB.coords ? `${lineB.path} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z` : '';

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[150px] overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Linear Gradients for Area Fills */}
            <linearGradient id="splineGreenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="splinePurpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Guidance Grid Lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="currentColor" className="text-border-default/40" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="currentColor" className="text-border-default/40" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="currentColor" className="text-border-default/60" />

          {/* Area Fills */}
          {areaAPath && <path d={areaAPath} fill="url(#splineGreenGrad)" />}
          {areaBPath && <path d={areaBPath} fill="url(#splinePurpleGrad)" />}

          {/* Spline Lines */}
          {lineB && (
            <path
              d={lineB.path}
              fill="none"
              stroke="#6366F1"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-xs"
            />
          )}

          {lineA && (
            <path
              d={lineA.path}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-xs"
            />
          )}

          {/* Current End Indicator Dots */}
          {lineA && lineA.coords && lineA.coords.length > 0 && (
            <circle
              cx={lineA.coords[lineA.coords.length - 1].x}
              cy={lineA.coords[lineA.coords.length - 1].y}
              r="4"
              className="fill-emerald-500 stroke-white stroke-2"
            />
          )}
          {lineB && lineB.coords && lineB.coords.length > 0 && (
            <circle
              cx={lineB.coords[lineB.coords.length - 1].x}
              cy={lineB.coords[lineB.coords.length - 1].y}
              r="4"
              className="fill-indigo-500 stroke-white stroke-2"
            />
          )}
        </svg>
      </div>

      {/* Time Labels */}
      <div className="flex justify-between px-3 text-xs text-text-tertiary font-mono">
        {labels.map((lbl, idx) => (
          <span key={idx}>{lbl}</span>
        ))}
      </div>
    </div>
  );
}
