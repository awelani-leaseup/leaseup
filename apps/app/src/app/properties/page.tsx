import { api } from "@/trpc/server";
import { H5 } from "@leaseup/ui/components/typography";
export default async function Properties() {
  const properties = await api.portfolio.getAll();
  return (
    <div className="mx-auto mt-10 max-w-7xl">
      <H5>Properties</H5>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <div key={property.id}>{property.name}</div>
        ))}
      </div>
    </div>
  );
}
