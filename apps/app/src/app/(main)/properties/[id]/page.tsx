"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { PropertyOverview } from "./_components/property-overview";

export default function PropertyViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property } = api.portfolio.getById.useQuery(id);

  if (!property) {
    return null; // Loading and error states are handled by layout
  }

  return <PropertyOverview property={property} />;
}
