"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { PropertyTenants } from "../_components/property-tenants";

export default function PropertyTenantsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property } = api.portfolio.getById.useQuery(id);

  if (!property) {
    return null; // Loading and error states are handled by layout
  }

  return <PropertyTenants property={property} />;
}
