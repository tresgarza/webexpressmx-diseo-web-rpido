"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, ChevronLeft, ChevronRight, ChevronDown, Target } from "lucide-react";
import { formatPrice, calculateCampaignDiscount } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import type { Plan, Campaign } from "@/lib/supabase";

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId: string;
  onSelect: (planId: string) => void;
  campaign: Campaign | null;
}

function getPlanStandardDays(planSlug: string | undefined): { min: number; max: number } {
  if (!planSlug) return { min: 3, max: 10 };
  switch (planSlug.toLowerCase()) {
    case 'starter': return { min: 2, max: 7 };
    case 'business': return { min: 3, max: 10 };
    case 'pro-plus':
    case 'proplus': return { min: 5, max: 30 };
    default: return { min: 3, max: 10 };
  }
}

export function PlanSelector({ plans, selectedPlanId, onSelect, campaign }: PlanSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const discountPercent = campaign?.discount_percent || 0;

  const nextPlan = () => setCurrentIndex((prev) => (prev + 1) % plans.length);
  const prevPlan = () => setCurrentIndex((prev) => (prev - 1 + plans.length) % plans.length);

  return (
    <>
      {/* Mobile Carousel */}
      <div className="lg:hidden relative mb-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={prevPlan}
            className="p-2 rounded-full bg-card border border-border hover:border-primary transition-colors"
            aria-label="Plan anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {plans.length}
          </span>
          <button
            onClick={nextPlan}
            className="p-2 rounded-full bg-card border border-border hover:border-primary transition-colors"
            aria-label="Siguiente plan"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            {plans.length > 0 && (
              <PlanCard
                plan={plans[currentIndex]}
                isSelected={selectedPlanId === plans[currentIndex].id}
                onSelect={() => onSelect(plans[currentIndex].id)}
                discountPercent={discountPercent}
                showDetails={true}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlanId === plan.id}
            onSelect={() => onSelect(plan.id)}
            discountPercent={discountPercent}
            showDetails={true}
          />
        ))}
      </div>
    </>
  );
}

function getPlanContext(planSlug: string) {
  switch (planSlug.toLowerCase()) {
    case 'starter':
      return {
        badge: { text: 'Simple y Rápido', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
        idealFor: ['MVPs', 'Emprendedores', 'Negocios que necesitan algo rápido', 'Sin blog, sin e-commerce']
      };
    case 'business':
      return {
        badge: null,
        idealFor: ['Empresas establecidas', 'Negocios que quieren web profesional', 'Quienes necesitan varias secciones', 'Mejor relación costo-beneficio']
      };
    case 'pro-plus':
    case 'proplus':
      return {
        badge: { text: 'Más Completo', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
        idealFor: ['Proyectos complejos', 'E-commerce informativo (sin checkout)', 'Empresas que quieren experiencia WOW', 'Marcas con branding fuerte']
      };
    default:
      return {
        badge: null,
        idealFor: []
      };
  }
}

function PlanCard({
  plan,
  isSelected,
  onSelect,
  discountPercent,
  showDetails = false,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  discountPercent: number;
  showDetails?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pricing = calculateCampaignDiscount(plan.price, discountPercent);
  const deliveryRange = getPlanStandardDays(plan.slug);
  const deliveryDaysLabel =
    deliveryRange.min === deliveryRange.max
      ? `${deliveryRange.min} días hábiles`
      : `${deliveryRange.min}-${deliveryRange.max} días hábiles`;
  const planContext = getPlanContext(plan.slug);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Don't select if clicking on the "Ver más" button
    if (target.closest('[data-details-button]')) {
      e.stopPropagation();
      return;
    }
    
    // Don't select if clicking directly on the "Seleccionar" button (it has its own handler)
    if (target.closest('[data-select-button]')) {
      return;
    }
    
    // Don't select if clicking on interactive elements inside expanded content (links, buttons, etc.)
    // But allow selection when clicking on regular text/content
    if (target.closest('[data-expanded-content]')) {
      const interactiveElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
      const isInteractive = interactiveElements.includes(target.tagName) || 
                           target.closest('a, button, input, select, textarea');
      
      if (isInteractive) {
        e.stopPropagation();
        return;
      }
      // If clicking on non-interactive content in expanded section, allow selection
    }
    
    onSelect();
  };

  const handleSelectButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`relative p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
          isSelected
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-border hover:border-primary/50"
        }`}
      >
        {plan.is_popular && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
            Popular
          </span>
        )}

        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-base md:text-lg">{plan.name}</h4>
              {isSelected && (
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
                </div>
              )}
            </div>
            {plan.subtitle && (
              <p className="text-xs md:text-sm text-muted-foreground mb-1.5">{plan.subtitle}</p>
            )}
          </div>
        </div>

        <div className="mb-2">
          {discountPercent > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-bold">{formatPrice(pricing.discounted)}</span>
              <span className="text-xs md:text-sm text-muted-foreground line-through">
                {formatPrice(pricing.original)}
              </span>
            </div>
          ) : (
            <span className="text-xl md:text-2xl font-bold">{formatPrice(plan.price)}</span>
          )}
        </div>

        <div className="flex items-center gap-1 mb-2 text-[10px] md:text-xs text-primary">
          <Clock className="w-3 h-3" />
          <span>{deliveryDaysLabel}</span>
        </div>

        {/* Features preview (first 2) */}
        {plan.features.length > 0 && (
          <div className="mb-2 space-y-1">
            {plan.features.slice(0, 2).map((feature, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px] md:text-xs">
                <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground line-clamp-1">{feature}</span>
              </div>
            ))}
            {plan.features.length > 2 && (
              <p className="text-[10px] md:text-xs text-muted-foreground italic">
                +{plan.features.length - 2} características más
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            data-select-button
            onClick={handleSelectButtonClick}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {isSelected ? "Seleccionado" : "Seleccionar"}
          </button>
          {showDetails && (
            <button
              type="button"
              data-details-button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="py-2 px-3 rounded-lg text-sm font-medium bg-background border border-border hover:bg-muted transition-colors flex items-center gap-1"
            >
              <span className="hidden sm:inline">{isExpanded ? 'Ver menos' : 'Ver más'}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && showDetails && (
            <motion.div
              data-expanded-content
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-3 pt-3 border-t border-border/50"
            >
              <div className="space-y-4">
                {/* Badge */}
                {plan.is_popular && (
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      ⭐ Más Popular
                    </span>
                  </div>
                )}
                {!plan.is_popular && planContext.badge && (
                  <div className="text-center">
                    <span className={`inline-block px-3 py-1 ${planContext.badge.color} text-xs font-semibold rounded-full`}>
                      {planContext.badge.text}
                    </span>
                  </div>
                )}

                {/* Description */}
                {plan.description && (
                  <p className="text-xs md:text-sm text-muted-foreground text-center">
                    {plan.description}
                  </p>
                )}

                {/* All Features */}
                {plan.features.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-xs md:text-sm mb-2">Incluye:</h5>
                    <ul className="space-y-1.5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-[10px] md:text-xs">
                          <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ideal For */}
                {planContext.idealFor.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      IDEAL PARA:
                    </p>
                    <ul className="space-y-1">
                      {planContext.idealFor.map((item, i) => (
                        <li key={i} className="text-[10px] md:text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

