import Link from "next/link";

import { api, HydrateClient } from "@/trpc/server";
import Dashboard from "./dashboard/page";

export default async function Home() {
  const hello = await api.portfolio.hello({ text: "from test" });

  return (
    <HydrateClient>
      <Dashboard />
    </HydrateClient>
  );
}
