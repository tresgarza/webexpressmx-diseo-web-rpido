'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveCampaign, getTimeRemaining, type Campaign } from '@/lib/campaigns';

export function PromoBanner() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const loadCampaign = async () => {
      const activeCampaign = await getActiveCampaign();
      setCampaign(activeCampaign);
      
      if (activeCampaign) {
        const remaining = getTimeRemaining(activeCampaign.end_date);
        setTimeRemaining(remaining.text);
      }
    };

    loadCampaign();

    // Refetch every hour
    const interval = setInterval(loadCampaign, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown every minute
  useEffect(() => {
    if (!campaign) return;

    const updateCountdown = () => {
      const remaining = getTimeRemaining(campaign.end_date);
      setTimeRemaining(remaining.text);
    };

    const interval = setInterval(updateCountdown, 60 * 1000);
    return () => clearInterval(interval);
  }, [campaign]);

  // Check localStorage for dismiss state
  useEffect(() => {
    const dismissed = localStorage.getItem('promo_banner_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismiss = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('promo_banner_dismissed', Date.now().toString());
    setIsDismissed(true);
  };

  const handleCTAClick = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!campaign || !campaign.banner_message || isDismissed) return null;

  const remaining = getTimeRemaining(campaign.end_date);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/95 to-primary"
        >
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-30" />
          
          <div className="relative mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3">
              {/* Sparkle icon with subtle animation */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="h-4 w-4 text-primary-foreground/90" />
              </motion.div>
              
              {/* Message */}
              <button
                onClick={handleCTAClick}
                className="group flex items-center gap-2 text-sm font-medium text-primary-foreground hover:text-white transition-colors"
              >
                <span>{campaign.banner_message}</span>
                
                {/* Time remaining badge */}
                {remaining.isUrgent && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/30 text-xs font-medium text-white">
                    <Clock className="w-3 h-3" />
                    {timeRemaining}
                  </span>
                )}
                
                {campaign.banner_cta && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-white group-hover:bg-white/30 transition-colors">
                    {campaign.banner_cta}
                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>
              
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 transition-all"
                aria-label="Cerrar banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
