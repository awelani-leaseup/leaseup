"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TenantPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  useEffect(() => {
    // Redirect to the profile page by default
    router.replace(`/tenants/${tenantId}/profile`);
  }, [tenantId, router]);

  return null;
}
