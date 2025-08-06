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
import { Textarea } from "@leaseup/ui/components/text-area";
import { User, Camera } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Manage your personal information and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Change Photo
                </Button>
                <p className="text-sm text-gray-500">
                  JPG, GIF or PNG. 1MB max.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" placeholder="123 Main Street" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" placeholder="NY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input id="zip" placeholder="10001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="United States" />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
