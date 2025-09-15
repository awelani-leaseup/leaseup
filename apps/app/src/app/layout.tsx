import "@leaseup/ui/global.css";

import { Inter } from "next/font/google";
import { AuthWrapper } from "./_components/auth-wrapper";
import { TRPCReactProvider } from "@/trpc/react";

const font = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ fontSize: "15px" }}>
      <body className={`${font.className} bg-gray-50 antialiased`}>
        <TRPCReactProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
