"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function ExitIntentPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving through the top of the viewport
      // This is a strong indicator they're about to close the tab
      if (e.clientY <= 0) {
        if (typeof window === 'undefined') return;

        // Check if we've shown the popup recently (within last 60 seconds)
        const lastShown = sessionStorage.getItem('exitIntentLastShown');
        if (lastShown) {
          const timeSinceLastShown = Date.now() - parseInt(lastShown, 10);
          if (timeSinceLastShown < 60000) {
            return; // Don't show if shown within last 60 seconds
          }
        }

        // Check if user has been on page for at least 5 seconds
        const timeOnPage = sessionStorage.getItem('pageLoadTime');
        if (timeOnPage) {
          const timeDiff = Date.now() - parseInt(timeOnPage, 10);
          if (timeDiff < 5000) {
            return; // Don't show if they've been on page less than 5 seconds
          }
        }

        // Check if they've scrolled down at least a bit (engaged user)
        const scrollPosition = window.scrollY;
        if (scrollPosition < 100) {
          return; // Don't show if they haven't scrolled at all
        }

        setShowPopup(true);
        sessionStorage.setItem('exitIntentLastShown', Date.now().toString());
      }
    };

    // Store page load time
    if (typeof window !== 'undefined') {
      if (!sessionStorage.getItem('pageLoadTime')) {
        sessionStorage.setItem('pageLoadTime', Date.now().toString());
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleGoToQuote = () => {
    setShowPopup(false);
    // Scroll to cotizador
    setTimeout(() => {
      const cotizador = document.getElementById('cotizador');
      if (cotizador) {
        cotizador.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent className="sm:max-w-md border-2 border-primary/20" showCloseButton={false}>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <DialogTitle className="text-xl font-bold">
                  ¡Espera! No te vayas aún 🚀
                </DialogTitle>
              </div>
              <DialogDescription className="text-base pt-2">
                <p className="text-foreground mb-4">
                  Estás a solo <span className="font-bold text-primary">30 segundos</span> de obtener tu{" "}
                  <span className="font-bold text-primary">cotización instantánea</span> y descubrir cuánto cuesta tu sitio web profesional.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Sin compromiso:</span> Es solo una estimación inicial
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Gratis:</span> No te costará nada obtener tu cotización
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Rápido:</span> En menos de 30 segundos tendrás tu respuesta
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                onClick={handleGoToQuote}
                className="flex-1 bg-primary hover:bg-primary/90 rounded-full"
                size="lg"
              >
                Obtener mi cotización ahora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="rounded-full"
                size="lg"
              >
                Tal vez después
              </Button>
            </div>
          </DialogContent>
        </Dialog>
  );
}

