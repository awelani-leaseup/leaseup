import { NextResponse } from "next/server";
import { runProcessPaymentRequestSuccessfulEffect } from "@leaseup/tasks/effect";

const ALLOWED_IPS = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0];

  if (!ip || !ALLOWED_IPS.includes(ip)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
  }

  const payload = await req.json();

  switch (payload.event) {
    case "invoice.create":
      // await runProcessInvoiceCreateEffect(payload);
      break;
    case "invoice.payment_failed":
      // await runProcessInvoiceUpdateEffect(payload);
      break;
    case "invoice.update":
      // await runProcessInvoicePaymentEffect(payload);
      break;
    case "invoice.payment_failed":
      // await runProcessInvoicePaymentFailedEffect(payload);
      break;
    case "invoice.payment_success":
      await runProcessPaymentRequestSuccessfulEffect(payload);
      break;
    case "invoice.payment_failed":
      // await runProcessInvoicePaymentFailedEffect(payload);
      break;
    case "charge.success":
      // await runProcessInvoicePaymentSuccessEffect(payload);
      break;
  }

  return NextResponse.json("OK", { status: 200 });
}
