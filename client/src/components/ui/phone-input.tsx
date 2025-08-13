import { forwardRef } from "react";
import PhoneInput2 from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, placeholder, disabled, "data-testid": testId, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <PhoneInput2
          country="ph"
          value={value}
          onChange={onChange}
          placeholder={placeholder || "Enter phone number"}
          disabled={disabled}
          data-testid={testId}
          enableSearch={true}
          searchPlaceholder="Search country..."
          preferredCountries={["ph", "us", "gb"]}
          countryCodeEditable={false}
          autoFormat={true}
          enableLongNumbers={true}
          {...props}
        />
        <style>{`
          .react-tel-input {
            width: 100% !important;
          }
          .react-tel-input .form-control {
            height: 48px !important;
            font-size: 16px !important;
            font-family: inherit !important;
            border: 1px solid #5D9C59 !important;
            border-radius: 6px !important;
            width: 100% !important;
          }
          .react-tel-input .flag-dropdown {
            border: 1px solid #5D9C59 !important;
            border-right: none !important;
            border-radius: 6px 0 0 6px !important;
            height: 48px !important;
          }
          .react-tel-input .form-control:focus {
            border-color: #5D9C59 !important;
            box-shadow: 0 0 0 2px rgba(93, 156, 89, 0.2) !important;
            outline: none !important;
          }
          .react-tel-input .flag-dropdown:focus-within {
            border-color: #5D9C59 !important;
          }
          @media (min-width: 640px) {
            .react-tel-input .form-control {
              height: 56px !important;
              font-size: 18px !important;
            }
            .react-tel-input .flag-dropdown {
              height: 56px !important;
            }
          }
        `}</style>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
