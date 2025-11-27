"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, Settings, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      try {
        const savedPrefs = JSON.parse(consent);
        setPreferences(savedPrefs);
      } catch {
        // If parsing fails, use defaults
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSaveSettings = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs: typeof preferences) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cookie_consent", JSON.stringify(prefs));
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: prefs }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Compact horizontal banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                {/* Text content - Left side */}
                <div className="flex-1 flex items-start gap-3">
                  <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5 hidden sm:block" />
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-foreground font-medium">Usamos cookies</span> para mejorar tu experiencia y analizar el tráfico.{" "}
                    <button 
                      onClick={() => setShowSettings(true)}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Ver detalles
                    </button>
                    {" · "}
                    <Link href="/privacidad" className="text-primary hover:underline">
                      Política de Privacidad
                    </Link>
                  </div>
                </div>

                {/* Buttons - Right side */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 px-3 hidden sm:flex"
                  >
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    Personalizar
                  </Button>
                  <Button
                    onClick={handleRejectOptional}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3 border-muted-foreground/30"
                  >
                    Solo esenciales
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    size="sm"
                    className="text-xs h-8 px-4 bg-primary hover:bg-primary/90"
                  >
                    Aceptar todas
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Settings Modal/Drawer */}
          <AnimatePresence>
            {showSettings && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSettings(false)}
                  className="fixed inset-0 bg-black/50 z-[101]"
                />
                
                {/* Settings Panel */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-[102] bg-background rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
                >
                  {/* Handle bar */}
                  <div className="sticky top-0 bg-background pt-3 pb-2 px-4 border-b border-border">
                    <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Preferencias de Cookies</h3>
                      </div>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Selecciona qué tipos de cookies deseas permitir. Las cookies necesarias 
                      siempre están activas para garantizar el funcionamiento del sitio.
                    </p>

                    {/* Cookie options */}
                    <div className="space-y-3">
                      {/* Necessary */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 pr-4">
                          <h4 className="font-medium text-sm">Necesarias</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Esenciales para el funcionamiento del sitio
                          </p>
                        </div>
                        <div className="w-10 h-5 bg-primary rounded-full flex items-center justify-end px-0.5">
                          <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 pr-4">
                          <h4 className="font-medium text-sm">Analíticas</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Google Analytics para entender el uso del sitio
                          </p>
                        </div>
                        <button
                          onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                          className={`w-10 h-5 rounded-full transition-all ${
                            preferences.analytics ? "bg-primary" : "bg-muted-foreground/30"
                          } flex items-center ${
                            preferences.analytics ? "justify-end" : "justify-start"
                          } px-0.5`}
                        >
                          <motion.div 
                            layout
                            className="w-4 h-4 bg-white rounded-full shadow-sm" 
                          />
                        </button>
                      </div>

                      {/* Marketing */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 pr-4">
                          <h4 className="font-medium text-sm">Marketing</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Facebook Pixel para anuncios personalizados
                          </p>
                        </div>
                        <button
                          onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                          className={`w-10 h-5 rounded-full transition-all ${
                            preferences.marketing ? "bg-primary" : "bg-muted-foreground/30"
                          } flex items-center ${
                            preferences.marketing ? "justify-end" : "justify-start"
                          } px-0.5`}
                        >
                          <motion.div 
                            layout
                            className="w-4 h-4 bg-white rounded-full shadow-sm" 
                          />
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleRejectOptional}
                        variant="outline"
                        className="flex-1"
                      >
                        Solo esenciales
                      </Button>
                      <Button
                        onClick={handleSaveSettings}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        Guardar preferencias
                      </Button>
                    </div>

                    {/* Links */}
                    <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                      <Link href="/privacidad" className="hover:underline">Política de Privacidad</Link>
                      {" · "}
                      <Link href="/terminos" className="hover:underline">Términos de Servicio</Link>
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
