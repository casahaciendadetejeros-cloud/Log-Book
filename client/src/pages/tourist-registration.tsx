import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { useToast } from "@/hooks/use-toast";
import { visitorAPI } from "@/lib/firebase";
import { insertVisitorSchema } from "@shared/schema";
import { User, Phone, Mail, Send, CheckCircle, Target, Users } from "lucide-react";
import type { InsertVisitor, Visitor } from "@shared/schema";

const PURPOSE_OPTIONS = [
  { value: "event", label: "Event" },
  { value: "field_trip", label: "Field Trip" },
  { value: "interview", label: "Interview" },
  { value: "ocular", label: "Ocular" },
  { value: "vlog_video", label: "Vlog/Video" },
  { value: "other", label: "Other" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function TouristRegistration() {
  const { toast } = useToast();
  const [successData, setSuccessData] = useState<Visitor | null>(null);
  const [purposeType, setPurposeType] = useState<string>("");

  const form = useForm<InsertVisitor>({
    resolver: zodResolver(insertVisitorSchema),
    defaultValues: {
      name: "",
      gender: undefined,
      phone: "",
      email: "",
      purpose: "",
    },
  });

  const registerVisitorMutation = useMutation({
    mutationFn: async (data: InsertVisitor) => {
      return await visitorAPI.createVisitor(data);
    },
    onSuccess: (visitor: Visitor) => {
      setSuccessData(visitor);
      form.reset();
      setPurposeType("");
      toast({
        title: "Registration Successful!",
        description: `Your control number is: ${visitor.controlNumber}`,
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccessData(null);
      }, 5000);
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertVisitor) => {
    // Use the custom purpose if "other" was selected
    if (purposeType === "other" && data.purpose) {
      // data.purpose already contains the custom text
    } else {
      data.purpose = purposeType;
    }
    
    // Ensure phone number is properly formatted
    if (data.phone && !data.phone.startsWith('+63 ')) {
      // If phone doesn't have proper format, format it
      const digits = data.phone.replace(/\D/g, "");
      if (digits.startsWith('63')) {
        const numberWithoutCountryCode = digits.substring(2);
        if (numberWithoutCountryCode.length >= 10) {
          const areaCode = numberWithoutCountryCode.substring(0, 3);
          const firstPart = numberWithoutCountryCode.substring(3, 6);
          const secondPart = numberWithoutCountryCode.substring(6, 10);
          data.phone = `+63 ${areaCode} ${firstPart} ${secondPart}`;
        }
      }
    }
    
    registerVisitorMutation.mutate(data);
  };

  const handlePurposeChange = (value: string) => {
    setPurposeType(value);
    if (value !== "other") {
      form.setValue("purpose", value);
    } else {
      form.setValue("purpose", "");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-[1360px]:px-10 mb-96">
      <Card className="shadow-xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8 lg:p-12">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">Welcome to Casa Hacienda de Tejeros</h2>
            <p className="text-base sm:text-lg text-gray-600">Please register your visit by filling out the form below</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 lg:space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm sm:text-base lg:text-lg font-medium text-gray-700">
                      <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary-green" />
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        data-testid="input-name"
                        className="h-12 sm:h-14 md:text-xl text-lg sm:text-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender Field */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm sm:text-base lg:text-lg font-medium text-gray-700">
                      <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary-green" />
                      Gender *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm sm:text-base lg:text-lg font-medium text-gray-700">
                      <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary-green" />
                      Phone Number *
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter your phone number"
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm sm:text-base lg:text-lg font-medium text-gray-700">
                      <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary-green" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                        className="h-12 sm:h-14 md:text-xl text-lg sm:text-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Purpose of Visit */}
              <div className="space-y-3">
                <Label className="flex items-center text-sm sm:text-base lg:text-lg font-medium text-gray-700">
                  <Target className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary-green" />
                  Purpose of Visit *
                </Label>
                <Select onValueChange={handlePurposeChange} value={purposeType}>
                  <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg">
                    <SelectValue placeholder="Select purpose of visit" />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Other Purpose Input */}
              {purposeType === "other" && (
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Please specify your purpose *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your specific purpose of visit"
                          data-testid="input-purpose-other"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="pt-6 lg:pt-8">
                <Button
                  type="submit"
                  className="w-full h-12 sm:h-14 lg:h-16 bg-primary-green text-white hover:bg-green-700 focus:ring-primary-green text-base sm:text-lg lg:text-xl font-semibold"
                  disabled={registerVisitorMutation.isPending}
                  data-testid="button-submit"
                >
                  {registerVisitorMutation.isPending ? (
                    "Registering..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                      Register Visit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {successData && (
            <div className="mt-6 p-4 bg-light-green border border-primary-green rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="text-primary-green mr-3 h-5 w-5" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Registration Successful!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your control number is: <span className="font-bold" data-testid="text-control-number">{successData.controlNumber}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
