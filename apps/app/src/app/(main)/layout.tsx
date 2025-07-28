"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Toaster } from "react-hot-toast";
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
  BookOpen,
  Building,
  DoorOpen,
  FileText,
  Folder,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
  SquareUserRound,
} from "lucide-react";
import NavHeader from "../_components/nav-header";
import { Button } from "@leaseup/ui/components/button";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/utils/auth/client";
import { useEffect } from "react";

const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
  throw new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
}

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname.startsWith(path);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  if (!session?.user) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/">
            <span className="px-2 text-2xl font-bold tracking-tight">
              LeaseUp
            </span>
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
                        <DropdownMenuItem>
                          <Link href="/invoices/create">Invoice</Link>
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
                  <SidebarMenuButton isActive={isActive("/dashboard")}>
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
                  <SidebarMenuButton isActive={isActive("/properties")}>
                    <Building />
                    <Link href="/properties">Properties</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/units")}>
                    <DoorOpen />
                    <Link href="/units">Units</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/keys")}>
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
                  <SidebarMenuButton isActive={isActive("/tenants")}>
                    <SquareUserRound />
                    <Link href="/tenants">Tenants</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/leases")}>
                    <FileText />
                    <Link href="/leases">Leases</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/documents")}>
                    <Folder />
                    <Link href="/documents">File Storage</Link>
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
                  <SidebarMenuButton isActive={isActive("/invoices")}>
                    <Banknote />
                    <Link href="/invoices">Invoices</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/transactions")}>
                    <Folder />
                    <Link href="/transactions">Transactions</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://leaseup.featurebase.app/help"
                >
                  <BookOpen />
                  Help Center
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://leaseup.featurebase.app"
                >
                  <MessageSquare />
                  Feedback Center
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/settings">
                  <Settings />
                  Account Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="w-full">
        <div className="sticky top-0 z-10 bg-white">
          <NavHeader />
        </div>
        <TRPCReactProvider>
          <APIProvider
            apiKey={NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
            libraries={["places"]}
          >
            <Toaster position="top-right" />
            <NuqsAdapter>{children}</NuqsAdapter>
          </APIProvider>
        </TRPCReactProvider>
      </main>
    </SidebarProvider>
  );
}
