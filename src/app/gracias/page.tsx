"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle, 
  MessageSquare, 
  Clock, 
  ArrowRight,
  Phone,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackThankYouPage, trackWhatsAppClick } from "@/lib/tracking-events";

function GraciasContent() {
  const searchParams = useSearchParams();
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    // Get plan info from URL params if available
    const plan = searchParams.get("plan");
    if (plan) {
      setPlanName(plan);
    }

    // Track thank you page view for conversions
    trackThankYouPage({
      planName: plan || undefined,
    });
  }, [searchParams]);

  const handleWhatsAppClick = () => {
    trackWhatsAppClick("gracias_page");
    window.open(
      "https://wa.me/528116364522?text=Hola!%20Acabo%20de%20enviar%20mi%20solicitud%20de%20cotización%20y%20me%20gustaría%20confirmar%20los%20detalles.",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
      
      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            ¡Solicitud Recibida! 🎉
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground mb-8"
          >
            {planName 
              ? `Tu solicitud para el plan ${planName} ha sido enviada exitosamente.`
              : "Tu solicitud de cotización ha sido enviada exitosamente."
            }
            <br />
            Nos pondremos en contacto contigo lo antes posible.
          </motion.p>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-2xl p-6 mb-8"
          >
            <h2 className="font-semibold mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Próximos Pasos
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium">Revisión de tu solicitud</p>
                  <p className="text-sm text-muted-foreground">
                    Nuestro equipo revisará los detalles de tu cotización.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium">Contacto en menos de 2 horas</p>
                  <p className="text-sm text-muted-foreground">
                    Te escribiremos por WhatsApp para confirmar detalles y resolver dudas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium">Propuesta personalizada</p>
                  <p className="text-sm text-muted-foreground">
                    Recibirás una propuesta ajustada a tus necesidades específicas.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={handleWhatsAppClick}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
              size="lg"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Escribir por WhatsApp
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              size="lg"
              onClick={() => {
                window.open(
                  "https://app.reclaim.ai/m/diego-garza/flexible-quick-meeting",
                  "_blank"
                );
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Llamada
            </Button>
          </motion.div>

          {/* Back to home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Volver al inicio
            </Link>
          </motion.div>

          {/* Trust elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 pt-8 border-t border-border"
          >
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Respuesta en menos de 2 horas</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+52 81 1636 4522</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <p>© {new Date().getFullYear()} SitioExpress.mx - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}

export default function GraciasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <GraciasContent />
    </Suspense>
  );
}

