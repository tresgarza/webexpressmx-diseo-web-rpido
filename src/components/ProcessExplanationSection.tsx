"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { ProcessTimeline } from "./ProcessTimeline";
import { ScheduleCallCard } from "./ScheduleCallButton";

export function ProcessExplanationSection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Cómo Funciona
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Proceso <span className="text-gradient">Simple y Rápido</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En solo 3 pasos completas tu solicitud y comenzamos tu proyecto
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <ProcessTimeline currentStep={1} totalSteps={3} />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: "Elige tu Plan",
              description: "Selecciona el plan base que mejor se adapte a tu proyecto y personaliza con add-ons opcionales según tus necesidades.",
              icon: CheckCircle2,
            },
            {
              step: 2,
              title: "Define tu Urgencia",
              description: "Elige cuándo necesitas tu proyecto. Ofrecemos opciones express con entrega prioritaria si lo necesitas rápido.",
              icon: CheckCircle2,
            },
            {
              step: 3,
              title: "Completa tus Datos",
              description: "Completa tu solicitud y te contactaremos por WhatsApp en menos de 2 horas para confirmar detalles y comenzar tu proyecto.",
              icon: CheckCircle2,
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 space-y-6"
        >
          <div className="text-center">
            <button
              onClick={() => {
                document.getElementById("cotizador")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-semibold"
            >
              Comenzar ahora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <ScheduleCallCard />
        </motion.div>
      </div>
    </section>
  );
}




