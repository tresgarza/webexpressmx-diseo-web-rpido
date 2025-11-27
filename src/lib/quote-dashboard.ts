import { supabase } from './supabase';
import type { Plan, Addon, RushFee } from './supabase';

// Types
export type QuoteStatus = 'pending' | 'contacted' | 'processed' | 'lost';

export interface QuoteMetadata {
  status: QuoteStatus;
  notes: { date: string; text: string }[];
  originalMessage?: string;
}

export interface QuoteLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  project_type: string;
  budget: string;
  timeline: string;
  message: string | null;
  source: string;
  plan_selected: string | null;
  created_at: string;
  session_id: string | null;
  user_fingerprint: string | null;
  ip_address: string | null;
  user_agent: string | null;
  last_step_reached: number | null;
  abandoned_at: string | null;
}

export interface QuoteEvent {
  id: string;
  event_type: string;
  session_id: string;
  user_fingerprint: string;
  step: number | null;
  plan_id: string | null;
  addon_ids: string[] | null;
  timeline_id: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
  url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface QuoteWithEvents extends QuoteLead {
  events: QuoteEvent[];
  plan?: Plan | null;
  addons?: Addon[];
  rushFee?: RushFee | null;
}

export interface QuoteFilters {
  dateFrom?: string;
  dateTo?: string;
  planId?: string;
  timelineId?: string;
  status?: 'all' | 'completed' | 'abandoned';
  quoteStatus?: QuoteStatus | 'all';
  hasPhone?: boolean;
  isUrgent?: boolean;
  searchText?: string;
  sortBy?: 'date' | 'urgency' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface FunnelStats {
  pageViews: number;
  wizardStarted: number;
  planSelected: number;
  phoneProvided: number;
  completed: number;
}

export interface QuoteStats {
  total: number;
  completed: number;
  abandoned: number;
  conversionRate: number;
  byPlan: Record<string, number>;
  byTimeline: Record<string, number>;
  byDate: { date: string; count: number }[];
}

// Calculate urgency level (1 = most urgent, 3 = least urgent)
export function calculateQuoteUrgency(
  timelineId: string | null,
  createdAt: string
): { level: 1 | 2 | 3; label: string; color: string } {
  // Based on timeline
  if (timelineId === 'urgent') {
    return { level: 1, label: 'Urgente', color: 'text-red-500 bg-red-500/10' };
  }
  if (timelineId === 'week') {
    return { level: 2, label: 'Esta semana', color: 'text-orange-500 bg-orange-500/10' };
  }
  
  // Check if quote is recent (last 24 hours)
  const hoursSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation < 24) {
    return { level: 2, label: 'Reciente', color: 'text-blue-500 bg-blue-500/10' };
  }
  
  return { level: 3, label: 'Normal', color: 'text-gray-500 bg-gray-500/10' };
}

// Build WhatsApp URL from quote data
export function buildWhatsAppURLFromQuote(
  quote: QuoteLead,
  plan?: Plan | null,
  addons?: Addon[],
  rushFee?: RushFee | null
): string {
  const name = quote.name || 'Cliente';
  const email = quote.email;
  const planName = plan?.name || quote.budget || 'Plan seleccionado';
  const deliveryInfo = quote.timeline || 'Flexible';
  
  let message = `👋 Hola ${name},\n\n`;
  message += `Te escribimos de SitioExpress respecto a tu cotización:\n\n`;
  message += `📦 *Plan:* ${planName}\n`;
  message += `⏰ *Entrega:* ${deliveryInfo}\n`;
  
  if (addons && addons.length > 0) {
    message += `\n✨ *Add-ons seleccionados:*\n`;
    addons.forEach(addon => {
      message += `   • ${addon.name}\n`;
    });
  }
  
  if (rushFee && rushFee.markup_percent > 0) {
    message += `\n⚡ *Prioridad:* ${rushFee.display_name || 'Express'}\n`;
  }
  
  message += `\n📧 *Tu email:* ${email}\n`;
  message += `\n¿Te gustaría agendar una llamada para revisar los detalles?`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/528116364522?text=${encodedMessage}`;
}

// Get quotes with filtering
export async function getQuotes(filters: QuoteFilters = {}): Promise<QuoteLead[]> {
  let query = supabase
    .from('web_dev_leads')
    .select('*')
    .eq('source', 'cotizador_express')
    .order('created_at', { ascending: filters.sortOrder === 'asc' });
  
  // Apply date filters
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }
  
  // Apply plan filter
  if (filters.planId) {
    query = query.eq('plan_selected', filters.planId);
  }
  
  // Apply status filter
  if (filters.status === 'completed') {
    query = query.is('abandoned_at', null);
  } else if (filters.status === 'abandoned') {
    query = query.not('abandoned_at', 'is', null);
  }
  
  // Apply search filter
  if (filters.searchText) {
    query = query.or(`name.ilike.%${filters.searchText}%,email.ilike.%${filters.searchText}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  // Deduplicate by session_id - keep only ONE record per session (the most complete/recent)
  // This ensures we see all unique users/sessions, including those in progress
  const deduplicatedMap = new Map<string, QuoteLead>();
  
  for (const lead of data) {
    if (!lead.session_id) {
      // If no session_id, keep it (shouldn't happen but just in case)
      deduplicatedMap.set(lead.id, lead);
      continue;
    }
    
    const existing = deduplicatedMap.get(lead.session_id);
    
    if (!existing) {
      // First occurrence of this session_id - keep it
      deduplicatedMap.set(lead.session_id, lead);
    } else {
      // We already have a record for this session - keep the better one
      // Score based on completeness and progress
      const existingScore = (existing.phone ? 10 : 0) + 
                           (existing.email && !existing.email.includes('@pending.com') ? 5 : 0) +
                           (existing.name && existing.name !== 'Lead en proceso' ? 5 : 0) +
                           (existing.last_step_reached || 0) * 2; // Weight step progress more
      
      const newScore = (lead.phone ? 10 : 0) + 
                      (lead.email && !lead.email.includes('@pending.com') ? 5 : 0) +
                      (lead.name && lead.name !== 'Lead en proceso' ? 5 : 0) +
                      (lead.last_step_reached || 0) * 2; // Weight step progress more
      
      // Keep the one with higher score, or if equal, the more recent one
      if (newScore > existingScore || 
          (newScore === existingScore && new Date(lead.created_at) > new Date(existing.created_at))) {
        deduplicatedMap.set(lead.session_id, lead);
      }
    }
  }
  
  // Convert map back to array and sort by created_at
  const deduplicated = Array.from(deduplicatedMap.values());
  deduplicated.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  return deduplicated;
}

// Get events for a specific session
export async function getEventsForSession(sessionId: string): Promise<QuoteEvent[]> {
  const { data, error } = await supabase
    .from('web_dev_quote_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return data || [];
}

// Get quote with all events
export async function getQuoteWithEvents(quoteId: string): Promise<QuoteWithEvents | null> {
  const { data: quote, error: quoteError } = await supabase
    .from('web_dev_leads')
    .select('*')
    .eq('id', quoteId)
    .single();
  
  if (quoteError || !quote) {
    console.error('Error fetching quote:', quoteError);
    return null;
  }
  
  // Get events for this session
  const events = quote.session_id 
    ? await getEventsForSession(quote.session_id)
    : [];
  
  // Get plan if selected
  let plan: Plan | null = null;
  if (quote.plan_selected) {
    const { data: planData } = await supabase
      .from('web_dev_plans')
      .select('*')
      .eq('slug', quote.plan_selected)
      .single();
    plan = planData;
  }
  
  return {
    ...quote,
    events,
    plan,
  };
}

// Get aggregate stats
export async function getQuoteStats(dateFrom?: string, dateTo?: string): Promise<QuoteStats> {
  // Get all quotes in date range
  let query = supabase
    .from('web_dev_leads')
    .select('*')
    .eq('source', 'cotizador_express');
  
  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }
  if (dateTo) {
    query = query.lte('created_at', dateTo);
  }
  
  const { data: quotes, error } = await query;
  
  if (error || !quotes) {
    console.error('Error fetching stats:', error);
    return {
      total: 0,
      completed: 0,
      abandoned: 0,
      conversionRate: 0,
      byPlan: {},
      byTimeline: {},
      byDate: [],
    };
  }
  
  // Calculate stats
  const total = quotes.length;
  const completed = quotes.filter(q => !q.abandoned_at).length;
  const abandoned = quotes.filter(q => q.abandoned_at).length;
  const conversionRate = total > 0 ? (completed / total) * 100 : 0;
  
  // Group by plan
  const byPlan: Record<string, number> = {};
  quotes.forEach(q => {
    const plan = q.plan_selected || 'Sin plan';
    byPlan[plan] = (byPlan[plan] || 0) + 1;
  });
  
  // Group by timeline
  const byTimeline: Record<string, number> = {};
  quotes.forEach(q => {
    // Extract timeline from message or use default
    const timeline = q.timeline || 'Sin definir';
    const timelineKey = timeline.includes('Express') ? 'Express' :
                       timeline.includes('Rápido') ? 'Rápido' : 'Estándar';
    byTimeline[timelineKey] = (byTimeline[timelineKey] || 0) + 1;
  });
  
  // Group by date (last 7 days)
  const byDate: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = quotes.filter(q => 
      q.created_at && q.created_at.startsWith(dateStr)
    ).length;
    byDate.push({ date: dateStr, count });
  }
  
  return {
    total,
    completed,
    abandoned,
    conversionRate,
    byPlan,
    byTimeline,
    byDate,
  };
}

// Get funnel data from view
export async function getFunnelData(date?: string): Promise<{
  started: number;
  planSelected: number;
  timelineSelected: number;
  completed: number;
  abandoned: number;
}> {
  let query = supabase
    .from('web_dev_quote_funnel')
    .select('*');
  
  if (date) {
    query = query.eq('date', date);
  }
  
  const { data, error } = await query;
  
  if (error || !data || data.length === 0) {
    return {
      started: 0,
      planSelected: 0,
      timelineSelected: 0,
      completed: 0,
      abandoned: 0,
    };
  }
  
  // Sum up all dates if no specific date provided
  const result = data.reduce((acc, row) => ({
    started: acc.started + (row.started || 0),
    planSelected: acc.planSelected + (row.plan_selected || 0),
    timelineSelected: acc.timelineSelected + (row.timeline_selected || 0),
    completed: acc.completed + (row.completed || 0),
    abandoned: acc.abandoned + (row.abandoned || 0),
  }), {
    started: 0,
    planSelected: 0,
    timelineSelected: 0,
    completed: 0,
    abandoned: 0,
  });
  
  return result;
}

// Mark quote as contacted
export async function markQuoteAsContacted(quoteId: string): Promise<boolean> {
  // We'll add a note to the message field to track contact status
  const { data: quote } = await supabase
    .from('web_dev_leads')
    .select('message')
    .eq('id', quoteId)
    .single();
  
  const currentMessage = quote?.message || '';
  const contactedNote = `\n\n---\n✓ Contactado: ${new Date().toLocaleString('es-MX')}`;
  
  const { error } = await supabase
    .from('web_dev_leads')
    .update({ message: currentMessage + contactedNote })
    .eq('id', quoteId);
  
  return !error;
}

// Get all plans for filter dropdown
export async function getPlansForFilter(): Promise<{ id: string; name: string; slug: string }[]> {
  const { data, error } = await supabase
    .from('web_dev_plans')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order');
  
  if (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
  
  return data || [];
}

// Get addons by IDs
export async function getAddonsByIds(addonIds: string[]): Promise<Addon[]> {
  if (!addonIds || addonIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('web_dev_addons')
    .select('*')
    .in('id', addonIds);
  
  if (error) {
    console.error('Error fetching addons:', error);
    return [];
  }
  
  return data || [];
}

// Get completed quotes (from view)
export async function getCompletedQuotes(): Promise<{
  session_id: string;
  email: string | null;
  name: string | null;
  plan_id: string | null;
  addon_ids: string[] | null;
  timeline_id: string | null;
  completed_at: string;
}[]> {
  const { data, error } = await supabase
    .from('web_dev_completed_quotes')
    .select('*')
    .order('completed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching completed quotes:', error);
    return [];
  }
  
  return data || [];
}

// Get abandoned quotes (from view)
export async function getAbandonedQuotes(): Promise<{
  session_id: string;
  email: string | null;
  name: string | null;
  plan_id: string | null;
  addon_ids: string[] | null;
  timeline_id: string | null;
  step: number | null;
  abandoned_at: string;
}[]> {
  const { data, error } = await supabase
    .from('web_dev_abandoned_quotes')
    .select('*')
    .order('abandoned_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching abandoned quotes:', error);
    return [];
  }
  
  return data || [];
}

// Format date for display
export function formatQuoteDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `Hace ${diffMins} min`;
  }
  if (diffHours < 24) {
    return `Hace ${diffHours}h`;
  }
  if (diffDays < 7) {
    return `Hace ${diffDays}d`;
  }
  
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined,
  });
}

// Get timeline label from ID
export function getTimelineLabel(timelineId: string | null, timelineStr: string | null): string {
  // First check timelineId
  if (timelineId === 'urgent') return '🔥 Express Premium';
  if (timelineId === 'week') return '⚡ Express Rápido';
  if (timelineId === 'standard' || timelineId === 'flexible') return '📅 Estándar';
  
  // Fallback to timeline string
  if (timelineStr) {
    if (timelineStr.includes('Express') || timelineStr.includes('express') || timelineStr.includes('urgent')) return '🔥 Express';
    if (timelineStr.includes('Rápido') || timelineStr.includes('rapido') || timelineStr.includes('week')) return '⚡ Rápido';
    if (timelineStr.includes('standard') || timelineStr.includes('Estándar')) return '📅 Estándar';
    return `📅 ${timelineStr}`;
  }
  
  // If timelineId is provided but not recognized
  if (timelineId) {
    return `📅 ${timelineId}`;
  }
  
  return '📅 Sin definir';
}

// Parse quote metadata from message field
export function parseQuoteMetadata(message: string | null): QuoteMetadata {
  const result: QuoteMetadata = {
    status: 'pending',
    notes: [],
    originalMessage: undefined,
  };

  if (!message) return result;

  // Parse status
  const statusMatch = message.match(/\[STATUS:(pending|contacted|processed|lost)\]/);
  if (statusMatch) {
    result.status = statusMatch[1] as QuoteStatus;
  } else if (message.includes('✓ Contactado')) {
    // Legacy format
    result.status = 'contacted';
  }

  // Parse notes
  const noteRegex = /\[NOTE:([^\]]+)\]\s*([^\[]*)/g;
  let match;
  while ((match = noteRegex.exec(message)) !== null) {
    result.notes.push({
      date: match[1].trim(),
      text: match[2].trim(),
    });
  }

  // Get original message (everything after ---)
  const separatorIndex = message.indexOf('---');
  if (separatorIndex !== -1) {
    const afterSeparator = message.substring(separatorIndex + 3).trim();
    // Remove metadata from original message
    const cleanedOriginal = afterSeparator
      .replace(/\[STATUS:[^\]]+\]/g, '')
      .replace(/\[NOTE:[^\]]+\][^\[]*/g, '')
      .trim();
    if (cleanedOriginal) {
      result.originalMessage = cleanedOriginal;
    }
  } else {
    // No metadata, entire message is original
    const cleanedMessage = message
      .replace(/\[STATUS:[^\]]+\]/g, '')
      .replace(/\[NOTE:[^\]]+\][^\[]*/g, '')
      .replace(/✓ Contactado:[^\n]*/g, '')
      .trim();
    if (cleanedMessage && !cleanedMessage.startsWith('[')) {
      result.originalMessage = cleanedMessage;
    }
  }

  return result;
}

// Build message field from metadata
export function buildQuoteMessage(metadata: QuoteMetadata): string {
  let message = `[STATUS:${metadata.status}]\n`;
  
  for (const note of metadata.notes) {
    message += `[NOTE:${note.date}] ${note.text}\n`;
  }
  
  if (metadata.originalMessage) {
    message += `---\n${metadata.originalMessage}`;
  }
  
  return message;
}

// Update quote status
export async function updateQuoteStatus(quoteId: string, status: QuoteStatus): Promise<boolean> {
  const { data: quote } = await supabase
    .from('web_dev_leads')
    .select('message')
    .eq('id', quoteId)
    .single();
  
  const metadata = parseQuoteMetadata(quote?.message || null);
  metadata.status = status;
  
  const newMessage = buildQuoteMessage(metadata);
  
  const { error } = await supabase
    .from('web_dev_leads')
    .update({ message: newMessage })
    .eq('id', quoteId);
  
  return !error;
}

// Add note to quote
export async function addQuoteNote(quoteId: string, noteText: string): Promise<boolean> {
  try {
    // First, fetch the current message
    const { data: quote, error: fetchError } = await supabase
      .from('web_dev_leads')
      .select('message')
      .eq('id', quoteId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching quote for note:', fetchError);
      return false;
    }
    
    // Parse existing metadata and add new note
    const metadata = parseQuoteMetadata(quote?.message || null);
    metadata.notes.unshift({
      date: new Date().toLocaleString('es-MX'),
      text: noteText,
    });
    
    // Build the new message
    const newMessage = buildQuoteMessage(metadata);
    
    // Update the quote
    const { error: updateError } = await supabase
      .from('web_dev_leads')
      .update({ message: newMessage })
      .eq('id', quoteId);
    
    if (updateError) {
      console.error('Error updating quote with note:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in addQuoteNote:', error);
    return false;
  }
}

// Get funnel stats for a date range
export async function getFunnelStats(dateFrom?: string, dateTo?: string): Promise<FunnelStats> {
  // Build date filter
  const dateFilter = {
    from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    to: dateTo || new Date().toISOString(),
  };

  // Get unique sessions that started the wizard (using 'quote_started' event type)
  const { data: startEvents } = await supabase
    .from('web_dev_quote_events')
    .select('session_id')
    .eq('event_type', 'quote_started')
    .gte('timestamp', dateFilter.from)
    .lte('timestamp', dateFilter.to);

  // Get unique sessions with plan selected
  const { data: planEvents } = await supabase
    .from('web_dev_quote_events')
    .select('session_id')
    .eq('event_type', 'plan_selected')
    .gte('timestamp', dateFilter.from)
    .lte('timestamp', dateFilter.to);

  // Get unique sessions with phone provided (check for non-null phone in any event)
  const { data: phoneEvents } = await supabase
    .from('web_dev_quote_events')
    .select('session_id, phone')
    .not('phone', 'is', null)
    .gte('timestamp', dateFilter.from)
    .lte('timestamp', dateFilter.to);

  // Get completed quotes - ONLY count leads that reached step 4 (actually submitted)
  // This is different from just providing phone - they must click "Completar Solicitud y Enviar a WhatsApp"
  const { data: completedLeads } = await supabase
    .from('web_dev_leads')
    .select('session_id')
    .eq('source', 'cotizador_express')
    .eq('last_step_reached', 4) // Only count as completed if they reached step 4
    .not('session_id', 'is', null)
    .gte('created_at', dateFilter.from)
    .lte('created_at', dateFilter.to);

  // Count unique sessions
  const uniqueSessions = (events: { session_id: string }[] | null) => {
    if (!events) return 0;
    return new Set(events.map(e => e.session_id)).size;
  };

  const started = uniqueSessions(startEvents);
  const selected = uniqueSessions(planEvents);
  const withPhone = uniqueSessions(phoneEvents as { session_id: string }[]);
  const completed = uniqueSessions(completedLeads);

  return {
    pageViews: Math.max(started, Math.floor(started * 1.3)), // Estimate page views as at least 30% more than started
    wizardStarted: started,
    planSelected: selected,
    phoneProvided: withPhone,
    completed: completed,
  };
}

// Get status label and color
export function getStatusInfo(status: QuoteStatus): { label: string; color: string; bgColor: string } {
  switch (status) {
    case 'pending':
      return { label: 'Pendiente', color: 'text-blue-600', bgColor: 'bg-blue-500/10' };
    case 'contacted':
      return { label: 'Contactado', color: 'text-amber-600', bgColor: 'bg-amber-500/10' };
    case 'processed':
      return { label: 'Procesado', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' };
    case 'lost':
      return { label: 'Perdido', color: 'text-red-600', bgColor: 'bg-red-500/10' };
    default:
      return { label: 'Pendiente', color: 'text-blue-600', bgColor: 'bg-blue-500/10' };
  }
}

// Get date range for period
export function getDateRangeForPeriod(period: 'today' | '7d' | '30d' | 'all'): { from: string; to: string } | null {
  const now = new Date();
  const to = now.toISOString();
  
  switch (period) {
    case 'today':
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { from: todayStart.toISOString(), to };
    case '7d':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { from: weekAgo.toISOString(), to };
    case '30d':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { from: monthAgo.toISOString(), to };
    case 'all':
      return null;
    default:
      return null;
  }
}



