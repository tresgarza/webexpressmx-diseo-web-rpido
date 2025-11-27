"use client";

import { Check, Circle } from "lucide-react";

interface ProcessTimelineProps {
  currentStep: number;
  totalSteps: number;
}

export function ProcessTimeline({ currentStep, totalSteps }: ProcessTimelineProps) {
  const steps = [
    { number: 1, label: "Elige tu plan", description: "Selecciona el plan base y personaliza con add-ons" },
    { number: 2, label: "Define tu urgencia", description: "Elige cuándo necesitas tu proyecto" },
    { number: 3, label: "Completa tus datos", description: "Completa tu solicitud y te contactamos por WhatsApp" },
  ];

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-start md:items-center gap-4 flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-6 h-6" />
                ) : (
                  step.number
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden md:block w-full h-1 mt-2 transition-colors duration-300 ${
                    currentStep > step.number ? "bg-primary" : "bg-muted"
                  }`}
                  style={{ width: "100px" }}
                />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{step.label}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




