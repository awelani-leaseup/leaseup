"use client";

import {
  Card,
  CardContent,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import { Switch } from "@leaseup/ui/components/switch";
import { Label } from "@leaseup/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@leaseup/ui/components/select";
import { Bell, Mail, Smartphone, Volume2 } from "lucide-react";

export default function NotificationsPage() {
  const notificationCategories = [
    {
      title: "Account & Security",
      description: "Important updates about your account and security",
      settings: [
        {
          id: "login-alerts",
          name: "Login Alerts",
          description: "New login attempts to your account",
          email: true,
          push: true,
          sms: false,
        },
        {
          id: "password-changes",
          name: "Password Changes",
          description: "When your password is changed",
          email: true,
          push: true,
          sms: true,
        },
        {
          id: "security-alerts",
          name: "Security Alerts",
          description: "Suspicious activity on your account",
          email: true,
          push: true,
          sms: true,
        },
      ],
    },
    {
      title: "Billing & Payments",
      description: "Updates about your subscription and payments",
      settings: [
        {
          id: "payment-successful",
          name: "Payment Successful",
          description: "Confirmation of successful payments",
          email: true,
          push: false,
          sms: false,
        },
        {
          id: "payment-failed",
          name: "Payment Failed",
          description: "When a payment fails",
          email: true,
          push: true,
          sms: true,
        },
        {
          id: "subscription-renewal",
          name: "Subscription Renewal",
          description: "Upcoming subscription renewals",
          email: true,
          push: false,
          sms: false,
        },
        {
          id: "invoice-available",
          name: "Invoice Available",
          description: "When new invoices are ready",
          email: true,
          push: false,
          sms: false,
        },
      ],
    },
    {
      title: "Property Management",
      description: "Updates about your properties and tenants",
      settings: [
        {
          id: "new-applications",
          name: "New Applications",
          description: "When you receive new tenant applications",
          email: true,
          push: true,
          sms: false,
        },
        {
          id: "lease-expiring",
          name: "Lease Expiring",
          description: "When leases are about to expire",
          email: true,
          push: true,
          sms: false,
        },
        {
          id: "maintenance-requests",
          name: "Maintenance Requests",
          description: "New maintenance requests from tenants",
          email: true,
          push: true,
          sms: true,
        },
        {
          id: "rent-overdue",
          name: "Rent Overdue",
          description: "When rent payments are overdue",
          email: true,
          push: true,
          sms: true,
        },
      ],
    },
    {
      title: "System Updates",
      description: "Platform updates and new features",
      settings: [
        {
          id: "feature-updates",
          name: "Feature Updates",
          description: "New features and improvements",
          email: true,
          push: false,
          sms: false,
        },
        {
          id: "maintenance-windows",
          name: "Maintenance Windows",
          description: "Scheduled system maintenance",
          email: true,
          push: false,
          sms: false,
        },
        {
          id: "newsletter",
          name: "Newsletter",
          description: "Monthly newsletter with tips and updates",
          email: true,
          push: false,
          sms: false,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notification Settings
            </h1>
            <p className="text-gray-600">
              Configure how and when you receive notifications
            </p>
          </div>
        </div>
      </div>

      {/* Single Card Container */}
      <Card>
        <CardContent className="space-y-8 p-6">
          {/* Notification Preferences */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">General Preferences</h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emailFrequency">Email Frequency</Label>
                  <Select defaultValue="instant">
                    <SelectTrigger id="emailFrequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quietHours">Quiet Hours</Label>
                  <Select defaultValue="10pm-8am">
                    <SelectTrigger id="quietHours">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="10pm-8am">10 PM - 8 AM</SelectItem>
                      <SelectItem value="11pm-7am">11 PM - 7 AM</SelectItem>
                      <SelectItem value="9pm-9am">9 PM - 9 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-medium">Do Not Disturb</p>
                  <p className="text-sm text-gray-600">
                    Pause all notifications temporarily
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Notification Categories */}
          {notificationCategories.map((category, index) => (
            <div key={category.title}>
              {index > 0 && <hr className="border-gray-200" />}
              <div className="space-y-4">
                <div>
                  <h2 className="mb-2 text-lg font-semibold">
                    {category.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="grid grid-cols-4 gap-4 border-b pb-2 text-sm font-medium text-gray-600">
                    <div>Notification</div>
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Smartphone className="h-4 w-4" />
                      Push
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Volume2 className="h-4 w-4" />
                      SMS
                    </div>
                  </div>

                  {/* Notification Settings */}
                  {category.settings.map((setting) => (
                    <div
                      key={setting.id}
                      className="grid grid-cols-4 gap-4 py-2"
                    >
                      <div>
                        <p className="font-medium">{setting.name}</p>
                        <p className="text-sm text-gray-600">
                          {setting.description}
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <Switch defaultChecked={setting.email} />
                      </div>
                      <div className="flex justify-center">
                        <Switch defaultChecked={setting.push} />
                      </div>
                      <div className="flex justify-center">
                        <Switch defaultChecked={setting.sms} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Contact Information */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm font-medium">Email Address</p>
                  <p className="text-sm text-gray-600">john.doe@example.com</p>
                  <Button variant="outlined" size="sm" className="mt-2">
                    Change Email
                  </Button>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium">Phone Number</p>
                  <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  <Button variant="outlined" size="sm" className="mt-2">
                    Change Phone
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Test Notifications */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Test Notifications</h2>
            <p className="mb-4 text-sm text-gray-600">
              Send test notifications to verify your settings are working
              correctly.
            </p>
            <div className="flex gap-2">
              <Button variant="outlined" size="sm">
                Send Test Email
              </Button>
              <Button variant="outlined" size="sm">
                Send Test Push
              </Button>
              <Button variant="outlined" size="sm">
                Send Test SMS
              </Button>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button>Save Notification Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
