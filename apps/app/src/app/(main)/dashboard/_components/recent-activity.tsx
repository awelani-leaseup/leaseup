"use client";

import { api } from "@/trpc/react";
import { formatCurrencyToZAR } from "@/utils/currency";
import { format, startOfDay, subDays } from "date-fns";
import { Clock } from "lucide-react";
import { EmptyState } from "@leaseup/ui/components/state";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@leaseup/ui/components/alert";
import { Button } from "@leaseup/ui/components/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from "@leaseup/ui/components/chart";

import { useMemo } from "react";

export function RecentActivity() {
  const { data, isLoading, error } = api.dashboard.getStats.useQuery();

  // Transform transaction data into chart data grouped by day
  const chartData = useMemo(() => {
    if (!data?.recentActivity?.length) return [];

    // Create a map to group transactions by day
    const dailyPayments = new Map();

    // Get the last 7 days for consistent chart display
    const today = startOfDay(new Date());
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, "yyyy-MM-dd");
      dailyPayments.set(dateKey, {
        date: format(date, "MMM dd"),
        fullDate: date,
        amount: 0,
        count: 0,
      });
    }

    // Group actual transactions by day
    data.recentActivity.forEach((transaction) => {
      const transactionDate = startOfDay(new Date(transaction.createdAt));
      const dateKey = format(transactionDate, "yyyy-MM-dd");

      if (dailyPayments.has(dateKey)) {
        const existing = dailyPayments.get(dateKey);
        existing.amount += transaction.amountPaid;
        existing.count += 1;
      }
    });

    return Array.from(dailyPayments.values());
  }, [data?.recentActivity]);

  const chartConfig = {
    amount: {
      label: "Payment Amount",
      color: "hsl(142, 76%, 36%)", // Green color matching the design
    },
  };

  if (isLoading) {
    return (
      <div
        id="recent-activity"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#2D3436]">
            Recent Activity
          </h2>
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="h-[300px] animate-pulse rounded bg-gray-200"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load recent activity. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const hasData = chartData.some((day) => day.amount > 0);

  if (!hasData) {
    return (
      <div
        id="recent-activity"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#2D3436]">
            Recent Activity
          </h2>
        </div>
        <EmptyState
          title="No Recent Activity"
          description="Your payment activity for the last 7 days will appear here once you start receiving payments."
          icon={<Clock />}
        />
      </div>
    );
  }

  const totalAmount = chartData.reduce((sum, day) => sum + day.amount, 0);
  const totalPayments = chartData.reduce((sum, day) => sum + day.count, 0);

  return (
    <div
      id="recent-activity"
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#2D3436]">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-[#7F8C8D]">
            Last 7 days • {totalPayments} payments •{" "}
            {formatCurrencyToZAR(totalAmount)}
          </p>
        </div>
        <Button variant="outlined">View All</Button>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px]">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            className="text-xs text-[#7F8C8D]"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            className="text-xs text-[#7F8C8D]"
            tickFormatter={(value: number) => `R${(value / 1000).toFixed(0)}k`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label, payload) => (
                  <div className="font-medium">
                    {payload?.[0]?.payload?.fullDate
                      ? format(
                          new Date(payload[0].payload.fullDate),
                          "EEEE, MMM dd, yyyy",
                        )
                      : label}
                  </div>
                )}
                formatter={(value, name, item) => [
                  <div key="payment-info" className="flex flex-col">
                    <span className="font-semibold text-[#2ECC71]">
                      {formatCurrencyToZAR(Number(value))}
                    </span>
                    {item.payload.count > 0 && (
                      <span className="text-xs text-[#7F8C8D]">
                        {item.payload.count} payment
                        {item.payload.count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>,
                  "",
                ]}
              />
            }
          />
          <Bar
            dataKey="amount"
            fill="var(--color-amount)"
            radius={[4, 4, 0, 0]}
            className="opacity-80 hover:opacity-100"
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
