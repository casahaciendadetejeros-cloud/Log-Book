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
          preferredCountries={["ph", "us", "gb", "no"]}
          countryCodeEditable={true}
          autoFormat={true}
          enableLongNumbers={15}
          specialLabel=""
          jumpCursorToEnd={false}
          inputProps={{
            maxLength: 15,
            inputMode: "numeric"
          }}
          {...props}
        />
        <style>{`
          .react-tel-input {
            width: 100% !important;
          }
          .react-tel-input .form-control {
            height: 48px !important;
            font-size: 18px !important;
            font-family: inherit !important;
            border: 1px solid #e2e8f0 !important;
            border-left: none !important;
            border-radius: 0 6px 6px 0 !important;
            width: 100% !important;
            background-color: white !important;
            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out !important;
          }
          .react-tel-input .flag-dropdown {
            border: 1px solid #e2e8f0 !important;
            border-right: none !important;
            border-radius: 6px 0 0 6px !important;
            height: 48px !important;
            background-color: white !important;
            transition: border-color 0.2s ease-in-out !important;
          }
          .react-tel-input .form-control:focus {
            border-color: #22c55e !important;
            box-shadow: 0 0 0 1px #22c55e !important;
            outline: none !important;
          }
          .react-tel-input .flag-dropdown:focus-within {
            border-color: #22c55e !important;
          }
          .react-tel-input:focus-within .flag-dropdown {
            border-color: #22c55e !important;
          }
          .react-tel-input:focus-within .form-control {
            border-color: #22c55e !important;
            box-shadow: 0 0 0 1px #22c55e !important;
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
