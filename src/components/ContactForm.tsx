"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackFormFieldChange } from "@/lib/quote-tracking";
import type { Plan, Addon, Campaign, RushFee } from "@/lib/supabase";
import type { TimelineOption } from "./TimelineSelector";

export type ContactData = {
  name: string;
  email: string;
  message?: string;
};

interface ContactFormProps {
  onSubmit: (data: ContactData) => Promise<void>;
  isSubmitting: boolean;
  plan: Plan | null;
  addons: Addon[];
  timeline: TimelineOption | null;
  campaign: Campaign | null;
  rushFee: RushFee | null;
}

export function ContactForm({
  onSubmit,
  isSubmitting,
  plan,
  addons,
  timeline,
}: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // Track form field changes in real-time
  useEffect(() => {
    if (name && name.length >= 2) {
      trackFormFieldChange(
        'name',
        name,
        4,
        plan?.id,
        addons.map(a => a.id),
        timeline?.id
      );
    }
  }, [name, plan?.id, addons, timeline?.id]);

  useEffect(() => {
    if (email && email.includes('@')) {
      trackFormFieldChange(
        'email',
        email,
        4,
        plan?.id,
        addons.map(a => a.id),
        timeline?.id
      );
    }
  }, [email, plan?.id, addons, timeline?.id]);

  const validateAndSubmit = async () => {
    const newErrors: { name?: string; email?: string } = {};
    
    if (!name || name.length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }
    
    if (!email || !email.includes('@') || !email.includes('.')) {
      newErrors.email = "Ingresa un email válido";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      await onSubmit({ name, email, message: message || undefined });
    }
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium mb-2">
          Nombre completo <span className="text-destructive">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
          }}
          className={`w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.name ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Juan Pérez"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium mb-2">
          Email <span className="text-destructive">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
          }}
          className={`w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.email ? 'border-destructive' : 'border-border'
          }`}
          placeholder="juan@ejemplo.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium mb-2">
          Mensaje adicional (opcional)
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Cuéntanos más sobre tu proyecto..."
        />
      </div>

      {/* Trust Elements */}
      <div className="space-y-2 md:space-y-3 pt-3 md:pt-4">
        <div className="bg-muted/50 rounded-xl p-3 md:p-4 border border-border">
          <p className="text-xs md:text-sm font-medium mb-1.5 md:mb-2 flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            Sin compromiso ni pago inicial
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Esta es solo una estimación inicial. Podrás ajustar cualquier detalle cuando te contactemos por WhatsApp. No se requiere pago hasta que confirmes el proyecto.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-muted text-muted-foreground">
            10+ proyectos entregados al mes
          </span>
          <span className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-muted text-muted-foreground">
            Respuesta en menos de 2 horas
          </span>
          <span className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-muted text-muted-foreground">
            Proyecto personalizable
          </span>
        </div>
      </div>

      <Button
        type="button"
        onClick={validateAndSubmit}
        disabled={isSubmitting}
        className="w-full rounded-full h-11 md:h-12 text-sm md:text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            Completar Solicitud y Enviar a WhatsApp
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}

