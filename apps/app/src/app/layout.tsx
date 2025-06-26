"use client";

import "@leaseup/ui/global.css";

import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { Albert_Sans } from "next/font/google";
import { APIProvider } from "@vis.gl/react-google-maps";

import { TRPCReactProvider } from "@/trpc/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@leaseup/ui/components/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@leaseup/ui/components/dropdown-menu";
import Link from "next/link";
import {
  Banknote,
  Building,
  DoorOpen,
  FileText,
  Folder,
  KeyRound,
  LayoutDashboard,
  Plus,
  SquareUserRound,
} from "lucide-react";
import NavHeader from "./_components/nav-header";
import { Button } from "@leaseup/ui/components/button";

const font = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          style={{
            backgroundColor: "#ECF0F1",
          }}
          className={`${font.className}`}
        >
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                <Link href="/">
                  <p className="px-2 text-2xl font-bold tracking-tight">
                    LeaseUp
                  </p>
                </Link>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="w-full">
                                <Plus /> Create New
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link href="/properties/create">Property</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href="/units/create">Unit</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href="/leases/create">Lease</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href="/tenants/create">Tenant</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
