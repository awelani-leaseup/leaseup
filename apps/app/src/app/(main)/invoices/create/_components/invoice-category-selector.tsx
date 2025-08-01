import { cn } from "@leaseup/ui/utils/cn";
import { FieldMessage, FieldLabel } from "@leaseup/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@leaseup/ui/components/select";

interface InvoiceCategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  className?: string;
}

const categoryLabels = {
  DEPOSIT: "Deposit",
  RENT: "Rent",
  MAINTENANCE: "Maintenance",
  UTILITY_BILL: "Utility Bill",
  LEVY: "Levy",
  RATES_AND_TAXES: "Rates & Taxes",
  SERVICE_CHARGE: "Service Charge",
  WATER_ELECTRICITY: "Water & Electricity",
  OTHER: "Other",
};

export function InvoiceCategorySelector({
  value,
  onChange,
  categories,
  className,
}: InvoiceCategorySelectorProps) {
  return (
    <div className={cn("w-full", className)}>
      <FieldLabel>Invoice Category</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-2 w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => {
            const label =
              categoryLabels[category as keyof typeof categoryLabels] ||
              category
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <SelectItem key={category} value={category}>
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <FieldMessage />
    </div>
  );
}
