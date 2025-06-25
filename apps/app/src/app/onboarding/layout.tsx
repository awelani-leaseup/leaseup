"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@leaseup/ui/components/card";
import { Building2, CheckCircle, CreditCard, User } from "lucide-react";
import { useState } from "react";

export const steps = [
  {
    id: 1,
    title: "Basic Info",
    icon: User,
    color: "bg-[#3498DB]",
    url: "/onboarding/basic-info",
    prev: null,
    next: "/onboarding/banking-details",
  },
  {
    id: 2,
    title: "Banking Details",
    icon: CreditCard,
    color: "bg-gray-200",
    url: "/onboarding/banking-details",
    prev: "/onboarding/basic-info",
    next: "/onboarding/identity-verification",
  },
  {
    id: 3,
    title: "Identity Verification",
    icon: Building2,
    color: "bg-gray-200",
    url: "/onboarding/identity-verification",
    prev: "/onboarding/banking-details",
    next: "/onboarding/review-submit",
  },
  {
    id: 4,
    title: "Review & Submit",
    icon: CheckCircle,
    color: "bg-gray-200",
    url: "/onboarding/review-submit",
    prev: "/onboarding/identity-verification",
    next: null,
  },
] as const;

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-0">
      <div className="w-full max-w-5xl">
        {/* Progress Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Basic Information</CardTitle>
              <span className="text-sm text-[#7F8C8D]">
                Step {currentStep} of 4
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-1 items-center">
                  <div
                    className={`h-8 w-8 ${step.id <= currentStep ? "bg-[#3498DB]" : "bg-gray-200"} flex items-center justify-center rounded-full`}
                  >
                    <span
                      className={`text-sm font-medium ${step.id <= currentStep ? "text-white" : "text-gray-400"}`}
                    >
                      {step.id}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 h-2 flex-1 rounded ${step.id < currentStep ? "bg-[#3498DB]" : "bg-gray-200"}`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-2 flex justify-between text-sm">
              {steps.map((step) => (
                <span
                  key={step.id}
                  className={`font-medium ${step.id <= currentStep ? "text-[#3498DB]" : "text-gray-400"}`}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {children}
      </div>
    </div>
  );
}
