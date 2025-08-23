"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import { Badge } from "@leaseup/ui/components/badge";
import { Input } from "@leaseup/ui/components/input";
import { Label } from "@leaseup/ui/components/label";
import { Textarea } from "@leaseup/ui/components/text-area";
import { Switch } from "@leaseup/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@leaseup/ui/components/select";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Settings as SettingsIcon,
  Upload,
  Palette,
} from "lucide-react";

function getBadgeVariant(status: string) {
  if (status === "Paid") return "outlined";
  if (status === "Overdue") return "solid";
  return "default";
}

function getBadgeClassName(status: string) {
  if (status === "Paid") return "border-green-200 text-green-600";
  if (status === "Overdue") return "bg-red-100 text-red-600";
  return "";
}

export default function InvoicesPage() {
  const recentInvoices = [
    {
      id: "INV-2024-001",
      date: "Dec 15, 2024",
      property: "123 Main St, Apt 4B",
      tenant: "John Smith",
      amount: "$1,200.00",
      status: "Paid",
      dueDate: "Dec 1, 2024",
    },
    {
      id: "INV-2024-002",
      date: "Dec 15, 2024",
      property: "456 Oak Ave, Unit 2A",
      tenant: "Sarah Johnson",
      amount: "$950.00",
      status: "Overdue",
      dueDate: "Dec 1, 2024",
    },
    {
      id: "INV-2024-003",
      date: "Dec 15, 2024",
      property: "789 Pine St, Suite 1",
      tenant: "Mike Davis",
      amount: "$1,800.00",
      status: "Pending",
      dueDate: "Jan 1, 2025",
    },
  ];

  const invoiceTemplates = [
    {
      id: "1",
      name: "Standard Rent Invoice",
      description: "Basic monthly rent invoice template",
      isDefault: true,
      lastModified: "2 weeks ago",
    },
    {
      id: "2",
      name: "Commercial Lease Invoice",
      description: "Template for commercial property leases",
      isDefault: false,
      lastModified: "1 month ago",
    },
    {
      id: "3",
      name: "Utility Invoice",
      description: "For utility charges and additional fees",
      isDefault: false,
      lastModified: "3 weeks ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice Settings
            </h1>
            <p className="text-gray-600">
              Manage invoice templates, branding, and automation settings
            </p>
          </div>
        </div>
      </div>

      {/* Single Card Container */}
      <Card>
        <CardContent className="space-y-8 p-6">
          {/* Recent Invoices */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5" />
              Recent Invoices
            </h2>
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-medium">{invoice.id}</p>
                      <Badge
                        variant="outlined"
                        className={getBadgeClassName(invoice.status)}
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{invoice.property}</p>
                    <p className="text-sm text-gray-600">
                      {invoice.tenant} • Due: {invoice.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{invoice.amount}</p>
                    <div className="flex gap-1">
                      <Button variant="outlined" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outlined" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outlined" className="mt-4 w-full">
              View All Invoices
            </Button>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Invoice Templates */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Invoice Templates</h2>
              <Button size="sm">Create Template</Button>
            </div>
            <div className="space-y-3">
              {invoiceTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-medium">{template.name}</p>
                      {template.isDefault && <Badge>Default</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last modified: {template.lastModified}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outlined" size="sm">
                      Preview
                    </Button>
                    <Button variant="outlined" size="sm">
                      Edit
                    </Button>
                    {!template.isDefault && (
                      <Button variant="outlined" size="sm">
                        Set Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Invoice Branding */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Palette className="h-5 w-5" />
              Invoice Branding
            </h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <Button
                        variant="outlined"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        defaultValue="#3B82F6"
                        className="h-10 w-20 p-1"
                      />
                      <Input defaultValue="#3B82F6" className="flex-1" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      defaultValue="Acme Properties LLC"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Company Address</Label>
                    <Textarea
                      id="companyAddress"
                      defaultValue="123 Business Street&#10;New York, NY 10001&#10;United States"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Invoice Settings */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <SettingsIcon className="h-5 w-5" />
                Invoice Settings
              </h2>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                    <Input id="invoicePrefix" defaultValue="INV-" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Default Payment Terms</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="45">45 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input id="taxRate" type="number" placeholder="0.00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerText">Invoice Footer Text</Label>
                  <Textarea
                    id="footerText"
                    placeholder="Thank you for your business!"
                    className="min-h-[60px]"
                  />
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* Automation Settings */}
              <div>
                <h2 className="mb-4 text-lg font-semibold">
                  Automation Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Auto-generate Monthly Invoices
                      </p>
                      <p className="text-sm text-gray-600">
                        Automatically create rent invoices each month
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Send Invoice Reminders</p>
                      <p className="text-sm text-gray-600">
                        Email reminders for overdue invoices
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Late Fee Automation</p>
                      <p className="text-sm text-gray-600">
                        Automatically add late fees to overdue invoices
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="grid gap-4 pt-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceDate">
                        Invoice Generation Date
                      </Label>
                      <Select defaultValue="1">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st of the month</SelectItem>
                          <SelectItem value="15">15th of the month</SelectItem>
                          <SelectItem value="last">
                            Last day of previous month
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reminderDays">Reminder Schedule</Label>
                      <Select defaultValue="3,7,14">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3,7,14">
                            3, 7, 14 days overdue
                          </SelectItem>
                          <SelectItem value="5,10">
                            5, 10 days overdue
                          </SelectItem>
                          <SelectItem value="7,14,30">
                            7, 14, 30 days overdue
                          </SelectItem>
                          <SelectItem value="custom">
                            Custom schedule
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button>Save Invoice Settings</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
