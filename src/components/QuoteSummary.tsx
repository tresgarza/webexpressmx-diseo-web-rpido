"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Clock, ChevronDown } from "lucide-react";
import { formatPrice, calculateCampaignDiscount, formatDeliveryDays } from "@/lib/pricing";
import type { Plan, Addon, Campaign, RushFee } from "@/lib/supabase";
import type { TimelineOption } from "./TimelineSelector";

interface QuoteSummaryProps {
  plan: Plan | null;
  addons: Addon[];
  timeline: TimelineOption | null;
  campaign: Campaign | null;
  rushFee: RushFee | null;
  step: number;
}

function isOneTimeAddon(addon: Addon): boolean {
  if (!addon.billing_type) return true;
  const billingType = addon.billing_type.toLowerCase();
  return billingType === 'one-time' || billingType === 'one_time' || billingType === '';
}

function isMonthlyAddon(addon: Addon): boolean {
  if (!addon.billing_type) return false;
  return addon.billing_type.toLowerCase() === 'monthly';
}

function calculateTotals(
  plan: Plan | null,
  addons: Addon[],
  discountPercent: number,
  rushFee: RushFee | null
) {
  const oneTimeAddons = addons.filter(isOneTimeAddon);
  const monthlyAddons = addons.filter(isMonthlyAddon);

  // Calculate base initial costs
  let priceBeforeRush = 0;
  if (plan) {
    priceBeforeRush += plan.price;
  }
  oneTimeAddons.forEach((addon) => {
    priceBeforeRush += addon.price;
  });

  // Apply rush fee markup to plan price only
  let rushFeeAmount = 0;
  let priceWithRush = priceBeforeRush;
  const hasRushFee = rushFee && rushFee.markup_percent > 0;

  if (plan && rushFee && rushFee.markup_percent > 0) {
    rushFeeAmount = Math.round(plan.price * (rushFee.markup_percent / 100));
    if (rushFee.markup_fixed) {
      rushFeeAmount += rushFee.markup_fixed;
    }
    priceWithRush = priceBeforeRush + rushFeeAmount;
  }

  // Apply campaign discount
  const initialSubtotal = priceWithRush;
  const initialDiscount = Math.round(initialSubtotal * (discountPercent / 100));
  const initialTotal = initialSubtotal - initialDiscount;

  // Calculate monthly costs
  let monthlySubtotal = 0;
  monthlyAddons.forEach((addon) => {
    monthlySubtotal += addon.price;
  });

  const monthlyDiscount = Math.round(monthlySubtotal * (discountPercent / 100));
  const monthlyTotal = monthlySubtotal - monthlyDiscount;

  return {
    initialSubtotal,
    initialDiscount,
    initialTotal,
    monthlySubtotal,
    monthlyDiscount,
    monthlyTotal,
    hasMonthly: monthlyTotal > 0,
    hasRushFee,
    rushFeeAmount,
    priceBeforeRush,
    priceWithRush,
  };
}

export function QuoteSummary({
  plan,
  addons,
  timeline,
  campaign,
  rushFee,
  step,
}: QuoteSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!plan && step === 1) return null;
  if (!plan) return null;

  const discountPercent = campaign?.discount_percent || 0;
  const totals = calculateTotals(plan, addons, discountPercent, rushFee);
  const oneTimeAddons = addons.filter(isOneTimeAddon);
  const monthlyAddons = addons.filter(isMonthlyAddon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 md:p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-lavender/5 border-2 border-primary/20 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-base md:text-lg flex items-center gap-2">
          <Target className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          Resumen de tu solicitud
        </h4>
        {addons.length > 0 && !isExpanded && (
          <span className="text-xs text-muted-foreground">
            {oneTimeAddons.length} add-on{oneTimeAddons.length !== 1 ? 's' : ''} inicial
            {oneTimeAddons.length !== 1 ? 'es' : ''}
            {monthlyAddons.length > 0 && (
              <> • {monthlyAddons.length} mensual{monthlyAddons.length !== 1 ? 'es' : ''}</>
            )}
          </span>
        )}
      </div>

      {/* Versión compacta - siempre visible */}
      <div className="bg-background/50 rounded-xl p-3 md:p-4 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">Plan {plan.name}</span>
              {discountPercent > 0 && (
                <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                  -{discountPercent}%
                </span>
              )}
            </div>
            {timeline && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  {timeline.deliveryDaysMin && timeline.deliveryDaysMax
                    ? formatDeliveryDays(timeline.deliveryDaysMin, timeline.deliveryDaysMax)
                    : timeline.sublabel}
                </span>
              </div>
            )}
          </div>
          <div className="text-right ml-4">
            <div className="text-xl md:text-2xl font-bold text-primary">
              {formatPrice(totals.initialTotal)}
            </div>
            {totals.hasMonthly && (
              <div className="text-xs text-muted-foreground">
                +{formatPrice(totals.monthlyTotal)}/mes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón Ver más / Ver menos */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center gap-2 w-full mt-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <span>{isExpanded ? 'Ver menos' : 'Ver más'}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Contenido expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 mt-4 pt-4 border-t border-border/50">

              {/* Disclaimer sobre variaciones */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <span className="font-semibold shrink-0">ℹ️</span>
                  <span>
                    <strong>Nota importante:</strong> Esta es una estimación inicial. 
                    El precio final puede variar si requieres funcionalidades específicas adicionales 
                    que no están incluidas en el plan base o add-ons estándar. Te contactaremos para 
                    ajustar los detalles según tus necesidades exactas.
                  </span>
                </p>
              </div>

              {/* Pago Inicial - Detallado */}
              <div className="bg-background/50 rounded-xl p-3 md:p-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            💰 Pago inicial
          </span>
          {discountPercent > 0 && totals.initialSubtotal > 0 && (
            <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
              -{discountPercent}%
            </span>
          )}
        </div>

        <div className="space-y-2 mb-3 text-xs">
          {/* Plan */}
          <div className="flex flex-col gap-1 py-1">
            <div className="flex justify-between items-center">
              <span className="font-medium">Plan {plan.name}</span>
              {discountPercent > 0 ? (
                <div className="text-right flex items-center gap-1.5">
                  <span className="line-through text-muted-foreground/60">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="font-semibold">
                    {formatPrice(calculateCampaignDiscount(plan.price, discountPercent).discounted)}
                  </span>
                </div>
              ) : (
                <span className="font-semibold">{formatPrice(plan.price)}</span>
              )}
            </div>
            {timeline && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  Entrega: {timeline.deliveryDaysMin && timeline.deliveryDaysMax
                    ? formatDeliveryDays(timeline.deliveryDaysMin, timeline.deliveryDaysMax)
                    : timeline.sublabel}
                </span>
              </div>
            )}
          </div>

          {/* Rush Fee */}
          {totals.hasRushFee && rushFee && (
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">
                {rushFee.display_name || 'Cargo por urgencia'}
              </span>
              <span className="font-semibold">+{formatPrice(totals.rushFeeAmount)}</span>
            </div>
          )}

          {/* Add-ons one-time */}
          {oneTimeAddons.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/30">
              <div className="text-[10px] font-medium text-muted-foreground/80 mb-1.5 uppercase tracking-wide">
                Add-ons (pago único) - {oneTimeAddons.length} item{oneTimeAddons.length !== 1 ? 's' : ''}
              </div>
              <div className="space-y-1">
                {oneTimeAddons.map((addon) => {
                  const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
                  return (
                    <div key={addon.id} className="flex justify-between items-center py-0.5">
                      <span className="truncate text-muted-foreground">{addon.name}</span>
                      {discountPercent > 0 ? (
                        <div className="text-right flex items-center gap-1.5 shrink-0">
                          <span className="line-through text-muted-foreground/60">
                            {formatPrice(addon.price)}
                          </span>
                          <span className="font-medium">{formatPrice(addonPricing.discounted)}</span>
                        </div>
                      ) : (
                        <span className="font-medium">{formatPrice(addon.price)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Subtotal antes del descuento */}
        {discountPercent > 0 && totals.initialSubtotal > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 pt-2 border-t border-border/50">
            <span>Subtotal inicial (antes de descuento)</span>
            <span className="line-through">{formatPrice(totals.initialSubtotal)}</span>
          </div>
        )}

        {/* Descuento aplicado */}
        {discountPercent > 0 && totals.initialDiscount > 0 && (
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="flex items-center gap-1">
              🏷️ Descuento ({campaign?.name || 'Promoción'})
            </span>
            <span className="font-semibold">-{formatPrice(totals.initialDiscount)}</span>
          </div>
        )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-semibold">Total inicial</span>
                  <span className="text-xl md:text-2xl font-bold text-primary">{formatPrice(totals.initialTotal)}</span>
                </div>
              </div>

              {/* Pago Mensual */}
              {totals.hasMonthly && (
                <div className="bg-background/50 rounded-xl p-3 md:p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              🔄 Pago mensual
            </span>
            {discountPercent > 0 && totals.monthlySubtotal > 0 && (
              <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                -{discountPercent}%
              </span>
            )}
          </div>

          {monthlyAddons.length > 0 && (
            <div className="space-y-1 mb-2 text-xs">
              <div className="text-[10px] font-medium text-muted-foreground/80 mb-1.5 uppercase tracking-wide">
                Add-ons (mensuales) - {monthlyAddons.length} item{monthlyAddons.length !== 1 ? 's' : ''}
              </div>
              <div className="space-y-1">
                {monthlyAddons.map((addon) => {
                  const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
                  return (
                    <div key={addon.id} className="flex justify-between items-center py-0.5">
                      <span className="truncate text-muted-foreground">{addon.name}</span>
                      {discountPercent > 0 ? (
                        <div className="text-right flex items-center gap-1.5 shrink-0">
                          <span className="line-through text-muted-foreground/60">
                            {formatPrice(addon.price)}
                          </span>
                          <span className="font-medium">
                            {formatPrice(addonPricing.discounted)}/mes
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium">{formatPrice(addon.price)}/mes</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {discountPercent > 0 && totals.monthlySubtotal > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 pt-2 border-t border-border/50">
              <span>Subtotal mensual (antes de descuento)</span>
              <span className="line-through">{formatPrice(totals.monthlySubtotal)}</span>
            </div>
          )}

          {discountPercent > 0 && totals.monthlyDiscount > 0 && (
            <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="flex items-center gap-1">
                🏷️ Descuento ({campaign?.name || 'Promoción'})
              </span>
              <span className="font-semibold">
                -{formatPrice(totals.monthlyDiscount)}/mes
              </span>
            </div>
          )}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="font-semibold">Total mensual</span>
                    <span className="text-xl md:text-2xl font-bold text-primary">
                      {formatPrice(totals.monthlyTotal)}
                      <span className="text-sm font-normal text-muted-foreground">/mes</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

