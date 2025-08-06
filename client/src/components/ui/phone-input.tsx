import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const [isValid, setIsValid] = useState(false);

    const formatPhoneNumber = (input: string) => {
      // Remove all non-digits
      const digits = input.replace(/\D/g, "");
      
      // Format for mobile: +63 9XX XXX XXXX (Philippine mobile format)
      if (digits.length >= 10) {
        if (digits.startsWith('63')) {
          // Already has country code
          const formatted = digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "+$1 $2 $3 $4");
          return formatted.slice(0, 16);
        } else if (digits.startsWith('9')) {
          // Mobile number without country code
          const formatted = digits.replace(/(\d{1})(\d{2})(\d{3})(\d{4})/, "+63 $1$2 $3 $4");
          return formatted.slice(0, 16);
        }
      } else if (digits.length >= 7) {
        if (digits.startsWith('9')) {
          return digits.replace(/(\d{1})(\d{2})(\d{0,3})/, "+63 $1$2 $3");
        }
      } else if (digits.length >= 3) {
        if (digits.startsWith('9')) {
          return "+63 " + digits;
        }
      }
      return digits.startsWith('9') ? "+63 " + digits : digits;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      // Valid mobile number should be +63 9XX XXX XXXX (16 characters)
      setIsValid(formatted.length === 16 && formatted.startsWith('+63 9'));
      
      // Create a synthetic event with formatted value
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: formatted }
      };
      
      if (onChange) {
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn("pr-10", className)}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {isValid && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <CheckCircle className="text-primary-green h-4 w-4" />
          </div>
        )}
        <p className="mt-1 text-sm text-gray-500">Format: +63 9XX XXX XXXX</p>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
