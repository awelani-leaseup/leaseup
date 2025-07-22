import { withForm } from "@leaseup/ui/components/form";
import { createInvoiceFormOptions } from "../_utils";
import type { InvoiceItem } from "../_types";
import { Input } from "@leaseup/ui/components/input";
import { Label } from "@leaseup/ui/components/label";
import { Button } from "@leaseup/ui/components/button";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@tanstack/react-form";

// Helper function to format currency consistently
const formatCurrency = (amount: number) => {
  return `R${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export const InvoiceItemsSubForm = withForm({
  ...createInvoiceFormOptions,
  render: ({ form }) => {
    const invoiceItems = useStore(
      form.store,
      (state) => state.values.invoiceItems,
    );

    const updateInvoiceItemField = (
      index: number,
      field: keyof InvoiceItem,
      value: string | number,
    ) => {
      const currentItems = [...form.getFieldValue("invoiceItems")];
      const item = { ...currentItems[index] };

      if (field === "quantity" || field === "rate") {
        item[field] = Number(value);
        // Recalculate amount with the updated field
        item.amount = (item.quantity || 0) * (item.rate || 0);
      } else {
        item[field] = value as any;
      }

      currentItems[index] = {
        description: item.description ?? "",
        quantity: item.quantity ?? 0,
        rate: item.rate ?? 0,
        amount: item.amount ?? 0,
      };

      form.setFieldValue("invoiceItems", currentItems);

      // Immediately recalculate total
      const subtotal = currentItems.reduce(
        (sum, currentItem) => sum + (currentItem.amount || 0),
        0,
      );
      form.setFieldValue("totalAmount", subtotal);
    };

    return (
      <>
        {/* Invoice Items */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Invoice Items</h3>
          </div>

          <form.AppField name="invoiceItems" mode="array">
            {(field) => (
              <>
                <div className="space-y-4">
                  {field.state.value.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-4"
                    >
                      <div>
                        <Label>Description</Label>
                        <form.Field name={`invoiceItems[${index}].description`}>
                          {(subField) => (
                            <Input
                              type="text"
                              value={subField.state.value || ""}
                              onChange={(e) =>
                                updateInvoiceItemField(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              className="mt-2"
                              placeholder="Enter description"
                            />
                          )}
                        </form.Field>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <form.Field name={`invoiceItems[${index}].quantity`}>
                          {(subField) => (
                            <Input
                              type="number"
                              value={subField.state.value || 1}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 1;
                                updateInvoiceItemField(
                                  index,
                                  "quantity",
                                  value,
                                );
                              }}
                              className="mt-2"
                              min="1"
                            />
                          )}
                        </form.Field>
                      </div>
                      <div>
                        <Label>Rate</Label>
                        <form.Field name={`invoiceItems[${index}].rate`}>
                          {(subField) => (
                            <Input
                              type="number"
                              value={subField.state.value || 0}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updateInvoiceItemField(index, "rate", value);
                              }}
                              className="mt-2"
                              min="0"
                              step="0.01"
                            />
                          )}
                        </form.Field>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label>Amount</Label>
                          <Input
                            className="mt-2"
                            type="text"
                            value={formatCurrency(item.amount || 0)}
                            readOnly
                          />
                        </div>
                        {field.state.value.length > 1 && (
                          <Button
                            type="button"
                            variant="soft"
                            size="icon"
                            color="destructive"
                            onClick={() => field.removeValue(index)}
                            className="mb-0.5"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  color="secondary"
                  type="button"
                  size="sm"
                  onClick={() =>
                    field.pushValue({
                      description: "",
                      quantity: 1,
                      rate: 0,
                      amount: 0,
                    })
                  }
                  className="mt-4"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </Button>
              </>
            )}
          </form.AppField>
        </div>

        {/* Invoice Summary */}
        <div className="mb-8 rounded-lg bg-gray-50 p-6">
          <div className="">
            <div className="flex justify-between">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-semibold">
                {formatCurrency(form.getFieldValue("totalAmount"))}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <form.AppField name="notes">
            {(field) => (
              <field.TextAreaField
                label="Notes"
                placeholder="Add any additional notes or payment instructions..."
                rows={4}
              />
            )}
          </form.AppField>
        </div>
      </>
    );
  },
});
