import React from 'react';

interface FeatureItem {
  feature: string;
  weight: number;
  category?: string;
}

interface FeatureImportanceBarChartProps {
  features: FeatureItem[];
}

export const FeatureImportanceBarChart: React.FC<FeatureImportanceBarChartProps> = ({ features }) => {
  const sorted = [...features].sort((a, b) => b.weight - a.weight);
  const maxWeight = Math.max(...features.map((f) => f.weight), 0.35);

  return (
    <div className="space-y-3">
      {sorted.map((item, idx) => {
        const pct = (item.weight / maxWeight) * 100;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">{item.feature}</span>
              <span className="font-mono text-slate-400 tabular-nums">
                {(item.weight * 100).toFixed(1)}% weight
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            {item.category && (
              <span className="text-[10px] text-slate-500">{item.category}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
