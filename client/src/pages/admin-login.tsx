import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Lock, ArrowLeft } from "lucide-react";
import { z } from "zod";
import Footer from "@/components/Footer";

const loginSchema = z.object({
  passkey: z.string().min(1, "Passkey is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface AdminLoginProps {
  onLogin: () => void;
  onReturn?: () => void;
}

export default function AdminLogin({ onLogin, onReturn }: AdminLoginProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Admin passkey - you can change this to your desired password
  const ADMIN_PASSKEY = "Casahacienda1897";

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      passkey: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Simple passkey validation
      if (data.passkey === ADMIN_PASSKEY) {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard!",
        });
        onLogin();
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid passkey.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/casa-full.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Gradient Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, rgba(93, 156, 89, 0.8) 25%, rgba(223, 46, 56, 0.8) 100%)'
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center">
        {/* Return Button */}
        {onReturn && (
          <div className="absolute top-8 left-8">
            <Button
              onClick={onReturn}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Registration
            </Button>
          </div>
        )}
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center">
            <BookOpen className="text-white text-4xl" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Admin Access
            </h2>
            <p className="mt-2 text-center text-sm text-white/90">
              Tourism Office - Municipality of Rosario
            </p>
          </div>
          <div className="mt-8">
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">Enter Admin Passkey</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="passkey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Passkey</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter admin passkey"
                                className="pl-10"
                                data-testid="input-passkey"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-primary-green text-white hover:bg-green-700"
                      disabled={isLoading}
                      data-testid="button-login"
                    >
                      {isLoading ? "Signing in..." : "Access Admin Dashboard"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}