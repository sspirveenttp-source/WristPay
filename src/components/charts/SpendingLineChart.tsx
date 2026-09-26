import React, { useState } from 'react';

interface DataPoint {
  day: string;
  amount: number;
}

interface SpendingLineChartProps {
  data: DataPoint[];
  height?: number;
}

export const SpendingLineChart: React.FC<SpendingLineChartProps> = ({
  data,
  height = 180
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-center text-xs text-slate-500 py-8">No data available</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.amount), 500);
  const minVal = 0;
  const range = maxVal - minVal;

  const width = 500;
  const paddingX = 35;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartW;
    const y = height - paddingY - (d.amount / range) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = height - paddingY - pct * chartH;
          const val = Math.round(minVal + pct * range);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingX - 6}
                y={y + 3}
                fill="#64748b"
                fontSize="9"
                textAnchor="end"
                fontFamily="JetBrains Mono, monospace"
              >
                ₹{val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#spendingGradient)" />

        {/* Primary Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & labels */}
        {points.map((p, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Invisible touch anchor */}
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />

              {/* Point circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? '5' : '3.5'}
                fill={isHovered ? '#818cf8' : '#6366f1'}
                stroke="#0f172a"
                strokeWidth="2"
                className="transition-all duration-150"
              />

              {/* Day label on X axis */}
              <text
                x={p.x}
                y={height - 6}
                fill={isHovered ? '#f8fafc' : '#94a3b8'}
                fontSize="10"
                textAnchor="middle"
                fontWeight={isHovered ? '600' : '400'}
                className="transition-colors"
              >
                {p.day}
              </text>

              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={p.x - 40}
                    y={Math.max(4, p.y - 28)}
                    width="80"
                    height="20"
                    rx="4"
                    fill="#1e1b4b"
                    stroke="#4338ca"
                    strokeWidth="1"
                  />
                  <text
                    x={p.x}
                    y={Math.max(17, p.y - 15)}
                    fill="#e0e7ff"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    ₹{p.amount.toLocaleString('en-IN')}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
