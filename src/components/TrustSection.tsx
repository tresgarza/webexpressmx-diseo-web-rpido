"use client";

import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { ScheduleCallCard } from "./ScheduleCallButton";

export function TrustSection() {
  const testimonials = [
    {
      name: "Manuel Filizola",
      company: "Trasciende",
      role: "Socio",
      quote: "Necesitábamos una plataforma profesional para nuestro negocio de ahorro e inversión. SitioExpress entendió perfectamente nuestra visión y creó un sitio que transmite confianza y profesionalismo. El proceso fue rápido y el resultado superó nuestras expectativas.",
      rating: 5,
      website: "https://trasciende-web-design.vercel.app/",
      websiteDisplay: "trasciende-web-design.vercel.app",
    },
    {
      name: "Adolfo Medina",
      company: "Fincentiva",
      role: "Director General",
      quote: "Como empresa de crédito con descuento vía nómina, necesitábamos un sitio web que fuera claro, confiable y fácil de usar. SitioExpress logró crear una experiencia digital que refleja nuestros valores y facilita que nuestros clientes encuentren la información que necesitan.",
      rating: 5,
      website: "https://fincentiva.com.mx/",
      websiteDisplay: "fincentiva.com.mx",
    },
    {
      name: "Ronny Connor",
      company: "Tres Garza",
      role: "Director de Operaciones",
      quote: "Como comercializadora de productos de oficina y limpieza para la industria, nuestro sitio web es fundamental para mostrar nuestro catálogo. SitioExpress desarrolló una solución que nos permite gestionar nuestra presencia digital de manera eficiente y profesional.",
      rating: 5,
      website: "https://tresgarza.com/",
      websiteDisplay: "tresgarza.com",
    },
    {
      name: "Guillermo Martinez",
      company: "Fincerlex",
      role: "Abogado",
      quote: "Para nuestro despacho jurídico era crucial tener un sitio web que transmitiera seriedad y profesionalismo. SitioExpress logró crear una presencia digital que refleja nuestros valores y facilita que los clientes nos contacten con confianza.",
      rating: 5,
      website: "https://fincerlex.mx/",
      websiteDisplay: "fincerlex.mx",
    },
    {
      name: "Arnulfo Chavez",
      company: "Halcyon",
      role: "Director",
      quote: "Como distribuidor especializado en soluciones de seguridad contra ransomware, necesitábamos un sitio web técnico pero accesible. SitioExpress entendió la complejidad de nuestro negocio y creó una plataforma que comunica efectivamente nuestros servicios.",
      rating: 5,
      website: "https://halcyon.mx/",
      websiteDisplay: "halcyon.mx",
    },
    {
      name: "Marcos Rodriguez",
      company: "Fincentiva Automotriz",
      role: "Gerente de Ventas",
      quote: "El sitio web para nuestra división automotriz ha sido clave para aumentar nuestras ventas. SitioExpress desarrolló una plataforma intuitiva que permite a nuestros clientes explorar opciones de financiamiento de manera clara y eficiente.",
      rating: 5,
      website: "https://autos.fincentiva.com.mx/",
      websiteDisplay: "autos.fincentiva.com.mx",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Razones para Confiar
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Lo que dicen nuestros <span className="text-gradient">Clientes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Más de 150 proyectos entregados con excelentes resultados
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic flex-grow">"{testimonial.quote}"</p>
              <div className="border-t border-border pt-4 mt-auto">
                <p className="font-semibold mb-1">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  {testimonial.role}, {testimonial.company}
                </p>
                {testimonial.website && (
                  <a
                    href={testimonial.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors group"
                  >
                    <span>Ver sitio web</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-xs text-muted-foreground ml-1">({testimonial.websiteDisplay})</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <ScheduleCallCard />
        </motion.div>
      </div>
    </section>
  );
}

