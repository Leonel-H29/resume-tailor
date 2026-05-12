"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, label: "Parsing resume content", duration: 1800 },
  { id: 2, label: "Analyzing job description", duration: 2200 },
  { id: 3, label: "Extracting ATS keywords", duration: 2800 },
  { id: 4, label: "Optimizing experience section", duration: 3800 },
  { id: 5, label: "Generating tailored resume", duration: 5500 },
  { id: 6, label: "Rendering PDF document", duration: 7000 },
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCurrentStep(index);
        if (index > 0) {
          setCompletedSteps((prev) => [...prev, index - 1]);
        }
      }, step.duration - STEPS[0].duration + (index === 0 ? 0 : 200));
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Animated orb */}
      <div className="relative mb-10">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center animate-pulse-slow">
            <Loader2 size={28} className="text-accent animate-spin" />
          </div>
        </div>
        <div className="absolute inset-0 rounded-full animate-ping bg-accent/10" style={{ animationDuration: "2s" }} />
      </div>

      <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
        Crafting your resume
      </h3>
      <p className="text-sm text-muted-foreground mb-8 text-center">
        Our AI is analyzing and tailoring your resume to the job description
      </p>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-3">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index && !isCompleted;
          const isPending = index > currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isPending ? "opacity-30" : "opacity-100"
              }`}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 size={18} className="text-accent" />
                ) : isCurrent ? (
                  <Loader2 size={18} className="text-accent animate-spin" />
                ) : (
                  <Circle size={18} className="text-border" />
                )}
              </div>
              <span
                className={`text-sm transition-colors duration-300 ${
                  isCompleted
                    ? "text-accent/70 line-through"
                    : isCurrent
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-8 w-full max-w-sm">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, ((currentStep + 1) / STEPS.length) * 100)}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          This typically takes 15–30 seconds
        </p>
      </div>
    </div>
  );
}
