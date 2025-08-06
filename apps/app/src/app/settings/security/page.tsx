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
import { Switch } from "@leaseup/ui/components/switch";
import { Shield, Key, Smartphone, AlertTriangle, Clock } from "lucide-react";

export default function SecurityPage() {
  const loginSessions = [
    {
      device: "MacBook Pro - Chrome",
      location: "New York, US",
      lastActive: "Active now",
      current: true,
    },
    {
      device: "iPhone 14 - Safari",
      location: "New York, US",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      device: "Windows PC - Edge",
      location: "Los Angeles, US",
      lastActive: "3 days ago",
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Security Settings
            </h1>
            <p className="text-gray-600">
              Manage your password, two-factor authentication, and security
              preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Security Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-3 w-24 rounded-full bg-gray-200">
                    <div className="h-3 w-18 rounded-full bg-yellow-500" />
                  </div>
                  <span className="text-lg font-semibold">75%</span>
                </div>
                <p className="text-sm text-gray-600">
                  Good security level. Consider enabling additional security
                  features.
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
              />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Authentication</p>
                <p className="text-sm text-gray-600">+1 (555) ***-**67</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outlined">Enabled</Badge>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Authenticator App</p>
                <p className="text-sm text-gray-600">
                  Use an app like Google Authenticator
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>Not Setup</Badge>
                <Button variant="outlined" size="sm">
                  Setup
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Codes</p>
                <p className="text-sm text-gray-600">
                  Download backup codes for account recovery
                </p>
              </div>
              <Button variant="outlined" size="sm">
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Login Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Login Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loginSessions.map((session) => (
                <div
                  key={`${session.device}-${session.location}-${session.lastActive}`}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-sm text-gray-600">{session.location}</p>
                    <p className="text-xs text-gray-500">
                      {session.lastActive}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.current ? (
                      <Badge>Current Session</Badge>
                    ) : (
                      <Button variant="outlined" size="sm">
                        Sign Out
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outlined" className="mt-4 w-full">
              Sign Out All Other Sessions
            </Button>
          </CardContent>
        </Card>

        {/* Security Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Security Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Login Notifications</p>
                <p className="text-sm text-gray-600">
                  Get notified of new login attempts
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Suspicious Activity Alerts</p>
                <p className="text-sm text-gray-600">
                  Alert me of unusual account activity
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-gray-600">
                  Automatically sign out after inactivity
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
