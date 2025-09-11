import { withForm } from "@leaseup/ui/components/form";
import { createInvoiceFormOptions } from "../_utils";
import { api } from "@/trpc/react";
import { useStore } from "@tanstack/react-form";

export const BasicInformationSubForm = withForm({
  ...createInvoiceFormOptions,
  render: ({ form }) => {
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

    return (
      <>
        {/* Tenant Selection */}
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

        {/* Lease Selection - Optional */}
        <form.AppField name="leaseId">
          {(field) => {
            const placeholder = !selectedTenantId
              ? "Select a tenant first..."
              : leasesLoading
                ? "Loading leases..."
                : "Choose a lease...";

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
