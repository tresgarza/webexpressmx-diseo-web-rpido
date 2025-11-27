"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { formatPrice, calculateCampaignDiscount } from "@/lib/pricing";
import type { Addon, Campaign } from "@/lib/supabase";

interface AddOnGridProps {
  addons: Addon[];
  selectedAddonIds: string[];
  onToggle: (addonId: string) => void;
  campaign: Campaign | null;
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

export function AddOnGrid({
  addons,
  selectedAddonIds,
  onToggle,
  campaign,
  isExpanded: controlledExpanded,
  onExpandChange,
}: AddOnGridProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const setExpanded = onExpandChange || setInternalExpanded;

  const discountPercent = campaign?.discount_percent || 0;

  // Separate addons by billing type
  const oneTimeAddons = addons.filter(
    (addon) => !addon.billing_type || addon.billing_type.toLowerCase() === 'one-time' || addon.billing_type.toLowerCase() === 'one_time'
  );
  const monthlyAddons = addons.filter(
    (addon) => addon.billing_type && addon.billing_type.toLowerCase() === 'monthly'
  );

  if (addons.length === 0) return null;

  return (
    <div className="border-t border-border pt-4 md:pt-5">
      <button
        type="button"
        onClick={() => setExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-3 md:mb-4 group"
      >
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm md:text-base">Add-ons opcionales</h4>
          {selectedAddonIds.length > 0 && (
            <span className="text-xs md:text-sm text-primary font-medium">
              {selectedAddonIds.length} seleccionado{selectedAddonIds.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-2 md:gap-3">
              {addons.map((addon) => {
                const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
                const isSelected = selectedAddonIds.includes(addon.id);

                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => onToggle(addon.id)}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all text-left flex items-start gap-2 md:gap-3 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected ? "bg-primary border-primary" : "border-border"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{addon.name}</span>
                        {addon.badge && (
                          <span className="text-xs bg-lavender/20 text-lavender px-2 py-0.5 rounded-full shrink-0">
                            {addon.badge}
                          </span>
                        )}
                      </div>
                      {addon.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {addon.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {discountPercent > 0 ? (
                          <>
                            <span className="text-sm font-semibold">
                              {formatPrice(addonPricing.discounted)}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(addonPricing.original)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold">
                            {formatPrice(addon.price)}
                          </span>
                        )}
                        {addon.billing_type && (
                          <span className="text-xs text-muted-foreground">
                            /{addon.billing_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

