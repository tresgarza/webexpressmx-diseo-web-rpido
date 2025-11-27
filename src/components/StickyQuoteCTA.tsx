"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyQuoteCTAProps {
  currentStep: number;
  onClick: () => void;
  quoteElementId?: string;
}

export function StickyQuoteCTA({
  currentStep,
  onClick,
  quoteElementId = "cotizador",
}: StickyQuoteCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const quoteElement = document.getElementById(quoteElementId);
      
      // Check if quote is in viewport
      if (quoteElement) {
        const rect = quoteElement.getBoundingClientRect();
        const inViewport = rect.top >= 0 && rect.top <= window.innerHeight;
        setIsInViewport(inViewport);
      }

      // Show button after 300px scroll and if quote is not in viewport
      setIsVisible(scrollY > 300 && !isInViewport);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [quoteElementId, isInViewport]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden"
      >
        <Button
          onClick={onClick}
          className="rounded-full shadow-lg shadow-primary/25 border-beam"
          size="lg"
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Continuar Solicitud
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}




