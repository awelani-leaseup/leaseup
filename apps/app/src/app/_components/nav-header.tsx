"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { SidebarHeader, SidebarTrigger } from "@leaseup/ui/components/sidebar";
import { Inbox } from "@novu/nextjs";

const NavHeader = () => {
  const { user } = useUser();
  return (
    <div className="mx-auto flex max-w-7xl items-center justify-between bg-white">
      <SidebarTrigger />
      <SidebarHeader className="flex flex-row items-center">
        <Inbox
          applicationIdentifier={
            process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER ?? ""
          }
          subscriber={user?.id ?? ""}
        />
        <UserButton
          showName={true}
          appearance={{
            elements: {},
          }}
        />
      </SidebarHeader>
    </div>
  );
};

export default NavHeader;
