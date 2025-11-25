"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Mail,
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
    { href: "#servicios", label: "Servicios" },
    { href: "#proceso", label: "Proceso" },
    { href: "#planes", label: "Planes" },
    { href: "#portafolio", label: "Portafolio" },
    { href: "#contacto", label: "Contacto" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass border-b border-border/50 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Web<span className="text-primary">Express</span>
            <span className="text-muted-foreground">.mx</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
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
          <Button className="hidden md:flex border-beam rounded-full" size="sm">
            Comenzar Proyecto
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
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium py-2"
                >
                  {link.label}
                </a>
              ))}
              <Button className="mt-4 rounded-full">Comenzar Proyecto</Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
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
          <span className="text-sm font-medium text-primary">Tu web profesional en 7 días o menos</span>
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
          <Button size="lg" className="border-beam rounded-full px-8 h-14 text-lg group">
            Solicitar Cotización
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg">
            Ver Portafolio
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
      solution: "Entregamos en 7 días o menos",
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
      day: "Día 1-2",
      title: "Descubrimiento",
      description: "Entendemos tu negocio, objetivos y audiencia. Definimos requisitos técnicos y funcionales.",
      icon: MessageSquare,
    },
    {
      day: "Día 3-4",
      title: "Primera Entrega",
      description: "Desarrollamos tu sitio con tecnología de punta. Presentamos la primera versión funcional.",
      icon: Code,
    },
    {
      day: "Día 5-6",
      title: "Refinamiento",
      description: "Implementamos ajustes y mejoras. Hasta 3 rondas de revisiones incluidas según tu plan.",
      icon: Palette,
    },
    {
      day: "Día 7",
      title: "Lanzamiento",
      description: "Pruebas finales, optimización y entrega. Tu sitio listo para conquistar el mundo.",
      icon: Rocket,
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
            Proceso <span className="text-gradient">Express</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Desarrollo ágil en 7 días con hasta 3 revisiones incluidas
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
                    <span className="text-primary font-bold text-sm">{step.day}</span>
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

// ============ PLANES Y PRECIOS SECTION ============
function PricingSection() {
  const [currentPlan, setCurrentPlan] = useState(1);

  const plans = [
    {
      name: "Starter",
      subtitle: "Para iniciar o validar una idea",
      price: "$17,500",
      description: "Para validar una idea o tener presencia urgente",
      features: [
        "Landing Page profesional",
        "Diseño responsive premium",
        "1 formulario / WhatsApp",
        "SEO básico",
        "Entrega en 5 días",
        "1 ronda de revisión",
      ],
      popular: false,
    },
    {
      name: "Business",
      subtitle: "Para empresas que buscan crecer",
      price: "$24,900",
      description: "Mejor relación precio/resultado",
      features: [
        "Sitio de 3–5 páginas",
        "Diseño premium personalizado",
        "Copy refinado desde tu brief",
        "Blog básico (opcional)",
        "Integraciones simples (WhatsApp / forms)",
        "SEO básico + estructura escalable",
        "3 rondas de revisiones",
        "Entrega en 7 días",
        "30 días de soporte incluido",
      ],
      popular: true,
    },
    {
      name: "Pro Plus",
      subtitle: "Para marcas que necesitan impacto premium",
      price: "$34,900",
      description: "Para proyectos con estrategia + diseño avanzado",
      features: [
        "Todo lo de Business +",
        "1–2 páginas adicionales",
        "Animaciones avanzadas",
        "Microinteracciones",
        "Integraciones personalizadas (Zapier, CRM)",
        "Optimización de performance",
        "Consultoría de estructura",
        "Prioridad en agenda",
        "60 días de soporte",
      ],
      popular: false,
    },
  ];

  const nextPlan = () => setCurrentPlan((prev) => (prev + 1) % plans.length);
  const prevPlan = () => setCurrentPlan((prev) => (prev - 1 + plans.length) % plans.length);

  return (
    <section id="planes" className="py-24 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Precios
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Planes <span className="text-gradient">Transparentes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sin costos ocultos. Elige el plan que mejor se adapte a tus necesidades.
          </p>
        </motion.div>

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
              <PricingCard plan={plans[currentPlan]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <PricingCard plan={plan} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
}: {
  plan: {
    name: string;
    subtitle?: string;
    price: string;
    description: string;
    features: string[];
    popular: boolean;
  };
}) {
  return (
    <FlashlightCard
      className={`h-full flex flex-col relative ${
        plan.popular ? "border-primary ring-2 ring-primary/20" : ""
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-full whitespace-nowrap z-10">
          Más Popular
        </div>
      )}
      <div className={`text-center mb-6 ${plan.popular ? "mt-4" : ""}`}>
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        {plan.subtitle && (
          <p className="text-sm text-primary font-medium mt-1">{plan.subtitle}</p>
        )}
        <p className="text-muted-foreground mt-1">{plan.description}</p>
      </div>
      <div className="text-center mb-6">
        <span className="text-5xl font-bold text-gradient">{plan.price}</span>
        <span className="text-muted-foreground"> MXN</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className={`w-full rounded-full ${plan.popular ? "border-beam" : ""}`}
        variant={plan.popular ? "default" : "outline"}
      >
        Elegir Plan
      </Button>
    </FlashlightCard>
  );
}

// ============ INTEGRACIONES SECTION ============
function IntegrationsSection() {
  const integrations = [
    { name: "Stripe", icon: "💳" },
    { name: "Shopify", icon: "🛒" },
    { name: "HubSpot", icon: "🎯" },
    { name: "Mailchimp", icon: "📧" },
    { name: "Google Analytics", icon: "📊" },
    { name: "Zapier", icon: "⚡" },
    { name: "Notion", icon: "📝" },
    { name: "Slack", icon: "💬" },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Tecnología
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Integraciones <span className="text-gradient">Poderosas</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conectamos tu sitio con las herramientas que ya usas
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {integrations.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <FlashlightCard className="text-center py-8">
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </FlashlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ PORTFOLIO MARQUEE ============
function PortfolioSection() {
  const projects = [
    { 
      name: "Fincentiva", 
      category: "Pyme", 
      url: "https://www.fincentiva.com.mx/",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot-2025-11-25-at-9.22.30-a.m-1764084159655.png?width=8000&height=8000&resize=contain" 
    },
    { 
      name: "Halcyon", 
      category: "Corporativo", 
      url: "https://www.halcyon.mx/",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot-2025-11-25-at-9.21.37-a.m-1764084137090.png?width=8000&height=8000&resize=contain" 
    },
    { 
      name: "Autos Fincentiva", 
      category: "Simuladores", 
      url: "http://autos.fincentiva.com.mx/",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot-2025-11-25-at-9.20.42-a.m-1764084137821.png?width=8000&height=8000&resize=contain" 
    },
    { 
      name: "Fer y Diego", 
      category: "Bodas", 
      url: "https://ferydiego.vercel.app/",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot-2025-11-25-at-9.21.04-a.m-1764084138121.png?width=8000&height=8000&resize=contain" 
    },
  ];

  return (
    <section id="portafolio" className="py-24 md:py-32 bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Portafolio
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Proyectos <span className="text-gradient">Destacados</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sitios web reales que hemos creado para nuestros clientes
          </p>
        </motion.div>
      </div>

      {/* Projects Grid with Screenshots */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProjectPreviewCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectPreviewCard({ project }: { project: { name: string; category: string; url: string; image: string } }) {
  return (
    <a 
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <FlashlightCard className="p-0 overflow-hidden">
        {/* Browser Window Chrome */}
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-background/80 rounded-md px-3 py-1.5 text-xs text-muted-foreground truncate max-w-md mx-auto">
              {project.url.replace(/^https?:\/\//, '')}
            </div>
          </div>
        </div>
        
        {/* Website Screenshot */}
        <div className="relative h-64 md:h-80 bg-background overflow-hidden">
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <span className="text-primary text-sm font-medium">{project.category}</span>
                <h3 className="text-white text-xl font-bold">{project.name}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary transition-colors">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </FlashlightCard>
    </a>
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
                alt="Equipo WebExpress"
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

// ============ CONTACT FORM ============
function ContactSection() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: "",
    budget: "",
    timeline: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const projectTypes = [
    { id: "landing", label: "Landing Page", icon: Globe },
    { id: "ecommerce", label: "E-Commerce", icon: ShoppingCart },
    { id: "corporate", label: "Sitio Corporativo", icon: Building2 },
    { id: "webapp", label: "Web App", icon: Code },
    { id: "redesign", label: "Rediseño", icon: Palette },
    { id: "other", label: "Otro", icon: Briefcase },
  ];

  const budgets = [
    { id: "starter", label: "$5,000 - $10,000" },
    { id: "business", label: "$10,000 - $25,000" },
    { id: "enterprise", label: "$25,000 - $50,000" },
    { id: "custom", label: "$50,000+" },
  ];

  const timelines = [
    { id: "urgent", label: "Lo antes posible" },
    { id: "month", label: "Este mes" },
    { id: "quarter", label: "Este trimestre" },
    { id: "flexible", label: "Flexible" },
  ];

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

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
            Contacto
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Comienza tu <span className="text-gradient">Proyecto</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cuéntanos sobre tu proyecto y te contactaremos en menos de 24 horas
          </p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step >= i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i}
              </div>
              {i < 3 && (
                <div
                  className={`w-16 h-1 mx-2 rounded-full transition-colors ${
                    step > i ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <FlashlightCard className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl font-bold mb-6">¿Qué tipo de proyecto necesitas?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, projectType: type.id })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.projectType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <type.icon className="w-6 h-6 text-primary mb-2" />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleNext}
                  disabled={!formData.projectType}
                  className="w-full rounded-full"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl font-bold mb-6">Detalles del proyecto</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Presupuesto estimado</label>
                  <div className="grid grid-cols-2 gap-3">
                    {budgets.map((budget) => (
                      <button
                        key={budget.id}
                        onClick={() => setFormData({ ...formData, budget: budget.id })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.budget === budget.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {budget.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium mb-3">¿Cuándo lo necesitas?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {timelines.map((timeline) => (
                      <button
                        key={timeline.id}
                        onClick={() => setFormData({ ...formData, timeline: timeline.id })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.timeline === timeline.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {timeline.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 rounded-full">
                    Atrás
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!formData.budget || !formData.timeline}
                    className="flex-1 rounded-full"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl font-bold mb-6">Información de contacto</h3>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre completo</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono (opcional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cuéntanos más (opcional)</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="Describe tu proyecto..."
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 rounded-full">
                    Atrás
                  </Button>
                  <Button
                    disabled={!formData.name || !formData.email}
                    className="flex-1 rounded-full border-beam"
                  >
                    Enviar Solicitud
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </FlashlightCard>

        {/* Schedule Call Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground mb-4">¿Prefieres hablar directamente?</p>
          <Button variant="outline" className="rounded-full">
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Llamada
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
      question: "¿Realmente pueden entregar en 7 días?",
      answer:
        "Sí. Nuestro proceso está optimizado para máxima eficiencia. Trabajamos con sprints intensivos y tecnología moderna que nos permite entregar proyectos de alta calidad en tiempo récord. Para proyectos más complejos como e-commerce, el tiempo puede extenderse a 10-14 días.",
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
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                <Zap className="w-5 h-5 text-foreground" />
              </div>
              <span className="font-bold text-xl">
                Web<span className="text-primary">Express</span>.mx
              </span>
            </div>
            <p className="text-background/70 mb-6 max-w-md">
              Transformamos tu visión en una presencia digital que convierte. 
              Sitios web profesionales en 7 días o menos.
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
            <h4 className="font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">Landing Pages</a></li>
              <li><a href="#" className="hover:text-background transition-colors">E-Commerce</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Sitios Corporativos</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Web Apps</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-background/70">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hola@webexpress.mx</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+52 55 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>CDMX, México</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © 2024 WebExpress.mx. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-background/50">
            <a href="#" className="hover:text-background transition-colors">Privacidad</a>
            <a href="#" className="hover:text-background transition-colors">Términos</a>
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
        <HeroSection />
        <ServicesSection />
        <ProblemSection />
        <ProcessSection />
        <PricingSection />
        <IntegrationsSection />
        <PortfolioSection />
        <AboutSection />
        <ContactSection />
        <FAQsSection />
      </main>
      <Footer />
    </div>
  );
}