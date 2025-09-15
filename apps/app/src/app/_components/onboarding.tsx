"use client";

import { useState, useEffect } from "react";
import { useAppForm } from "@leaseup/ui/components/form";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Lightbulb,
  Mail,
  Phone,
  Rocket,
  MapPin,
  X,
} from "lucide-react";

import { api } from "@/trpc/react";
import { Button } from "@leaseup/ui/components/button";
import { Input } from "@leaseup/ui/components/input";
import { Label } from "@leaseup/ui/components/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";

import { useAutocompleteSuggestions } from "@/hooks";
import { useApiLoadingStatus } from "@vis.gl/react-google-maps";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@leaseup/ui/components/popover";

export const Onboarding = () => {
  const utils = api.useUtils();
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

  const form = useAppForm({
    defaultValues: {
      businessName: "",
      businessType: "",
      propertyCount: "",
      yearsInBusiness: "",
      businessAddress: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      preferredContact: "Email",
    },
  });

  const [address, setAddress] = useState("");
  const [debouncedAddress, setDebouncedAddress] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAddress(address);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [address]);

  const { suggestions, resetSession } = useAutocompleteSuggestions(
    debouncedAddress,
    {
      input: debouncedAddress,
    },
  );
  const status = useApiLoadingStatus();

  return (
    <div className="bg-[#ECF0F1 mt-6 flex min-h-screen justify-center px-4 sm:px-0">
      <div className="w-full max-w-5xl">
        {/* Main Content */}
        <form.AppForm>
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
                    <form.AppField name="businessName">
                      {(field) => (
                        <field.TextField
                          label="Business/Company Name *"
                          placeholder="Enter your business name"
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="businessType">
                      {(field) => (
                        <field.SelectField
                          label="Business Type *"
                          options={businessTypes.map((type) => ({
                            label: type,
                            id: type,
                          }))}
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="propertyCount">
                      {(field) => (
                        <field.SelectField
                          label="Number of Properties *"
                          options={propertyCounts.map((count) => ({
                            label: count,
                            id: count,
                          }))}
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="yearsInBusiness">
                      {(field) => (
                        <field.SelectField
                          label="Years in Business *"
                          options={yearsInBusiness.map((years) => ({
                            label: years,
                            id: years,
                          }))}
                        />
                      )}
                    </form.AppField>
                  </div>

                  <div className="mt-6">
                    <form.AppField name="businessAddress">
                      {(field) => (
                        <Popover
                          open={
                            suggestions.length > 0 &&
                            form.state.values.businessAddress === ""
                          }
                          onOpenChange={(e) => {
                            resetSession();
                          }}
                        >
                          <PopoverTrigger className="flex w-full flex-col">
                            <Label>Address *</Label>
                            <div className="relative">
                              <Input
                                className="mt-1 mb-2 w-full"
                                value={address}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                  setAddress(e.target.value);
                                  field.setValue("");
                                }}
                              />
                            </div>
                          </PopoverTrigger>

                          <PopoverContent className="w-96 p-0" align="start">
                            <div className="flex flex-col divide-y">
                              {suggestions.map((suggestion) => (
                                <button
                                  className="flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-left hover:bg-gray-100"
                                  key={suggestion.placePrediction?.placeId}
                                  onClick={() => {
                                    field.setValue(
                                      suggestion.placePrediction?.text.text ??
                                        "",
                                    );
                                    setAddress(
                                      suggestion.placePrediction?.text.text ??
                                        "",
                                    );
                                    resetSession();
                                  }}
                                >
                                  <MapPin className="size-4 shrink-0 stroke-1" />
                                  <span className="text-sm">
                                    {suggestion.placePrediction?.text.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </form.AppField>
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
                    <form.AppField name="firstName">
                      {(field) => (
                        <field.TextField
                          label="First Name *"
                          placeholder="Enter your first name"
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="lastName">
                      {(field) => (
                        <field.TextField
                          label="Last Name *"
                          placeholder="Enter your last name"
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="email">
                      {(field) => (
                        <field.TextField
                          label="Email Address *"
                          placeholder="Enter your email address"
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="phone">
                      {(field) => (
                        <field.TextField
                          label="Phone Number *"
                          placeholder="Enter your phone number"
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="jobTitle">
                      {(field) => (
                        <field.TextField
                          label="Job Title"
                          placeholder="Enter your job title"
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="preferredContact">
                      {(field) => (
                        <field.SelectField
                          label="Preferred Contact Method"
                          options={["Email", "Phone", "Text Message"].map(
                            (option) => ({
                              label: option,
                              id: option,
                            }),
                          )}
                        />
                      )}
                    </form.AppField>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              {/* <Card>
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
                              onCheckedChange={() =>
                                handleFeatureToggle(feature)
                              }
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
              </Card> */}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outlined"
                  // disabled={currentStep === 1}
                  // onClick={() =>
                  //   // setCurrentStep((prev) => Math.max(1, prev - 1))
                  // }
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
                    // onClick={() =>
                    //   setCurrentStep((prev) => Math.min(4, prev + 1))
                    // }
                    className="flex items-center rounded-lg bg-[#3498DB] px-6 py-3 text-white hover:bg-[#2980B9]"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
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
                            Having accurate business information helps us
                            provide better service and faster processing.
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
                          <p className="text-xs text-[#7F8C8D]">
                            (555) 123-4567
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form.AppForm>
      </div>
    </div>
  );
};
