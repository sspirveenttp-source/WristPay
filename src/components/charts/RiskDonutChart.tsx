import React from 'react';

interface RiskDonutChartProps {
  normalCount: number;
  suspiciousCount: number;
  size?: number;
}

export const RiskDonutChart: React.FC<RiskDonutChartProps> = ({
  normalCount,
  suspiciousCount,
  size = 160
}) => {
  const total = Math.max(1, normalCount + suspiciousCount);
  const normalPct = (normalCount / total) * 100;
  const suspiciousPct = (suspiciousCount / total) * 100;

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Offsets
  const normalDash = (normalPct / 100) * circumference;
  const suspiciousDash = (suspiciousPct / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />

          {/* Normal Segment (Emerald) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${normalDash} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* Suspicious Segment (Rose) */}
          {suspiciousCount > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth={strokeWidth}
              strokeDasharray={`${suspiciousDash} ${circumference}`}
              strokeDashoffset={-normalDash}
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-white font-mono tabular-nums leading-none">
            {normalPct.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase mt-1">
            Normal Rate
          </span>
        </div>
      </div>

      {/* Legend & Details */}
      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
          <div>
            <div className="font-semibold text-slate-200">Normal Transactions</div>
            <div className="text-[11px] text-slate-400 font-mono">
              {normalCount} txns · {normalPct.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
          <div>
            <div className="font-semibold text-slate-200">Suspicious Anomaly Flagged</div>
            <div className="text-[11px] text-slate-400 font-mono">
              {suspiciousCount} txns · {suspiciousPct.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
