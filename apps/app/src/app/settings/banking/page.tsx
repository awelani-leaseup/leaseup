import { api } from "@/trpc/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { BankingInfoForm } from "./_components/banking-info-form";

export default async function BankingPage() {
  const bankingInfo = await api.profile.getBankingInfo();

  const initialFormData = {
    // @ts-expect-error - fix type later
    bankCode: bankingInfo?.subaccountDetails?.bank ?? "",
    accountNumber: bankingInfo?.subaccountDetails?.account_number ?? "",
    documentType: "national_id",
    idNumber: bankingInfo?.idNumber ?? "",
  };

  return (
    <div className="mx-auto space-y-6 sm:max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Banking Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <BankingInfoForm initialData={initialFormData} />
        </CardContent>
      </Card>
    </div>
  );
}
