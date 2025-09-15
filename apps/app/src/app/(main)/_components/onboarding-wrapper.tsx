interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  // Onboarding logic is now handled in AuthWrapper at the root level
  // This component now just passes through children
  return <>{children}</>;
}
