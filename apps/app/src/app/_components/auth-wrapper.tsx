"use client";

import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/utils/auth/client";
import { useEffect } from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  // Check if current path is an auth page
  const isAuthPage =
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password");

  useEffect(() => {
    if (!isPending) {
      if (!session?.user && !isAuthPage) {
        // Redirect to sign-in only if not already on an auth page
        router.push("/sign-in");
      } else if (session?.user && isAuthPage) {
        // Redirect authenticated users away from auth pages
        router.push("/");
      }
    }
  }, [session, isPending, router, isAuthPage]);

  // Always render children - let the routing handle the redirects
  return <>{children}</>;
}
