"use client";

import { useEffect, useState } from "react";
import { useAppForm } from "@leaseup/ui/components/form";
import { useStore } from "@tanstack/react-form";
import { onboardingFormOptions } from "./_utils";
import type { OnboardingFormData } from "./_types";
import {
  BasicInfoStep,
  BankingDetailsStep,
  ReviewSubmitStep,
} from "./_components";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { steps } from "./_constants";
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
} from "@leaseup/ui/components/stepper";
import { Button } from "@leaseup/ui/components/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { data: onboardingStatus } =
    api.onboarding.getOnboardingStatus.useQuery();
  const router = useRouter();

  useEffect(() => {
    if (onboardingStatus?.onboardingCompleted) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingStatus]);

  // tRPC mutation for completing onboarding
  const completeOnboardingMutation =
    api.onboarding.completeOnboarding.useMutation({
      onSuccess: (data) => {
        console.log("Onboarding completed successfully:", data);

        router.push("/dashboard");
      },
      onError: (error) => {
        console.error("Error completing onboarding:", error);
        toast.error("Error completing onboarding");
      },
    });

  const form = useAppForm({
    ...onboardingFormOptions,
    onSubmit: async ({ value }: { value: OnboardingFormData }) => {
      try {
        await completeOnboardingMutation.mutateAsync(value);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  // Get form submission state
  const isSubmitting =
    useStore(form.store, (state) => state.isSubmitting) ||
    completeOnboardingMutation.isPending;

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length) {
      form.handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  // Render the current step component
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep form={form} />;
      case 2:
        return <BankingDetailsStep form={form} />;
      case 3:
        return <ReviewSubmitStep form={form} />;
      default:
        return <BasicInfoStep form={form} />;
    }
  };

  return (
    <Stepper
      value={currentStep}
      className="flex w-full justify-center px-4 py-8 sm:px-0"
      steps={steps}
    >
      <div className="w-full max-w-5xl">
        <div className="">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding</CardTitle>
              <CardDescription>
                Let&apos;s get your account set up to start managing your
                properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {steps.map(({ id, title }, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep;

                  return (
                    <StepperItem
                      key={id}
                      step={stepNumber}
                      className="flex-1"
                      completed={isCompleted}
                    >
                      <StepperTrigger
                        className="w-full cursor-pointer flex-col items-start gap-2 rounded"
                        onClick={() => handleStepClick(stepNumber)}
                      >
                        <StepperIndicator className="bg-border h-1 w-full">
                          <span className="sr-only">{stepNumber}</span>
                        </StepperIndicator>
                        <div className="space-y-0.5">
                          <StepperTitle
                            className={
                              isActive ? "text-primary font-semibold" : ""
                            }
                          >
                            {title}
                          </StepperTitle>
                        </div>
                      </StepperTrigger>
                    </StepperItem>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <div className="mx-auto mt-10 flex max-w-7xl flex-col">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="col-span-2">
                <Card>
                  <CardContent>
                    <form.AppForm>
                      {renderStepContent()}
                      <form.FormMessage>
                        {form.state.errors?.length > 0 &&
                          "Please fix all errors in all steps before submitting"}
                      </form.FormMessage>
                    </form.AppForm>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={currentStep === 1 || isSubmitting}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={handleNext} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          {currentStep === steps.length ? "Submit" : "Next"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              <div className="col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Need help?</CardTitle>
                    <CardDescription>
                      If you need help, please contact us at{" "}
                      <a href="mailto:support@leaseup.com">
                        support@leaseup.com
                      </a>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Stepper>
  );
}
