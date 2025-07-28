import { NextResponse } from "next/server";
import { paymentRequestSuccessfulTask } from "@leaseup/tasks/trigger";

const ALLOWED_IPS = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0];

  if (!ip || !ALLOWED_IPS.includes(ip)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
  }

  const payload = await req.json();

  switch (payload.event) {
    case "paymentrequest.success":
      await paymentRequestSuccessfulTask.trigger(payload);
      break;
    case "paymentrequest.pending":
      break;
  }

  return NextResponse.json("OK", { status: 200 });
}
