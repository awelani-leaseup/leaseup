"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import { Input } from "@leaseup/ui/components/input";
import { Label } from "@leaseup/ui/components/label";
import { Badge } from "@leaseup/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@leaseup/ui/components/select";
import {
  Wallet,
  Building,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";

export default function BankingPage() {
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const bankAccounts = [
    {
      id: "1",
      bankName: "Chase Bank",
      accountType: "Business Checking",
      accountNumber: "****1234",
      routingNumber: "021000021",
      isDefault: true,
      isVerified: true,
    },
    {
      id: "2",
      bankName: "Bank of America",
      accountType: "Business Savings",
      accountNumber: "****5678",
      routingNumber: "026009593",
      isDefault: false,
      isVerified: true,
    },
  ];

  const paymentMethods = [
    {
      id: "1",
      type: "ACH",
      description: "Direct bank transfer",
      processingTime: "1-3 business days",
      fees: "Free",
      isEnabled: true,
    },
    {
      id: "2",
      type: "Wire Transfer",
      description: "Same-day bank transfer",
      processingTime: "Same day",
      fees: "$25",
      isEnabled: false,
    },
    {
      id: "3",
      type: "Check",
      description: "Physical check mailing",
      processingTime: "5-7 business days",
      fees: "$5",
      isEnabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Banking Settings
            </h1>
            <p className="text-gray-600">
              Manage your bank accounts and payment methods
            </p>
          </div>
        </div>
      </div>

      {/* Single Card Container */}
      <Card>
        <CardContent className="space-y-8 p-6">
          {/* Connected Bank Accounts */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Connected Bank Accounts</h2>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </div>
            <div className="space-y-4">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{account.bankName}</p>
                        {account.isDefault && <Badge>Default</Badge>}
                        {account.isVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {account.accountType}
                      </p>
                      <p className="text-sm text-gray-500">
                        Account:{" "}
                        {showAccountNumber
                          ? account.accountNumber.replace("****", "1234567890")
                          : account.accountNumber}{" "}
                        • Routing: {account.routingNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                    >
                      {showAccountNumber ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    {!account.isDefault && (
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
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Add New Bank Account */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Add New Bank Account</h2>
            <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" placeholder="Chase Bank" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Business Checking</SelectItem>
                    <SelectItem value="savings">Business Savings</SelectItem>
                    <SelectItem value="personal-checking">
                      Personal Checking
                    </SelectItem>
                    <SelectItem value="personal-savings">
                      Personal Savings
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input id="routingNumber" placeholder="021000021" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" placeholder="1234567890" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHolder">Account Holder Name</Label>
              <Input id="accountHolder" placeholder="Acme Properties LLC" />
            </div>
              <Button>Add Bank Account</Button>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Payment Methods */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Payment Methods</h2>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{method.type}</p>
                      {method.isEnabled ? (
                        <Badge
                          variant="outlined"
                          className="border-green-200 text-green-600"
                        >
                          Enabled
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600">
                          Disabled
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {method.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Processing: {method.processingTime} • Fees: {method.fees}
                    </p>
                  </div>
                  <Button variant="outlined" size="sm">
                    {method.isEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Direct Deposit Settings */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Direct Deposit Settings</h2>
            <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="depositSchedule">Deposit Schedule</Label>
              <Select defaultValue="weekly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly (Fridays)</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumAmount">Minimum Deposit Amount</Label>
              <Input id="minimumAmount" type="number" placeholder="100.00" />
              <p className="text-sm text-gray-500">
                Funds will only be deposited if the balance exceeds this amount
              </p>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Bank Verification */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Bank Account Verification</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Verification Required
                    </p>
                    <p className="text-sm text-blue-700">
                      To ensure secure transactions, we need to verify your bank
                      account with micro-deposits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deposit1">First Deposit Amount</Label>
                  <Input id="deposit1" placeholder="0.XX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit2">Second Deposit Amount</Label>
                  <Input id="deposit2" placeholder="0.XX" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button>Verify Deposits</Button>
                <Button variant="outlined">Resend Deposits</Button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button>Save Banking Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
