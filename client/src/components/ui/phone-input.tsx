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
      
      // Format based on length
      if (digits.length >= 6) {
        const formatted = digits.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
        return formatted.slice(0, 14); // Limit to formatted length
      } else if (digits.length >= 3) {
        return digits.replace(/(\d{3})(\d{0,3})/, "($1) $2");
      }
      return digits;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      setIsValid(formatted.length === 14);
      
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
        <p className="mt-1 text-sm text-gray-500">Format: (123) 456-7890</p>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
