"use client";

import { Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const RECLAIM_CALENDAR_URL = "https://app.reclaim.ai/m/diego-garza/flexible-quick-meeting";

interface ScheduleCallButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
  text?: string;
}

export function ScheduleCallButton({
  variant = "outline",
  size = "default",
  className = "",
  showIcon = true,
  text = "Agendar llamada de 15-30 min",
}: ScheduleCallButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => window.open(RECLAIM_CALENDAR_URL, "_blank")}
      asChild
    >
      <a href={RECLAIM_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
        {showIcon && <Calendar className="w-4 h-4 mr-2" />}
        {text}
      </a>
    </Button>
  );
}

interface ScheduleCallCardProps {
  className?: string;
}

export function ScheduleCallCard({ className = "" }: ScheduleCallCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-xl p-6 border border-primary/20 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">¿Prefieres hablar directamente?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Agenda una llamada de 15-30 minutos para discutir tu proyecto en detalle y recibir recomendaciones personalizadas.
          </p>
          <ScheduleCallButton size="sm" />
        </div>
      </div>
    </motion.div>
  );
}

