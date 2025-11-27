'use client';

import { supabase, type Plan, type Addon, type Campaign, type RushFee, TIMELINE_OPTIONS } from './supabase';
import { getActiveCampaign } from './campaigns';

// Cache for rush fees to avoid repeated API calls
let rushFeesCache: RushFee[] | null = null;
let rushFeesCacheTimestamp: number = 0;
const RUSH_FEES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Formatea un precio como moneda mexicana
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formatea un rango de precios
 */
export function formatPriceRange(min: number, max: number | null): string {
  if (!max || min === max) {
    return formatPrice(min);
  }
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

/**
 * Calcula el precio con descuento de campaña aplicado
 */
export function calculateCampaignDiscount(
  basePrice: number,
  discountPercent: number
): { original: number; discounted: number; savings: number; discountPercent: number } {
  if (!discountPercent || discountPercent <= 0) {
    return { 
      original: basePrice, 
      discounted: basePrice, 
      savings: 0,
      discountPercent: 0,
    };
  }
  
  const savings = basePrice * (discountPercent / 100);
  const discounted = basePrice - savings;
  
  return {
    original: basePrice,
    discounted: Math.round(discounted),
    savings: Math.round(savings),
    discountPercent,
  };
}

/**
 * Obtiene todos los planes activos
 */
export async function getAllPlans(includeInactive: boolean = false): Promise<Plan[]> {
  let query = supabase
    .from('web_dev_plans')
    .select('*');
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    return [];
  }

  // Parsear features JSONB
  return (data || []).map(plan => ({
    ...plan,
    features: Array.isArray(plan.features) ? plan.features : [],
  })) as Plan[];
}

/**
 * Obtiene todos los add-ons activos
 */
export async function getAllAddons(includeInactive: boolean = false): Promise<Addon[]> {
  let query = supabase
    .from('web_dev_addons')
    .select('*');
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching addons:', error);
    return [];
  }

  return (data || []) as Addon[];
}

/**
 * Obtiene un plan por slug
 */
export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const { data, error } = await supabase
    .from('web_dev_plans')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    features: Array.isArray(data.features) ? data.features : [],
  } as Plan;
}

/**
 * Obtiene un addon por slug
 */
export async function getAddonBySlug(slug: string): Promise<Addon | null> {
  const { data, error } = await supabase
    .from('web_dev_addons')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as Addon;
}

/**
 * Obtiene un plan con precio calculado según la campaña activa
 */
export async function getPlanWithCampaignPricing(slug: string): Promise<{
  plan: Plan;
  pricing: ReturnType<typeof calculateCampaignDiscount>;
  campaign: Campaign | null;
} | null> {
  const plan = await getPlanBySlug(slug);
  if (!plan) return null;

  const campaign = await getActiveCampaign();
  const pricing = calculateCampaignDiscount(
    plan.price, 
    campaign?.discount_percent || 0
  );

  return { plan, pricing, campaign };
}

/**
 * Obtiene todos los planes con precios de campaña aplicados
 */
export async function getAllPlansWithCampaignPricing(): Promise<{
  plans: Array<Plan & { pricing: ReturnType<typeof calculateCampaignDiscount> }>;
  campaign: Campaign | null;
}> {
  const [plans, campaign] = await Promise.all([
    getAllPlans(),
    getActiveCampaign()
  ]);

  const plansWithPricing = plans.map(plan => ({
    ...plan,
    pricing: calculateCampaignDiscount(
      plan.price, 
      campaign?.discount_percent || 0
    ),
  }));

  return { plans: plansWithPricing, campaign };
}

/**
 * Obtiene un addon con precio calculado según la campaña activa
 */
export async function getAddonWithCampaignPricing(slug: string): Promise<{
  addon: Addon;
  pricing: ReturnType<typeof calculateCampaignDiscount>;
  campaign: Campaign | null;
} | null> {
  const addon = await getAddonBySlug(slug);
  if (!addon) return null;

  const campaign = await getActiveCampaign();
  const pricing = calculateCampaignDiscount(
    addon.price, 
    campaign?.discount_percent || 0
  );

  return { addon, pricing, campaign };
}

/**
 * Obtiene todos los addons con precios de campaña aplicados
 */
export async function getAllAddonsWithCampaignPricing(): Promise<{
  addons: Array<Addon & { pricing: ReturnType<typeof calculateCampaignDiscount> }>;
  campaign: Campaign | null;
}> {
  const [addons, campaign] = await Promise.all([
    getAllAddons(),
    getActiveCampaign()
  ]);

  const addonsWithPricing = addons.map(addon => ({
    ...addon,
    pricing: calculateCampaignDiscount(
      addon.price, 
      campaign?.discount_percent || 0
    ),
  }));

  return { addons: addonsWithPricing, campaign };
}

// ============ RUSH FEES FUNCTIONS ============

/**
 * Obtiene todos los rush fees activos
 */
export async function getAllRushFees(forceRefresh: boolean = false): Promise<RushFee[]> {
  const now = Date.now();
  
  // Return cached data if valid
  if (!forceRefresh && rushFeesCache && (now - rushFeesCacheTimestamp < RUSH_FEES_CACHE_TTL)) {
    return rushFeesCache;
  }
  
  const { data, error } = await supabase
    .from('web_dev_rush_fees')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching rush fees:', error);
    return rushFeesCache || [];
  }

  rushFeesCache = (data || []) as RushFee[];
  rushFeesCacheTimestamp = now;
  return rushFeesCache;
}

/**
 * Obtiene un rush fee específico por plan_slug y timeline_id
 */
export async function getRushFee(planSlug: string, timelineId: string): Promise<RushFee | null> {
  const allRushFees = await getAllRushFees();
  
  // First try to find exact match for this plan
  let rushFee = allRushFees.find(
    rf => rf.plan_slug === planSlug && rf.timeline_id === timelineId
  );
  
  // If no exact match, try 'all' plan_slug as fallback
  if (!rushFee) {
    rushFee = allRushFees.find(
      rf => rf.plan_slug === 'all' && rf.timeline_id === timelineId
    );
  }
  
  return rushFee || null;
}

/**
 * Obtiene todos los rush fees para un plan específico
 */
export async function getRushFeesForPlan(planSlug: string): Promise<RushFee[]> {
  const allRushFees = await getAllRushFees();
  
  // Get rush fees for this specific plan
  let planSpecificFees = allRushFees.filter(rf => rf.plan_slug === planSlug);
  
  // If no plan-specific fees, get 'all' fees
  if (planSpecificFees.length === 0) {
    planSpecificFees = allRushFees.filter(rf => rf.plan_slug === 'all');
  }
  
  // Sort by display_order (ascending) - fastest first
  return planSpecificFees.sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }
    // Fallback: sort by days (min first)
    const aDays = a.delivery_days_min || a.delivery_days_max || 999;
    const bDays = b.delivery_days_min || b.delivery_days_max || 999;
    return aDays - bDays;
  });
}

/**
 * Calcula el markup por urgencia
 */
export function calculateRushMarkup(
  basePrice: number,
  rushFee: RushFee | null
): {
  original: number;
  withRush: number;
  rushAmount: number;
  markupPercent: number;
  displayName: string | null;
  description: string | null;
  deliveryDaysMin: number | null;
  deliveryDaysMax: number | null;
  hasRushFee: boolean;
} {
  if (!rushFee || (rushFee.markup_percent === 0 && !rushFee.markup_fixed)) {
    return {
      original: basePrice,
      withRush: basePrice,
      rushAmount: 0,
      markupPercent: 0,
      displayName: rushFee?.display_name || null,
      description: rushFee?.description || null,
      deliveryDaysMin: rushFee?.delivery_days_min || null,
      deliveryDaysMax: rushFee?.delivery_days_max || null,
      hasRushFee: false,
    };
  }

  let rushAmount = 0;
  
  // Apply percentage markup
  if (rushFee.markup_percent > 0) {
    rushAmount += Math.round(basePrice * (rushFee.markup_percent / 100));
  }
  
  // Apply fixed markup if exists
  if (rushFee.markup_fixed) {
    rushAmount += rushFee.markup_fixed;
  }
  
  return {
    original: basePrice,
    withRush: basePrice + rushAmount,
    rushAmount,
    markupPercent: rushFee.markup_percent,
    displayName: rushFee.display_name,
    description: rushFee.description,
    deliveryDaysMin: rushFee.delivery_days_min,
    deliveryDaysMax: rushFee.delivery_days_max,
    hasRushFee: rushFee.markup_percent > 0 || !!rushFee.markup_fixed,
  };
}

/**
 * Calcula el precio final con rush fee y descuento de campaña
 * Orden: Precio base → +Rush fee → -Descuento campaña
 */
export function calculateFinalPriceWithRush(
  basePrice: number,
  rushFee: RushFee | null,
  discountPercent: number
): {
  basePrice: number;
  priceWithRush: number;
  rushAmount: number;
  rushPercent: number;
  finalPrice: number;
  campaignDiscount: number;
  totalSavings: number;
  displayName: string | null;
  deliveryDaysMin: number | null;
  deliveryDaysMax: number | null;
  hasRushFee: boolean;
} {
  // Step 1: Calculate rush markup
  const rushResult = calculateRushMarkup(basePrice, rushFee);
  const priceWithRush = rushResult.withRush;
  
  // Step 2: Apply campaign discount on price with rush
  const campaignResult = calculateCampaignDiscount(priceWithRush, discountPercent);
  
  return {
    basePrice,
    priceWithRush,
    rushAmount: rushResult.rushAmount,
    rushPercent: rushResult.markupPercent,
    finalPrice: campaignResult.discounted,
    campaignDiscount: campaignResult.savings,
    totalSavings: campaignResult.savings, // Total savings from campaign (rush is value-add, not savings)
    displayName: rushResult.displayName,
    deliveryDaysMin: rushResult.deliveryDaysMin,
    deliveryDaysMax: rushResult.deliveryDaysMax,
    hasRushFee: rushResult.hasRushFee,
  };
}

/**
 * Obtiene la etiqueta de timeline por su ID
 */
export function getTimelineLabel(timelineId: string): string {
  const option = TIMELINE_OPTIONS.find(t => t.id === timelineId);
  return option?.label || timelineId;
}

/**
 * Obtiene el icono de timeline por su ID
 */
export function getTimelineIcon(timelineId: string): string {
  const option = TIMELINE_OPTIONS.find(t => t.id === timelineId);
  return option?.icon || '📅';
}

/**
 * Formatea el rango de días de entrega
 */
export function formatDeliveryDays(min: number | null, max: number | null): string {
  if (!min && !max) return '';
  if (min && max && min !== max) {
    return `${min}-${max} días`;
  }
  return `${min || max} días`;
}

// Legacy exports for backward compatibility
export { calculateCampaignDiscount as calculateDiscountedPrice };
export async function getPlanWithPricing(slug: string) {
  const result = await getPlanWithCampaignPricing(slug);
  if (!result) return null;
  return { 
    plan: result.plan, 
    pricing: result.pricing, 
    promotion: result.campaign 
  };
}
export async function getAddonWithPricing(slug: string) {
  const result = await getAddonWithCampaignPricing(slug);
  if (!result) return null;
  return { 
    addon: result.addon, 
    pricing: result.pricing, 
    promotion: result.campaign 
  };
}
