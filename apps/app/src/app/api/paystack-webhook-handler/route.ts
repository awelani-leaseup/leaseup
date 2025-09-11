import { NextResponse } from "next/server";
import {
  runProcessPaymentRequestSuccessfulEffect,
  runProcessSubscriptionCreateEffect,
  runProcessSubscriptionDisableEffect,
  runProcessSubscriptionNotRenewingEffect,
  runProcessExpiringCardsEffect,
  runProcessInvoicePaymentFailedEffect,
} from "@leaseup/tasks/effect";

const ALLOWED_IPS = [
  "52.31.139.75",
  "52.49.173.169",
  "52.214.14.220",
  "127.0.0.1",
];

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0];

  if (!ip || !ALLOWED_IPS.includes(ip)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
  }

  const payload = await req.json();

  console.log("Event", payload.event);

  switch (payload.event) {
    case "paymentrequest.pending":
      break;
    case "paymentrequest.success":
      await runProcessPaymentRequestSuccessfulEffect(payload);
      break;
    case "subscription.create":
      await runProcessSubscriptionCreateEffect(payload);
      break;
    case "subscription.disable":
      await runProcessSubscriptionDisableEffect(payload);
      break;
    case "subscription.not_renewing":
      await runProcessSubscriptionNotRenewingEffect(payload);
      break;
    case "subscription.expiring_cards":
      await runProcessExpiringCardsEffect(payload);
      break;
    case "invoice.create":
      // Log invoice creation for subscription tracking
      console.log(
        "Invoice created for subscription:",
        payload.data.subscription,
      );
      break;
    case "invoice.payment_failed":
      await runProcessInvoicePaymentFailedEffect(payload);
      break;
    case "charge.success":
      // Log successful charges (including subscription renewals)
      console.log("Charge successful:", payload.data?.reference || "unknown");
      break;
  }

  return NextResponse.json("OK", { status: 200 });
}
