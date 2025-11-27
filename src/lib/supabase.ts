import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wypyrofixlyxzoeqndno.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cHlyb2ZpeGx5eHpvZXFuZG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMDkwMjEsImV4cCI6MjA1ODU4NTAyMX0.ajn5K6HXNnNl8WQUfle0-iVa-1Rh9Y8Mfm5xrXKWan0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials are missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Lead = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  project_type: string;
  budget: string;
  timeline: string;
  message?: string;
  source?: string;
  plan_selected?: string;
  created_at?: string;
};

export type Promotion = {
  id: string;
  title: string;
  message: string;
  discount_percent: number | null;
  bonus_text: string | null;
  cta_text: string | null;
  location: string;
  rotation_type: 'hourly' | 'daily' | 'event' | 'static' | 'weekly';
  priority: number;
  start_date: string | null;
  end_date: string | null;
  day_of_week: number[] | null;
  hour_start: number | null;
  hour_end: number | null;
  is_active: boolean;
  applies_to_plan_id: string | null;
  applies_to_addon_id: string | null;
  applies_to_all_plans: boolean;
  applies_to_all_addons: boolean;
  created_at: string;
  updated_at: string;
};

export type PromoEvent = {
  id: string;
  name: string;
  event_type: string | null;
  start_date: string;
  end_date: string;
  priority_boost: number;
  is_recurring: boolean;
  recurrence_rule: string | null;
  created_at: string;
};

export type PromoOverride = {
  id: string;
  location: string;
  promotion_id: string | null;
  override_message: string | null;
  expires_at: string;
  created_by: string | null;
  created_at: string;
};

export type Plan = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  currency: string;
  features: string[];
  delivery_days: number | null;
  support_days: number | null;
  revision_rounds: number | null;
  is_popular: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Addon = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  price: number;
  price_max: number | null;
  currency: string;
  billing_type: string | null;
  badge: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Campaign = {
  id: string;
  name: string;
  discount_percent: number;
  banner_message: string | null;
  banner_cta: string | null;
  pricing_message: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
};

export type RushFee = {
  id: string;
  plan_slug: string;
  timeline_id: string;
  markup_percent: number;
  markup_fixed: number | null;
  display_name: string | null;
  description: string | null;
  delivery_days_min: number | null;
  delivery_days_max: number | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

// Timeline options with labels
export type TimelineOption = {
  id: string;
  label: string;
  icon: string;
};

export const TIMELINE_OPTIONS: TimelineOption[] = [
  { id: 'urgent', label: 'Lo antes posible', icon: '🔥' },
  { id: 'week', label: 'Esta semana', icon: '⚡' },
  { id: 'month', label: 'Este mes', icon: '📅' },
  { id: 'flexible', label: 'Flexible', icon: '🌿' },
];

