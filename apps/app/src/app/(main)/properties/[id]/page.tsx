"use client";

import { useParams } from "next/navigation";
import { PropertyOverview } from "./_components/property-overview";

export default function PropertyViewPage() {
  const { id } = useParams<{ id: string }>();

  return <PropertyOverview id={id} />;
}
