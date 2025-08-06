import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertVisitorSchema } from "@shared/schema";
import { User, Phone, Mail, Send, CheckCircle } from "lucide-react";
import type { InsertVisitor, Visitor } from "@shared/schema";

export default function TouristRegistration() {
  const { toast } = useToast();
  const [successData, setSuccessData] = useState<Visitor | null>(null);

  const form = useForm<InsertVisitor>({
    resolver: zodResolver(insertVisitorSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const registerVisitorMutation = useMutation({
    mutationFn: async (data: InsertVisitor) => {
      const response = await apiRequest("POST", "/api/visitors", data);
      return response.json();
    },
    onSuccess: (visitor: Visitor) => {
      setSuccessData(visitor);
      form.reset();
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
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertVisitor) => {
    registerVisitorMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Our Destination</h2>
            <p className="text-gray-600">Please register your visit by filling out the form below</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                      <User className="mr-2 h-4 w-4 text-primary-green" />
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        data-testid="input-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                      <Phone className="mr-2 h-4 w-4 text-primary-green" />
                      Phone Number *
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        placeholder="(123) 456-7890"
                        data-testid="input-phone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                      <Mail className="mr-2 h-4 w-4 text-primary-green" />
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-primary-green text-white hover:bg-green-700 focus:ring-primary-green"
                  disabled={registerVisitorMutation.isPending}
                  data-testid="button-submit"
                >
                  {registerVisitorMutation.isPending ? (
                    "Registering..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
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
