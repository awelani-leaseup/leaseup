"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const recentActivity = [
    {
      action: "Password changed",
      date: "2 days ago",
      type: "security",
    },
    {
      action: "Billing address updated",
      date: "1 week ago",
      type: "billing",
    },
    {
      action: "Notification preferences updated",
      date: "2 weeks ago",
      type: "preferences",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Settings Overview
            </h1>
            <p className="text-gray-600">
              Manage your account settings and preferences using the sidebar
              navigation
            </p>
          </div>
        </div>
      </div>

      {/* Single Card Container */}
      <Card>
        <CardContent className="space-y-8 p-6">
          {/* Recent Activity */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.action + activity.date}
                  className="flex items-start gap-3"
                >
                  <div className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Account Summary */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Account Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plan</span>
                <Badge>Pro Plan</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Security Score</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-gray-200">
                    <div className="h-2 w-12 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Two-factor auth</span>
                <Badge variant="outlined">Enabled</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
