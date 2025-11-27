'use client';

import { supabase, type Promotion, type PromoEvent, type PromoOverride } from './supabase';

// Cache para evitar múltiples llamadas
const promoCache: Map<string, { data: Promotion | null; timestamp: number }> = new Map();
const CACHE_DURATION: Record<string, number> = {
  sticky_banner: 2 * 60 * 60 * 1000, // 2 horas
  hero_badge: 24 * 60 * 60 * 1000, // 24 horas
  pricing_urgency: 60 * 60 * 1000, // 1 hora
  pricing_slots: 7 * 24 * 60 * 60 * 1000, // 1 semana
  form_urgency: 4 * 60 * 60 * 1000, // 4 horas
  form_bonus: 24 * 60 * 60 * 1000, // 24 horas
  social_toast: 30 * 1000, // 30 segundos (rotación local)
};

/**
 * Verifica si hay un override activo para una ubicación
 */
async function checkOverride(location: string): Promise<PromoOverride | null> {
  const { data, error } = await supabase
    .from('web_dev_promo_overrides')
    .select('*')
    .eq('location', location)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Obtiene eventos activos en la fecha actual
 */
async function getActiveEvents(date: Date = new Date()): Promise<PromoEvent[]> {
  const dateStr = date.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('web_dev_promo_events')
    .select('*')
    .lte('start_date', dateStr)
    .gte('end_date', dateStr);

  if (error || !data) return [];
  return data;
}

/**
 * Verifica si una promoción está dentro del rango de fechas
 */
function isWithinDateRange(promo: Promotion, now: Date): boolean {
  if (!promo.start_date && !promo.end_date) return true;
  
  const start = promo.start_date ? new Date(promo.start_date) : null;
  const end = promo.end_date ? new Date(promo.end_date) : null;
  
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

/**
 * Verifica si el día de la semana es válido
 */
function isValidDayOfWeek(promo: Promotion, now: Date): boolean {
  if (!promo.day_of_week || promo.day_of_week.length === 0) return true;
  
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  return promo.day_of_week.includes(dayOfWeek);
}

/**
 * Verifica si la hora actual está dentro del rango permitido
 */
function isValidHour(promo: Promotion, now: Date): boolean {
  if (promo.hour_start === null && promo.hour_end === null) return true;
  
  const currentHour = now.getHours();
  
  if (promo.hour_start !== null && promo.hour_end !== null) {
    if (promo.hour_start <= promo.hour_end) {
      return currentHour >= promo.hour_start && currentHour <= promo.hour_end;
    } else {
      // Rango que cruza medianoche
      return currentHour >= promo.hour_start || currentHour <= promo.hour_end;
    }
  }
  
  if (promo.hour_start !== null) return currentHour >= promo.hour_start;
  if (promo.hour_end !== null) return currentHour <= promo.hour_end;
  
  return true;
}

/**
 * Aplica boosts de prioridad basados en eventos activos
 */
function applyEventBoosts(promos: Promotion[], events: PromoEvent[]): Promotion[] {
  if (events.length === 0) return promos;
  
  const totalBoost = events.reduce((sum, event) => sum + event.priority_boost, 0);
  
  return promos.map(promo => ({
    ...promo,
    priority: promo.priority + totalBoost,
  }));
}

/**
 * Selecciona una promoción basada en el tipo de rotación
 */
function selectByRotation(promos: Promotion[], location: string): Promotion | null {
  if (promos.length === 0) return null;
  
  // Ordenar por prioridad descendente
  const sorted = [...promos].sort((a, b) => b.priority - a.priority);
  
  // Para rotación por hora/día, usar timestamp para selección determinística
  const now = new Date();
  const rotationKey = location + '_' + now.getHours() + '_' + now.getDate();
  const hash = rotationKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Seleccionar basado en hash para rotación determinística pero variada
  const index = hash % sorted.length;
  return sorted[index];
}

/**
 * Obtiene promociones activas para una ubicación específica
 */
async function getPromosForLocation(location: string): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('web_dev_promotions')
    .select('*')
    .eq('location', location)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error || !data) return [];
  return data;
}

/**
 * Función principal para obtener la promoción activa
 */
export async function getActivePromotion(location: string): Promise<Promotion | null> {
  const now = Date.now();
  const cacheKey = location;
  const cached = promoCache.get(cacheKey);
  
  // Verificar cache
  const cacheDuration = CACHE_DURATION[location] || 60 * 60 * 1000; // Default 1 hora
  if (cached && (now - cached.timestamp) < cacheDuration) {
    return cached.data;
  }
  
  try {
    // 1. Verificar override
    const override = await checkOverride(location);
    if (override) {
      if (override.override_message) {
        // Crear promoción temporal desde override
        const { data: promoData } = await supabase
          .from('web_dev_promotions')
          .select('*')
          .eq('id', override.promotion_id)
          .single();
        
        if (promoData) {
          const promo: Promotion = {
            ...promoData,
            message: override.override_message,
          };
          promoCache.set(cacheKey, { data: promo, timestamp: now });
          return promo;
        }
      }
    }
    
    // 2. Obtener promociones activas
    const promos = await getPromosForLocation(location);
    
    // 3. Filtrar por fecha/hora/día
    const nowDate = new Date();
    const validPromos = promos.filter(p => 
      isWithinDateRange(p, nowDate) &&
      isValidDayOfWeek(p, nowDate) &&
      isValidHour(p, nowDate)
    );
    
    if (validPromos.length === 0) {
      promoCache.set(cacheKey, { data: null, timestamp: now });
      return null;
    }
    
    // 4. Obtener eventos activos y aplicar boosts
    const activeEvents = await getActiveEvents(nowDate);
    const boostedPromos = applyEventBoosts(validPromos, activeEvents);
    
    // 5. Seleccionar promoción
    const selected = selectByRotation(boostedPromos, location);
    
    promoCache.set(cacheKey, { data: selected, timestamp: now });
    return selected;
  } catch (error) {
    console.error('Error fetching promotion:', error);
    return null;
  }
}

/**
 * Limpia el cache (útil para testing o cuando se actualiza una promoción)
 */
export function clearPromoCache(location?: string) {
  if (location) {
    promoCache.delete(location);
  } else {
    promoCache.clear();
  }
}

/**
 * Obtiene todas las promociones (para admin)
 */
export async function getAllPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('web_dev_promotions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all promotions:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }
  
  return data || [];
}

/**
 * Obtiene todos los eventos (para admin)
 */
export async function getAllEvents(): Promise<PromoEvent[]> {
  const { data, error } = await supabase
    .from('web_dev_promo_events')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return data || [];
}

