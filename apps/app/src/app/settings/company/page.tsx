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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@leaseup/ui/components/select";
import { Building, Upload, FileText } from "lucide-react";

export default function CompanyPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Company Settings
            </h1>
            <p className="text-gray-600">
              Manage your business information and company details
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Company Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-200">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Button>
                <p className="text-sm text-gray-500">
                  PNG or JPG. Recommended size: 512x512px. Max 2MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Acme Properties Inc." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="property-management">
                      Property Management
                    </SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Number of Employees</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="500+">500+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.acmeproperties.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your company..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Address */}
        <Card>
          <CardHeader>
            <CardTitle>Business Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Street Address</Label>
              <Input id="businessAddress" placeholder="123 Business Ave" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="businessCity">City</Label>
                <Input id="businessCity" placeholder="New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessState">State/Province</Label>
                <Input id="businessState" placeholder="NY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessZip">ZIP/Postal Code</Label>
                <Input id="businessZip" placeholder="10001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessCountry">Country</Label>
              <Input id="businessCountry" placeholder="United States" />
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Legal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input id="taxId" placeholder="12-3456789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessLicense">Business License Number</Label>
                <Input id="businessLicense" placeholder="BL-123456789" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="sole-proprietorship">
                    Sole Proprietorship
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  placeholder="contact@acmeproperties.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                placeholder="support@acmeproperties.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Business Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Business License</Label>
                <Button variant="outlined" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload License
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Insurance Certificate</Label>
                <Button variant="outlined" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Certificate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Articles of Incorporation</Label>
              <Button variant="outlined" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save Company Information</Button>
        </div>
      </div>
    </div>
  );
}
