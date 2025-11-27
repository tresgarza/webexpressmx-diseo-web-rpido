"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
  Clock,
  Target,
  Rocket,
  Code,
  Palette,
  Globe,
  ShoppingCart,
  BarChart3,
  Phone,
  MapPin,
  Instagram,
  Linkedin,
  Twitter,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  Star,
  ChevronDown,
  Send,
  Calendar,
  MessageSquare,
  Building2,
  Briefcase,
  Store,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/lib/supabase";
import { PromoBanner } from "@/components/PromoBanner";
import { HeroWithQuote } from "@/components/HeroWithQuote";
import { TrustSection } from "@/components/TrustSection";
import { ProcessExplanationSection } from "@/components/ProcessExplanationSection";
import { StickyQuoteCTA } from "@/components/StickyQuoteCTA";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { getActiveCampaign, type Campaign } from "@/lib/campaigns";
import { 
  getAllPlans, 
  getAllAddons, 
  formatPrice, 
  formatPriceRange, 
  calculateCampaignDiscount,
  getRushFeesForPlan,
  getRushFee,
  calculateFinalPriceWithRush,
  formatDeliveryDays,
} from "@/lib/pricing";
import type { Plan, Addon, RushFee } from "@/lib/supabase";

// ============ HEADER ============
function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLinks = [
    { href: "#proceso", label: "Proceso" },
    { href: "#cotizador", label: "Cotizador" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Promo Banner - Above Navigation */}
      <PromoBanner />
      
      {/* Navigation Bar */}
      <div
        className={`transition-all duration-300 ${
        isScrolled
          ? "glass border-b border-border/50 py-3"
            : "bg-background/80 backdrop-blur-sm py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src="/logo-sitioexpress.png"
              alt="SitioExpress Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Sitio<span className="text-primary">Express</span>
            <span className="text-muted-foreground">.mx</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            link.href.startsWith('/') ? (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ) : (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
            )
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <Button 
            className="hidden md:flex border-beam rounded-full" 
            size="sm"
            onClick={() => {
              document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Iniciar Ahora
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/50"
          >
            <nav className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                link.href.startsWith('/') ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium py-2"
                  >
                    {link.label}
                  </Link>
                ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium py-2"
                >
                  {link.label}
                </a>
                )
              ))}
                <Button 
                  className="mt-4 rounded-full"
                  onClick={() => {
                    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                >
                  Comenzar Proyecto
                </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </header>
  );
}

// ============ ANIMATED TEXT ============
function AnimatedText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: i * 0.03, duration: 0.4, ease: "easeOut" }}
          className="inline-block"
          style={{ transformOrigin: "bottom" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

// ============ HERO SECTION ============
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lavender/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lavender/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Tu web profesional lista en 2-30 días hábiles según tu plan</span>
          </motion.div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          <AnimatedText text="Creamos webs que" />
          <br />
          <span className="text-gradient">
            <AnimatedText text="impulsan ventas" />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
        >
          Diseño premium, desarrollo rápido y resultados medibles. 
          Transformamos tu visión en una presencia digital que convierte visitantes en clientes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            size="lg" 
            className="border-beam rounded-full px-8 h-14 text-lg group"
            onClick={() => {
              document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Cotización Instantánea
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20"
        >
          {[
            { value: "150+", label: "Proyectos Entregados" },
            { value: "7", label: "Días Promedio" },
            { value: "98%", label: "Clientes Satisfechos" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============ FLASHLIGHT CARD ============
function FlashlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`flashlight-card bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============ QUÉ HACEMOS SECTION ============
function ServicesSection() {
  const services = [
    {
      icon: Globe,
      title: "Landing Pages",
      description: "Páginas de aterrizaje optimizadas para convertir visitantes en leads y clientes.",
    },
    {
      icon: Store,
      title: "E-Commerce",
      description: "Tiendas en línea completas con carrito, pagos y gestión de inventario.",
    },
    {
      icon: Building2,
      title: "Sitios Corporativos",
      description: "Presencia digital profesional que refleja la identidad de tu empresa.",
    },
    {
      icon: Rocket,
      title: "Web Apps",
      description: "Aplicaciones web personalizadas para automatizar y escalar tu negocio.",
    },
    {
      icon: Palette,
      title: "Rediseño Web",
      description: "Renovamos tu sitio actual con diseño moderno y mejor rendimiento.",
    },
    {
      icon: BarChart3,
      title: "SEO & Analytics",
      description: "Optimización para buscadores y métricas para tomar mejores decisiones.",
    },
  ];

  return (
    <section id="servicios" className="py-24 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Servicios
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            ¿Qué <span className="text-gradient">Hacemos</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Soluciones digitales completas adaptadas a las necesidades de tu negocio
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <FlashlightCard className="h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </FlashlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ PROBLEMA SECTION ============
function ProblemSection() {
  const problems = [
    {
      icon: Clock,
      problem: "Agencias que tardan meses",
      solution: "Entregamos desde 2 hasta 30 días según tu plan",
    },
    {
      icon: Target,
      problem: "Sitios que no convierten",
      solution: "Diseño enfocado en resultados",
    },
    {
      icon: Code,
      problem: "Tecnología obsoleta",
      solution: "Stack moderno y veloz",
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
            El Problema
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            ¿Por qué <span className="text-gradient">Somos Diferentes</span>?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <FlashlightCard className="text-center h-full">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-lg text-muted-foreground line-through mb-4">
                  {item.problem}
                </p>
                <div className="w-8 h-0.5 bg-primary mx-auto mb-4" />
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-semibold text-primary">{item.solution}</p>
              </FlashlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ PROCESO EXPRESS SECTION ============
function ProcessSection() {
  const steps = [
    {
      phase: "Fase 1",
      title: "Descubrimiento",
      description: "Entendemos tu negocio, objetivos y audiencia. Definimos requisitos técnicos y funcionales para crear la estrategia perfecta.",
      icon: MessageSquare,
      duration: "Inicio del proyecto",
    },
    {
      phase: "Fase 2",
      title: "Desarrollo",
      description: "Construimos tu sitio con tecnología de punta. Desarrollo ágil y eficiente con entregas incrementales para tu revisión.",
      icon: Code,
      duration: "Durante el desarrollo",
    },
    {
      phase: "Fase 3",
      title: "Refinamiento",
      description: "Implementamos ajustes y mejoras basados en tu feedback. Hasta 3 rondas de revisiones incluidas según tu plan seleccionado.",
      icon: Palette,
      duration: "Iterativo",
    },
    {
      phase: "Fase 4",
      title: "Lanzamiento",
      description: "Pruebas finales, optimización y entrega. Tu sitio profesional listo para conquistar el mundo digital.",
      icon: Rocket,
      duration: "Entrega final",
    },
  ];

  return (
    <section id="proceso" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Metodología
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Proceso <span className="text-gradient">Ágil</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Desarrollo profesional adaptado a tus necesidades
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Tiempos de entrega desde 2 hasta 30 días hábiles según el plan y urgencia seleccionados. Cada proyecto se adapta a tu ritmo y requerimientos específicos.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden lg:block" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className={`lg:flex items-center gap-8 ${
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <div className={`lg:w-1/2 ${i % 2 === 0 ? "lg:text-right" : ""}`}>
                  <FlashlightCard>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-primary font-bold text-sm">{step.phase}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground font-medium">{step.duration}</span>
                    </div>
                    <h3 className="text-2xl font-bold mt-2 mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </FlashlightCard>
                </div>

                <div className="hidden lg:flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground relative z-10 mx-auto my-4 lg:my-0">
                  <step.icon className="w-7 h-7" />
                </div>

                <div className="lg:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ PRICING PROMO MESSAGE ============
function PricingPromoMessage({ campaign }: { campaign: Campaign | null }) {
  if (!campaign || !campaign.pricing_message) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-10"
    >
      <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
        {campaign.discount_percent && campaign.discount_percent > 0 && (
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-sm font-bold tracking-wide">
            {campaign.discount_percent}% OFF
          </span>
        )}
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {campaign.pricing_message.replace(/🎁/g, '').trim()}
        </span>
      </div>
    </motion.div>
  );
}

// ============ PLANES Y PRECIOS SECTION ============
function PricingSection() {
  const [currentPlan, setCurrentPlan] = useState(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar planes y campaña activa en paralelo
        const [plansData, activeCampaign] = await Promise.all([
          getAllPlans(),
          getActiveCampaign()
        ]);
        
        setPlans(plansData);
        setCampaign(activeCampaign);
      } catch (error) {
        console.error('Error loading pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const nextPlan = () => setCurrentPlan((prev) => (prev + 1) % (plans.length || 1));
  const prevPlan = () => setCurrentPlan((prev) => (prev - 1 + (plans.length || 1)) % (plans.length || 1));

  return (
    <section id="planes" className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planes y Precios
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Sin costos ocultos. Elige el plan que mejor se adapte a tu proyecto. Tiempos de entrega desde 2 hasta 30 días hábiles según el plan y urgencia seleccionados.
          </p>
          <PricingPromoMessage campaign={campaign} />
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando planes...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay planes disponibles</p>
          </div>
        ) : (
          <>
        {/* Mobile Carousel */}
        <div className="lg:hidden relative">
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={prevPlan}
              className="p-2 rounded-full bg-card border border-border hover:border-primary transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-sm text-muted-foreground">
              {currentPlan + 1} / {plans.length}
            </span>
            <button
              onClick={nextPlan}
              className="p-2 rounded-full bg-card border border-border hover:border-primary transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlan}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <PricingCard plan={plans[currentPlan]} campaign={campaign} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <PricingCard plan={plan} campaign={campaign} />
            </motion.div>
          ))}
        </div>
          </>
        )}
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  campaign,
}: {
  plan: Plan;
  campaign: Campaign | null;
}) {
  // Calcular descuento usando la campaña activa
  const discountPercent = campaign?.discount_percent || 0;
  const pricing = calculateCampaignDiscount(plan.price, discountPercent);
  
  const originalPrice = plan.price;
  const discountedPrice = pricing.discounted;
  const savings = pricing.savings;
  const hasDiscount = discountPercent > 0;
  
  // Get delivery days range
  const getPlanStandardDays = (planSlug: string | undefined): { min: number; max: number } => {
    if (!planSlug) return { min: 3, max: 10 };
    switch (planSlug.toLowerCase()) {
      case 'starter': return { min: 2, max: 7 };
      case 'business': return { min: 3, max: 10 };
      case 'pro-plus':
      case 'proplus': return { min: 5, max: 30 };
      default: return { min: 3, max: 10 };
    }
  };
  
  const deliveryRange = getPlanStandardDays(plan.slug);
  const deliveryDaysLabel = deliveryRange.min === deliveryRange.max 
    ? `${deliveryRange.min} días hábiles`
    : `${deliveryRange.min}-${deliveryRange.max} días hábiles`;
  
  // Get contextual badge and ideal for text based on plan
  const getPlanContext = (planSlug: string) => {
    switch (planSlug.toLowerCase()) {
      case 'starter':
        return {
          badge: { text: 'Simple y Rápido', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
          idealFor: ['MVPs', 'Emprendedores', 'Negocios que necesitan algo rápido', 'Sin blog, sin e-commerce']
        };
      case 'business':
        return {
          badge: null, // Already has "Más Popular" badge
          idealFor: ['Empresas establecidas', 'Negocios que quieren web profesional', 'Quienes necesitan varias secciones', 'Mejor relación costo-beneficio']
        };
      case 'pro-plus':
      case 'proplus':
        return {
          badge: { text: 'Más Completo', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
          idealFor: ['Proyectos complejos', 'E-commerce informativo (sin checkout)', 'Empresas que quieren experiencia WOW', 'Marcas con branding fuerte']
        };
      default:
        return {
          badge: null,
          idealFor: []
        };
    }
  };
  
  const planContext = getPlanContext(plan.slug);
  
  return (
    <div
      className={`h-full flex flex-col relative p-8 rounded-2xl bg-card border transition-all duration-300 hover:shadow-xl ${
        plan.is_popular 
          ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" 
          : "border-border hover:border-primary/50"
      }`}
    >
      {/* Popular Badge */}
      {plan.is_popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full whitespace-nowrap shadow-lg">
          ⭐ Más Popular
        </div>
      )}
      
      {/* Contextual Badge (for non-popular plans) */}
      {!plan.is_popular && planContext.badge && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 ${planContext.badge.color} text-sm font-semibold rounded-full whitespace-nowrap shadow-lg`}>
          {planContext.badge.text}
        </div>
      )}

      {/* Plan Name & Description */}
      <div className={`text-center mb-8 ${plan.is_popular || planContext.badge ? "mt-3" : ""}`}>
        <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
        <p className="text-muted-foreground text-sm">{plan.description || plan.subtitle || ''}</p>
      </div>

      {/* Price Section - HERO */}
      <div className="text-center mb-6 py-6 -mx-8 px-8 bg-muted/30">
        {hasDiscount ? (
          <div className="space-y-2">
            {/* Original Price - Strikethrough */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                -{discountPercent}%
              </span>
      </div>
            {/* Discounted Price - HERO */}
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
                {formatPrice(discountedPrice).replace('$', '')}
              </span>
              <span className="text-xl text-muted-foreground font-medium">MXN</span>
            </div>
            {/* Savings */}
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              Ahorras {formatPrice(savings)}
            </p>
          </div>
        ) : (
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
              {formatPrice(plan.price).replace('$', '')}
            </span>
            <span className="text-xl text-muted-foreground font-medium">MXN</span>
          </div>
        )}
        
        {/* Delivery Days */}
        <div className="flex items-center justify-center gap-1 mt-3 text-sm text-primary">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{deliveryDaysLabel}</span>
        </div>
      </div>
      
      {/* Features */}
      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* Ideal For Section */}
      {planContext.idealFor.length > 0 && (
        <div className="mb-6 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Target className="w-3 h-3" />
            IDEAL PARA:
          </p>
          <ul className="space-y-1.5">
            {planContext.idealFor.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Button */}
      <Button
        className={`w-full h-12 rounded-xl font-semibold text-base transition-all duration-200 ${
          plan.is_popular 
            ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
            : "hover:bg-primary hover:text-primary-foreground"
        }`}
        variant={plan.is_popular ? "default" : "outline"}
        onClick={() => {
          document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => {
            const event = new CustomEvent("preselectPlan", { detail: plan.id });
            window.dispatchEvent(event);
          }, 500);
        }}
      >
        {plan.is_popular ? "Comenzar Ahora" : plan.slug?.toLowerCase() === 'pro-plus' || plan.slug?.toLowerCase() === 'proplus' ? "Solicitar Cotización" : `Elegir ${plan.name}`}
      </Button>
    </div>
  );
}

// ============ ADD-ONS SECTION ============
function AddOnsSection() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const loadAddons = async () => {
      setLoading(true);
      try {
        const [addonsData, activeCampaign] = await Promise.all([
          getAllAddons(),
          getActiveCampaign()
        ]);
        setAddons(addonsData);
        setCampaign(activeCampaign);
      } catch (error) {
        console.error('Error loading addons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAddons();
    const interval = setInterval(loadAddons, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const discountPercent = campaign?.discount_percent || 0;
  const hasDiscount = discountPercent > 0;

  return (
    <section id="addons" className="py-24 md:py-32 bg-muted/20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Potencia tu Proyecto
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Servicios Adicionales
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Complementos profesionales para maximizar el impacto de tu sitio web
          </p>
          {hasDiscount && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-xs font-bold">
                {discountPercent}% OFF
              </span>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Descuento aplicado a todos los add-ons
              </span>
            </div>
          )}
        </motion.div>

        {/* Add-ons Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Cargando servicios...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {addons.map((item, i) => (
              <AddOnCard 
                key={item.id} 
                addon={item} 
                discountPercent={discountPercent} 
                index={i} 
              />
            ))}
          </div>
        )}

        {/* CTA */}
            <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-14"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-card border border-border">
            <div className="text-center sm:text-left">
              <p className="font-medium mb-1">¿Necesitas algo personalizado?</p>
              <p className="text-sm text-muted-foreground">Platiquemos sobre los requerimientos de tu proyecto</p>
        </div>
            <Button 
              size="lg"
              className="rounded-full px-6"
              onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Solicitar Cotización
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Add-on Card Component
function AddOnCard({ 
  addon, 
  discountPercent, 
  index 
}: { 
  addon: Addon; 
  discountPercent: number; 
  index: number;
}) {
  const hasDiscount = discountPercent > 0;
  const pricing = calculateCampaignDiscount(addon.price, discountPercent);
  const pricingMax = addon.price_max ? calculateCampaignDiscount(addon.price_max, discountPercent) : null;
  
  const billingSuffix = addon.billing_type === 'monthly' ? '/mes' : addon.billing_type === 'yearly' ? '/año' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group h-full"
    >
      <div className="relative h-full flex flex-col bg-card border border-border rounded-xl p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
        {/* Badges Row */}
        <div className="flex items-center justify-between mb-4 min-h-[24px]">
          <div className="flex items-center gap-2">
            {addon.badge && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                {addon.badge}
              </span>
            )}
            {addon.billing_type && addon.billing_type !== 'one-time' && (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                Recurrente
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <span className="text-xl">{addon.icon || '✨'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
              {addon.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
          {addon.description || 'Servicio profesional para tu proyecto'}
        </p>

        {/* Price Section */}
        <div className="pt-4 border-t border-border mt-auto">
          {hasDiscount ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground/70 line-through">
                  {addon.price_max 
                    ? `${formatPrice(addon.price)} - ${formatPrice(addon.price_max)}`
                    : formatPrice(addon.price)
                  }
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-foreground">
                  {pricingMax 
                    ? `${formatPrice(pricing.discounted)} - ${formatPrice(pricingMax.discounted)}`
                    : formatPrice(pricing.discounted)
                  }
                </span>
                <span className="text-sm text-muted-foreground">{billingSuffix}</span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Ahorras {pricingMax 
                  ? `${formatPrice(pricing.savings)} - ${formatPrice(pricingMax.savings)}`
                  : formatPrice(pricing.savings)
                }
              </p>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">
                {addon.price_max 
                  ? `${formatPrice(addon.price)} - ${formatPrice(addon.price_max)}`
                  : formatPrice(addon.price)
                }
              </span>
              <span className="text-sm text-muted-foreground">{billingSuffix}</span>
            </div>
          )}
          
          {/* Annual option for hosting */}
          {addon.billing_type === 'monthly' && addon.slug === 'hosting_gestionado' && (
            <p className="text-xs text-muted-foreground mt-1.5">
              o {hasDiscount ? formatPrice(Math.round(6000 * (1 - discountPercent / 100))) : formatPrice(6000)}/año
            </p>
          )}
          
          {/* Add to Quote Button */}
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-3 rounded-lg text-sm hover:bg-primary hover:text-primary-foreground"
            onClick={() => {
              document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
              setTimeout(() => {
                const event = new CustomEvent("preselectAddon", { detail: addon.id });
                window.dispatchEvent(event);
              }, 500);
            }}
          >
            Agregar a cotización
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ============ TESTIMONIALS SECTION ============
function TestimonialsSection() {
  const testimonials = [
    {
      name: "María González",
      company: "TechStart MX",
      role: "CEO",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      quote: "SitioExpress entregó nuestro sitio en 5 días. El diseño superó nuestras expectativas y las ventas online aumentaron 40% en el primer mes.",
      rating: 5,
    },
    {
      name: "Carlos Ramírez",
      company: "Boutique Elegante",
      role: "Fundador",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "Profesionalismo y velocidad. Teníamos una fecha límite ajustada y cumplieron perfectamente. El sitio es hermoso y funcional.",
      rating: 5,
    },
    {
      name: "Ana Martínez",
      company: "Consultoría Digital",
      role: "Directora de Marketing",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "La mejor inversión que hemos hecho este año. El proceso fue transparente, las revisiones fueron rápidas y el resultado final es impecable.",
      rating: 5,
    },
    {
      name: "Roberto Sánchez",
      company: "Inmobiliaria Premium",
      role: "Gerente General",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      quote: "Sitio web moderno que refleja perfectamente nuestra marca. El equipo fue muy receptivo a nuestros comentarios y entregaron antes de tiempo.",
      rating: 5,
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
            Testimonios
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Lo que dicen nuestros <span className="text-gradient">Clientes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Más de 150 empresas confían en nosotros para su presencia digital
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <FlashlightCard className="h-full">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
              </FlashlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ ABOUT US SECTION ============
function AboutSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Sobre Nosotros
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Un equipo <span className="text-gradient">apasionado</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Somos diseñadores, desarrolladores y estrategas digitales con una misión: 
              democratizar el acceso a sitios web de alta calidad para empresas de todos los tamaños.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Basados en Ciudad de México, hemos ayudado a más de 150 empresas a transformar 
              su presencia digital y aumentar sus ventas en línea.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Users, value: "12+", label: "Expertos" },
                { icon: Award, value: "5 años", label: "Experiencia" },
                { icon: Star, value: "4.9/5", label: "Calificación" },
                { icon: Globe, value: "3 países", label: "Presencia" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="Equipo SitioExpress"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 p-6 rounded-2xl glass border border-border shadow-xl">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-background bg-primary/20"
                    />
                  ))}
                </div>
                <div>
                  <div className="font-bold">+150 clientes</div>
                  <div className="text-sm text-muted-foreground">confían en nosotros</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============ WHATSAPP UTILITY ============
interface WhatsAppFormData {
  name: string;
  email: string;
  phone?: string;
  projectType: string;
  timeline: string;
  message?: string;
  selectedPlan?: Plan | null;
  selectedAddons?: Addon[];
  campaign?: Campaign | null;
  rushFee?: RushFee | null;
  totals?: QuoteTotals;
}

function buildWhatsAppURL(formData: WhatsAppFormData) {
  const projectTypeLabels: Record<string, string> = {
    landing: "Landing Page",
    ecommerce: "E-Commerce",
    corporate: "Sitio Corporativo",
    webapp: "Web App",
    redesign: "Rediseño",
    other: "Otro",
  };

  // Build delivery time text
  let deliveryText = '';
  if (formData.rushFee) {
    const days = formatDeliveryDays(formData.rushFee.delivery_days_min, formData.rushFee.delivery_days_max);
    deliveryText = formData.rushFee.display_name ? `${formData.rushFee.display_name} (${days})` : days;
  }

  let message = `👋 Hola, soy ${formData.name}\n\n`;
  message += `═══════════════════════\n`;
  message += `   📋 COTIZACIÓN SITIOEXPRESS\n`;
  message += `═══════════════════════\n\n`;
  
  message += `📌 *Proyecto:* ${projectTypeLabels[formData.projectType] || formData.projectType}\n`;
  message += `⏰ *Entrega:* ${deliveryText || formData.timeline}`;
  if (formData.totals?.hasRushFee) {
    message += ` ⚡ Prioridad Premium`;
  }
  message += `\n\n`;

  // Separate addons by billing type
  const oneTimeAddons = formData.selectedAddons?.filter(a => !a.billing_type || a.billing_type === 'one-time') || [];
  const monthlyAddons = formData.selectedAddons?.filter(a => a.billing_type === 'monthly') || [];
  const discountPercent = formData.campaign?.discount_percent || 0;

  // PAGO INICIAL
  if (oneTimeAddons.length > 0 || formData.selectedPlan) {
    message += `💰 *PAGO INICIAL:*\n`;
    
    if (formData.selectedPlan) {
      message += `   • ${formData.selectedPlan.name}: ${formatPrice(formData.selectedPlan.price)} MXN\n`;
    }

    // Rush Fee as value-added service
    if (formData.totals?.hasRushFee && formData.rushFee) {
      message += `   • ${formData.rushFee.display_name}: +${formatPrice(formData.totals.rushFeeAmount)} MXN\n`;
      message += `     (Entrega prioritaria +${formData.totals.rushFeePercent}%)\n`;
    }

    if (oneTimeAddons.length > 0) {
      oneTimeAddons.forEach(addon => {
        message += `   • ${addon.name}: ${formatPrice(addon.price)} MXN\n`;
      });
    }

    if (formData.totals) {
      // Show subtotal before discount
      if (discountPercent > 0 && formData.totals.initialSubtotal > 0) {
        message += `   ─────────────────\n`;
        message += `   Subtotal: ${formatPrice(formData.totals.initialSubtotal)} MXN\n`;
        message += `   🏷️ ${formData.campaign?.name}: -${discountPercent}%\n`;
      }
      message += `   ─────────────────\n`;
      message += `   *TOTAL INICIAL: ${formatPrice(formData.totals.initialTotal)} MXN*\n\n`;
    }
  }

  // PAGO MENSUAL
  if (monthlyAddons.length > 0 && formData.totals?.hasMonthly) {
    message += `🔄 *PAGO MENSUAL:*\n`;
    monthlyAddons.forEach(addon => {
      const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
      message += `   • ${addon.name}: ${formatPrice(addonPricing.discounted)}/mes`;
      if (addonPricing.discountPercent > 0) {
        message += ` (antes ${formatPrice(addonPricing.original)})`;
      }
      message += `\n`;
    });
    if (discountPercent > 0 && formData.totals.monthlySubtotal > 0) {
      message += `   🏷️ Descuento ${formData.campaign?.name}: -${discountPercent}%\n`;
    }
    message += `   ─────────────────\n`;
    message += `   *TOTAL MENSUAL: ${formatPrice(formData.totals.monthlyTotal)}/mes*\n\n`;
  }

  message += `📧 *Contacto:*\n`;
  message += `   Email: ${formData.email}\n`;
  if (formData.phone) {
    message += `   Tel: ${formData.phone}\n`;
  }

  if (formData.message) {
    message += `\n📝 *Notas adicionales:*\n${formData.message}\n`;
  }

  message += `\n🌐 Vengo de SitioExpress.mx`;

  return `https://wa.me/528116364522?text=${encodeURIComponent(message)}`;
}

// ============ CONTACT FORM SCHEMA ============
const formSchema = z.object({
  projectType: z.string().min(1, "Selecciona un tipo de proyecto"),
  selectedPlan: z.string().min(1, "Selecciona un plan"),
  selectedAddons: z.array(z.string()),
  timeline: z.string().min(1, "Selecciona una urgencia"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// ============ QUOTE TOTALS CALCULATOR WITH RUSH FEE ============
interface QuoteTotals {
  initialSubtotal: number;
  initialDiscount: number;
  initialTotal: number;
  monthlySubtotal: number;
  monthlyDiscount: number;
  monthlyTotal: number;
  hasMonthly: boolean;
  rushFeeAmount: number;
  rushFeePercent: number;
  hasRushFee: boolean;
  priceBeforeRush: number;
  priceWithRush: number;
}

function calculateQuoteTotalsWithRush(
  plan: Plan | null,
  addons: Addon[],
  discountPercent: number,
  rushFee: RushFee | null
): QuoteTotals {
  // Helper function to check if addon is one-time (handle both 'one-time' and 'one_time' formats)
  const isOneTimeAddon = (addon: Addon): boolean => {
    if (!addon.billing_type) return true; // Default to one-time if no billing_type
    const billingType = addon.billing_type.toLowerCase();
    return billingType === 'one-time' || billingType === 'one_time' || billingType === '';
  };
  
  // Helper function to check if addon is monthly
  const isMonthlyAddon = (addon: Addon): boolean => {
    if (!addon.billing_type) return false;
    return addon.billing_type.toLowerCase() === 'monthly';
  };
  
  // Separate addons by billing type
  const oneTimeAddons = addons.filter(isOneTimeAddon);
  const monthlyAddons = addons.filter(isMonthlyAddon);

  // Calculate base initial costs: plan + one-time addons
  let priceBeforeRush = 0;
  if (plan) {
    priceBeforeRush += plan.price;
  }
  oneTimeAddons.forEach(addon => {
    priceBeforeRush += addon.price;
  });

  // Apply rush fee markup to plan price only (not addons)
  let rushFeeAmount = 0;
  let priceWithRush = priceBeforeRush;
  const hasRushFee = rushFee && rushFee.markup_percent > 0;
  
  if (plan && rushFee && rushFee.markup_percent > 0) {
    // Rush fee applies only to plan price
    rushFeeAmount = Math.round(plan.price * (rushFee.markup_percent / 100));
    priceWithRush = priceBeforeRush + rushFeeAmount;
  }

  // Initial subtotal is price with rush fee applied
  const initialSubtotal = priceWithRush;
  
  // Apply campaign discount on top of rush-included price
  const initialDiscount = Math.round(initialSubtotal * (discountPercent / 100));
  const initialTotal = initialSubtotal - initialDiscount;

  // Calculate monthly costs: only monthly addons (no rush fee on monthly)
  let monthlySubtotal = 0;
  monthlyAddons.forEach(addon => {
    monthlySubtotal += addon.price;
  });
  const monthlyDiscount = Math.round(monthlySubtotal * (discountPercent / 100));
  const monthlyTotal = monthlySubtotal - monthlyDiscount;

  return {
    initialSubtotal,
    initialDiscount,
    initialTotal,
    monthlySubtotal,
    monthlyDiscount,
    monthlyTotal,
    hasMonthly: monthlyAddons.length > 0,
    rushFeeAmount,
    rushFeePercent: rushFee?.markup_percent || 0,
    hasRushFee: !!hasRushFee,
    priceBeforeRush,
    priceWithRush,
  };
}

function ContactSection({ preselectedPlan }: { preselectedPlan?: string }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationPhase, setConfirmationPhase] = useState<'loading' | 'success'>('loading');
  
  // Pricing data from Supabase
  const [plans, setPlans] = useState<Plan[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [rushFees, setRushFees] = useState<RushFee[]>([]);
  const [selectedRushFee, setSelectedRushFee] = useState<RushFee | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectType: "",
      selectedPlan: preselectedPlan || "",
      selectedAddons: [],
      timeline: "",
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  // Load plans, addons, and campaign on mount
  useEffect(() => {
    async function loadPricingData() {
      setIsLoadingPrices(true);
      try {
        const [plansData, addonsData, campaignData] = await Promise.all([
          getAllPlans(),
          getAllAddons(),
          getActiveCampaign()
        ]);
        setPlans(plansData);
        setAddons(addonsData);
        setCampaign(campaignData);
        
        // If preselected plan, set it
        if (preselectedPlan) {
          setValue("selectedPlan", preselectedPlan);
        }
      } catch (error) {
        console.error("Error loading pricing data:", error);
      } finally {
        setIsLoadingPrices(false);
      }
    }
    loadPricingData();
  }, [preselectedPlan, setValue]);

  // Listen for preselect events from PricingCard buttons
  useEffect(() => {
    const handlePreselectPlan = (e: CustomEvent) => {
      setValue("selectedPlan", e.detail);
      // Scroll to form
      document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
    };
    
    const handlePreselectAddon = (e: CustomEvent) => {
      const currentAddons = watch("selectedAddons") || [];
      if (!currentAddons.includes(e.detail)) {
        setValue("selectedAddons", [...currentAddons, e.detail]);
      }
      document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
    };
    
    window.addEventListener("preselectPlan" as any, handlePreselectPlan as EventListener);
    window.addEventListener("preselectAddon" as any, handlePreselectAddon as EventListener);
    return () => {
      window.removeEventListener("preselectPlan" as any, handlePreselectPlan as EventListener);
      window.removeEventListener("preselectAddon" as any, handlePreselectAddon as EventListener);
    };
  }, [setValue, watch]);

  const projectType = watch("projectType");
  const selectedPlanId = watch("selectedPlan");
  const selectedAddonIds = watch("selectedAddons") || [];
  const timeline = watch("timeline");
  const name = watch("name");
  const email = watch("email");

  // Get selected plan and addon objects
  const selectedPlanObj = plans.find(p => p.id === selectedPlanId) || null;
  const selectedAddonObjs = addons.filter(a => selectedAddonIds.includes(a.id));
  
  // Helper functions to filter addons by billing type (handle both 'one-time' and 'one_time' formats)
  const isOneTimeAddon = (addon: Addon): boolean => {
    if (!addon.billing_type) return true; // Default to one-time if no billing_type
    const billingType = addon.billing_type.toLowerCase();
    return billingType === 'one-time' || billingType === 'one_time' || billingType === '';
  };
  
  const isMonthlyAddon = (addon: Addon): boolean => {
    if (!addon.billing_type) return false;
    return addon.billing_type.toLowerCase() === 'monthly';
  };
  
  const oneTimeAddons = selectedAddonObjs.filter(isOneTimeAddon);
  const monthlyAddons = selectedAddonObjs.filter(isMonthlyAddon);

  // Get standard delivery days range based on plan
  const getPlanStandardDays = (planSlug: string | undefined): { min: number; max: number } => {
    if (!planSlug) return { min: 3, max: 10 }; // Default
    switch (planSlug.toLowerCase()) {
      case 'starter': return { min: 2, max: 7 };
      case 'business': return { min: 3, max: 10 };
      case 'pro-plus':
      case 'proplus': return { min: 5, max: 30 };
      default: return { min: 3, max: 10 };
    }
  };

  // Build timelines dynamically based on selected plan
  const buildDynamicTimelines = useCallback(() => {
    if (!selectedPlanObj) {
      const defaultRange = getPlanStandardDays(undefined);
      return [
        { id: "flexible", label: "🌿 Flexible", sublabel: `${defaultRange.min}-${defaultRange.max} días hábiles`, displayName: "Estándar", markupPercent: 0, hasMarkup: false, rushFeeAmount: 0, rushFee: null, deliveryDaysMin: defaultRange.min, deliveryDaysMax: defaultRange.max },
      ];
    }

    const deliveryRange = getPlanStandardDays(selectedPlanObj.slug);
    const standardDays = deliveryRange.max; // Use max for standard option, but sublabel will show range
    const planPrice = selectedPlanObj.price;
    
    // Generate timeline options based on rush fees for this plan
    const timelineOptions: Array<{
      id: string;
      label: string;
      sublabel: string;
      displayName: string;
      markupPercent: number;
      hasMarkup: boolean;
      rushFeeAmount: number;
      rushFee: RushFee | null;
      deliveryDaysMin: number | null;
      deliveryDaysMax: number | null;
    }> = [];

    // Sort rush fees by display_order (ascending) - fastest first
    const sortedRushFees = [...rushFees].sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      // Fallback: sort by days (min first)
      const aDays = a.delivery_days_min || a.delivery_days_max || 999;
      const bDays = b.delivery_days_min || b.delivery_days_max || 999;
      return aDays - bDays;
    });
    
    // Find flexible rush fee early for later use (the standard option without markup)
    const flexibleRushFee = sortedRushFees.find(rf => rf.timeline_id === 'flexible' && rf.markup_percent === 0);

    // Process rush fees with markup (express options)
    sortedRushFees.forEach(rushFee => {
      // Skip rush fees without markup (they'll be handled separately)
      if (rushFee.markup_percent === 0 && !rushFee.markup_fixed) {
        return;
      }

      // Calculate rush amount
      let rushAmount = 0;
      if (rushFee.markup_percent > 0) {
        rushAmount = Math.round(planPrice * (rushFee.markup_percent / 100));
      }
      if (rushFee.markup_fixed) {
        rushAmount += rushFee.markup_fixed;
      }

      // Get delivery days from Supabase, with fallback to percentage calculation
      let deliveryDaysMin: number = rushFee.delivery_days_min || 0;
      let deliveryDaysMax: number = rushFee.delivery_days_max || 0;
      
      // Fallback: if no days in Supabase, calculate as percentage based on plan range
      if (!deliveryDaysMin && !deliveryDaysMax) {
        const fallbackDays = Math.max(2, Math.floor(deliveryRange.max * (rushFee.timeline_id === 'urgent' ? 0.5 : 0.75)));
        deliveryDaysMin = fallbackDays;
        deliveryDaysMax = fallbackDays;
      } else if (!deliveryDaysMin && deliveryDaysMax) {
        deliveryDaysMin = deliveryDaysMax;
      } else if (deliveryDaysMin && !deliveryDaysMax) {
        deliveryDaysMax = deliveryDaysMin;
      }
      
      // Ensure rush fees offer faster delivery than standard (rush fees should be expedited)
      // Rush fees can overlap with standard min but should be faster than standard max
      // Only adjust if rush fee max is >= standard max (meaning it's not faster)
      if (deliveryDaysMax >= deliveryRange.max && rushFee.markup_percent > 0) {
        // For rush fees with markup, ensure they're faster than standard max
        deliveryDaysMax = Math.max(deliveryDaysMin, deliveryRange.max - 1);
        // Ensure min doesn't exceed max
        if (deliveryDaysMin > deliveryDaysMax) {
          deliveryDaysMin = Math.max(1, deliveryDaysMax);
        }
      }

      // Format days label
      let daysLabel = '';
      if (deliveryDaysMin === deliveryDaysMax) {
        daysLabel = `${deliveryDaysMin} días hábiles`;
      } else {
        daysLabel = `${deliveryDaysMin}-${deliveryDaysMax} días hábiles`;
      }

      // Determine label and icon based on timeline_id
      let label = '';
      let icon = '';
      if (rushFee.timeline_id === 'urgent') {
        label = '🔥 Express';
        icon = '🔥';
      } else if (rushFee.timeline_id === 'week') {
        label = '⚡ Rápido';
        icon = '⚡';
      } else {
        label = rushFee.display_name || 'Express';
        icon = '🚀';
      }

      timelineOptions.push({
        id: rushFee.timeline_id,
        label: label,
        sublabel: daysLabel,
        displayName: rushFee.display_name || 'Express Premium',
        markupPercent: rushFee.markup_percent,
        hasMarkup: true,
        rushFeeAmount: rushAmount,
        rushFee: rushFee,
        deliveryDaysMin: deliveryDaysMin,
        deliveryDaysMax: deliveryDaysMax,
      });
    });

    // Option: Estándar/Flexible (always last)
    // Use the flexible rush fee found earlier, or calculate a specific range
    let standardDaysMin: number;
    let standardDaysMax: number;
    
    if (flexibleRushFee && flexibleRushFee.delivery_days_min && flexibleRushFee.delivery_days_max) {
      // Use the flexible rush fee from Supabase
      standardDaysMin = flexibleRushFee.delivery_days_min;
      standardDaysMax = flexibleRushFee.delivery_days_max;
    } else {
      // Fallback: Calculate a more specific range that's longer than "Rápido"
      // Find the fastest rush fee to determine the baseline
      const fastestRushFee = sortedRushFees
        .filter(rf => rf.markup_percent > 0)
        .sort((a, b) => {
          const aMax = a.delivery_days_max || a.delivery_days_min || 999;
          const bMax = b.delivery_days_max || b.delivery_days_min || 999;
          return aMax - bMax;
        })[0];
      
      if (fastestRushFee && fastestRushFee.delivery_days_max) {
        // Standard should start after the fastest option ends
        standardDaysMin = Math.max(fastestRushFee.delivery_days_max + 1, Math.floor(deliveryRange.max * 0.6));
        standardDaysMax = deliveryRange.max;
      } else {
        // Ultimate fallback: use plan range
        standardDaysMin = deliveryRange.min;
        standardDaysMax = deliveryRange.max;
      }
    }
    
    const standardDaysLabel = standardDaysMin === standardDaysMax 
      ? `${standardDaysMin} días hábiles`
      : `${standardDaysMin}-${standardDaysMax} días hábiles`;
    
    timelineOptions.push({
      id: 'flexible',
      label: '📅 Estándar',
      sublabel: standardDaysLabel,
      displayName: 'Estándar',
      markupPercent: 0,
      hasMarkup: false,
      rushFeeAmount: 0,
      rushFee: flexibleRushFee || null,
      deliveryDaysMin: standardDaysMin,
      deliveryDaysMax: standardDaysMax,
    });

    return timelineOptions;
  }, [selectedPlanObj, rushFees]);

  const timelines = buildDynamicTimelines();

  // Load rush fees when plan changes
  useEffect(() => {
    async function loadRushFees() {
      if (selectedPlanObj?.slug) {
        const fees = await getRushFeesForPlan(selectedPlanObj.slug);
        setRushFees(fees);
      }
    }
    loadRushFees();
  }, [selectedPlanObj?.slug]);

  // Update selected rush fee when timeline changes
  useEffect(() => {
    if (timeline && selectedPlanObj) {
      const timelineOption = timelines.find(t => t.id === timeline);
      if (timelineOption?.rushFee) {
        setSelectedRushFee(timelineOption.rushFee);
      } else {
        setSelectedRushFee(null);
      }
    }
  }, [timeline, selectedPlanObj, timelines]);

  // Calculate totals with rush fee
  const discountPercent = campaign?.discount_percent || 0;
  const totals = calculateQuoteTotalsWithRush(selectedPlanObj, selectedAddonObjs, discountPercent, selectedRushFee);

  const projectTypes = [
    { id: "landing", label: "Landing Page", icon: Globe },
    { id: "ecommerce", label: "E-Commerce", icon: ShoppingCart },
    { id: "corporate", label: "Sitio Corporativo", icon: Building2 },
    { id: "webapp", label: "Web App", icon: Code },
    { id: "redesign", label: "Rediseño", icon: Palette },
    { id: "other", label: "Otro", icon: Briefcase },
  ];

  const TOTAL_STEPS = 4;

  const handleNext = () => {
    if (step === 1 && !projectType) return;
    if (step === 2 && !selectedPlanId) return;
    if (step === 3 && !timeline) return;
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleAddon = (addonId: string) => {
    const current = selectedAddonIds;
    if (current.includes(addonId)) {
      setValue("selectedAddons", current.filter(id => id !== addonId));
    } else {
      setValue("selectedAddons", [...current, addonId]);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setShowConfirmation(true);
    setConfirmationPhase('loading');
    
    try {
      // Build budget string based on selected plan
      const budgetStr = selectedPlanObj ? selectedPlanObj.name : "custom";
      
      // Build addons string for database
      const addonsStr = selectedAddonObjs.map(a => a.name).join(", ");
      
      // Build delivery info for database
      const deliveryInfo = selectedRushFee 
        ? `${selectedRushFee.display_name}: ${formatDeliveryDays(selectedRushFee.delivery_days_min, selectedRushFee.delivery_days_max)}`
        : data.timeline;
      
      // Build totals message for database
      let totalsMessage = `Pago inicial: ${formatPrice(totals.initialTotal)} MXN`;
      if (totals.hasRushFee) {
        totalsMessage += ` (incluye ${selectedRushFee?.display_name} +${formatPrice(totals.rushFeeAmount)})`;
      }
      if (totals.hasMonthly) {
        totalsMessage += `\nPago mensual: ${formatPrice(totals.monthlyTotal)}/mes`;
      }
      const fullMessage = data.message 
        ? `${data.message}\n\nEntrega: ${deliveryInfo}\nAdd-ons: ${addonsStr || 'Ninguno'}\n${totalsMessage}`
        : `Entrega: ${deliveryInfo}\nAdd-ons: ${addonsStr || 'Ninguno'}\n${totalsMessage}`;

      // Guardar en Supabase
      const { error } = await supabase.from("web_dev_leads").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        project_type: data.projectType,
        budget: budgetStr,
        timeline: data.timeline,
        message: fullMessage,
        source: "cotizador_express",
        plan_selected: selectedPlanObj?.slug || null,
      });

      if (error) throw error;

      // Show success phase
      await new Promise(resolve => setTimeout(resolve, 1500));
      setConfirmationPhase('success');
      
      // Wait a moment then redirect to WhatsApp
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Build and open WhatsApp URL
      const whatsappUrl = buildWhatsAppURL({
        name: data.name,
        email: data.email,
        phone: data.phone,
        projectType: data.projectType,
        timeline: data.timeline,
        message: data.message,
        selectedPlan: selectedPlanObj,
        selectedAddons: selectedAddonObjs,
        campaign,
        rushFee: selectedRushFee,
        totals,
      });
      window.open(whatsappUrl, "_blank");

      // Reset form
      setShowConfirmation(false);
      setStep(1);
      setValue("projectType", "");
      setValue("selectedPlan", "");
      setValue("selectedAddons", []);
      setValue("timeline", "");
      setValue("name", "");
      setValue("email", "");
      setValue("phone", "");
      setValue("message", "");
      
      toast.success("¡Cotización enviada!", {
        description: "Te contactaremos en menos de 2 horas",
      });

    } catch (error) {
      console.error("Error submitting form:", error);
      setShowConfirmation(false);
      toast.error("Error al enviar", {
        description: "Por favor intenta de nuevo o contáctanos directamente por WhatsApp",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-24 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Cotizador Instantáneo
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Arma tu <span className="text-gradient">Cotización</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Selecciona tu plan, personaliza con add-ons y obtén tu cotización en menos de 30 segundos
          </p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step >= i
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > i ? <Check className="w-5 h-5" /> : i}
              </div>
              {i < 4 && (
                <div
                  className={`w-12 md:w-16 h-1 mx-2 rounded-full transition-colors duration-300 ${
                    step > i ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Confirmation Overlay */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-card border border-border rounded-3xl p-12 text-center max-w-md mx-4 shadow-2xl"
              >
                {confirmationPhase === 'loading' ? (
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Rocket className="w-10 h-10 text-primary" />
                      </motion.div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Preparando tu cotización...</h3>
                    <p className="text-muted-foreground">Un momento por favor</p>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
                    >
                      <Check className="w-10 h-10 text-emerald-500" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">¡Listo!</h3>
                    <p className="text-muted-foreground">Redirigiendo a WhatsApp...</p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)}>
        <FlashlightCard className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {/* STEP 1: Project Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl font-bold mb-2">¿Qué tipo de proyecto necesitas?</h3>
                <p className="text-muted-foreground mb-6">Selecciona el que mejor describe tu proyecto</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setValue("projectType", type.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left group ${
                        projectType === type.id
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <type.icon className={`w-6 h-6 mb-2 transition-colors ${
                        projectType === type.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      }`} />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
                
                {errors.projectType && (
                  <p className="text-sm text-destructive mb-4">{errors.projectType.message}</p>
                )}
                <input type="hidden" {...register("projectType")} />
                
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!projectType}
                  className="w-full rounded-full"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* STEP 2: Plan + Add-ons Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl font-bold mb-2">Elige tu plan</h3>
                <p className="text-muted-foreground mb-6">Selecciona el plan que mejor se adapte a tus necesidades</p>

                {isLoadingPrices ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  <>
                    {/* Plans Grid */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      {plans.map((plan) => {
                        const pricing = calculateCampaignDiscount(plan.price, discountPercent);
                        const isSelected = selectedPlanId === plan.id;
                        
                        return (
                      <button
                            key={plan.id}
                            type="button"
                            onClick={() => setValue("selectedPlan", plan.id)}
                            className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                            {plan.is_popular && (
                              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                                Popular
                              </span>
                            )}
                            
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-lg">{plan.name}</h4>
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-4 h-4 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            
                            <div className="mb-3">
                              {discountPercent > 0 ? (
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-bold">{formatPrice(pricing.discounted)}</span>
                                  <span className="text-sm text-muted-foreground line-through">{formatPrice(pricing.original)}</span>
                                </div>
                              ) : (
                                <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                              )}
                            </div>
                            
                            {plan.subtitle && (
                              <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                            )}
                            
                            {/* Show standard delivery days range based on plan slug */}
                            {(() => {
                              const deliveryRange = getPlanStandardDays(plan.slug);
                              return (
                                <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {deliveryRange.min === deliveryRange.max 
                                      ? `${deliveryRange.min} días hábiles`
                                      : `${deliveryRange.min}-${deliveryRange.max} días hábiles`
                                    }
                                  </span>
                                </div>
                              );
                            })()}
                      </button>
                        );
                      })}
                  </div>
                    <input type="hidden" {...register("selectedPlan")} />

                    {/* Add-ons */}
                    {addons.length > 0 && (
                      <div className="border-t border-border pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">Add-ons opcionales</h4>
                          {selectedAddonIds.length > 0 && (
                            <span className="text-sm text-primary font-medium">
                              {selectedAddonIds.length} seleccionado{selectedAddonIds.length > 1 ? 's' : ''}
                            </span>
                          )}
                </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          {addons.map((addon) => {
                            const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
                            const isSelected = selectedAddonIds.includes(addon.id);
                            
                            return (
                      <button
                                key={addon.id}
                                type="button"
                                onClick={() => toggleAddon(addon.id)}
                                className={`p-4 rounded-xl border-2 transition-all text-left flex items-start gap-3 ${
                                  isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isSelected ? "bg-primary border-primary" : "border-border"
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium truncate">{addon.name}</span>
                                    {addon.badge && (
                                      <span className="text-xs bg-lavender/20 text-lavender px-2 py-0.5 rounded-full shrink-0">
                                        {addon.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {discountPercent > 0 ? (
                                      <>
                                        <span className="text-sm font-semibold">{formatPrice(addonPricing.discounted)}</span>
                                        <span className="text-xs text-muted-foreground line-through">{formatPrice(addonPricing.original)}</span>
                                      </>
                                    ) : (
                                      <span className="text-sm font-semibold">{formatPrice(addon.price)}</span>
                                    )}
                                    {addon.billing_type && (
                                      <span className="text-xs text-muted-foreground">/{addon.billing_type}</span>
                                    )}
                                  </div>
                                </div>
                      </button>
                            );
                          })}
                  </div>
                </div>
                    )}

                    {/* Live Subtotal - Mejorado y más visible */}
                    {selectedPlanId && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-lavender/5 border-2 border-primary/20 shadow-lg space-y-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-lg flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Resumen de tu cotización
                          </h4>
                          {selectedAddonObjs.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {oneTimeAddons.length} add-on{oneTimeAddons.length !== 1 ? 's' : ''} inicial{oneTimeAddons.length !== 1 ? 'es' : ''}
                              {monthlyAddons.length > 0 && (
                                <> • {monthlyAddons.length} mensual{monthlyAddons.length !== 1 ? 'es' : ''}</>
                              )}
                            </span>
                          )}
                        </div>
                        
                        {/* Pago Inicial */}
                        <div className="bg-background/50 rounded-xl p-4 border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              💰 Pago inicial
                            </span>
                            {discountPercent > 0 && totals.initialSubtotal > 0 && (
                              <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                                -{discountPercent}%
                              </span>
                            )}
                          </div>
                          
                          {/* Desglose detallado */}
                          {selectedPlanObj && (
                            <div className="space-y-2 mb-3 text-xs">
                              {/* Plan */}
                              <div className="flex flex-col gap-1 py-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Plan {selectedPlanObj.name}</span>
                                  {discountPercent > 0 ? (
                                    <div className="text-right flex items-center gap-1.5">
                                      <span className="line-through text-muted-foreground/60">{formatPrice(selectedPlanObj.price)}</span>
                                      <span className="font-semibold">{formatPrice(calculateCampaignDiscount(selectedPlanObj.price, discountPercent).discounted)}</span>
                                    </div>
                                  ) : (
                                    <span className="font-semibold">{formatPrice(selectedPlanObj.price)}</span>
                                  )}
                                </div>
                                {/* Delivery days range */}
                                {(() => {
                                  const deliveryRange = getPlanStandardDays(selectedPlanObj.slug);
                                  return (
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        Entrega estándar: {deliveryRange.min === deliveryRange.max 
                                          ? `${deliveryRange.min} días hábiles`
                                          : `${deliveryRange.min}-${deliveryRange.max} días hábiles`
                                        }
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>
                              
                              {/* Add-ons one-time - Mostrar TODOS */}
                              {oneTimeAddons.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-border/30">
                                  <div className="text-[10px] font-medium text-muted-foreground/80 mb-1.5 uppercase tracking-wide">
                                    Add-ons (pago único) - {oneTimeAddons.length} item{oneTimeAddons.length !== 1 ? 's' : ''}
                                  </div>
                                  <div className="space-y-1">
                                    {oneTimeAddons.map(addon => {
                                      const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
                                      return (
                                        <div key={addon.id} className="flex justify-between items-center py-0.5">
                                          <span className="truncate text-muted-foreground">{addon.name}</span>
                                          {discountPercent > 0 ? (
                                            <div className="text-right flex items-center gap-1.5 shrink-0">
                                              <span className="line-through text-muted-foreground/60">{formatPrice(addon.price)}</span>
                                              <span className="font-medium">{formatPrice(addonPricing.discounted)}</span>
                                            </div>
                                          ) : (
                                            <span className="font-medium">{formatPrice(addon.price)}</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Verificación del subtotal */}
                          {(() => {
                            // Calcular subtotal manualmente para verificación
                            let calculatedSubtotal = 0;
                            if (selectedPlanObj) {
                              calculatedSubtotal += selectedPlanObj.price;
                            }
                            oneTimeAddons.forEach(addon => {
                              calculatedSubtotal += addon.price;
                            });
                            
                            return (
                              <>
                                {/* Subtotal antes del descuento */}
                                {discountPercent > 0 && totals.initialSubtotal > 0 && (
                                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 pt-2 border-t border-border/50">
                                    <span>Subtotal inicial (antes de descuento)</span>
                                    <span className="line-through">{formatPrice(totals.initialSubtotal)}</span>
                                  </div>
                                )}
                                
                                {/* Descuento aplicado */}
                                {discountPercent > 0 && totals.initialDiscount > 0 && (
                                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-2">
                                    <span className="flex items-center gap-1">
                                      🏷️ Descuento ({campaign?.name || 'Promoción'})
                                    </span>
                                    <span className="font-semibold">-{formatPrice(totals.initialDiscount)}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                  <span className="font-semibold">Total inicial</span>
                                  <span className="text-2xl font-bold text-primary">{formatPrice(totals.initialTotal)}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Pago Mensual */}
                        {totals.hasMonthly && (
                          <div className="bg-background/50 rounded-xl p-4 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                🔄 Pago mensual
                              </span>
                              {discountPercent > 0 && totals.monthlySubtotal > 0 && (
                                <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                                  -{discountPercent}%
                                </span>
                              )}
                            </div>
                            
                            {/* Desglose mensual - Mostrar TODOS */}
                            {monthlyAddons.length > 0 && (
                              <div className="space-y-1 mb-2 text-xs">
                                <div className="text-[10px] font-medium text-muted-foreground/80 mb-1.5 uppercase tracking-wide">
                                  Add-ons (mensuales) - {monthlyAddons.length} item{monthlyAddons.length !== 1 ? 's' : ''}
                                </div>
                                <div className="space-y-1">
                                  {monthlyAddons.map(addon => {
                                    const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
                                    return (
                                      <div key={addon.id} className="flex justify-between items-center py-0.5">
                                        <span className="truncate text-muted-foreground">{addon.name}</span>
                                        {discountPercent > 0 ? (
                                          <div className="text-right flex items-center gap-1.5 shrink-0">
                                            <span className="line-through text-muted-foreground/60">{formatPrice(addon.price)}</span>
                                            <span className="font-medium">{formatPrice(addonPricing.discounted)}/mes</span>
                                          </div>
                                        ) : (
                                          <span className="font-medium">{formatPrice(addon.price)}/mes</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* Subtotal mensual antes del descuento */}
                            {discountPercent > 0 && totals.monthlySubtotal > 0 && (
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 pt-2 border-t border-border/50">
                                <span>Subtotal mensual (antes de descuento)</span>
                                <span className="line-through">{formatPrice(totals.monthlySubtotal)}</span>
                              </div>
                            )}
                            
                            {/* Descuento mensual aplicado */}
                            {discountPercent > 0 && totals.monthlyDiscount > 0 && (
                              <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-2">
                                <span className="flex items-center gap-1">
                                  🏷️ Descuento ({campaign?.name || 'Promoción'})
                                </span>
                                <span className="font-semibold">-{formatPrice(totals.monthlyDiscount)}/mes</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <span className="font-semibold">Total mensual</span>
                              <span className="text-2xl font-bold text-primary">{formatPrice(totals.monthlyTotal)}<span className="text-sm font-normal text-muted-foreground">/mes</span></span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </>
                )}

                {errors.selectedPlan && (
                  <p className="text-sm text-destructive mt-4">{errors.selectedPlan.message}</p>
                )}

                <div className="flex gap-4 mt-8">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1 rounded-full">
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!selectedPlanId}
                    className="flex-1 rounded-full"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Timeline/Urgency */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl font-bold mb-2">¿Cuándo necesitas tu proyecto?</h3>
                <p className="text-muted-foreground mb-6">Opciones de entrega express disponibles</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {timelines.map((option) => {
                    const isSelected = timeline === option.id;
                    const hasMarkup = option.hasMarkup;
                    
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setValue("timeline", option.id);
                          // Update selected rush fee immediately
                          if (option.rushFee) {
                            setSelectedRushFee(option.rushFee);
                          } else {
                            setSelectedRushFee(null);
                          }
                        }}
                        className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {/* Express Badge */}
                        {hasMarkup && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                            {option.displayName || 'Express'}
                          </span>
                        )}
                        
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <span className="font-semibold text-base block">{option.label}</span>
                            <span className="text-sm text-muted-foreground block mt-1">{option.sublabel}</span>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-primary shrink-0" />
                          )}
                        </div>
                        
                        {/* Monto extra en pesos - Mostrado prominentemente */}
                        {hasMarkup && option.rushFeeAmount > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2 -mx-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                Cargo por urgencia:
                              </span>
                              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                +{formatPrice(option.rushFeeAmount)}
                              </span>
                            </div>
                            <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                              <span className="font-medium">+{option.markupPercent}%</span> por prioridad máxima
                            </div>
                          </div>
                        )}
                        
                        {!hasMarkup && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              ✅ Sin cargo adicional
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Resumen de totales actualizado con rush fee */}
                {timeline && selectedPlanObj && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-lavender/5 border-2 border-primary/20 shadow-lg space-y-4"
                  >
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Resumen de totales
                    </h4>
                    
                    {/* Pago Inicial con rush fee */}
                    <div className="bg-background/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                          💰 Pago inicial
                        </span>
                        {discountPercent > 0 && totals.initialSubtotal > 0 && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>
                      
                      {/* Desglose */}
                      <div className="space-y-1 mb-2 text-xs text-muted-foreground">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between">
                            <span>Plan {selectedPlanObj.name}</span>
                            <span>{formatPrice(selectedPlanObj.price)}</span>
                          </div>
                          {/* Show standard delivery days if no rush fee */}
                          {!totals.hasRushFee && (() => {
                            const deliveryRange = getPlanStandardDays(selectedPlanObj.slug);
                            return (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                                <Clock className="w-3 h-3" />
                                <span>
                                  Entrega estándar: {deliveryRange.min === deliveryRange.max 
                                    ? `${deliveryRange.min} días hábiles`
                                    : `${deliveryRange.min}-${deliveryRange.max} días hábiles`
                                  }
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        {oneTimeAddons.length > 0 && (
                          <>
                            {oneTimeAddons.map(addon => {
                              const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
                              return (
                                <div key={addon.id} className="flex justify-between">
                                  <span className="truncate">{addon.name}</span>
                                  <span>{formatPrice(addonPricing.discounted)}</span>
                                </div>
                              );
                            })}
                          </>
                        )}
                        {totals.hasRushFee && totals.rushFeeAmount > 0 && selectedRushFee && (
                          <div className="flex justify-between pt-2 border-t border-border/50">
                            <div className="flex flex-col">
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                {selectedRushFee.display_name || 'Entrega Express'}
                              </span>
                              {selectedRushFee.delivery_days_min && selectedRushFee.delivery_days_max && (
                                <span className="text-[10px] text-muted-foreground mt-0.5">
                                  {selectedRushFee.delivery_days_min === selectedRushFee.delivery_days_max
                                    ? `${selectedRushFee.delivery_days_min} días hábiles`
                                    : `${selectedRushFee.delivery_days_min}-${selectedRushFee.delivery_days_max} días hábiles`}
                                </span>
                              )}
                            </div>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">+{formatPrice(totals.rushFeeAmount)}</span>
                          </div>
                        )}
                      </div>
                      
                      {discountPercent > 0 && totals.initialSubtotal > 0 && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 pt-2 border-t border-border/50">
                          <span>Subtotal inicial</span>
                          <span className="line-through">{formatPrice(totals.initialSubtotal)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="font-semibold">Total inicial</span>
                        <span className="text-2xl font-bold text-primary">{formatPrice(totals.initialTotal)}</span>
                      </div>
                    </div>

                    {/* Pago Mensual */}
                    {totals.hasMonthly && (
                      <div className="bg-background/50 rounded-xl p-4 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            🔄 Pago mensual
                          </span>
                          {discountPercent > 0 && totals.monthlySubtotal > 0 && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                              -{discountPercent}%
                            </span>
                          )}
                        </div>
                        
                        {discountPercent > 0 && totals.monthlySubtotal > 0 && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 pt-2 border-t border-border/50">
                            <span>Subtotal mensual</span>
                            <span className="line-through">{formatPrice(totals.monthlySubtotal)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="font-semibold">Total mensual</span>
                          <span className="text-2xl font-bold text-primary">{formatPrice(totals.monthlyTotal)}<span className="text-sm font-normal text-muted-foreground">/mes</span></span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {errors.timeline && (
                  <p className="text-sm text-destructive mb-4">{errors.timeline.message}</p>
                )}
                <input type="hidden" {...register("timeline")} />

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1 rounded-full">
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!timeline}
                    className="flex-1 rounded-full"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Contact Info + Summary */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl font-bold mb-6">Finaliza tu cotización</h3>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Contact Form */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg mb-4">Datos de contacto</h4>
                  <div>
                      <label className="block text-sm font-medium mb-2">Nombre completo *</label>
                    <input
                      type="text"
                        {...register("name")}
                        className={`w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                          errors.name ? "border-destructive" : "border-border focus:border-primary"
                        }`}
                      placeholder="Tu nombre"
                    />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                      )}
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-2">Correo electrónico *</label>
                    <input
                      type="email"
                        {...register("email")}
                        className={`w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                          errors.email ? "border-destructive" : "border-border focus:border-primary"
                        }`}
                      placeholder="tu@email.com"
                    />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono (opcional)</label>
                    <input
                      type="tel"
                        {...register("phone")}
                      className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-2">Notas adicionales (opcional)</label>
                    <textarea
                        {...register("message")}
                        rows={3}
                      className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        placeholder="Algo más que debamos saber..."
                    />
                  </div>
                </div>

                  {/* Quote Summary */}
                  <div className="bg-muted/50 rounded-2xl p-6 border border-border">
                    <h4 className="font-semibold text-lg mb-4">Resumen de tu cotización</h4>

                    {/* Express Delivery Info */}
                    {selectedRushFee && (
                      <div className={`mb-4 p-3 rounded-xl border ${totals.hasRushFee ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            {selectedRushFee.display_name}: {formatDeliveryDays(selectedRushFee.delivery_days_min, selectedRushFee.delivery_days_max)}
                          </span>
                          {totals.hasRushFee && (
                            <span className="ml-auto text-xs font-semibold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/20">
                              Prioridad Premium
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* PAGO INICIAL Section */}
                    <div className="mb-4 pb-4 border-b border-border">
                      <h5 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        💰 Pago inicial
                      </h5>
                      
                      {/* Selected Plan */}
                      {selectedPlanObj && (
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <span className="text-sm font-medium">{selectedPlanObj.name}</span>
                            <span className="text-xs text-muted-foreground block">Plan principal</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold">{formatPrice(selectedPlanObj.price)}</span>
                          </div>
                        </div>
                      )}

                      {/* Rush Fee (Express Delivery) */}
                      {totals.hasRushFee && selectedRushFee && (
                        <div className="flex items-center justify-between py-2 text-amber-600 dark:text-amber-400">
                          <div>
                            <span className="text-sm font-medium">{selectedRushFee.display_name}</span>
                            <span className="text-xs opacity-80 block">Entrega prioritaria (+{totals.rushFeePercent}%)</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold">+{formatPrice(totals.rushFeeAmount)}</span>
                          </div>
                        </div>
                      )}

                      {/* Selected Add-ons - One-time */}
                      {oneTimeAddons.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Add-ons (pago único)</span>
                          {oneTimeAddons.map(addon => {
                            const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
                            return (
                              <div key={addon.id} className="flex items-center justify-between mt-2">
                                <span className="text-xs">{addon.name}</span>
                                <div className="text-right">
                                  {discountPercent > 0 ? (
                                    <>
                                      <span className="text-xs font-medium">{formatPrice(addonPricing.discounted)}</span>
                                      <span className="text-xs text-muted-foreground line-through ml-1">{formatPrice(addonPricing.original)}</span>
                                    </>
                                  ) : (
                                    <span className="text-xs font-medium">{formatPrice(addon.price)}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Discount for Initial Payment */}
                      {discountPercent > 0 && campaign && totals.initialSubtotal > 0 && (
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50 text-emerald-600 dark:text-emerald-400">
                          <span className="text-xs">🏷️ {campaign.name}</span>
                          <span className="text-xs font-medium">-{discountPercent}%</span>
                        </div>
                      )}

                      {/* Initial Payment Total */}
                      <div className="mt-3 pt-2 border-t border-border">
                        {discountPercent > 0 && totals.initialSubtotal > 0 && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Subtotal inicial</span>
                            <span className="line-through">{formatPrice(totals.initialSubtotal)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">Total inicial</span>
                          <span className="font-bold text-lg text-primary">{formatPrice(totals.initialTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* PAGO MENSUAL Section */}
                    {totals.hasMonthly && (
                      <div className="mb-4 pb-4 border-b border-border">
                        <h5 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                          🔄 Pago mensual
                        </h5>

                        {/* Selected Add-ons - Monthly */}
                        {selectedAddonObjs.filter(a => a.billing_type === 'monthly').map(addon => {
                          const addonPricing = calculateCampaignDiscount(addon.price, discountPercent);
                          return (
                            <div key={addon.id} className="flex items-center justify-between py-2">
                              <span className="text-xs">{addon.name}</span>
                              <div className="text-right">
                                {discountPercent > 0 ? (
                                  <>
                                    <span className="text-xs font-medium">{formatPrice(addonPricing.discounted)}<span className="text-xs text-muted-foreground">/mes</span></span>
                                    <span className="text-xs text-muted-foreground line-through ml-1 block">{formatPrice(addonPricing.original)}/mes</span>
                                  </>
                                ) : (
                                  <span className="text-xs font-medium">{formatPrice(addon.price)}<span className="text-xs text-muted-foreground">/mes</span></span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Discount for Monthly Payment */}
                        {discountPercent > 0 && campaign && totals.monthlySubtotal > 0 && (
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50 text-emerald-600 dark:text-emerald-400">
                            <span className="text-xs">🏷️ {campaign.name}</span>
                            <span className="text-xs font-medium">-{discountPercent}%</span>
                          </div>
                        )}

                        {/* Monthly Payment Total */}
                        <div className="mt-3 pt-2 border-t border-border">
                          {discountPercent > 0 && totals.monthlySubtotal > 0 && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Subtotal mensual</span>
                              <span className="line-through">{formatPrice(totals.monthlySubtotal)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">Total mensual</span>
                            <span className="font-bold text-lg text-primary">{formatPrice(totals.monthlyTotal)}<span className="text-xs font-normal text-muted-foreground">/mes</span></span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      💡 Sin compromiso - solo expresa tu interés
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1 rounded-full">
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !name || !email}
                    className="flex-1 rounded-full border-beam"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar a WhatsApp"}
                    <MessageSquare className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </FlashlightCard>
        </form>

        {/* Direct WhatsApp Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground mb-4">¿Prefieres hablar directamente?</p>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              window.open("https://wa.me/528116364522?text=Hola%2C%20quiero%20información%20sobre%20sus%20servicios", "_blank");
            }}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Hablar por WhatsApp
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// ============ FAQs SECTION ============
function FAQsSection() {
  const faqs = [
    {
      question: "¿Realmente pueden entregar tan rápido?",
      answer:
        "Sí. Nuestro proceso está optimizado para máxima eficiencia. Trabajamos con sprints intensivos y tecnología moderna que nos permite entregar proyectos de alta calidad en tiempo récord. Los tiempos varían según el plan: Starter (2-7 días), Business (3-10 días) y Pro Plus (5-30 días) según la complejidad del proyecto.",
    },
    {
      question: "¿Qué incluye el precio?",
      answer:
        "Todos nuestros planes incluyen diseño personalizado, desarrollo responsive, optimización SEO básica, hosting por 1 año, certificado SSL, y soporte post-lanzamiento. No hay costos ocultos.",
    },
    {
      question: "¿Puedo hacer cambios después de la entrega?",
      answer:
        "Por supuesto. Incluimos rondas de revisiones según el plan elegido. Después del lanzamiento, ofrecemos planes de mantenimiento mensual o puedes solicitar cambios puntuales con costos adicionales.",
    },
    {
      question: "¿Qué tecnologías utilizan?",
      answer:
        "Utilizamos el stack más moderno del mercado: Next.js, React, TypeScript, Tailwind CSS, y plataformas headless CMS. Esto garantiza velocidad, seguridad y escalabilidad.",
    },
    {
      question: "¿Ofrecen hosting y dominio?",
      answer:
        "Sí, incluimos hosting premium por 1 año en todos nuestros planes. El dominio puede estar incluido o transferirse si ya cuentas con uno.",
    },
    {
      question: "¿Cómo es el proceso de pago?",
      answer:
        "Trabajamos con 50% de anticipo para iniciar el proyecto y 50% al momento de la entrega. Aceptamos transferencias bancarias, tarjetas de crédito/débito y PayPal.",
    },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            FAQs
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Preguntas <span className="text-gradient">Frecuentes</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border rounded-2xl px-6 bg-card data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

// ============ FOOTER ============
function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src="/logo-sitioexpress.png"
                  alt="SitioExpress Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-xl">
                Sitio<span className="text-primary">Express</span>.mx
              </span>
            </div>
            <p className="text-background/70 mb-6 max-w-md">
              Transformamos tu visión en una presencia digital que convierte. 
              Sitios web profesionales desde 2 hasta 30 días hábiles según tu plan.
            </p>
            <div className="flex gap-4">
              {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#cotizador" className="hover:text-background transition-colors">Cotizador</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-background/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+52 81 1636 4522</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Monterrey, México</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} SitioExpress.mx. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-background/50">
            <Link href="/privacidad" className="hover:text-background transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-background transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============ MAIN PAGE ============
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <main>
        {/* S1: Hero + Cotizador */}
        <HeroWithQuote />
        
        {/* S2: Razones para Confiar */}
        <TrustSection />
        
        {/* S3: Cómo Funciona el Cotizador */}
        <ProcessExplanationSection />
        
        {/* S4: Proceso de Trabajo */}
        <ProcessSection />
        
        {/* S6: Beneficios/Diferenciadores */}
        <ProblemSection />
        
        {/* S7: FAQs */}
        <FAQsSection />
      </main>
      <Footer />
      
      {/* Sticky CTA for Mobile */}
      <StickyQuoteCTA
        currentStep={1}
        onClick={() => {
          document.getElementById("cotizador")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      
      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}