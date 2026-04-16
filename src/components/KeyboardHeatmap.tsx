import React from 'react';
import { cn } from '../lib/utils';

interface KeyboardHeatmapProps {
  missedKeys: Record<string, number>;
}

const KEYBOARD_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

export function KeyboardHeatmap({ missedKeys }: KeyboardHeatmapProps) {
  const maxMissed = Math.max(...Object.values(missedKeys), 0);

  return (
    <div className="bg-surface border border-border-theme p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[13px] font-semibold text-text-dim uppercase tracking-wider">Missed Keys Heatmap</h3>
        <span className="text-[11px] text-text-dim/60 font-medium">Last Session Keys</span>
      </div>
      <div className="flex flex-col gap-1 items-center">
        {KEYBOARD_LAYOUT.map((row, i) => (
          <div key={i} className="flex gap-1 justify-center">
            {row.map(key => {
              const count = missedKeys[key] || 0;
              const intensity = maxMissed > 0 ? (count / maxMissed) : 0;
              
              let heatClass = "";
              if (intensity > 0.7) heatClass = "bg-accent-red/40 border-accent-red";
              else if (intensity > 0.3) heatClass = "bg-orange-500/40 border-orange-500/50";
              else if (intensity > 0) heatClass = "bg-accent-green/20 border-accent-green/30";

              return (
                <div
                  key={key}
                  className={cn(
                    "w-8 h-8 md:w-[32px] md:h-[32px] flex items-center justify-center rounded-md border text-[10px] font-medium transition-colors",
                    heatClass || "bg-bg border-border-theme text-text-dim"
                  )}
                >
                  {key.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
