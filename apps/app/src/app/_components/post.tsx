"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function LatestPost() {
  const utils = api.useUtils();
  const [name, setName] = useState("");

  return <div className="w-full max-w-xs"></div>;
}
