import {
  ProfilePictureFormSkeleton,
  PersonalInfoFormSkeleton,
  BusinessInfoFormSkeleton,
  AddressInfoFormSkeleton,
} from "./_components/profile-skeleton";

export default function ProfilePageLoading() {
  return (
    <div className="space-y-6">
      <ProfilePictureFormSkeleton />
      <PersonalInfoFormSkeleton />
      <BusinessInfoFormSkeleton />
      <AddressInfoFormSkeleton />
    </div>
  );
}
