import "@leaseup/ui/global.css";

import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import { TRPCReactProvider } from "@/trpc/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@leaseup/ui/components/sidebar";
import Link from "next/link";
import {
  Banknote,
  Building,
  DoorOpen,
  FileText,
  Folder,
  KeyRound,
  LayoutDashboard,
  SquareUserRound,
} from "lucide-react";
import NavHeader from "./_components/navheader";

export const metadata: Metadata = {
  title: "Leaseup",
  description: "Leaseup is a property management system for landlords.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const font = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${font.className}`}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <Script
            id="fontawesome-config"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.FontAwesomeConfig = {
                  autoReplaceSvg: 'nest',
                };
              `,
            }}
          />
          <Script
            src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"
            strategy="beforeInteractive"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </head>
        <body>
          <SidebarProvider>
            <Sidebar>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <LayoutDashboard />
                          <Link href="/dashboard">Dashboard</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarGroupLabel>Portfolio</SidebarGroupLabel>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Building />
                          <Link href="/properties">Properties</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <DoorOpen />
                          <Link href="/units">Units</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <KeyRound />
                          <Link href="/keys">Keys</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <SquareUserRound />
                          <Link href="/tenants">Tenants</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <FileText />
                          <Link href="/leases">Leases</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Banknote />
                          <Link href="/transactions">Transactions</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Folder />
                          <Link href="/documents">Documents</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter />
            </Sidebar>
            <main className="w-full">
              <div className="sticky top-0 z-10 bg-white">
                <NavHeader />
              </div>
              <TRPCReactProvider>
                <SignedIn>{children}</SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </TRPCReactProvider>
            </main>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
