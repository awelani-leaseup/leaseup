"use client";

import "@leaseup/ui/global.css";

import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { type Metadata } from "next";
import { Onest } from "next/font/google";
import { APIProvider } from "@vis.gl/react-google-maps";

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

const font = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${font.className}`}>
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
                          <Folder />
                          <Link href="/documents">Documents</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarGroupLabel>Accounting</SidebarGroupLabel>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Banknote />
                          <Link href="/invoices">Invoices</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Folder />
                          <Link href="/transactions">Transactions</Link>
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
                <SignedIn>
                  <APIProvider
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}
                    libraries={["places"]}
                  >
                    {children}
                  </APIProvider>
                </SignedIn>
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
