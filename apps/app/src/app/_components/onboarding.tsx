"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  User,
  Building2,
  CreditCard,
  CheckCircle,
  Lightbulb,
  Mail,
  Phone,
  Rocket,
} from "lucide-react";

import { api } from "@/trpc/react";
import { Button } from "@leaseup/ui/components/button";
import { Input } from "@leaseup/ui/components/input";
import { Label } from "@leaseup/ui/components/label";
import { Textarea } from "@leaseup/ui/components/text-area";
import { Checkbox } from "@leaseup/ui/components/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@leaseup/ui/components/select";

export const Onboarding = () => {
  const utils = api.useUtils();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Business Information
    businessName: "",
    businessType: "",
    propertyCount: "",
    yearsInBusiness: "",
    businessAddress: "",
    city: "",
    state: "",
    zipCode: "",

    // Contact Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    preferredContact: "Email",

    // Additional Information
    heardFrom: "",
    features: [] as string[],
    challenges: "",
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const steps = [
    { id: 1, title: "Basic Info", icon: User, color: "bg-[#3498DB]" },
    { id: 2, title: "Banking Details", icon: CreditCard, color: "bg-gray-200" },
    {
      id: 3,
      title: "Identity Verification",
      icon: Building2,
      color: "bg-gray-200",
    },
    {
      id: 4,
      title: "Review & Submit",
      icon: CheckCircle,
      color: "bg-gray-200",
    },
  ];

  const businessTypes = [
    "Individual Landlord",
    "Property Management Company",
    "Real Estate Investment Trust",
    "LLC",
    "Corporation",
    "Partnership",
  ];

  const propertyCounts = [
    "1-5 properties",
    "6-10 properties",
    "11-25 properties",
    "26-50 properties",
    "50+ properties",
  ];

  const yearsInBusiness = [
    "Less than 1 year",
    "1-3 years",
    "4-7 years",
    "8-15 years",
    "15+ years",
  ];

  const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  const heardFromOptions = [
    "Google Search",
    "Social Media",
    "Referral from friend/colleague",
    "Industry publication",
    "Trade show/conference",
    "Advertisement",
    "Other",
  ];

  const features = [
    "Rent Collection",
    "Tenant Screening",
    "Maintenance Requests",
    "Financial Reporting",
    "Lease Management",
    "Communication Tools",
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ECF0F1] px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Basic Information</CardTitle>
              <span className="text-sm text-[#7F8C8D]">
                Step {currentStep} of 4
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-1 items-center">
                  <div
                    className={`h-8 w-8 ${step.id <= currentStep ? "bg-[#3498DB]" : "bg-gray-200"} flex items-center justify-center rounded-full`}
                  >
                    <span
                      className={`text-sm font-medium ${step.id <= currentStep ? "text-white" : "text-gray-400"}`}
                    >
                      {step.id}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 h-2 flex-1 rounded ${step.id < currentStep ? "bg-[#3498DB]" : "bg-gray-200"}`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-2 flex justify-between text-sm">
              {steps.map((step) => (
                <span
                  key={step.id}
                  className={`font-medium ${step.id <= currentStep ? "text-[#3498DB]" : "text-gray-400"}`}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Form Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Welcome Section */}
            <Card>
              <CardHeader>
                <div className="flex">
                  <div className="flex items-center">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3498DB]">
                      <Rocket className="text-xl text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Welcome to LeaseUp
                    </CardTitle>
                    <CardDescription>
                      Let's get your account set up to start managing your
                      properties
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="businessName"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      Business/Company Name *
                    </Label>
                    <Input
                      id="businessName"
                      placeholder="Enter your business name"
                      value={formData.businessName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("businessName", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="businessType"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      Business Type *
                    </Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value: string) =>
                        handleInputChange("businessType", value)
                      }
                    >
                      <SelectTrigger className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="propertyCount"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      Number of Properties *
                    </Label>
                    <Select
                      value={formData.propertyCount}
                      onValueChange={(value: string) =>
                        handleInputChange("propertyCount", value)
                      }
                    >
                      <SelectTrigger className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]">
                        <SelectValue placeholder="Select property count" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyCounts.map((count) => (
                          <SelectItem key={count} value={count}>
                            {count}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="yearsInBusiness"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      Years in Business
                    </Label>
                    <Select
                      value={formData.yearsInBusiness}
                      onValueChange={(value: string) =>
                        handleInputChange("yearsInBusiness", value)
                      }
                    >
                      <SelectTrigger className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearsInBusiness.map((years) => (
                          <SelectItem key={years} value={years}>
                            {years}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <Label
                    htmlFor="businessAddress"
                    className="mb-2 block text-sm font-medium text-[#2D3436]"
                  >
                    Business Address *
                  </Label>
                  <Input
                    id="businessAddress"
                    placeholder="Street Address"
                    value={formData.businessAddress}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("businessAddress", e.target.value)
                    }
                    className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                  />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      placeholder="City"
                      value={formData.city}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                    />
                    <Select
                      value={formData.state}
                      onValueChange={(value: string) =>
                        handleInputChange("state", value)
                      }
                    >
                      <SelectTrigger className="rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="ZIP Code"
                      value={formData.zipCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                      className="rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="jobTitle"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      Job Title
                    </Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Property Manager, Owner"
                      value={formData.jobTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("jobTitle", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="preferredContact"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      Preferred Contact Method
                    </Label>
                    <Select
                      value={formData.preferredContact}
                      onValueChange={(value: string) =>
                        handleInputChange("preferredContact", value)
                      }
                    >
                      <SelectTrigger className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                        <SelectItem value="Text Message">
                          Text Message
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="heardFrom"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      How did you hear about us?
                    </Label>
                    <Select
                      value={formData.heardFrom}
                      onValueChange={(value: string) =>
                        handleInputChange("heardFrom", value)
                      }
                    >
                      <SelectTrigger className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {heardFromOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-medium text-[#2D3436]">
                      What features are you most interested in?
                    </Label>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center">
                          <Checkbox
                            id={feature}
                            checked={formData.features.includes(feature)}
                            onCheckedChange={() => handleFeatureToggle(feature)}
                            className="h-4 w-4 rounded border-gray-300 text-[#3498DB] focus:ring-[#3498DB]"
                          />
                          <Label
                            htmlFor={feature}
                            className="ml-2 text-sm text-[#2D3436]"
                          >
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="challenges"
                      className="mb-2 block text-sm font-medium text-[#2D3436]"
                    >
                      Tell us about your biggest property management challenge
                    </Label>
                    <Textarea
                      id="challenges"
                      rows={4}
                      placeholder="Optional: Help us understand how we can best serve you..."
                      value={formData.challenges}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleInputChange("challenges", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outlined"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="flex items-center rounded-lg border border-[#7F8C8D] px-6 py-3 text-[#7F8C8D] hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="outlined"
                  className="flex items-center rounded-lg border border-[#3498DB] px-6 py-3 text-[#3498DB] hover:bg-[#3498DB]/5"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
                <Button
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(4, prev + 1))
                  }
                  className="flex items-center rounded-lg bg-[#3498DB] px-6 py-3 text-white hover:bg-[#2980B9]"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Help & Progress */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`size-8 ${step.id <= currentStep ? "bg-[#3498DB]" : "bg-gray-200"} mr-3 flex items-center justify-center rounded-full`}
                      >
                        <step.icon
                          className={`${step.id <= currentStep ? "text-white" : "text-gray-400"} size-4`}
                        />
                      </div>
                      <span
                        className={`text-sm ${step.id <= currentStep ? "font-medium text-[#3498DB]" : "text-gray-400"}`}
                      >
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-[#3498DB]/10 p-3">
                  <p className="text-sm font-medium text-[#3498DB]">
                    Step {currentStep} of 4
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-[#3498DB] transition-all duration-300"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help & Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-[#ECF0F1] p-3">
                    <div className="flex items-start">
                      <Lightbulb className="mt-1 mr-2 size-4 shrink-0 text-[#F39C12]" />
                      <div>
                        <p className="text-sm font-medium text-[#2D3436]">
                          Pro Tip
                        </p>
                        <p className="text-xs text-[#7F8C8D]">
                          Having accurate business information helps us provide
                          better service and faster processing.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center rounded-lg bg-[#ECF0F1] p-3">
                      <Mail className="mr-3 size-4 shrink-0 text-[#3498DB]" />
                      <div>
                        <p className="text-sm font-medium text-[#2D3436]">
                          Email Support
                        </p>
                        <p className="text-xs text-[#7F8C8D]">
                          support@rentwise.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center rounded-lg bg-[#ECF0F1] p-3">
                      <Phone className="mr-3 size-4 shrink-0 text-[#3498DB]" />
                      <div>
                        <p className="text-sm font-medium text-[#2D3436]">
                          Phone Support
                        </p>
                        <p className="text-xs text-[#7F8C8D]">(555) 123-4567</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
