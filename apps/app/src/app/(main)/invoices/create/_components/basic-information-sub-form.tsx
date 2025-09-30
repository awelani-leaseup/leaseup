import { withForm } from "@leaseup/ui/components/form";
import { createInvoiceFormOptions } from "../_utils";
import { api } from "@/trpc/react";
import { useStore } from "@tanstack/react-form";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect } from "react";

export const BasicInformationSubForm = withForm({
  ...createInvoiceFormOptions,
  render: function BasicInformationSubForm({ form }) {
    const [{ leaseId }] = useQueryStates({
      leaseId: parseAsString,
    });
    const { data: lease } = api.invoice.getLeaseById.useQuery(leaseId || "", {
      enabled: !!leaseId,
    });
    const { data: allTenants } = api.invoice.getAllTenants.useQuery();

    const selectedTenantId = useStore(
      form.store,
      (state) => state.values.tenantId,
    );

    const { data: tenantLeases, isLoading: leasesLoading } =
      api.invoice.getTenantLeases.useQuery(
        { tenantId: selectedTenantId },
        { enabled: !!selectedTenantId },
      );

    const { data: invoiceCategories } =
      api.invoice.getInvoiceCategory.useQuery();

    useEffect(() => {
      form.setFieldValue("tenantId", lease?.tenantLease?.[0]?.tenant.id || "");
      form.setFieldValue("leaseId", leaseId || "");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lease, leaseId]);

    return (
      <>
        <form.AppField name="tenantId">
          {(field) => (
            <field.ComboboxField
              label="Select Tenant"
              placeholder="Choose a tenant..."
              options={
                allTenants?.map((tenant) => ({
                  id: tenant.id,
                  label: `${tenant.firstName} ${tenant.lastName}`,
                  sublabel: tenant.email,
                })) || []
              }
            />
          )}
        </form.AppField>

        <form.AppField name="leaseId">
          {(field) => {
            let placeholder = "Choose a lease...";
            if (!selectedTenantId) {
              placeholder = "Select a tenant first...";
            } else if (leasesLoading) {
              placeholder = "Loading leases...";
            }

            const options = !selectedTenantId
              ? []
              : tenantLeases?.map((lease) => ({
                  id: lease.id,
                  label: `${lease.unit?.property?.name || "Unknown Property"} - ${lease.unit?.name || "Unknown Unit"}`,
                  sublabel: `R${lease.rent.toLocaleString()}/month`,
                })) || [];

            return (
              <field.ComboboxField
                label="Select Lease (Optional)"
                placeholder={placeholder}
                options={options}
              />
            );
          }}
        </form.AppField>

        <form.AppField name="invoiceDate">
          {(field) => <field.DateField label="Invoice Date" mode="single" />}
        </form.AppField>

        <form.AppField name="dueDate">
          {(field) => <field.DateField label="Due Date" mode="single" />}
        </form.AppField>

        <form.AppField name="invoiceCategory">
          {(field) => (
            <field.SelectField
              label="Invoice Category"
              options={
                invoiceCategories?.map((category) => ({
                  id: category,
                  label: category
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                })) || []
              }
            />
          )}
        </form.AppField>
      </>
    );
  },
});
