"use client";

import { authClient } from "@/utils/auth/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@leaseup/ui/components/dropdown-menu";
import { Button } from "@leaseup/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import { SidebarHeader, SidebarTrigger } from "@leaseup/ui/components/sidebar";
import { Inbox } from "@novu/nextjs";
import { ChevronDownIcon, LogOutIcon, Settings } from "lucide-react";
import Link from "next/link";

const NavHeader = () => {
  const { data: session } = authClient.useSession();
  return (
    <div className="mx-auto flex max-w-7xl items-center justify-between bg-white">
      <SidebarTrigger />
      <SidebarHeader className="flex flex-row items-center">
        <Inbox
          applicationIdentifier={
            process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER ?? ""
          }
          subscriber={session?.user?.id ?? ""}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="text"
              className="h-auto border-none p-1 ring-0 hover:bg-transparent hover:no-underline"
            >
              {session?.user?.name}
              <Avatar>
                <AvatarImage
                  src={session?.user?.image ?? ""}
                  alt="Profile image"
                />
                <AvatarFallback>
                  {session?.user?.name?.split(" ")[0]?.charAt(0)}
                  {session?.user?.name?.split(" ")[1]?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <ChevronDownIcon
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full max-w-96">
            <DropdownMenuLabel className="flex min-w-0 flex-col">
              <span className="text-foreground truncate text-sm font-medium">
                {session?.user?.name}
              </span>
              <span className="text-muted-foreground truncate text-xs font-normal">
                {session?.user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">
                  <Settings
                    size={16}
                    className="opacity-60"
                    aria-hidden="true"
                  />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => authClient.signOut()}>
              <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
    </div>
  );
};

export default NavHeader;
