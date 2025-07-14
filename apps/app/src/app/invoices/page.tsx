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

export default async function Invoices() {
  return (
    <div className="mx-auto mt-10 flex max-w-7xl flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Invoices</CardTitle>
          <CardDescription>Manage your invoices</CardDescription>
          <CardAction>
            <Link href="/invoices/create">
              <Button>
                <Plus />
                Invoices
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
