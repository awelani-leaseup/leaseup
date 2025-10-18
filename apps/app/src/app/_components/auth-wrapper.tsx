"use client";

import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/utils/auth/client";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const utils = api.useUtils();

  const isAuthPage =
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password") ||
    pathname?.startsWith("/verify-email");

  const isOnboardingPage = pathname?.startsWith("/onboarding");

  useEffect(() => {
    const newUserId = session?.user?.id || null;
    if (currentUserId !== newUserId) {
      if (currentUserId !== null) {
        utils.onboarding.getOnboardingStatus.invalidate();
      }
      setCurrentUserId(newUserId);
    }
  }, [session?.user?.id, currentUserId, utils]);

  const shouldCheckOnboarding =
    !!session?.user?.id && !isAuthPage && !isOnboardingPage;

  const {
    data: onboardingStatus,
    isPending: isOnboardingPending,
    isLoading: isOnboardingLoading,
    error: onboardingError,
    isError: isOnboardingError,
  } = api.onboarding.getOnboardingStatus.useQuery(undefined, {
    enabled: shouldCheckOnboarding,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isAuthPending) {
      if (!session?.user && !isAuthPage) {
        router.push("/sign-in");
        return;
      }

      if (session?.user && isAuthPage) {
        router.push("/");
        return;
      }

      if (isOnboardingLoading || isOnboardingPending) {
        return;
      }

      if (session?.user?.id && !isAuthPage && !isOnboardingPage) {
        if (onboardingStatus && !onboardingStatus.onboardingCompleted) {
          router.push("/onboarding");
          return;
        }
      }
    }
  }, [
    session,
    isAuthPending,
    router,
    isAuthPage,
    isOnboardingPage,
    onboardingStatus,
    isOnboardingPending,
    isOnboardingError,
    onboardingError,
    isOnboardingLoading,
  ]);

  if (isAuthPending || (shouldCheckOnboarding && isOnboardingLoading)) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return <>{children}</>;
}
