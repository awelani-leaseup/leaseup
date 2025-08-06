"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import { Badge } from "@leaseup/ui/components/badge";
import {
  CreditCard,
  Calendar,
  Download,
  Plus,
  CheckCircle,
} from "lucide-react";

export default function BillingPage() {
  const currentPlan = {
    name: "Pro Plan",
    price: "$29",
    period: "month",
    features: [
      "Unlimited properties",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Custom branding",
    ],
  };

  const paymentMethods = [
    {
      type: "Visa",
      last4: "4242",
      expiry: "12/25",
      isDefault: true,
    },
    {
      type: "Mastercard",
      last4: "8888",
      expiry: "08/26",
      isDefault: false,
    },
  ];

  const billingHistory = [
    {
      id: "INV-001",
      date: "Dec 1, 2024",
      amount: "$29.00",
      status: "Paid",
      description: "Pro Plan - Monthly",
    },
    {
      id: "INV-002",
      date: "Nov 1, 2024",
      amount: "$29.00",
      status: "Paid",
      description: "Pro Plan - Monthly",
    },
    {
      id: "INV-003",
      date: "Oct 1, 2024",
      amount: "$29.00",
      status: "Paid",
      description: "Pro Plan - Monthly",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Billing & Subscription
            </h1>
            <p className="text-gray-600">
              Manage your subscription plan and payment methods
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Plan
              <Badge>Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                <p className="text-gray-600">
                  {currentPlan.price}/{currentPlan.period} · Next billing: Jan
                  1, 2025
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{currentPlan.price}</p>
                <p className="text-gray-600">per {currentPlan.period}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-medium">Plan Features:</h4>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <Button className="w-full">Upgrade Plan</Button>
                <Button variant="outlined" className="w-full">
                  Change Plan
                </Button>
                <Button
                  variant="outlined"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Payment Methods
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Method
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.type + method.last4}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-200">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {method.type} •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires {method.expiry}
                      </p>
                    </div>
                    {method.isDefault && (
                      <Badge variant="outlined" className="ml-2">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button variant="outlined" size="sm">
                        Set Default
                      </Button>
                    )}
                    <Button variant="outlined" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 text-sm font-medium">Billing Address</p>
                <p className="text-sm text-gray-600">
                  123 Business Street
                  <br />
                  New York, NY 10001
                  <br />
                  United States
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Tax Information</p>
                <p className="text-sm text-gray-600">
                  Tax ID: 12-3456789
                  <br />
                  VAT: Not applicable
                </p>
              </div>
            </div>
            <Button variant="outlined">Update Billing Information</Button>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-sm text-gray-600">
                      {invoice.date} • {invoice.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{invoice.amount}</p>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outlined"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outlined" className="mt-4 w-full">
              View All Invoices
            </Button>
          </CardContent>
        </Card>

        {/* Usage & Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Usage & Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Properties</span>
                  <span>45 / Unlimited</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 w-1/4 rounded-full bg-blue-600"></div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>API Calls</span>
                  <span>2,340 / 10,000</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 w-1/4 rounded-full bg-blue-600"></div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Storage</span>
                  <span>1.2 GB / 100 GB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 w-[2%] rounded-full bg-blue-600"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
