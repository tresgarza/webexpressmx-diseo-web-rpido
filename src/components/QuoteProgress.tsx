"use client";

import { Check } from "lucide-react";

interface QuoteProgressProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS: Record<number, string> = {
  1: "Plan",
  2: "Urgencia",
  3: "Extras",
  4: "Contacto",
};

export function QuoteProgress({ currentStep, totalSteps }: QuoteProgressProps) {
  return (
    <div className="mb-4 md:mb-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              currentStep >= step
                ? "bg-primary text-primary-foreground scale-110"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {currentStep > step ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < totalSteps && (
            <div
                className={`w-6 md:w-10 h-1 mx-1 rounded-full transition-colors duration-300 ${
                currentStep > step ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
      </div>
      {/* Step Labels (Mobile hidden, Desktop visible) */}
      <div className="hidden md:flex items-center justify-center gap-1.5 mt-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <span
              className={`w-8 text-center text-[10px] font-medium transition-colors ${
                currentStep >= step
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {STEP_LABELS[step] || `Paso ${step}`}
            </span>
            {step < totalSteps && (
              <div className="w-6 md:w-10 mx-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

