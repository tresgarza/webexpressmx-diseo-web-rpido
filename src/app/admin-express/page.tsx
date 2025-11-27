'use client';

import { useEffect, useState } from 'react';
import { supabase, type Plan, type Addon, type Campaign, type RushFee } from '@/lib/supabase';
import { 
  getActiveCampaign, 
  getAllCampaigns, 
  getUpcomingCampaigns, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign,
  endCampaignNow,
  activateCampaignNow,
  getTimeRemaining, 
  getTimeUntilStart,
  getCampaignStatus,
  formatDateRange,
  getCampaignDuration,
  clearCampaignCache
} from '@/lib/campaigns';
import { getAllPlans, getAllAddons, formatPrice, getAllRushFees } from '@/lib/pricing';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  LogOut, Plus, Edit, Trash2, Eye, EyeOff, Calendar, DollarSign, Package, 
  RefreshCw, X, Save, Clock, Play, Pause, Zap, TrendingUp, Target, MessageSquare
} from 'lucide-react';
import { QuoteDashboard } from '@/components/QuoteDashboard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Campaign schema
const campaignSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  discount_percent: z.number().min(0).max(50),
  banner_message: z.string().nullable().optional(),
  banner_cta: z.string().nullable().optional(),
  pricing_message: z.string().nullable().optional(),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().min(1, 'La fecha de fin es requerida'),
  is_active: z.boolean(),
  priority: z.number().min(1).max(100),
}).refine((data) => {
  return new Date(data.start_date) < new Date(data.end_date);
}, { message: 'La fecha de inicio debe ser anterior a la fecha de fin', path: ['end_date'] });

type CampaignFormData = z.infer<typeof campaignSchema>;

// Plan schema
const planSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  currency: z.string().default('MXN'),
  features: z.array(z.string()).min(1, 'Debe tener al menos una característica'),
  delivery_days: z.number().nullable().optional(),
  support_days: z.number().nullable().optional(),
  revision_rounds: z.number().nullable().optional(),
  is_popular: z.boolean(),
  display_order: z.number().default(0),
  is_active: z.boolean(),
});

type PlanFormData = z.infer<typeof planSchema>;

// Addon schema
const addonSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  price_max: z.number().nullable().optional(),
  currency: z.string().default('MXN'),
  billing_type: z.enum(['one-time', 'monthly', 'yearly']).nullable().optional(),
  badge: z.string().nullable().optional(),
  display_order: z.number().default(0),
  is_active: z.boolean(),
});

type AddonFormData = z.infer<typeof addonSchema>;

// Rush Fee schema
const rushFeeSchema = z.object({
  plan_slug: z.string().min(1, 'El plan es requerido'),
  timeline_id: z.enum(['urgent', 'week', 'month', 'flexible']),
  markup_percent: z.number().min(0, 'El porcentaje debe ser mayor o igual a 0').max(50, 'El porcentaje máximo es 50%'),
  markup_fixed: z.number().nullable().optional(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  delivery_days_min: z.number().nullable().optional(),
  delivery_days_max: z.number().nullable().optional(),
  display_order: z.number().default(0),
  is_active: z.boolean(),
});

type RushFeeFormData = z.infer<typeof rushFeeSchema>;

export default function AdminExpressPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState<Campaign[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [rushFees, setRushFees] = useState<RushFee[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'plans' | 'addons' | 'rush-fees' | 'cotizaciones'>('dashboard');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [showRushFeeModal, setShowRushFeeModal] = useState(false);
  const [editingRushFee, setEditingRushFee] = useState<RushFee | null>(null);
  
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, refreshKey]);

  // Auto-refresh time remaining
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email === 'diegogg98@hotmail.com') {
      setUser(session.user);
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email || 'diegogg98@hotmail.com',
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: email || 'diegogg98@hotmail.com',
            password: password,
          });
          if (signUpError) {
            toast.error(`Error: ${signUpError.message}`);
          } else {
            toast.success('Cuenta creada. Intenta iniciar sesión nuevamente.');
          }
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else if (data.user?.email === 'diegogg98@hotmail.com') {
        setUser(data.user);
        toast.success('Sesión iniciada');
      } else {
        await supabase.auth.signOut();
        toast.error('Solo el email diegogg98@hotmail.com tiene acceso');
      }
    } catch (err: any) {
      toast.error('Error inesperado');
    } finally {
      setIsSigningIn(false);
    }
  };

  const loadData = async () => {
    try {
      const [allCampaigns, active, upcoming, plansData, addonsData, rushFeesData] = await Promise.all([
        getAllCampaigns(),
        getActiveCampaign(),
        getUpcomingCampaigns(),
        getAllPlans(true),
        getAllAddons(true),
        getAllRushFees(true),
      ]);
      setCampaigns(allCampaigns);
      setActiveCampaign(active);
      setUpcomingCampaigns(upcoming);
      setPlans(plansData);
      setAddons(addonsData);
      setRushFees(rushFeesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    }
  };

  const handleSaveCampaign = async (data: CampaignFormData) => {
    try {
      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, data);
        toast.success('Campaña actualizada');
      } else {
        await createCampaign(data as any);
        toast.success('Campaña creada');
      }
      setShowCampaignModal(false);
      setEditingCampaign(null);
      clearCampaignCache();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    }
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!confirm(`¿Eliminar campaña "${campaign.name}"?`)) return;
    try {
      await deleteCampaign(campaign.id);
      toast.success('Campaña eliminada');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };

  const handleActivateCampaign = async (campaign: Campaign) => {
    try {
      await activateCampaignNow(campaign.id);
      toast.success('Campaña activada');
      clearCampaignCache();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al activar');
    }
  };

  const handleEndCampaign = async (campaign: Campaign) => {
    if (!confirm(`¿Terminar campaña "${campaign.name}" ahora?`)) return;
    try {
      await endCampaignNow(campaign.id);
      toast.success('Campaña terminada');
      clearCampaignCache();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al terminar');
    }
  };

  const handleSavePlan = async (data: PlanFormData) => {
    try {
      if (editingPlan) {
        const { error } = await supabase.from('web_dev_plans').update(data).eq('id', editingPlan.id);
        if (error) throw error;
        toast.success('Plan actualizado');
      } else {
        const { error } = await supabase.from('web_dev_plans').insert([data]);
        if (error) throw error;
        toast.success('Plan creado');
      }
      setShowPlanModal(false);
      setEditingPlan(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    if (!confirm(`¿Eliminar plan "${plan.name}"?`)) return;
    try {
      const { error } = await supabase.from('web_dev_plans').delete().eq('id', plan.id);
      if (error) throw error;
      toast.success('Plan eliminado');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };

  const handleSaveAddon = async (data: AddonFormData) => {
    try {
      if (editingAddon) {
        const { error } = await supabase.from('web_dev_addons').update(data).eq('id', editingAddon.id);
        if (error) throw error;
        toast.success('Add-on actualizado');
      } else {
        const { error } = await supabase.from('web_dev_addons').insert([data]);
        if (error) throw error;
        toast.success('Add-on creado');
      }
      setShowAddonModal(false);
      setEditingAddon(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    }
  };

  const handleDeleteAddon = async (addon: Addon) => {
    if (!confirm(`¿Eliminar add-on "${addon.name}"?`)) return;
    try {
      const { error } = await supabase.from('web_dev_addons').delete().eq('id', addon.id);
      if (error) throw error;
      toast.success('Add-on eliminado');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };

  const handleSaveRushFee = async (data: RushFeeFormData) => {
    try {
      if (editingRushFee) {
        const { error } = await supabase.from('web_dev_rush_fees').update(data).eq('id', editingRushFee.id);
        if (error) throw error;
        toast.success('Rush fee actualizado');
      } else {
        const { error } = await supabase.from('web_dev_rush_fees').insert([data]);
        if (error) throw error;
        toast.success('Rush fee creado');
      }
      setShowRushFeeModal(false);
      setEditingRushFee(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    }
  };

  const handleDeleteRushFee = async (rushFee: RushFee) => {
    if (!confirm(`¿Eliminar rush fee para ${rushFee.plan_slug} - ${rushFee.timeline_id}?`)) return;
    try {
      const { error } = await supabase.from('web_dev_rush_fees').delete().eq('id', rushFee.id);
      if (error) throw error;
      toast.success('Rush fee eliminado');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Sesión cerrada');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AdminExpress</h1>
              <p className="text-sm text-muted-foreground">Sistema de Campañas</p>
            </div>
          </div>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="diegogg98@hotmail.com"
                className="w-full p-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AdminExpress</h1>
              <p className="text-xs text-muted-foreground">Sistema de Campañas Unificadas</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Target },
            { id: 'cotizaciones', label: 'Cotizaciones', icon: MessageSquare },
            { id: 'campaigns', label: `Campañas (${campaigns.length})`, icon: Calendar },
            { id: 'plans', label: `Planes (${plans.length})`, icon: DollarSign },
            { id: 'addons', label: `Add-ons (${addons.length})`, icon: Package },
            { id: 'rush-fees', label: `Rush Fees (${rushFees.length})`, icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cotizaciones Tab */}
        {activeTab === 'cotizaciones' && (
          <QuoteDashboard />
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Active Campaign - Hero Card */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Campaña Activa
              </h2>
              
              {activeCampaign ? (
                <ActiveCampaignCard 
                  campaign={activeCampaign} 
                  plans={plans}
                  onEdit={() => {
                    setEditingCampaign(activeCampaign);
                    setShowCampaignModal(true);
                  }}
                  onEnd={() => handleEndCampaign(activeCampaign)}
                />
              ) : (
                <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground mb-4">No hay campaña activa</p>
                  <Button onClick={() => {
                    setEditingCampaign(null);
                    setShowCampaignModal(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Campaña
                  </Button>
                </div>
              )}
            </section>

            {/* Campaign Queue */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Cola de Campañas
                </h2>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setEditingCampaign(null);
                    setShowCampaignModal(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva
                </Button>
              </div>
              
              {upcomingCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {upcomingCampaigns.map((campaign, idx) => {
                    const startInfo = getTimeUntilStart(campaign.start_date);
                    const duration = getCampaignDuration(campaign.start_date, campaign.end_date);
                    
                    return (
                      <div
                        key={campaign.id}
                        className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateRange(campaign.start_date, campaign.end_date)} • {duration} días
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {campaign.discount_percent > 0 && (
                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
                              {campaign.discount_percent}% OFF
                            </span>
                          )}
                          <span className="text-sm text-blue-600">{startInfo.text}</span>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setEditingCampaign(campaign);
                                setShowCampaignModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleActivateCampaign(campaign)}
                              title="Activar ahora"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-6 text-center text-muted-foreground">
                  No hay campañas programadas
                </div>
              )}
            </section>

            {/* Timeline */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                Timeline de Campañas
              </h2>
              <CampaignTimeline campaigns={campaigns} activeCampaign={activeCampaign} />
            </section>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Todas las Campañas</h2>
              <Button onClick={() => {
                setEditingCampaign(null);
                setShowCampaignModal(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </div>

            <div className="grid gap-4">
              {campaigns.map((campaign) => {
                const status = getCampaignStatus(campaign);
                const timeInfo = status === 'active' 
                  ? getTimeRemaining(campaign.end_date) 
                  : status === 'scheduled'
                    ? getTimeUntilStart(campaign.start_date)
                    : null;
                
                return (
                  <div
                    key={campaign.id}
                    className={`bg-card border rounded-lg p-6 transition-colors ${
                      status === 'active' ? 'border-primary' : 
                      status === 'scheduled' ? 'border-blue-500/50' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            status === 'active' ? 'bg-green-500/10 text-green-600' :
                            status === 'scheduled' ? 'bg-blue-500/10 text-blue-600' :
                            status === 'ended' ? 'bg-muted text-muted-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {status === 'active' ? 'Activa' :
                             status === 'scheduled' ? 'Programada' :
                             status === 'ended' ? 'Terminada' : 'Inactiva'}
                          </span>
                          {campaign.discount_percent > 0 && (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                              {campaign.discount_percent}% OFF
                            </span>
                          )}
                          {timeInfo && (
                            <span className={`text-xs ${
                              status === 'active' && timeInfo.isUrgent ? 'text-amber-600' : 'text-muted-foreground'
                            }`}>
                              {timeInfo.text}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDateRange(campaign.start_date, campaign.end_date)}
                        </p>
                        {campaign.banner_message && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Banner:</span> {campaign.banner_message}
                          </p>
                        )}
                        {campaign.pricing_message && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Pricing:</span> {campaign.pricing_message}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {status === 'active' && (
                          <Button size="sm" variant="outline" onClick={() => handleEndCampaign(campaign)}>
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {status === 'scheduled' && (
                          <Button size="sm" variant="outline" onClick={() => handleActivateCampaign(campaign)}>
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingCampaign(campaign);
                            setShowCampaignModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteCampaign(campaign)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Planes de Precios</h2>
              <Button onClick={() => {
                setEditingPlan(null);
                setShowPlanModal(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Plan
              </Button>
            </div>

            {/* Price Preview with Campaign Discount */}
            {activeCampaign && activeCampaign.discount_percent > 0 && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium text-primary mb-2">
                  Campaña activa: {activeCampaign.name} ({activeCampaign.discount_percent}% OFF)
                </p>
                <p className="text-xs text-muted-foreground">
                  Los precios mostrados en la web tienen el descuento aplicado automáticamente.
                </p>
              </div>
            )}

            <div className="grid gap-4">
              {plans.map((plan) => {
                const discountedPrice = activeCampaign?.discount_percent 
                  ? Math.round(plan.price * (1 - activeCampaign.discount_percent / 100))
                  : plan.price;
                
                return (
                  <div key={plan.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                            {plan.slug}
                          </span>
                          {plan.is_popular && (
                            <span className="px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded">
                              Popular
                            </span>
                          )}
                          {!plan.is_active && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-xl mb-1">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                        <div className="flex items-baseline gap-2">
                          {activeCampaign?.discount_percent ? (
                            <>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(plan.price)}
                              </span>
                              <span className="text-2xl font-bold text-primary">
                                {formatPrice(discountedPrice)}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-primary">
                              {formatPrice(plan.price)}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">MXN</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingPlan(plan);
                            setShowPlanModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeletePlan(plan)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Addons Tab */}
        {activeTab === 'addons' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add-ons Disponibles</h2>
              <Button onClick={() => {
                setEditingAddon(null);
                setShowAddonModal(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Add-on
              </Button>
            </div>

            <div className="grid gap-4">
              {addons.map((addon) => (
                <div key={addon.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{addon.icon || '✨'}</span>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">{addon.name}</h3>
                          {addon.badge && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                              {addon.badge}
                            </span>
                          )}
                          {!addon.is_active && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{addon.description}</p>
                        <span className="text-lg font-bold text-primary">
                          {addon.price_max 
                            ? `${formatPrice(addon.price)} - ${formatPrice(addon.price_max)}`
                            : formatPrice(addon.price)}
                          {addon.billing_type === 'monthly' && '/mes'}
                          {addon.billing_type === 'yearly' && '/año'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingAddon(addon);
                          setShowAddonModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteAddon(addon)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rush Fees Tab */}
        {activeTab === 'rush-fees' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Rush Fees (Markups por Urgencia)</h2>
                <p className="text-sm text-muted-foreground">Configura los markups por tiempo de entrega y plan</p>
              </div>
              <Button 
                onClick={() => {
                  setEditingRushFee(null);
                  setShowRushFeeModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Rush Fee
              </Button>
            </div>

            {/* Rush Fees Table */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-sm">Plan</th>
                    <th className="text-left px-4 py-3 font-medium text-sm">Timeline</th>
                    <th className="text-left px-4 py-3 font-medium text-sm">Display Name</th>
                    <th className="text-right px-4 py-3 font-medium text-sm">Markup %</th>
                    <th className="text-center px-4 py-3 font-medium text-sm">Días</th>
                    <th className="text-center px-4 py-3 font-medium text-sm">Estado</th>
                    <th className="text-right px-4 py-3 font-medium text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rushFees.map((rf) => (
                    <tr key={rf.id} className={!rf.is_active ? 'opacity-50' : ''}>
                      <td className="px-4 py-3">
                        <span className="font-medium">{rf.plan_slug}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rf.timeline_id === 'urgent' ? 'bg-amber-500/20 text-amber-600' :
                          rf.timeline_id === 'week' ? 'bg-blue-500/20 text-blue-600' :
                          rf.timeline_id === 'month' ? 'bg-green-500/20 text-green-600' :
                          'bg-gray-500/20 text-gray-600'
                        }`}>
                          {rf.timeline_id === 'urgent' ? '🔥 Urgente' :
                           rf.timeline_id === 'week' ? '⚡ Esta semana' :
                           rf.timeline_id === 'month' ? '📅 Este mes' : '🌿 Flexible'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {rf.display_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rf.markup_percent > 0 ? (
                          <span className="font-bold text-amber-600">+{rf.markup_percent}%</span>
                        ) : (
                          <span className="text-muted-foreground">0%</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {rf.delivery_days_min && rf.delivery_days_max 
                          ? `${rf.delivery_days_min}-${rf.delivery_days_max}` 
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {rf.is_active ? (
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-600 text-xs font-medium">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingRushFee(rf);
                              setShowRushFeeModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteRushFee(rf)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rushFees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay rush fees configurados
                </div>
              )}
            </div>

            {/* Price Preview */}
            {plans.length > 0 && rushFees.length > 0 && (
              <div className="mt-8 bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Vista Previa de Precios con Rush Fee
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Plan</th>
                        <th className="text-right py-2 px-2">Base</th>
                        <th className="text-right py-2 px-2">🔥 Urgente</th>
                        <th className="text-right py-2 px-2">⚡ Esta Semana</th>
                        <th className="text-right py-2 px-2">📅 Este Mes</th>
                        <th className="text-right py-2 px-2">🌿 Flexible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.filter(p => p.is_active).map((plan) => {
                        const getMarkup = (timelineId: string) => {
                          const rf = rushFees.find(r => r.plan_slug === plan.slug && r.timeline_id === timelineId);
                          return rf?.markup_percent || 0;
                        };
                        const calcPrice = (markup: number) => Math.round(plan.price * (1 + markup / 100));
                        
                        return (
                          <tr key={plan.id} className="border-b border-border/50">
                            <td className="py-2 px-2 font-medium">{plan.name}</td>
                            <td className="py-2 px-2 text-right">{formatPrice(plan.price)}</td>
                            <td className="py-2 px-2 text-right text-amber-600 font-medium">
                              {formatPrice(calcPrice(getMarkup('urgent')))}
                              {getMarkup('urgent') > 0 && <span className="text-xs ml-1">(+{getMarkup('urgent')}%)</span>}
                            </td>
                            <td className="py-2 px-2 text-right text-blue-600 font-medium">
                              {formatPrice(calcPrice(getMarkup('week')))}
                              {getMarkup('week') > 0 && <span className="text-xs ml-1">(+{getMarkup('week')}%)</span>}
                            </td>
                            <td className="py-2 px-2 text-right text-green-600 font-medium">
                              {formatPrice(calcPrice(getMarkup('month')))}
                            </td>
                            <td className="py-2 px-2 text-right text-muted-foreground">
                              {formatPrice(calcPrice(getMarkup('flexible')))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          campaign={editingCampaign}
          plans={plans}
          onClose={() => {
            setShowCampaignModal(false);
            setEditingCampaign(null);
          }}
          onSave={handleSaveCampaign}
        />
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <PlanModal
          plan={editingPlan}
          onClose={() => {
            setShowPlanModal(false);
            setEditingPlan(null);
          }}
          onSave={handleSavePlan}
        />
      )}

      {/* Addon Modal */}
      {showAddonModal && (
        <AddonModal
          addon={editingAddon}
          onClose={() => {
            setShowAddonModal(false);
            setEditingAddon(null);
          }}
          onSave={handleSaveAddon}
        />
      )}

      {/* Rush Fee Modal */}
      {showRushFeeModal && (
        <RushFeeModal
          rushFee={editingRushFee}
          plans={plans}
          onClose={() => {
            setShowRushFeeModal(false);
            setEditingRushFee(null);
          }}
          onSave={handleSaveRushFee}
        />
      )}
    </div>
  );
}

// Active Campaign Card Component
function ActiveCampaignCard({ 
  campaign, 
  plans,
  onEdit, 
  onEnd 
}: { 
  campaign: Campaign; 
  plans: Plan[];
  onEdit: () => void; 
  onEnd: () => void;
}) {
  const timeInfo = getTimeRemaining(campaign.end_date);

  return (
    <div className="bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary rounded-xl overflow-hidden">
      {/* Header with Countdown */}
      <div className="bg-primary/5 border-b border-primary/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="font-semibold text-primary">ACTIVA</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            timeInfo.isUrgent 
              ? 'bg-amber-500/10 text-amber-600' 
              : 'bg-blue-500/10 text-blue-600'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-bold">{timeInfo.text}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-1">{campaign.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDateRange(campaign.start_date, campaign.end_date)}
            </p>
          </div>
          {campaign.discount_percent > 0 && (
            <div className="text-right">
              <div className="text-4xl font-extrabold text-primary">
                {campaign.discount_percent}%
              </div>
              <div className="text-sm text-muted-foreground">OFF</div>
            </div>
          )}
        </div>

        {/* Messages Preview */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {campaign.banner_message && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Banner Superior</p>
              <p className="text-sm">{campaign.banner_message}</p>
              {campaign.banner_cta && (
                <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {campaign.banner_cta}
                </span>
              )}
            </div>
          )}
          {campaign.pricing_message && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Sección Pricing</p>
              <p className="text-sm">{campaign.pricing_message}</p>
            </div>
          )}
        </div>

        {/* Price Preview */}
        {campaign.discount_percent > 0 && plans.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground mb-3">Vista Previa de Precios</p>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {plans.filter(p => p.is_active).map((plan) => {
                const discounted = Math.round(plan.price * (1 - campaign.discount_percent / 100));
                const savings = plan.price - discounted;
                return (
                  <div key={plan.id} className="flex-shrink-0 p-3 bg-background rounded-lg border border-border min-w-[140px]">
                    <p className="text-xs font-medium text-muted-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground line-through">{formatPrice(plan.price)}</p>
                    <p className="text-lg font-bold text-primary">{formatPrice(discounted)}</p>
                    <p className="text-xs text-green-600">Ahorras {formatPrice(savings)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onEdit} className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={onEnd} className="text-destructive hover:text-destructive">
            <Pause className="w-4 h-4 mr-2" />
            Terminar Ahora
          </Button>
        </div>
      </div>
    </div>
  );
}

// Campaign Timeline Component
function CampaignTimeline({ campaigns, activeCampaign }: { campaigns: Campaign[]; activeCampaign: Campaign | null }) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const totalDays = Math.ceil((endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24));

  const getPosition = (date: string) => {
    const d = new Date(date);
    const daysDiff = Math.ceil((d.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(100, (daysDiff / totalDays) * 100));
  };

  const relevantCampaigns = campaigns.filter(c => {
    const end = new Date(c.end_date);
    return end >= startOfMonth;
  });

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Month Labels */}
      <div className="flex justify-between mb-4 text-sm text-muted-foreground">
        <span>{startOfMonth.toLocaleDateString('es-MX', { month: 'long' })}</span>
        <span>{new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('es-MX', { month: 'long' })}</span>
      </div>

      {/* Timeline */}
      <div className="relative h-32 bg-muted/30 rounded-lg overflow-hidden">
        {/* Today marker */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 z-20"
          style={{ left: `${getPosition(now.toISOString())}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rounded-full" />
        </div>

        {/* Campaign bars */}
        {relevantCampaigns.map((campaign, idx) => {
          const left = getPosition(campaign.start_date);
          const right = 100 - getPosition(campaign.end_date);
          const isActive = campaign.id === activeCampaign?.id;
          
          return (
            <div
              key={campaign.id}
              className={`absolute h-8 rounded-md flex items-center px-2 text-xs font-medium ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-primary/30 text-foreground'
              }`}
              style={{
                left: `${left}%`,
                right: `${right}%`,
                top: `${12 + idx * 28}px`,
              }}
              title={`${campaign.name}: ${formatDateRange(campaign.start_date, campaign.end_date)}`}
            >
              <span className="truncate">{campaign.name}</span>
              {campaign.discount_percent > 0 && (
                <span className="ml-1 flex-shrink-0">({campaign.discount_percent}%)</span>
              )}
            </div>
          );
        })}

        {relevantCampaigns.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No hay campañas en este período
          </div>
        )}
      </div>
    </div>
  );
}

// Campaign Modal Component
function CampaignModal({ 
  campaign, 
  plans,
  onClose, 
  onSave 
}: { 
  campaign: Campaign | null;
  plans: Plan[];
  onClose: () => void;
  onSave: (data: CampaignFormData) => void;
}) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: campaign ? {
      name: campaign.name,
      discount_percent: campaign.discount_percent,
      banner_message: campaign.banner_message,
      banner_cta: campaign.banner_cta,
      pricing_message: campaign.pricing_message,
      start_date: campaign.start_date.slice(0, 16),
      end_date: campaign.end_date.slice(0, 16),
      is_active: campaign.is_active,
      priority: campaign.priority,
    } : {
      name: '',
      discount_percent: 0,
      banner_message: '',
      banner_cta: 'Cotizar Ahora',
      pricing_message: '',
      start_date: '',
      end_date: '',
      is_active: true,
      priority: 5,
    },
  });

  const discountPercent = watch('discount_percent');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {campaign ? 'Editar Campaña' : 'Nueva Campaña'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la Campaña *</label>
            <input
              {...register('name')}
              placeholder="Ej: Black Friday 2025"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descuento (%)</label>
            <input
              type="range"
              {...register('discount_percent', { valueAsNumber: true })}
              min={0}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span className="font-bold text-primary text-lg">{discountPercent}% OFF</span>
              <span>50%</span>
            </div>
          </div>

          {/* Price Preview */}
          {discountPercent > 0 && plans.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-3">Vista Previa de Precios</p>
              <div className="grid grid-cols-3 gap-3">
                {plans.filter(p => p.is_active).map((plan) => {
                  const discounted = Math.round(plan.price * (1 - discountPercent / 100));
                  return (
                    <div key={plan.id} className="text-center">
                      <p className="text-xs text-muted-foreground">{plan.name}</p>
                      <p className="text-xs line-through text-muted-foreground">{formatPrice(plan.price)}</p>
                      <p className="text-lg font-bold text-primary">{formatPrice(discounted)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Mensaje del Banner</label>
            <input
              {...register('banner_message')}
              placeholder="Ej: 🔥 Black Friday: 30% OFF en todos los planes"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">CTA del Banner</label>
            <input
              {...register('banner_cta')}
              placeholder="Ej: Cotizar Ahora"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mensaje de Pricing</label>
            <input
              {...register('pricing_message')}
              placeholder="Ej: Aprovecha 30% de descuento en todos los planes"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Inicio *</label>
              <input
                type="datetime-local"
                {...register('start_date')}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.start_date && <p className="text-xs text-destructive mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Fin *</label>
              <input
                type="datetime-local"
                {...register('end_date')}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.end_date && <p className="text-xs text-destructive mt-1">{errors.end_date.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prioridad (1-100)</label>
              <input
                type="number"
                {...register('priority', { valueAsNumber: true })}
                min={1}
                max={100}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium">Activa</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Plan Modal Component
function PlanModal({ plan, onClose, onSave }: { plan: Plan | null; onClose: () => void; onSave: (data: PlanFormData) => void }) {
  const [newFeature, setNewFeature] = useState('');
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: plan ? {
      name: plan.name,
      slug: plan.slug,
      subtitle: plan.subtitle,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      features: plan.features,
      delivery_days: plan.delivery_days,
      support_days: plan.support_days,
      revision_rounds: plan.revision_rounds,
      is_popular: plan.is_popular,
      display_order: plan.display_order,
      is_active: plan.is_active,
    } : {
      name: '',
      slug: '',
      subtitle: null,
      description: null,
      price: 0,
      currency: 'MXN',
      features: [],
      delivery_days: null,
      support_days: null,
      revision_rounds: null,
      is_popular: false,
      display_order: 0,
      is_active: true,
    },
  });

  const features = watch('features') || [];

  const addFeature = () => {
    if (newFeature.trim()) {
      setValue('features', [...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setValue('features', features.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{plan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input {...register('name')} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <input {...register('slug')} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
              {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea {...register('description')} rows={2} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Precio (MXN) *</label>
              <input type="number" {...register('price', { valueAsNumber: true })} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Días entrega</label>
              <input type="number" {...register('delivery_days', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Revisiones</label>
              <input type="number" {...register('revision_rounds', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Características *</label>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input value={feature} onChange={(e) => { const u = [...features]; u[index] = e.target.value; setValue('features', u); }} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(index)}><X className="w-4 h-4" /></Button>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="Nueva característica..." className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                <Button type="button" onClick={addFeature} size="sm"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            {errors.features && <p className="text-xs text-destructive mt-1">{errors.features.message}</p>}
          </div>
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2"><input type="checkbox" {...register('is_popular')} className="w-4 h-4 rounded" /><span className="text-sm">Popular</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded" /><span className="text-sm">Activo</span></label>
          </div>
          <div className="flex gap-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1"><Save className="w-4 h-4 mr-2" />Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Addon Modal Component
function AddonModal({ addon, onClose, onSave }: { addon: Addon | null; onClose: () => void; onSave: (data: AddonFormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<AddonFormData>({
    resolver: zodResolver(addonSchema),
    defaultValues: addon ? {
      name: addon.name,
      slug: addon.slug,
      icon: addon.icon,
      description: addon.description,
      price: addon.price,
      price_max: addon.price_max,
      currency: addon.currency,
      billing_type: addon.billing_type as any,
      badge: addon.badge,
      display_order: addon.display_order,
      is_active: addon.is_active,
    } : {
      name: '',
      slug: '',
      icon: null,
      description: null,
      price: 0,
      price_max: null,
      currency: 'MXN',
      billing_type: 'one-time',
      badge: null,
      display_order: 0,
      is_active: true,
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{addon ? 'Editar Add-on' : 'Nuevo Add-on'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input {...register('name')} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <input {...register('slug')} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
              {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Icono (emoji)</label>
              <input {...register('icon')} placeholder="✨" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Badge</label>
              <input {...register('badge')} placeholder="Popular" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea {...register('description')} rows={2} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Precio base *</label>
              <input type="number" {...register('price', { valueAsNumber: true })} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Precio máximo</label>
              <input type="number" {...register('price_max', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Facturación</label>
              <select {...register('billing_type')} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none">
                <option value="one-time">Una vez</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded" />
            <span className="text-sm font-medium">Activo</span>
          </div>
          <div className="flex gap-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1"><Save className="w-4 h-4 mr-2" />Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Rush Fee Modal Component
function RushFeeModal({ 
  rushFee, 
  plans,
  onClose, 
  onSave 
}: { 
  rushFee: RushFee | null; 
  plans: Plan[];
  onClose: () => void; 
  onSave: (data: RushFeeFormData) => void;
}) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RushFeeFormData>({
    resolver: zodResolver(rushFeeSchema),
    defaultValues: rushFee ? {
      plan_slug: rushFee.plan_slug,
      timeline_id: rushFee.timeline_id as any,
      markup_percent: rushFee.markup_percent,
      markup_fixed: rushFee.markup_fixed,
      display_name: rushFee.display_name,
      description: rushFee.description,
      delivery_days_min: rushFee.delivery_days_min,
      delivery_days_max: rushFee.delivery_days_max,
      display_order: rushFee.display_order,
      is_active: rushFee.is_active,
    } : {
      plan_slug: '',
      timeline_id: 'urgent',
      markup_percent: 0,
      markup_fixed: null,
      display_name: '',
      description: '',
      delivery_days_min: null,
      delivery_days_max: null,
      display_order: 0,
      is_active: true,
    },
  });

  const selectedPlanSlug = watch('plan_slug');
  const selectedPlan = plans.find(p => p.slug === selectedPlanSlug);
  const markupPercent = watch('markup_percent') || 0;
  const previewPrice = selectedPlan ? Math.round(selectedPlan.price * (1 + markupPercent / 100)) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{rushFee ? 'Editar Rush Fee' : 'Nuevo Rush Fee'}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit(onSave)} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plan *</label>
              <select
                {...register('plan_slug')}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="">Seleccionar plan...</option>
                {plans.filter(p => p.is_active).map(plan => (
                  <option key={plan.id} value={plan.slug}>{plan.name}</option>
                ))}
              </select>
              {errors.plan_slug && <p className="text-xs text-destructive mt-1">{errors.plan_slug.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Timeline *</label>
              <select
                {...register('timeline_id')}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="urgent">Lo antes posible (Urgente)</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="flexible">Flexible</option>
              </select>
              {errors.timeline_id && <p className="text-xs text-destructive mt-1">{errors.timeline_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Markup % *</label>
              <input
                type="number"
                step="0.01"
                {...register('markup_percent', { valueAsNumber: true })}
                className="w-full p-2 border rounded-lg bg-background"
                placeholder="0"
              />
              {errors.markup_percent && <p className="text-xs text-destructive mt-1">{errors.markup_percent.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                type="text"
                {...register('display_name')}
                className="w-full p-2 border rounded-lg bg-background"
                placeholder="Express Premium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dias minimos</label>
              <input
                type="number"
                {...register('delivery_days_min', { valueAsNumber: true })}
                className="w-full p-2 border rounded-lg bg-background"
                placeholder="3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dias maximos</label>
              <input
                type="number"
                {...register('delivery_days_max', { valueAsNumber: true })}
                className="w-full p-2 border rounded-lg bg-background"
                placeholder="5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripcion</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full p-2 border rounded-lg bg-background"
              placeholder="Entrega prioritaria con atencion dedicada"
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('is_active')} id="rushFee-is-active" />
            <label htmlFor="rushFee-is-active" className="text-sm">Activo</label>
          </div>

          {/* Price Preview */}
          {selectedPlan && markupPercent > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 border">
              <h4 className="text-sm font-medium mb-2">Vista Previa</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{selectedPlan.name}</span>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground line-through mr-2">{formatPrice(selectedPlan.price)}</span>
                  <span className="font-bold text-amber-600">{formatPrice(previewPrice)}</span>
                  <span className="text-xs text-amber-600 ml-1">(+{markupPercent}%)</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
