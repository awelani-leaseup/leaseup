import { api } from "@/trpc/server";
import { ProfilePictureForm } from "./_components/profile-picture-form";
import { PersonalInfoForm } from "./_components/personal-info-form";
import { BusinessInfoForm } from "./_components/business-info-form";
import { AddressInfoForm } from "./_components/address-info-form";
import { Separator } from "@leaseup/ui/components/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";

export default async function ProfilePage() {
  const profileData = await api.profile.getProfile();

  return (
    <div className="mx-auto space-y-6 sm:max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfilePictureForm
            initialData={{
              image: profileData?.image || undefined,
            }}
          />
          <Separator className="my-6" />
          <PersonalInfoForm
            initialData={{
              fullName: profileData?.name || undefined,
              email: profileData?.email || undefined,
              phone: profileData?.phone || undefined,
            }}
          />
          <Separator className="my-6" />
          <BusinessInfoForm
            initialData={{
              businessName: profileData?.businessName || undefined,
              numberOfProperties: profileData?.numberOfProperties || undefined,
              numberOfUnits: profileData?.numberOfUnits || undefined,
            }}
          />
          <Separator className="my-6" />
          <AddressInfoForm
            initialData={{
              addressLine1: profileData?.addressLine1 || undefined,
              addressLine2: profileData?.addressLine2 || undefined,
              city: profileData?.city || undefined,
              state: profileData?.state || undefined,
              zip: profileData?.zip || undefined,
              countryCode: profileData?.countryCode || undefined,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
