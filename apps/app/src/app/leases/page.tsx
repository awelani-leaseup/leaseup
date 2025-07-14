import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function Leases() {
  return (
    <div className="mx-auto mt-10 flex max-w-7xl flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Leases</CardTitle>
          <CardDescription>Manage your leases here.</CardDescription>
          <CardAction>
            <Link href="/leases/create">
              <Button>
                <Plus />
                Add Lease
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
