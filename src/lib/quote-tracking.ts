"use client";

import { supabase } from "./supabase";
import { getStoredUTMParams } from "./tracking-events";

// Generate or get session ID from localStorage
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('quote_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('quote_session_id', sessionId);
  }
  return sessionId;
}

// Get or create user fingerprint with enhanced data
export function getUserFingerprint(): string {
  if (typeof window === 'undefined') return '';
  
  let fingerprint = localStorage.getItem('user_fingerprint');
  if (!fingerprint) {
    try {
      // Canvas fingerprint
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('fingerprint', 2, 2);
      const canvasHash = btoa(canvas.toDataURL()).substr(0, 16);
      
      // Collect browser characteristics
      const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language || navigator.languages?.[0] || '';
      const platform = navigator.platform || '';
      const userAgent = navigator.userAgent.substr(0, 32);
      
      // Create comprehensive fingerprint
      const fingerprintData = [
        canvasHash,
        screenInfo,
        timezone,
        language,
        platform,
        userAgent,
      ].join('_');
      
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < fingerprintData.length; i++) {
        const char = fingerprintData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      fingerprint = `fp_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
      localStorage.setItem('user_fingerprint', fingerprint);
    } catch (error) {
      // Fallback to simple fingerprint
      fingerprint = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_fingerprint', fingerprint);
    }
  }
  return fingerprint;
}

// Cache IP address to avoid multiple requests
let cachedIP: string | null = null;
let ipFetchPromise: Promise<string | null> | null = null;

/**
 * Get user's IP address using a public API
 */
export async function getUserIP(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // Return cached IP if available
  if (cachedIP) return cachedIP;
  
  // Return existing promise if already fetching
  if (ipFetchPromise) return ipFetchPromise;
  
  // Fetch IP address
  ipFetchPromise = (async () => {
    try {
      // Try multiple IP services for reliability
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://api.myip.com',
      ];
      
      for (const service of services) {
        try {
          const response = await fetch(service, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(3000), // 3 second timeout
          });
          
          if (response.ok) {
            const data = await response.json();
            const ip = data.ip || data.query || data.ipAddress;
            if (ip && typeof ip === 'string') {
              cachedIP = ip;
              return ip;
            }
          }
        } catch (error) {
          // Try next service
          continue;
        }
      }
      
      return null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Could not fetch IP address:', error);
      }
      return null;
    } finally {
      ipFetchPromise = null;
    }
  })();
  
  return ipFetchPromise;
}

export type QuoteEventType =
  | 'quote_started'
  | 'plan_selected'
  | 'addon_selected'
  | 'addon_removed'
  | 'timeline_selected'
  | 'step_changed'
  | 'quote_abandoned'
  | 'quote_completed';

export interface QuoteEvent {
  event_type: QuoteEventType;
  session_id: string;
  user_fingerprint: string;
  step?: number;
  plan_id?: string | null;
  addon_ids?: string[];
  timeline_id?: string | null;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  metadata?: Record<string, any>;
  ip_address?: string | null;
}

/**
 * Track quote events to Supabase
 * Exported for use in components
 */
export async function trackQuoteEvent(event: QuoteEvent, includeIP: boolean = true): Promise<void> {
  try {
    const sessionId = getSessionId();
    const fingerprint = getUserFingerprint();
    
    // Get IP address if needed (non-blocking)
    let ipAddress: string | null = null;
    if (includeIP && typeof window !== 'undefined') {
      // Don't await - fetch in background
      getUserIP().then(ip => {
        if (ip) {
          // Update cached IP for future events
          cachedIP = ip;
        }
      }).catch(() => {
        // Ignore errors
      });
      
      // Use cached IP if available
      ipAddress = cachedIP || null;
    }

    const eventData = {
      ...event,
      session_id: sessionId,
      user_fingerprint: fingerprint,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ip_address: ipAddress,
    };

    // Try to insert into web_dev_quote_events table
    const { error } = await supabase.from('web_dev_quote_events').insert([eventData]);

    if (error) {
      // Fallback: Save to localStorage if Supabase fails
      if (typeof window !== 'undefined') {
        try {
          const failedEvents = JSON.parse(localStorage.getItem('failed_quote_events') || '[]');
          failedEvents.push({
            ...eventData,
            failed_at: new Date().toISOString(),
            error: error.message,
          });
          // Keep only last 50 failed events
          const recentFailed = failedEvents.slice(-50);
          localStorage.setItem('failed_quote_events', JSON.stringify(recentFailed));
        } catch (storageError) {
          // Ignore storage errors
        }
      }

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Quote tracking error (table may not exist):', error);
        console.log('Event data saved to localStorage fallback:', eventData);
        console.log('💡 Tip: Run the SQL migrations in src/lib/supabase-migrations.sql');
      }
    } else {
      // Success - try to retry failed events
      if (typeof window !== 'undefined') {
        retryFailedEvents();
      }
    }
  } catch (error) {
    // Fail silently in production, but log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracking quote event:', error);
    }
  }
}

/**
 * Retry failed events from localStorage
 */
async function retryFailedEvents(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const failedEvents = JSON.parse(localStorage.getItem('failed_quote_events') || '[]');
    if (failedEvents.length === 0) return;

    const retryPromises = failedEvents.map(async (eventData: any) => {
      const { failed_at, error: _, ...event } = eventData;
      const { error } = await supabase.from('web_dev_quote_events').insert([event]);
      
      if (!error) {
        return true; // Success
      }
      return false; // Still failed
    });

    const results = await Promise.all(retryPromises);
    const successCount = results.filter(r => r).length;

    if (successCount > 0) {
      // Remove successfully retried events
      const stillFailed = failedEvents.filter((_: any, i: number) => !results[i]);
      localStorage.setItem('failed_quote_events', JSON.stringify(stillFailed));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Retried ${successCount} failed tracking events`);
      }
    }
  } catch (error) {
    // Ignore retry errors
  }
}

/**
 * Save or update lead with contact info for immediate access
 * This function now ensures only ONE lead per session_id exists
 */
async function saveLeadContactInfo(
  phone?: string,
  email?: string,
  name?: string,
  planId?: string,
  addonIds?: string[],
  timelineId?: string,
  step?: number
): Promise<void> {
  if (!phone && !email && !name) return;

  try {
    const sessionId = getSessionId();
    const fingerprint = getUserFingerprint();
    const ipAddress = await getUserIP();

    // Check if ANY lead exists for this session (including partial ones)
    const { data: existingLeads } = await supabase
      .from('web_dev_leads')
      .select('id, phone, email, name, last_step_reached')
      .eq('session_id', sessionId)
      .eq('source', 'cotizador_express')
      .order('created_at', { ascending: false });

    if (existingLeads && existingLeads.length > 0) {
      // Find the best lead to keep (most complete or most recent)
      let bestLead = existingLeads[0];
      let bestScore = (bestLead.phone ? 10 : 0) + 
                     (bestLead.email && !bestLead.email.includes('@pending.com') ? 5 : 0) +
                     (bestLead.name && bestLead.name !== 'Lead en proceso' ? 5 : 0) +
                     (bestLead.last_step_reached || 0) * 2;
      
      for (const lead of existingLeads.slice(1)) {
        const score = (lead.phone ? 10 : 0) + 
                     (lead.email && !lead.email.includes('@pending.com') ? 5 : 0) +
                     (lead.name && lead.name !== 'Lead en proceso' ? 5 : 0) +
                     (lead.last_step_reached || 0) * 2;
        
        if (score > bestScore || 
            (score === bestScore && new Date(lead.created_at) > new Date(bestLead.created_at))) {
          bestLead = lead;
          bestScore = score;
        }
      }
      
      // If there are multiple leads for this session, delete the others (keep only the best one)
      if (existingLeads.length > 1) {
        const idsToDelete = existingLeads.filter(l => l.id !== bestLead.id).map(l => l.id);
        if (idsToDelete.length > 0) {
          await supabase
            .from('web_dev_leads')
            .delete()
            .in('id', idsToDelete);
        }
      }

      // Update the best lead with new contact info
      const updateData: any = {
        last_step_reached: Math.max(step || 0, bestLead.last_step_reached || 0), // Always update to highest step
      };

      // Only update fields that are provided and not already set (or improve incomplete data)
      if (phone && (!bestLead.phone || bestLead.phone.length < 10)) {
        updateData.phone = phone;
      }
      if (email && (!bestLead.email || bestLead.email.includes('@pending.com'))) {
        updateData.email = email;
      }
      if (name && (!bestLead.name || bestLead.name === 'Lead en proceso')) {
        updateData.name = name;
      }
      if (planId && !bestLead.plan_selected) {
        updateData.plan_selected = planId;
      }

      // Always update last_step_reached to the highest step reached, and other fields if provided
      // This ensures we track progress even for leads in process
      await supabase
        .from('web_dev_leads')
        .update(updateData)
        .eq('id', bestLead.id);
    } else {
      // Create new lead entry only if none exists
      await supabase.from('web_dev_leads').insert({
        name: name || 'Lead en proceso',
        email: email || `temp_${sessionId.slice(-8)}@pending.com`,
        phone: phone || null,
        project_type: 'cotizador',
        budget: planId || 'custom',
        timeline: timelineId || 'standard',
        source: 'cotizador_express',
        plan_selected: planId || null,
        session_id: sessionId,
        user_fingerprint: fingerprint,
        ip_address: ipAddress,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        last_step_reached: step || 1,
      });
    }
  } catch (error) {
    // Fail silently - tracking continues in quote_events
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error saving lead contact info:', error);
    }
  }
}

/**
 * Track form field changes with debounce
 */
let debounceTimers: Map<string, NodeJS.Timeout> = new Map();

export async function trackFormFieldChange(
  fieldName: 'email' | 'phone' | 'name',
  value: string,
  step: number,
  planId?: string,
  addonIds?: string[],
  timelineId?: string
): Promise<void> {
  // Clear existing timer for this field
  const existingTimer = debounceTimers.get(fieldName);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // Set new timer
  const timer = setTimeout(async () => {
    if (value && value.length > 0) {
      // Track in quote_events
      await trackQuoteEvent({
        event_type: 'step_changed',
        session_id: '',
        user_fingerprint: '',
        step,
        plan_id: planId,
        addon_ids: addonIds,
        timeline_id: timelineId,
        [fieldName]: value,
        metadata: {
          field_changed: fieldName,
          field_length: value.length,
        },
      }, false); // Don't fetch IP for form field changes to reduce latency

      // Save to web_dev_leads for immediate access (especially phone)
      if (fieldName === 'phone' || fieldName === 'email' || fieldName === 'name') {
        await saveLeadContactInfo(
          fieldName === 'phone' ? value : undefined,
          fieldName === 'email' ? value : undefined,
          fieldName === 'name' ? value : undefined,
          planId,
          addonIds,
          timelineId,
          step
        );
      }
    }
    debounceTimers.delete(fieldName);
  }, 1000); // 1 second debounce

  debounceTimers.set(fieldName, timer);
}

/**
 * Track when user starts the quote process
 */
export async function trackQuoteStarted(): Promise<void> {
  // Save session start time for calculating total duration
  if (typeof window !== 'undefined') {
    localStorage.setItem('quote_session_start_time', Date.now().toString());
    localStorage.setItem('quote_step_times', JSON.stringify({ 1: Date.now() }));
  }

  await trackQuoteEvent({
    event_type: 'quote_started',
    session_id: '',
    user_fingerprint: '',
    step: 1,
    metadata: {
      startedAt: new Date().toISOString(),
    },
  });
}

/**
 * Track when user selects a plan
 */
export async function trackPlanSelected(planId: string, step: number): Promise<void> {
  await trackQuoteEvent({
    event_type: 'plan_selected',
    session_id: '',
    user_fingerprint: '',
    step,
    plan_id: planId,
  });
}

/**
 * Track when user selects/removes addons
 */
export async function trackAddonChange(
  addonId: string,
  isSelected: boolean,
  step: number
): Promise<void> {
  await trackQuoteEvent({
    event_type: isSelected ? 'addon_selected' : 'addon_removed',
    session_id: '',
    user_fingerprint: '',
    step,
    addon_ids: [addonId],
  });
}

/**
 * Track when user selects timeline
 */
export async function trackTimelineSelected(timelineId: string, step: number): Promise<void> {
  await trackQuoteEvent({
    event_type: 'timeline_selected',
    session_id: '',
    user_fingerprint: '',
    step,
    timeline_id: timelineId,
  });
}

/**
 * Track step changes
 */
export async function trackStepChange(
  fromStep: number,
  toStep: number,
  planId?: string,
  addonIds?: string[],
  timelineId?: string
): Promise<void> {
  await trackQuoteEvent({
    event_type: 'step_changed',
    session_id: '',
    user_fingerprint: '',
    step: toStep,
    plan_id: planId,
    addon_ids: addonIds,
    timeline_id: timelineId,
  });
}

/**
 * Track when user abandons the quote (leaves page or closes browser)
 */
export async function trackQuoteAbandoned(
  step: number,
  planId?: string,
  addonIds?: string[],
  timelineId?: string,
  email?: string,
  phone?: string,
  name?: string
): Promise<void> {
  await trackQuoteEvent({
    event_type: 'quote_abandoned',
    session_id: '',
    user_fingerprint: '',
    step,
    plan_id: planId,
    addon_ids: addonIds,
    timeline_id: timelineId,
    email: email || null,
    phone: phone || null,
    name: name || null,
  });
}

/**
 * Track when user completes the quote with enhanced metadata
 */
export async function trackQuoteCompleted(
  planId: string,
  addonIds: string[],
  timelineId: string,
  email: string,
  phone: string | undefined,
  name: string,
  metadata?: {
    campaignId?: string | null;
    campaignDiscount?: number;
    rushFeeId?: string | null;
    rushFeeDisplayName?: string | null;
    whatsappUrl?: string;
    totalTimeSeconds?: number;
    timePerStep?: Record<number, number>; // step -> seconds
    addonNames?: string[];
    planName?: string;
    planSlug?: string;
    timelineDisplayName?: string;
    messageLength?: number;
  }
): Promise<void> {
  // Calculate total time if session start time exists
  let totalTimeSeconds: number | undefined = undefined;
  if (typeof window !== 'undefined') {
    const sessionStartTime = localStorage.getItem('quote_session_start_time');
    if (sessionStartTime) {
      const startTime = parseInt(sessionStartTime, 10);
      totalTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    }
  }

  await trackQuoteEvent({
    event_type: 'quote_completed',
    session_id: '',
    user_fingerprint: '',
    step: 4, // Updated to step 4 (final step)
    plan_id: planId,
    addon_ids: addonIds,
    timeline_id: timelineId,
    email,
    phone: phone || null,
    name,
    metadata: {
      ...metadata,
      totalTimeSeconds: metadata?.totalTimeSeconds || totalTimeSeconds,
      completedAt: new Date().toISOString(),
      hasPhone: !!phone,
      addonCount: addonIds.length,
    },
  });
}

/**
 * Save partial quote data to localStorage for recovery
 */
export function savePartialQuote(data: {
  planId?: string;
  addonIds?: string[];
  timelineId?: string;
  email?: string;
  phone?: string;
  name?: string;
  step?: number;
}): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('partial_quote', JSON.stringify({
      ...data,
      saved_at: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error saving partial quote:', error);
  }
}

/**
 * Get partial quote data from localStorage
 */
export function getPartialQuote(): {
  planId?: string;
  addonIds?: string[];
  timelineId?: string;
  email?: string;
  phone?: string;
  name?: string;
  step?: number;
} | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('partial_quote');
    if (!saved) return null;
    
    const data = JSON.parse(saved);
    // Check if data is older than 7 days
    const savedAt = new Date(data.saved_at);
    const daysDiff = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) {
      localStorage.removeItem('partial_quote');
      return null;
    }
    
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Clear partial quote data
 */
export function clearPartialQuote(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('partial_quote');
}

/**
 * Check if quote_events table exists and is accessible
 */
export async function checkTrackingHealth(): Promise<{
  healthy: boolean;
  message: string;
  failedEventsCount: number;
}> {
  try {
      // Try a simple query
      const { error } = await supabase
        .from('web_dev_quote_events')
        .select('id')
        .limit(1);

      if (error) {
        const failedEvents = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem('failed_quote_events') || '[]').length 
          : 0;
        
        return {
          healthy: false,
          message: `Tabla web_dev_quote_events no existe o no es accesible. Ejecuta las migraciones SQL en Supabase. Error: ${error.message}`,
          failedEventsCount: failedEvents,
        };
      }

    const failedEvents = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('failed_quote_events') || '[]').length 
      : 0;

    return {
      healthy: true,
      message: 'Tracking funcionando correctamente',
      failedEventsCount: failedEvents,
    };
  } catch (error: any) {
    return {
      healthy: false,
      message: `Error verificando tracking: ${error?.message || 'Unknown error'}`,
      failedEventsCount: 0,
    };
  }
}

