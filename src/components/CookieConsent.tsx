"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    // Check if user has already made a choice
    if (typeof window === "undefined") return;

    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
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

    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: prefs }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="mx-auto max-w-4xl">
            <div className="bg-card border-2 border-border rounded-2xl shadow-2xl p-6 md:p-8">
              {!showSettings ? (
                <>
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Cookie className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-2">
                        Uso de Cookies y Tecnologías de Seguimiento
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Utilizamos cookies y tecnologías similares para mejorar tu experiencia, 
                        analizar el uso del sitio y personalizar contenido. Al hacer clic en 
                        "Aceptar todas", aceptas el uso de todas las cookies. Puedes gestionar 
                        tus preferencias en cualquier momento.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBanner(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      aria-label="Cerrar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cookie Types */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-2">Necesarias</h4>
                      <p className="text-xs text-muted-foreground">
                        Esenciales para el funcionamiento del sitio. Siempre activas.
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-2">Analíticas</h4>
                      <p className="text-xs text-muted-foreground">
                        Nos ayudan a entender cómo los visitantes interactúan con el sitio.
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-2">Marketing</h4>
                      <p className="text-xs text-muted-foreground">
                        Utilizadas para mostrar anuncios relevantes y medir campañas.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-primary hover:bg-primary/90 rounded-full"
                    >
                      Aceptar todas
                    </Button>
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="flex-1 rounded-full"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Personalizar
                    </Button>
                    <Button
                      onClick={handleRejectOptional}
                      variant="ghost"
                      className="rounded-full"
                    >
                      Solo necesarias
                    </Button>
                  </div>

                  {/* Privacy Link */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      Al continuar, aceptas nuestra{" "}
                      <Link href="/privacidad" className="text-primary hover:underline">
                        Política de Privacidad
                      </Link>
                      {" y "}
                      <Link href="/terminos" className="text-primary hover:underline">
                        Términos de Servicio
                      </Link>
                      .
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Settings View */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-2">
                        Preferencias de Cookies
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Selecciona qué tipos de cookies deseas aceptar.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      aria-label="Cerrar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-4 mb-6">
                    {/* Necessary - Always on */}
                    <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Cookies Necesarias</h4>
                        <p className="text-sm text-muted-foreground">
                          Estas cookies son esenciales para el funcionamiento del sitio web 
                          y no se pueden desactivar.
                        </p>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-6 bg-primary rounded-full flex items-center justify-end px-1">
                          <div className="w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* Analytics */}
                    <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Cookies Analíticas</h4>
                        <p className="text-sm text-muted-foreground">
                          Nos ayudan a entender cómo los visitantes usan nuestro sitio web 
                          (Google Analytics).
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() =>
                            setPreferences((p) => ({ ...p, analytics: !p.analytics }))
                          }
                          className={`w-12 h-6 rounded-full transition-colors ${
                            preferences.analytics ? "bg-primary" : "bg-muted"
                          } flex items-center ${
                            preferences.analytics ? "justify-end" : "justify-start"
                          } px-1`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full" />
                        </button>
                      </div>
                    </div>

                    {/* Marketing */}
                    <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Cookies de Marketing</h4>
                        <p className="text-sm text-muted-foreground">
                          Utilizadas para mostrar anuncios relevantes y medir la efectividad 
                          de nuestras campañas (Facebook Pixel).
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() =>
                            setPreferences((p) => ({ ...p, marketing: !p.marketing }))
                          }
                          className={`w-12 h-6 rounded-full transition-colors ${
                            preferences.marketing ? "bg-primary" : "bg-muted"
                          } flex items-center ${
                            preferences.marketing ? "justify-end" : "justify-start"
                          } px-1`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveSettings}
                    className="w-full bg-primary hover:bg-primary/90 rounded-full"
                  >
                    Guardar Preferencias
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

