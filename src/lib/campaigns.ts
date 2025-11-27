import { supabase } from './supabase';
export type { Campaign } from './supabase';

// Cache for active campaign
let campaignCache: { campaign: Campaign | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get the currently active campaign based on date and priority
 */
export async function getActiveCampaign(): Promise<Campaign | null> {
  // Check cache first
  if (campaignCache && Date.now() - campaignCache.timestamp < CACHE_DURATION) {
    return campaignCache.campaign;
  }

  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('web_dev_campaigns')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('priority', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching active campaign:', error);
    return null;
  }

  // Update cache
  campaignCache = { campaign: data, timestamp: Date.now() };
  
  return data;
}

/**
 * Get all campaigns (for admin panel)
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('web_dev_campaigns')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }

  return data || [];
}

/**
 * Get upcoming campaigns (not yet started)
 */
export async function getUpcomingCampaigns(): Promise<Campaign[]> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('web_dev_campaigns')
    .select('*')
    .eq('is_active', true)
    .gt('start_date', now)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming campaigns:', error);
    return [];
  }

  return data || [];
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('web_dev_campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }

  return data;
}

/**
 * Create a new campaign
 */
export async function createCampaign(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('web_dev_campaigns')
    .insert([campaign])
    .select()
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    throw new Error(error.message);
  }

  // Clear cache
  clearCampaignCache();
  
  return data;
}

/**
 * Update a campaign
 */
export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('web_dev_campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating campaign:', error);
    throw new Error(error.message);
  }

  // Clear cache
  clearCampaignCache();
  
  return data;
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('web_dev_campaigns')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting campaign:', error);
    throw new Error(error.message);
  }

  // Clear cache
  clearCampaignCache();
  
  return true;
}

/**
 * Activate a campaign immediately (set high priority and adjust dates if needed)
 */
export async function activateCampaignNow(id: string): Promise<Campaign | null> {
  const now = new Date();
  const updates: Partial<Campaign> = {
    is_active: true,
    priority: 100, // Highest priority
  };

  // If campaign hasn't started yet, start it now
  const campaign = await getCampaignById(id);
  if (campaign && new Date(campaign.start_date) > now) {
    updates.start_date = now.toISOString();
  }

  return updateCampaign(id, updates);
}

/**
 * End a campaign immediately
 */
export async function endCampaignNow(id: string): Promise<Campaign | null> {
  return updateCampaign(id, {
    end_date: new Date().toISOString(),
    priority: 0,
  });
}

/**
 * Clear the campaign cache
 */
export function clearCampaignCache(): void {
  campaignCache = null;
}

/**
 * Calculate time remaining for a campaign
 */
export function getTimeRemaining(endDate: string): {
  days: number;
  hours: number;
  minutes: number;
  text: string;
  isExpired: boolean;
  isUrgent: boolean;
} {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, text: 'Finalizada', isExpired: true, isUrgent: false };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let text = '';
  const isUrgent = days === 0;

  if (days > 7) {
    text = `${days} días restantes`;
  } else if (days > 1) {
    text = `${days} días, ${hours}h restantes`;
  } else if (days === 1) {
    text = `1 día, ${hours}h restantes`;
  } else if (hours > 1) {
    text = `${hours}h ${minutes}m restantes`;
  } else if (hours === 1) {
    text = `1h ${minutes}m restantes`;
  } else {
    text = `${minutes} minutos restantes`;
  }

  return { days, hours, minutes, text, isExpired: false, isUrgent };
}

/**
 * Calculate time until a campaign starts
 */
export function getTimeUntilStart(startDate: string): {
  days: number;
  hours: number;
  text: string;
  isStarted: boolean;
} {
  const now = new Date();
  const start = new Date(startDate);
  const diff = start.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, text: 'Ya inició', isStarted: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let text = '';
  if (days > 7) {
    text = `Inicia en ${days} días`;
  } else if (days > 1) {
    text = `Inicia en ${days} días`;
  } else if (days === 1) {
    text = `Inicia mañana`;
  } else if (hours > 1) {
    text = `Inicia en ${hours}h`;
  } else {
    text = `Inicia pronto`;
  }

  return { days, hours, text, isStarted: false };
}

/**
 * Get campaign status
 */
export function getCampaignStatus(campaign: Campaign): 'active' | 'scheduled' | 'ended' | 'inactive' {
  if (!campaign.is_active) return 'inactive';
  
  const now = new Date();
  const start = new Date(campaign.start_date);
  const end = new Date(campaign.end_date);

  if (now < start) return 'scheduled';
  if (now > end) return 'ended';
  return 'active';
}

/**
 * Format date for display
 */
export function formatCampaignDate(date: string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startStr = start.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  
  return `${startStr} → ${endStr}`;
}

/**
 * Calculate campaign duration in days
 */
export function getCampaignDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

