"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@leaseup/ui/components/sidebar";
import {
  User,
  CreditCard,
  Bell,
  Building,
  Shield,
  Key,
  Settings as SettingsIcon,
  FileText,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const settingsNavigation = [
    {
      title: "Account",
      items: [
        {
          title: "Profile",
          href: "/settings/profile",
          icon: User,
        },
        {
          title: "Security",
          href: "/settings/security",
          icon: Shield,
        },
      ],
    },
    {
      title: "Business",
      items: [
        {
          title: "Company",
          href: "/settings/company",
          icon: Building,
        },
        {
          title: "Banking",
          href: "/settings/banking",
          icon: Wallet,
        },
      ],
    },
    {
      title: "Billing",
      items: [
        {
          title: "Subscription",
          href: "/settings/billing",
          icon: CreditCard,
        },
        {
          title: "Invoices",
          href: "/settings/invoices",
          icon: FileText,
        },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="sidebar">
          <SidebarContent>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <X className="h-4 w-4" />
                  Exit Settings
                </Link>
              </div>
            </div>

            {settingsNavigation.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
