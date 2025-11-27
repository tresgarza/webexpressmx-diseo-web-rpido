"use client";

import { Check } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import type { Plan, RushFee } from "@/lib/supabase";

export interface TimelineOption {
  id: string;
  label: string;
  sublabel: string;
  displayName: string;
  markupPercent: number;
  hasMarkup: boolean;
  rushFeeAmount: number;
  rushFee: RushFee | null;
  deliveryDaysMin: number | null;
  deliveryDaysMax: number | null;
}

interface TimelineSelectorProps {
  timelines: TimelineOption[];
  selectedTimelineId: string;
  onSelect: (timelineId: string) => void;
  plan: Plan | null;
}

export function TimelineSelector({
  timelines,
  selectedTimelineId,
  onSelect,
  plan,
}: TimelineSelectorProps) {
  if (!plan) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
      {timelines.map((option) => {
        const isSelected = selectedTimelineId === option.id;
        const hasMarkup = option.hasMarkup;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`relative p-4 md:p-5 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            {hasMarkup && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                {option.displayName || 'Express'}
              </span>
            )}

            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <span className="font-semibold text-sm md:text-base block">{option.label}</span>
                <span className="text-xs md:text-sm text-muted-foreground block mt-0.5 md:mt-1">
                  {option.sublabel}
                </span>
              </div>
              {isSelected && <Check className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />}
            </div>

            {hasMarkup && option.rushFeeAmount > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-1.5 md:p-2 -mx-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] md:text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Cargo por urgencia:
                  </span>
                  <span className="text-base md:text-lg font-bold text-amber-600 dark:text-amber-400">
                    +{formatPrice(option.rushFeeAmount)}
                  </span>
                </div>
                <div className="text-[9px] md:text-[10px] text-amber-600/80 dark:text-amber-400/80">
                  <span className="font-medium">+{option.markupPercent}%</span> por prioridad máxima
                </div>
              </div>
            )}

            {!hasMarkup && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <span className="text-[10px] md:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✅ Sin cargo adicional
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

