import { User, CreditCard, Building2, CheckCircle } from "lucide-react";

export const steps = [
  {
    id: 1,
    title: "Basic Info",
    icon: User,
    color: "bg-[#3498DB]",
    url: "/onboarding/basic-info",
    prev: null,
    next: "/onboarding/banking-details",
  },
  {
    id: 2,
    title: "Banking Details",
    icon: CreditCard,
    color: "bg-gray-200",
    url: "/onboarding/banking-details",
    prev: "/onboarding/basic-info",
    next: "/onboarding/identity-verification",
  },
  {
    id: 3,
    title: "Identity Verification",
    icon: Building2,
    color: "bg-gray-200",
    url: "/onboarding/identity-verification",
    prev: "/onboarding/banking-details",
    next: "/onboarding/review-submit",
  },
  {
    id: 4,
    title: "Review & Submit",
    icon: CheckCircle,
    color: "bg-gray-200",
    url: "/onboarding/review-submit",
    prev: "/onboarding/identity-verification",
    next: null,
  },
] as const;
