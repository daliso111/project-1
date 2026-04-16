import React from 'react';
import { ACHIEVEMENTS } from '../achievements';
import { cn } from '../lib/utils';
import { Lock } from 'lucide-react';

interface BadgeGridProps {
  unlockedIds: string[];
}

export function BadgeGrid({ unlockedIds }: BadgeGridProps) {
  return (
    <div className="bg-surface border border-border-theme p-6 rounded-xl">
      <h3 className="text-[13px] font-semibold text-text-dim uppercase tracking-wider mb-6">Achievement Badges</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {ACHIEVEMENTS.map((badge) => {
          const isUnlocked = unlockedIds.includes(badge.id);
          
          return (
            <div 
              key={badge.id}
              className={cn(
                "relative group flex flex-col items-center p-4 rounded-xl border transition-all duration-300",
                isUnlocked 
                  ? "bg-bg border-accent-blue/30 shadow-lg shadow-accent-blue/5" 
                  : "bg-bg/50 border-border-theme opacity-50 grayscale"
              )}
            >
              <div className="text-3xl mb-2 grayscale-0">{isUnlocked ? badge.icon : <Lock size={20} className="text-text-dim" />}</div>
              <p className="text-[10px] font-bold text-text-main text-center uppercase tracking-tighter mb-1 leading-none">{badge.title}</p>
              
              {/* Tooltip on hover */}
              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-stone-900 text-white text-[10px] py-1 px-3 rounded whitespace-nowrap z-10">
                {badge.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
