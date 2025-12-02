'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActivePromotion, type Promotion } from '@/lib/promotions';

const NAMES = [
  'María', 'Carlos', 'Ana', 'Luis', 'Patricia', 'Roberto', 'Laura', 'Diego',
  'Fernanda', 'Javier', 'Sofía', 'Miguel', 'Carmen', 'Ricardo', 'Alejandra'
];

const CITIES = [
  'Monterrey', 'Ciudad de México', 'Guadalajara', 'Puebla', 'Tijuana',
  'León', 'Querétaro', 'Mérida', 'Cancún', 'Toluca'
];

const COMPANIES = [
  'TechSolutions', 'Digital Plus', 'Innovación MX', 'WebPro', 'Creative Studio',
  'Marketing Express', 'Negocios Online', 'Startup Hub', 'Empresa Digital'
];

function replacePlaceholders(message: string): string {
  let result = message;
  
  // Reemplazar [NOMBRE]
  if (result.includes('[NOMBRE]')) {
    result = result.replace('[NOMBRE]', NAMES[Math.floor(Math.random() * NAMES.length)]);
  }
  
  // Reemplazar [CIUDAD]
  if (result.includes('[CIUDAD]')) {
    result = result.replace('[CIUDAD]', CITIES[Math.floor(Math.random() * CITIES.length)]);
  }
  
  // Reemplazar [EMPRESA]
  if (result.includes('[EMPRESA]')) {
    result = result.replace('[EMPRESA]', COMPANIES[Math.floor(Math.random() * COMPANIES.length)]);
  }
  
  // Reemplazar [N] con números aleatorios
  result = result.replace(/\[N\]/g, () => {
    const num = Math.floor(Math.random() * 20) + 1;
    return num.toString();
  });
  
  // Reemplazar [N] minutos/horas
  result = result.replace(/\[N\] minutos/g, () => {
    const num = Math.floor(Math.random() * 30) + 1;
    return `${num} minutos`;
  });
  
  result = result.replace(/\[N\] horas/g, () => {
    const num = Math.floor(Math.random() * 5) + 1;
    return `${num} horas`;
  });
  
  return result;
}

export function SocialToast() {
  const [currentPromo, setCurrentPromo] = useState<Promotion | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);

  useEffect(() => {
    const loadPromo = async () => {
      const promo = await getActivePromotion('social_toast');
      if (promo) {
        setCurrentPromo(promo);
      }
    };

    loadPromo();

    // Rotar cada 30 segundos
    const interval = setInterval(() => {
      loadPromo();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentPromo) return;

    // Mostrar notificación cada 30-60 segundos
    const showNotification = () => {
      const message = replacePlaceholders(currentPromo.message);
      
      // Evitar repetir el mismo mensaje inmediatamente
      if (displayedMessages.length > 0 && displayedMessages[displayedMessages.length - 1] === message) {
        return;
      }

      setDisplayedMessages(prev => [...prev.slice(-2), message]); // Mantener solo últimas 3
      setIsVisible(true);

      // Ocultar después de 5 segundos
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Primera notificación después de 10 segundos
    const initialTimeout = setTimeout(showNotification, 10000);

    // Luego cada 30-60 segundos aleatoriamente
    const interval = setInterval(() => {
      const delay = Math.random() * 30000 + 30000; // Entre 30-60 segundos
      setTimeout(showNotification, delay);
    }, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [currentPromo, displayedMessages]);

  if (!currentPromo) return null;

  return (
    <AnimatePresence>
      {isVisible && displayedMessages.length > 0 && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          className="fixed bottom-4 left-4 z-40 max-w-sm bg-card border border-border shadow-lg rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {displayedMessages[displayedMessages.length - 1]}
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}






