"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Rocket, Check, MessageSquare, X, Package, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  getAllPlans,
  getAllAddons,
  formatPrice,
  getRushFeesForPlan,
  formatDeliveryDays,
  calculateCampaignDiscount,
} from "@/lib/pricing";
import { getActiveCampaign, type Campaign } from "@/lib/campaigns";
import type { Plan, Addon, RushFee } from "@/lib/supabase";
import {
  trackQuoteStarted,
  trackPlanSelected,
  trackAddonChange,
  trackTimelineSelected,
  trackStepChange,
  trackQuoteAbandoned,
  trackQuoteCompleted,
  trackQuoteEvent,
  trackFormFieldChange,
  savePartialQuote,
  clearPartialQuote,
  getSessionId,
  getUserFingerprint,
  getUserIP,
} from "@/lib/quote-tracking";
import {
  trackLeadConversion,
  trackQuoteStart,
  getStoredUTMParams,
  storeUTMParams,
  initializeTracking,
} from "@/lib/tracking-events";
import { QuoteProgress } from "./QuoteProgress";
import { PlanSelector } from "./PlanSelector";
import { AddOnGrid } from "./AddOnGrid";
import { TimelineSelector, type TimelineOption } from "./TimelineSelector";
import { QuoteSummary } from "./QuoteSummary";
import { ContactForm, type ContactData } from "./ContactForm";

const formSchema = z.object({
  selectedPlan: z.string().min(1, "Selecciona un plan"),
  selectedAddons: z.array(z.string()),
  timeline: z.string().min(1, "Selecciona una urgencia"),
  phone: z.string().min(10, "Ingresa un teléfono válido (mínimo 10 dígitos)"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface QuoteWizardProps {
  initialPlan?: string;
  initialAddons?: string[];
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

function buildWhatsAppURL(data: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  selectedPlan: Plan | null;
  selectedAddons: Addon[];
  campaign: Campaign | null;
  rushFee: RushFee | null;
  timeline: TimelineOption | null;
}) {
  const { name, email, phone, message, selectedPlan, selectedAddons, campaign, rushFee, timeline } = data;

  let deliveryText = '';
  if (rushFee) {
    const days = formatDeliveryDays(rushFee.delivery_days_min, rushFee.delivery_days_max);
    deliveryText = rushFee.display_name ? `${rushFee.display_name} (${days})` : days;
  } else if (timeline) {
    deliveryText = timeline.sublabel;
  }

  let whatsappMessage = `👋 Hola, soy ${name}\n\n`;
  whatsappMessage += `═══════════════════════\n`;
  whatsappMessage += `   📋 SOLICITUD DE PROYECTO\n`;
  whatsappMessage += `═══════════════════════\n\n`;

  if (selectedPlan) {
    whatsappMessage += `📦 *Plan:* ${selectedPlan.name}\n`;
  }
  whatsappMessage += `⏰ *Entrega:* ${deliveryText}\n`;
  if (rushFee) {
    whatsappMessage += ` ⚡ Prioridad Premium\n`;
  }
  whatsappMessage += `\n`;

  const discountPercent = campaign?.discount_percent || 0;
  const oneTimeAddons = selectedAddons.filter(
    (a) => !a.billing_type || a.billing_type.toLowerCase() === 'one-time' || a.billing_type.toLowerCase() === 'one_time'
  );
  const monthlyAddons = selectedAddons.filter(
    (a) => a.billing_type && a.billing_type.toLowerCase() === 'monthly'
  );

  // Calculate totals
  let initialSubtotal = selectedPlan ? selectedPlan.price : 0;
  oneTimeAddons.forEach((addon) => {
    initialSubtotal += addon.price;
  });

  let rushFeeAmount = 0;
  if (selectedPlan && rushFee && rushFee.markup_percent > 0) {
    rushFeeAmount = Math.round(selectedPlan.price * (rushFee.markup_percent / 100));
    if (rushFee.markup_fixed) {
      rushFeeAmount += rushFee.markup_fixed;
    }
    initialSubtotal += rushFeeAmount;
  }

  const initialDiscount = Math.round(initialSubtotal * (discountPercent / 100));
  const initialTotal = initialSubtotal - initialDiscount;

  let monthlySubtotal = 0;
  monthlyAddons.forEach((addon) => {
    monthlySubtotal += addon.price;
  });
  const monthlyDiscount = Math.round(monthlySubtotal * (discountPercent / 100));
  const monthlyTotal = monthlySubtotal - monthlyDiscount;

  // PAGO INICIAL
  if (selectedPlan || oneTimeAddons.length > 0) {
    whatsappMessage += `💰 *PAGO INICIAL:*\n`;
    if (selectedPlan) {
      whatsappMessage += `   • ${selectedPlan.name}: ${formatPrice(selectedPlan.price)} MXN\n`;
    }
    if (rushFee && rushFeeAmount > 0) {
      whatsappMessage += `   • ${rushFee.display_name || 'Urgencia'}: +${formatPrice(rushFeeAmount)} MXN\n`;
    }
    if (oneTimeAddons.length > 0) {
      oneTimeAddons.forEach((addon) => {
        whatsappMessage += `   • ${addon.name}: ${formatPrice(addon.price)} MXN\n`;
      });
    }
    if (discountPercent > 0 && initialSubtotal > 0) {
      whatsappMessage += `   ─────────────────\n`;
      whatsappMessage += `   Subtotal: ${formatPrice(initialSubtotal)} MXN\n`;
      whatsappMessage += `   🏷️ ${campaign?.name || 'Descuento'}: -${discountPercent}%\n`;
    }
    whatsappMessage += `   ─────────────────\n`;
    whatsappMessage += `   *TOTAL INICIAL: ${formatPrice(initialTotal)} MXN*\n\n`;
  }

  // PAGO MENSUAL
  if (monthlyAddons.length > 0) {
    whatsappMessage += `🔄 *PAGO MENSUAL:*\n`;
    monthlyAddons.forEach((addon) => {
      const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
      whatsappMessage += `   • ${addon.name}: ${formatPrice(addonPricing.discounted)}/mes`;
      if (addonPricing.discountPercent > 0) {
        whatsappMessage += ` (antes ${formatPrice(addonPricing.original)})`;
      }
      whatsappMessage += `\n`;
    });
    if (discountPercent > 0 && monthlySubtotal > 0) {
      whatsappMessage += `   🏷️ Descuento ${campaign?.name || 'Promoción'}: -${discountPercent}%\n`;
    }
    whatsappMessage += `   ─────────────────\n`;
    whatsappMessage += `   *TOTAL MENSUAL: ${formatPrice(monthlyTotal)}/mes*\n\n`;
  }

  whatsappMessage += `📧 *Contacto:*\n`;
  whatsappMessage += `   Email: ${email}\n`;
  if (phone) {
    whatsappMessage += `   Tel: ${phone}\n`;
  }

  if (message) {
    whatsappMessage += `\n📝 *Notas adicionales:*\n${message}\n`;
  }

  whatsappMessage += `\n🌐 Vengo de SitioExpress.mx`;

  return `https://wa.me/528116364522?text=${encodeURIComponent(whatsappMessage)}`;
}

export function QuoteWizard({ initialPlan, initialAddons }: QuoteWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [rushFees, setRushFees] = useState<RushFee[]>([]);
  const [selectedRushFee, setSelectedRushFee] = useState<RushFee | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [addonsExpanded, setAddonsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedPlan: initialPlan || "",
      selectedAddons: initialAddons || [],
      timeline: "",
      phone: "",
      name: "",
      email: "",
      message: "",
    },
  });

  useEffect(() => {
    async function loadPricingData() {
      setIsLoadingPrices(true);
      try {
        const [plansData, addonsData, campaignData] = await Promise.all([
          getAllPlans(),
          getAllAddons(),
          getActiveCampaign(),
        ]);
        setPlans(plansData);
        setAddons(addonsData);
        setCampaign(campaignData);

        if (initialPlan) {
          setValue("selectedPlan", initialPlan);
        }

        // Store UTM params for attribution
        storeUTMParams();

        // Track quote started (internal tracking)
        await trackQuoteStarted();
        
        // Track quote start for Google/Facebook Ads
        trackQuoteStart(initialPlan || undefined, undefined);
        
        // Check tracking health in development
        if (process.env.NODE_ENV === 'development') {
          const { checkTrackingHealth } = await import('@/lib/quote-tracking');
          const health = await checkTrackingHealth();
          if (!health.healthy) {
            console.warn('⚠️ Tracking Health Check:', health.message);
            if (health.failedEventsCount > 0) {
              console.log(`📦 ${health.failedEventsCount} eventos guardados en localStorage esperando reintento`);
            }
          }
        }
      } catch (error) {
        console.error("Error loading pricing data:", error);
      } finally {
        setIsLoadingPrices(false);
      }
    }
    loadPricingData();
  }, [initialPlan, setValue]);

  // Track abandonment on page unload or visibility change
  useEffect(() => {
    const handleBeforeUnload = () => {
      const planId = watch("selectedPlan");
      const addonIds = watch("selectedAddons") || [];
      const timelineId = watch("timeline");
      const name = watch("name");
      const email = watch("email");

      // Only track if user has made some progress
      if (planId || addonIds.length > 0 || timelineId || email || name) {
        // Use synchronous tracking for beforeunload (more reliable)
        trackQuoteAbandoned(
          step,
          planId || undefined,
          addonIds.length > 0 ? addonIds : undefined,
          timelineId || undefined,
          email || undefined,
          undefined,
          name || undefined
        ).catch(() => {
          // Silently fail - event is saved to localStorage fallback
        });
      }
    };

    // Track when page becomes hidden (tab switch, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const planId = watch("selectedPlan");
        const addonIds = watch("selectedAddons") || [];
        const timelineId = watch("timeline");
        const email = watch("email");
        const name = watch("name");

        if (planId || addonIds.length > 0 || timelineId || email || name) {
          // Track as potential abandonment (but don't mark as final abandonment)
          trackQuoteEvent({
            event_type: 'step_changed',
            session_id: '',
            user_fingerprint: '',
            step,
            plan_id: planId || undefined,
            addon_ids: addonIds.length > 0 ? addonIds : undefined,
            timeline_id: timelineId || undefined,
            email: email || undefined,
            name: name || undefined,
            metadata: {
              page_hidden: true,
              visibility_change: true,
            },
          }, false).catch(() => {
            // Silently fail
          });
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [step, watch]);

  const selectedPlanId = watch("selectedPlan");
  const selectedAddonIds = watch("selectedAddons") || [];
  const timeline = watch("timeline");
  const selectedPlanObj = plans.find((p) => p.id === selectedPlanId) || null;
  const selectedAddonObjs = addons.filter((a) => selectedAddonIds.includes(a.id));

  // Expand addons when plan is selected or when initial plan is provided
  useEffect(() => {
    if ((selectedPlanId || initialPlan) && !addonsExpanded) {
      setAddonsExpanded(true);
    }
  }, [selectedPlanId, initialPlan, addonsExpanded]);

  const buildDynamicTimelines = useCallback(() => {
    if (!selectedPlanObj) {
      const defaultRange = getPlanStandardDays(undefined);
      return [
        {
          id: "flexible",
          label: "🌿 Flexible",
          sublabel: `${defaultRange.min}-${defaultRange.max} días hábiles`,
          displayName: "Estándar",
          markupPercent: 0,
          hasMarkup: false,
          rushFeeAmount: 0,
          rushFee: null,
          deliveryDaysMin: defaultRange.min,
          deliveryDaysMax: defaultRange.max,
        },
      ];
    }

    const deliveryRange = getPlanStandardDays(selectedPlanObj.slug);
    const timelineOptions: TimelineOption[] = [];

    const sortedRushFees = [...rushFees].sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      const aDays = a.delivery_days_min || a.delivery_days_max || 999;
      const bDays = b.delivery_days_min || b.delivery_days_max || 999;
      return aDays - bDays;
    });

    const flexibleRushFee = sortedRushFees.find(
      (rf) => rf.timeline_id === 'flexible' && rf.markup_percent === 0
    );

    sortedRushFees.forEach((rushFee) => {
      if (rushFee.markup_percent === 0 && !rushFee.markup_fixed) {
        return;
      }

      let rushAmount = 0;
      if (rushFee.markup_percent > 0) {
        rushAmount = Math.round(selectedPlanObj.price * (rushFee.markup_percent / 100));
      }
      if (rushFee.markup_fixed) {
        rushAmount += rushFee.markup_fixed;
      }

      let deliveryDaysMin: number = rushFee.delivery_days_min || 0;
      let deliveryDaysMax: number = rushFee.delivery_days_max || 0;

      if (!deliveryDaysMin && !deliveryDaysMax) {
        const fallbackDays = Math.max(
          2,
          Math.floor(deliveryRange.max * (rushFee.timeline_id === 'urgent' ? 0.5 : 0.75))
        );
        deliveryDaysMin = fallbackDays;
        deliveryDaysMax = fallbackDays;
      } else if (!deliveryDaysMin && deliveryDaysMax) {
        deliveryDaysMin = deliveryDaysMax;
      } else if (deliveryDaysMin && !deliveryDaysMax) {
        deliveryDaysMax = deliveryDaysMin;
      }

      if (deliveryDaysMax >= deliveryRange.max && rushFee.markup_percent > 0) {
        deliveryDaysMax = Math.max(deliveryDaysMin, deliveryRange.max - 1);
        if (deliveryDaysMin > deliveryDaysMax) {
          deliveryDaysMin = Math.max(1, deliveryDaysMax);
        }
      }

      const daysLabel =
        deliveryDaysMin === deliveryDaysMax
          ? `${deliveryDaysMin} días hábiles`
          : `${deliveryDaysMin}-${deliveryDaysMax} días hábiles`;

      let label = '';
      if (rushFee.timeline_id === 'urgent') {
        label = '🔥 Express';
      } else if (rushFee.timeline_id === 'week') {
        label = '⚡ Rápido';
      } else {
        label = rushFee.display_name || 'Express';
      }

      timelineOptions.push({
        id: rushFee.timeline_id,
        label: label,
        sublabel: daysLabel,
        displayName: rushFee.display_name || 'Express Premium',
        markupPercent: rushFee.markup_percent,
        hasMarkup: true,
        rushFeeAmount: rushAmount,
        rushFee: rushFee,
        deliveryDaysMin: deliveryDaysMin,
        deliveryDaysMax: deliveryDaysMax,
      });
    });

    let standardDaysMin: number;
    let standardDaysMax: number;

    if (flexibleRushFee && flexibleRushFee.delivery_days_min && flexibleRushFee.delivery_days_max) {
      standardDaysMin = flexibleRushFee.delivery_days_min;
      standardDaysMax = flexibleRushFee.delivery_days_max;
    } else {
      const fastestRushFee = sortedRushFees
        .filter((rf) => rf.markup_percent > 0)
        .sort((a, b) => {
          const aMax = a.delivery_days_max || a.delivery_days_min || 999;
          const bMax = b.delivery_days_max || b.delivery_days_min || 999;
          return aMax - bMax;
        })[0];

      if (fastestRushFee && fastestRushFee.delivery_days_max) {
        standardDaysMin = Math.max(
          fastestRushFee.delivery_days_max + 1,
          Math.floor(deliveryRange.max * 0.6)
        );
        standardDaysMax = deliveryRange.max;
      } else {
        standardDaysMin = deliveryRange.min;
        standardDaysMax = deliveryRange.max;
      }
    }

    const standardDaysLabel =
      standardDaysMin === standardDaysMax
        ? `${standardDaysMin} días hábiles`
        : `${standardDaysMin}-${standardDaysMax} días hábiles`;

    timelineOptions.push({
      id: 'flexible',
      label: '📅 Estándar',
      sublabel: standardDaysLabel,
      displayName: 'Estándar',
      markupPercent: 0,
      hasMarkup: false,
      rushFeeAmount: 0,
      rushFee: flexibleRushFee || null,
      deliveryDaysMin: standardDaysMin,
      deliveryDaysMax: standardDaysMax,
    });

    return timelineOptions;
  }, [selectedPlanObj, rushFees]);

  const timelines = buildDynamicTimelines();

  useEffect(() => {
    async function loadRushFees() {
      if (selectedPlanObj?.slug) {
        const fees = await getRushFeesForPlan(selectedPlanObj.slug);
        setRushFees(fees);
      }
    }
    loadRushFees();
  }, [selectedPlanObj?.slug]);

  useEffect(() => {
    if (timeline && selectedPlanObj) {
      const timelineOption = timelines.find((t) => t.id === timeline);
      if (timelineOption?.rushFee) {
        setSelectedRushFee(timelineOption.rushFee);
      } else {
        setSelectedRushFee(null);
      }
    }
  }, [timeline, selectedPlanObj, timelines]);

  const TOTAL_STEPS = 4;

  const handleNext = async () => {
    if (step === 1 && !selectedPlanId) return;
    const phoneValue = getValues("phone");
    if (step === 2 && (!timeline || !phoneValue || phoneValue.length < 10)) {
      if (!phoneValue || phoneValue.length < 10) {
        toast.error("Por favor ingresa tu teléfono para continuar");
      }
      return;
    }
    // Step 3 (Add-ons) has no required validation - can proceed without selecting any
    
    const nextStep = Math.min(step + 1, TOTAL_STEPS);
    
    // Track time spent in current step
    if (typeof window !== 'undefined') {
      const stepTimesStr = localStorage.getItem('quote_step_times');
      const stepTimes = stepTimesStr ? JSON.parse(stepTimesStr) : {};
      stepTimes[nextStep] = Date.now();
      localStorage.setItem('quote_step_times', JSON.stringify(stepTimes));
    }
    
    // Track step change
    await trackStepChange(
      step,
      nextStep,
      selectedPlanId || undefined,
      selectedAddonIds.length > 0 ? selectedAddonIds : undefined,
      timeline || undefined
    );
    
    // Save partial quote
    savePartialQuote({
      planId: selectedPlanId || undefined,
      addonIds: selectedAddonIds.length > 0 ? selectedAddonIds : undefined,
      timelineId: timeline || undefined,
      step: nextStep,
    });
    
    setStep(nextStep);
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleAddon = async (addonId: string) => {
    const current = selectedAddonIds;
    const isSelected = current.includes(addonId);
    
    if (isSelected) {
      setValue("selectedAddons", current.filter((id) => id !== addonId));
    } else {
      setValue("selectedAddons", [...current, addonId]);
    }
    
    // Track addon change
    await trackAddonChange(addonId, !isSelected, step);
    
    // Save partial quote
    savePartialQuote({
      planId: selectedPlanId || undefined,
      addonIds: isSelected 
        ? current.filter((id) => id !== addonId)
        : [...current, addonId],
      timelineId: timeline || undefined,
      step,
    });
  };

  const selectedTimelineOption = timelines.find((t) => t.id === timeline) || null;

  const onSubmit = async (contactData: ContactData) => {
    setIsSubmitting(true);

    try {
      const addonsStr = selectedAddonObjs.map((a) => a.name).join(", ");
      const deliveryInfo = selectedRushFee
        ? `${selectedRushFee.display_name}: ${formatDeliveryDays(
            selectedRushFee.delivery_days_min,
            selectedRushFee.delivery_days_max
          )}`
        : timeline;

      const fullMessage = contactData.message
        ? `${contactData.message}\n\nEntrega: ${deliveryInfo}\nAdd-ons: ${addonsStr || 'Ninguno'}`
        : `Entrega: ${deliveryInfo}\nAdd-ons: ${addonsStr || 'Ninguno'}`;

      // Get phone from form (captured in Step 2)
      const phoneValue = getValues("phone");

      // Calculate time per step
      let timePerStep: Record<number, number> = {};
      if (typeof window !== 'undefined') {
        const stepTimesStr = localStorage.getItem('quote_step_times');
        if (stepTimesStr) {
          try {
            const stepTimes = JSON.parse(stepTimesStr);
            const stepKeys = Object.keys(stepTimes).map(Number).sort((a, b) => a - b);
            for (let i = 0; i < stepKeys.length - 1; i++) {
              const currentStep = stepKeys[i];
              const nextStep = stepKeys[i + 1];
              timePerStep[currentStep] = Math.floor((stepTimes[nextStep] - stepTimes[currentStep]) / 1000);
            }
            // Time in final step (current step)
            const sessionStartTime = localStorage.getItem('quote_session_start_time');
            if (sessionStartTime) {
              const startTime = parseInt(sessionStartTime, 10);
              const lastStepTime = stepTimes[stepKeys[stepKeys.length - 1]] || startTime;
              timePerStep[step] = Math.floor((Date.now() - lastStepTime) / 1000);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }

      // Build WhatsApp URL first to include in tracking
      const url = buildWhatsAppURL({
        name: contactData.name,
        email: contactData.email,
        phone: phoneValue || undefined,
        message: contactData.message,
        selectedPlan: selectedPlanObj,
        selectedAddons: selectedAddonObjs,
        campaign,
        rushFee: selectedRushFee,
        timeline: selectedTimelineOption,
      });

      // Track quote completed with enhanced metadata
      await trackQuoteCompleted(
        selectedPlanId,
        selectedAddonIds,
        timeline,
        contactData.email,
        phoneValue || undefined,
        contactData.name,
        {
          campaignId: campaign?.id || null,
          campaignDiscount: campaign?.discount_percent || 0,
          rushFeeId: selectedRushFee?.id || null,
          rushFeeDisplayName: selectedRushFee?.display_name || null,
          whatsappUrl: url,
          timePerStep,
          addonNames: selectedAddonObjs.map(a => a.name),
          planName: selectedPlanObj?.name,
          planSlug: selectedPlanObj?.slug,
          timelineDisplayName: selectedTimelineOption?.displayName,
          messageLength: contactData.message?.length || 0,
        }
      );

      // Track lead conversion for Google/Facebook Ads
      const totalPrice = selectedPlanObj?.price || 0;
      trackLeadConversion({
        planId: selectedPlanId || undefined,
        planName: selectedPlanObj?.name,
        planPrice: totalPrice,
        email: contactData.email,
        phone: phoneValue || undefined,
        addons: selectedAddonObjs.map(a => a.name),
        totalValue: totalPrice,
      });

      const sessionId = getSessionId();
      const fingerprint = getUserFingerprint();
      const ipAddress = await getUserIP();

      // Calculate total time
      let totalTimeSeconds: number | undefined = undefined;
      if (typeof window !== 'undefined') {
        const sessionStartTime = localStorage.getItem('quote_session_start_time');
        if (sessionStartTime) {
          const startTime = parseInt(sessionStartTime, 10);
          totalTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
        }
      }

      // Get UTM params for attribution
      const utmParams = getStoredUTMParams();
      const utmString = Object.keys(utmParams).length > 0 
        ? `UTM: ${JSON.stringify(utmParams)}`
        : 'UTM: none';

      // Build enhanced message with metadata
      const enhancedMessage = `[METADATA]
Campaign: ${campaign?.id || 'none'} (${campaign?.discount_percent || 0}% descuento)
Rush Fee: ${selectedRushFee?.id || 'none'} (${selectedRushFee?.display_name || 'N/A'})
Total Time: ${totalTimeSeconds || 'N/A'} segundos
Time per Step: ${JSON.stringify(timePerStep)}
${utmString}
WhatsApp URL: ${url}
---
${fullMessage}`;

      // Check if lead already exists for this session to avoid duplicates
      const { data: existingLead } = await supabase
        .from("web_dev_leads")
        .select('id')
        .eq('session_id', sessionId)
        .eq('source', 'cotizador_express')
        .maybeSingle();

      if (existingLead) {
        // Update existing lead instead of creating a new one
        const { error } = await supabase
          .from("web_dev_leads")
          .update({
            name: contactData.name,
            email: contactData.email,
            phone: phoneValue || null,
            project_type: "cotizador",
            budget: selectedPlanObj?.name || "custom",
            timeline: deliveryInfo,
            message: enhancedMessage,
            plan_selected: selectedPlanObj?.slug || null,
            user_fingerprint: fingerprint,
            ip_address: ipAddress,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            last_step_reached: 4,
          })
          .eq('id', existingLead.id);

        if (error) throw error;
      } else {
        // Only insert if no existing lead found
        const { error } = await supabase.from("web_dev_leads").insert({
          name: contactData.name,
          email: contactData.email,
          phone: phoneValue || null,
          project_type: "cotizador",
          budget: selectedPlanObj?.name || "custom",
          timeline: deliveryInfo,
          message: enhancedMessage,
          source: "cotizador_express",
          plan_selected: selectedPlanObj?.slug || null,
          session_id: sessionId,
          user_fingerprint: fingerprint,
          ip_address: ipAddress,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          last_step_reached: 4,
        });

        if (error) throw error;
      }

      // Clear partial quote after successful submission
      clearPartialQuote();
      
      // Clear tracking times
      if (typeof window !== 'undefined') {
        localStorage.removeItem('quote_session_start_time');
        localStorage.removeItem('quote_step_times');
        
        // Store WhatsApp URL and plan name in sessionStorage for /gracias page
        sessionStorage.setItem('pending_whatsapp_redirect', url);
        sessionStorage.setItem('pending_plan_name', selectedPlanObj?.name || '');
      }

      // Show quick toast then redirect to /gracias
      toast.success("¡Solicitud enviada!", {
        description: "Redirigiendo...",
        duration: 1500,
      });

      // Small delay then redirect to /gracias page
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Redirect to /gracias - this triggers Google Ads conversion tracking
      router.push(`/gracias?plan=${encodeURIComponent(selectedPlanObj?.name || '')}`);

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error al enviar", {
        description: "Por favor intenta de nuevo o contáctanos directamente por WhatsApp",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <QuoteProgress currentStep={step} totalSteps={TOTAL_STEPS} />

      <div>
        <AnimatePresence mode="wait">
          {/* STEP 1: Plan Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-1.5 md:mb-2">Elige tu plan</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Selecciona el plan que mejor se adapte a tus necesidades
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-5 bg-muted/50 rounded-lg p-2 md:p-3 border border-border">
                💡 <strong>Sin compromiso:</strong> Puedes ajustar cualquier detalle después. Esta es solo una estimación inicial.
              </p>

              {isLoadingPrices ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <>
                  <PlanSelector
                    plans={plans}
                    selectedPlanId={selectedPlanId}
                    onSelect={async (planId) => {
                      setValue("selectedPlan", planId);
                      await trackPlanSelected(planId, step);
                      savePartialQuote({
                        planId,
                        addonIds: selectedAddonIds.length > 0 ? selectedAddonIds : undefined,
                        timelineId: timeline || undefined,
                        step,
                      });
                    }}
                    campaign={campaign}
                  />

                  <input type="hidden" {...register("selectedPlan")} />

                  <QuoteSummary
                    plan={selectedPlanObj}
                    addons={[]}
                    timeline={null}
                    campaign={campaign}
                    rushFee={null}
                    step={step}
                  />
                </>
              )}

              {errors.selectedPlan && (
                <p className="text-sm text-destructive mt-4">{errors.selectedPlan.message}</p>
              )}

              <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedPlanId}
                  className="flex-1 rounded-full"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Timeline */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-1.5 md:mb-2">¿Cuándo necesitas tu proyecto?</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Opciones de entrega express disponibles
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-5 bg-muted/50 rounded-lg p-2 md:p-3 border border-border">
                ⏰ Puedes cambiar la urgencia cuando te contactemos. Los tiempos son estimados según la complejidad del proyecto.
              </p>

              <TimelineSelector
                timelines={timelines}
                selectedTimelineId={timeline}
                onSelect={async (timelineId) => {
                  setValue("timeline", timelineId);
                  const option = timelines.find((t) => t.id === timelineId);
                  if (option?.rushFee) {
                    setSelectedRushFee(option.rushFee);
                  } else {
                    setSelectedRushFee(null);
                  }
                  await trackTimelineSelected(timelineId, step);
                  savePartialQuote({
                    planId: selectedPlanId || undefined,
                    addonIds: selectedAddonIds.length > 0 ? selectedAddonIds : undefined,
                    timelineId,
                    step,
                  });
                }}
                plan={selectedPlanObj}
              />

              <input type="hidden" {...register("timeline")} />

              {/* Phone Capture - Required */}
              <div className="mt-4 md:mt-5 p-3 md:p-4 bg-primary/5 rounded-xl border border-primary/20">
                <label htmlFor="phone-early" className="block text-sm font-medium mb-2">
                  📱 Teléfono de contacto <span className="text-destructive">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Necesario para atenderte lo antes posible por WhatsApp
                </p>
                <input
                  id="phone-early"
                  type="tel"
                  {...register("phone")}
                  placeholder="Ej: 55 1234 5678"
                  className={`w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-base ${
                    errors.phone ? 'border-destructive' : 'border-border'
                  }`}
                  onChange={async (e) => {
                    const phoneValue = e.target.value;
                    if (phoneValue && phoneValue.length >= 10) {
                      await trackFormFieldChange(
                        'phone',
                        phoneValue,
                        step,
                        selectedPlanId || undefined,
                        selectedAddonIds,
                        timeline || undefined
                      );
                      savePartialQuote({
                        planId: selectedPlanId || undefined,
                        addonIds: selectedAddonIds.length > 0 ? selectedAddonIds : undefined,
                        timelineId: timeline || undefined,
                        phone: phoneValue,
                        step,
                      });
                    }
                  }}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <QuoteSummary
                plan={selectedPlanObj}
                addons={selectedAddonObjs}
                timeline={selectedTimelineOption}
                campaign={campaign}
                rushFee={selectedRushFee}
                step={step}
              />

              {errors.timeline && (
                <p className="text-sm text-destructive mt-4">{errors.timeline.message}</p>
              )}

              <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!timeline}
                  className="flex-1 rounded-full"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Add-ons */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-1.5 md:mb-2">Personaliza tu paquete</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Agrega funcionalidades extras a tu proyecto
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-5 bg-muted/50 rounded-lg p-2 md:p-3 border border-border">
                ✨ <strong>Opcional:</strong> Puedes continuar sin agregar extras o seleccionar los que necesites.
              </p>

              <AddOnGrid
                addons={addons}
                selectedAddonIds={selectedAddonIds}
                onToggle={toggleAddon}
                campaign={campaign}
                isExpanded={true}
                onExpandChange={() => {}}
              />

              <QuoteSummary
                plan={selectedPlanObj}
                addons={selectedAddonObjs}
                timeline={selectedTimelineOption}
                campaign={campaign}
                rushFee={selectedRushFee}
                step={step}
              />

              <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 rounded-full"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Contact */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-1.5 md:mb-2">Completa tus datos</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-5">
                Completa tu solicitud y te contactaremos por WhatsApp en menos de 2 horas para discutir los detalles de tu proyecto
              </p>

              <QuoteSummary
                plan={selectedPlanObj}
                addons={selectedAddonObjs}
                timeline={selectedTimelineOption}
                campaign={campaign}
                rushFee={selectedRushFee}
                step={step}
              />

              <div className="mt-4 md:mt-6">
                <ContactForm
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  plan={selectedPlanObj}
                  addons={selectedAddonObjs}
                  timeline={selectedTimelineOption}
                  campaign={campaign}
                  rushFee={selectedRushFee}
                />
              </div>

              <div className="flex gap-3 md:gap-4 mt-4 md:mt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

