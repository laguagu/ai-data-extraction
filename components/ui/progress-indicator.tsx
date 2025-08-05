"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  className?: string;
}

export function ProgressIndicator({
  steps,
  currentStep,
  completedSteps,
  className,
}: ProgressIndicatorProps) {
  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return "completed";
    if (stepId === currentStep) return "current";
    return "pending";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative">
            <div className="flex items-center space-x-4">
              {/* Step Icon */}
              <div className="relative flex-shrink-0">
                <motion.div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                    status === "completed" &&
                      "bg-primary border-primary text-primary-foreground",
                    status === "current" &&
                      "border-primary bg-primary/10 text-primary",
                    status === "pending" &&
                      "border-muted bg-background text-muted-foreground",
                  )}
                  initial={false}
                  animate={{
                    scale: status === "current" ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {status === "completed" && (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {status === "current" && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {status === "pending" && <Circle className="w-4 h-4" />}
                </motion.div>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute top-8 left-1/2 w-0.5 h-6 -ml-px">
                    <div
                      className={cn(
                        "h-full w-full transition-colors duration-300",
                        completedSteps.includes(step.id)
                          ? "bg-primary"
                          : "bg-muted",
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <motion.p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    status === "completed" && "text-primary",
                    status === "current" && "text-foreground",
                    status === "pending" && "text-muted-foreground",
                  )}
                  initial={false}
                  animate={{
                    x: status === "current" ? 4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {step.label}
                </motion.p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
