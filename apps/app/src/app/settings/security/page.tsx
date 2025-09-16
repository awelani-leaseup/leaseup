import { api } from "@/trpc/server";
import { EmailDisplayForm } from "./_components/email-display-form";
import { PasswordChangeForm } from "./_components/password-change-form";
import { DeleteAccountForm } from "./_components/delete-account-form";
import { Separator } from "@leaseup/ui/components/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";

export default async function SecurityPage() {
  const profileData = await api.profile.getProfile();

  return (
    <div className="mx-auto space-y-6 sm:max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmailDisplayForm
            initialData={{
              email: profileData?.email || undefined,
            }}
          />
          <Separator className="my-6" />
          <PasswordChangeForm />
          <Separator className="my-6" />
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
