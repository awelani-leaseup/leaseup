"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { PropertyUnits } from "../_components/property-units";

export default function PropertyUnitsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property } = api.portfolio.getById.useQuery(id);

  if (!property) {
    return null; // Loading and error states are handled by layout
  }

  return <PropertyUnits property={property} />;
}
