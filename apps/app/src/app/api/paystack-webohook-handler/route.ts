import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import crypto from "crypto";

import { TASK_EVENTS } from "@leaseup/tasks/tasks";
import { paymentRequestSuccessfulTask } from "@leaseup/tasks/trigger";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set");
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-paystack-signature");
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = await req.json();

  switch (payload.event) {
    case TASK_EVENTS.PAYMENT_REQUEST_SUCCESSFUL:
      await tasks.trigger<typeof paymentRequestSuccessfulTask>(
        TASK_EVENTS.PAYMENT_REQUEST_SUCCESSFUL,
        payload,
      );
      break;
    case TASK_EVENTS.PAYMENT_REQUEST_PENDING:
      await tasks.trigger(TASK_EVENTS.PAYMENT_REQUEST_PENDING, payload);
      break;
  }

  return NextResponse.json("OK", { status: 200 });
}
