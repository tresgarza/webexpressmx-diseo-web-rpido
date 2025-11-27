'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { QuoteDashboard } from '@/components/QuoteDashboard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Zap, LogOut } from 'lucide-react';

export default function CotizacionesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    checkAuth();
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
        toast.error(`Error: ${error.message}`);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Sesión cerrada');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
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
              <h1 className="text-2xl font-bold">Cotizaciones</h1>
              <p className="text-sm text-muted-foreground">Dashboard de Cotizaciones</p>
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
              <h1 className="text-xl font-bold">Cotizaciones</h1>
              <p className="text-xs text-muted-foreground">Dashboard de Cotizaciones en Vivo</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <QuoteDashboard />
      </div>
    </div>
  );
}





