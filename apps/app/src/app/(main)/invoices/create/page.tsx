"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import {
  FieldDescription,
  FieldLabel,
  FieldMessage,
  useAppForm,
} from "@leaseup/ui/components/form";
import { Separator } from "@leaseup/ui/components/separator";
import { H5 } from "@leaseup/ui/components/typography";
import { Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { createInvoiceFormOptions } from "./_utils";
import { BasicInformationSubForm } from "./_components/basic-information-sub-form";
import { InvoiceItemsSubForm } from "./_components/invoice-items-sub-form";

import { Switch } from "@leaseup/ui/components/switch";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect } from "react";

export default function CreateInvoice() {
  const router = useRouter();

  const [{ leaseId, tenantId }] = useQueryStates({
    leaseId: parseAsString,
    tenantId: parseAsString,
  });
  const { mutateAsync: createInvoice, isPending } =
    api.invoice.createInvoice.useMutation();

  const { data: lease } = api.invoice.getLeaseById.useQuery(leaseId || "", {
    enabled: !!leaseId,
  });
  const form = useAppForm({
    ...createInvoiceFormOptions,
    onSubmit: async ({ value }) => {
      try {
        const subtotal = value.invoiceItems.reduce(
          (sum, item) => sum + (item.amount || 0),
          0,
        );
        const totalAmount = subtotal;

        await createInvoice({
          leaseId: value.leaseId || "",
          tenantId: value.tenantId,
          notes: value.notes,
          dueDate: value.dueDate,
          invoiceDate: value.invoiceDate,
          invoiceItems: value.invoiceItems,
          totalAmount,
          markAsPaid: value.markAsPaid,
          category: value.invoiceCategory,
        });

        toast.success("Invoice created successfully");
        router.push("/invoices");
      } catch (error) {
        toast.error("Failed to create invoice");
        console.error("Invoice creation error:", error);
      }
    },
  });

  useEffect(() => {
    if (leaseId) {
      form.setFieldValue("leaseId", leaseId);
      form.setFieldValue("tenantId", lease?.tenantLease?.[0]?.tenant.id || "");
    } else if (tenantId) {
      form.setFieldValue("tenantId", tenantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaseId]);

  return (
    <div className="mx-auto my-10 max-w-4xl">
      {/* Page Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Create New Invoice
                </CardTitle>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/invoices">
                <Button variant="outlined">Cancel</Button>
              </Link>
              {/* <Button variant="outlined">
                <Save className="h-4 w-4" />
                Save Draft
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form.AppForm>
            <div className="mb-8">
              <H5>Basic Information</H5>
              <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
                <BasicInformationSubForm form={form} />
              </div>
              <div className="mt-6">
                <form.AppField name="markAsPaid">
                  {(field) => (
                    <div className="flex w-full flex-col gap-2">
                      <label className="flex flex-row items-center justify-between gap-2 rounded-md border border-gray-200 p-4">
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Mark as paid</FieldLabel>
                          <FieldDescription>
                            This invoice will be marked as paid upon creation if
                            checked
                          </FieldDescription>
                        </div>
                        <Switch
                          checked={field.state.value}
                          onCheckedChange={(checked) => {
                            field.setValue(checked === true);
                          }}
                        />
                      </label>
                      <FieldMessage />
                    </div>
                  )}
                </form.AppField>
              </div>
            </div>

            <Separator className="my-8" />

            <InvoiceItemsSubForm form={form} />

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                type="button"
                onClick={form.handleSubmit}
                isLoading={isPending}
                className="flex-1"
              >
                <Send className="h-4 w-4" />
                Send Invoice
              </Button>
            </div>

            <div className="mt-4">
              <form.FormMessage />
            </div>
          </form.AppForm>
        </CardContent>
      </Card>
    </div>
  );
}
