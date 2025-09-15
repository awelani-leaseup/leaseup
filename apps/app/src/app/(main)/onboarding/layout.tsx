"use client";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "react-hot-toast";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <TRPCReactProvider>
          <Toaster position="top-right" />
          {children}
        </TRPCReactProvider>
      </main>
    </div>
  );
}
