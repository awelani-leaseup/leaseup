"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { PropertyLeases } from "../_components/property-leases";

export default function PropertyLeasesPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property } = api.portfolio.getById.useQuery(id);

  if (!property) {
    return null; // Loading and error states are handled by layout
  }

  return <PropertyLeases property={property} />;
}
