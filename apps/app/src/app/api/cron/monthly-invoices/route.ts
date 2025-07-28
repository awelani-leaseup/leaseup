import { NextResponse } from "next/server";
// import { runMonthlyInvoicesAsPromise } from "@leaseup/tasks/tasks";

export async function GET(request: Request) {
  // Security check for cron jobs
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🚀 Starting Effect-based monthly invoices via Vercel cron");

    // const result = await runMonthlyInvoicesAsPromise();

    // console.log("✅ Monthly invoices completed successfully", result);

    return NextResponse.json({
      success: true,
      // result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Monthly invoices failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
