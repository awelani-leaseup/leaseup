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
import { Textarea } from "@leaseup/ui/components/text-area";
import { Switch } from "@leaseup/ui/components/switch";
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

export default function ApiKeysPage() {
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const apiKeys = [
    {
      id: "1",
      name: "Production API Key",
      key: "lup_live_1234567890abcdef",
      maskedKey: "lup_live_••••••••••••cdef",
      created: "2024-01-15",
      lastUsed: "2 hours ago",
      permissions: ["read", "write"],
      isActive: true,
      usageCount: 2456,
    },
    {
      id: "2",
      name: "Development API Key",
      key: "lup_test_abcdef1234567890",
      maskedKey: "lup_test_••••••••••••7890",
      created: "2024-02-01",
      lastUsed: "1 day ago",
      permissions: ["read"],
      isActive: true,
      usageCount: 156,
    },
    {
      id: "3",
      name: "Mobile App Integration",
      key: "lup_live_9876543210fedcba",
      maskedKey: "lup_live_••••••••••••dcba",
      created: "2024-01-20",
      lastUsed: "Never",
      permissions: ["read", "write", "admin"],
      isActive: false,
      usageCount: 0,
    },
  ];

  const permissions = [
    {
      id: "read",
      name: "Read",
      description: "View properties, tenants, and leases",
    },
    { id: "write", name: "Write", description: "Create and update data" },
    {
      id: "delete",
      name: "Delete",
      description: "Remove data (use with caution)",
    },
    { id: "admin", name: "Admin", description: "Full administrative access" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <Key className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
            <p className="text-gray-600">
              Manage API keys for integrations and third-party access
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* API Usage Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              API Usage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">2,612</p>
                <p className="text-sm text-gray-600">Total API Calls</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-600">3</p>
                <p className="text-sm text-gray-600">Active Keys</p>
                <p className="text-xs text-gray-500">2 enabled, 1 disabled</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">99.9%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Your API Keys
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Key
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-medium">{apiKey.name}</h3>
                        {apiKey.isActive ? (
                          <Badge
                            variant="outlined"
                            className="border-green-200 text-green-600"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {apiKey.created}
                        </span>
                        <span>Last used: {apiKey.lastUsed}</span>
                        <span>{apiKey.usageCount} calls</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch defaultChecked={apiKey.isActive} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">API Key</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Input
                          value={
                            showKeys[apiKey.id] ? apiKey.key : apiKey.maskedKey
                          }
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="outlined" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600">
                        Permissions
                      </Label>
                      <div className="mt-1 flex gap-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge
                            key={permission}
                            variant="outlined"
                            className="text-xs"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outlined" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Regenerate
                    </Button>
                    <Button
                      variant="outlined"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create New API Key */}
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">Key Name</Label>
              <Input id="keyName" placeholder="My Integration Key" />
              <p className="text-sm text-gray-500">
                Choose a descriptive name to help you identify this key
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyDescription">Description (Optional)</Label>
              <Textarea
                id="keyDescription"
                placeholder="Describe what this API key will be used for..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{permission.name}</p>
                    <p className="text-sm text-gray-600">
                      {permission.description}
                    </p>
                  </div>
                  <Switch />
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button>Create API Key</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <p>
                  Never share your API keys publicly or commit them to version
                  control
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <p>
                  Use environment variables to store API keys in your
                  applications
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <p>Regularly rotate your API keys and disable unused ones</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <p>
                  Grant only the minimum permissions necessary for each
                  integration
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <p>
                  Monitor API usage regularly to detect any unusual activity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Need help getting started with our API? Check out our
              comprehensive documentation and code examples.
            </p>
            <div className="flex gap-2">
              <Button variant="outlined">View API Docs</Button>
              <Button variant="outlined">Code Examples</Button>
              <Button variant="outlined">Postman Collection</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
