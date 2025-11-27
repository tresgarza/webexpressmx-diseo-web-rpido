'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  endDate: Date;
  className?: string;
}

export function CountdownTimer({ endDate, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endDate.getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (isExpired) {
    return (
      <span className={`text-destructive font-semibold ${className}`}>
        ⚠️ Esta oferta ha expirado
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium">⏱️ Esta oferta termina en:</span>
      <div className="flex gap-2">
        {timeLeft.days > 0 && (
          <motion.div
            key={timeLeft.days}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="bg-primary/10 text-primary px-2 py-1 rounded font-bold text-sm"
          >
            {timeLeft.days}d
          </motion.div>
        )}
        <motion.div
          key={`${timeLeft.hours}-${timeLeft.minutes}-${timeLeft.seconds}`}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="bg-primary/10 text-primary px-2 py-1 rounded font-bold text-sm"
        >
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </motion.div>
      </div>
    </div>
  );
}





