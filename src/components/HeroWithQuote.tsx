"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteWizard } from "./QuoteWizard";
import { TrustBadges } from "./TrustBadges";
import { ScheduleCallButton } from "./ScheduleCallButton";
import Link from "next/link";

export function HeroWithQuote() {
  const [initialPlan, setInitialPlan] = useState<string | undefined>();
  const [initialAddons, setInitialAddons] = useState<string[]>([]);

  useEffect(() => {
    // Get URL params from window.location for client-side
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get('plan');
      const addonParam = params.get('addon');
      
      if (planParam) {
        setInitialPlan(planParam);
      }
      
      if (addonParam) {
        setInitialAddons([addonParam]);
      }
    }
  }, []);
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lavender/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lavender/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:py-12">
        {/* Hero Content */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Tu web profesional lista en 2-30 días hábiles según tu plan
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Creamos webs que
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-gradient"
            >
              impulsan ventas
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8"
          >
            Diseño premium, desarrollo rápido y resultados medibles. 
            Transformamos tu visión en una presencia digital que convierte visitantes en clientes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 md:mb-8"
          >
            <Button
              size="lg"
              className="border-beam rounded-full px-8 h-14 text-lg group"
              onClick={() => {
                document.getElementById("cotizador")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Cotización Instantánea
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center mb-6"
          >
            <ScheduleCallButton 
              variant="ghost" 
              size="sm"
              text="agenda una llamada de 15-30 min"
              className="text-sm"
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-12"
          >
            <TrustBadges />
          </motion.div>
        </div>

        {/* Cotizador */}
        <div id="cotizador" className="w-full flex items-start justify-center">
          <div className="w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-center mb-8"
            >
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Cotizador Instantáneo
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                Completa tu <span className="text-gradient">Solicitud</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
                Selecciona tu plan, personaliza con add-ons y obtén tu cotización instantánea en menos de 30 segundos
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span>✓</span> Sin compromiso
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <span>✓</span> Ajustable a tu criterio
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <span>✓</span> Sin pago inicial
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
                Tu solicitud se enviará por WhatsApp para contacto directo. Podrás ajustar cualquier detalle cuando te contactemos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="bg-card border border-border rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl"
            >
              <QuoteWizard initialPlan={initialPlan} initialAddons={initialAddons} />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}

