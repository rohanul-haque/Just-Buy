import * as React from "react";
import { cn } from "@/lib/utils";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
  onComplete?: (value: string) => void;
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 5,
  disabled = false,
  hasError = false,
  onComplete,
  className,
}) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of characters padded to length
  const digits = React.useMemo(() => {
    const valDigits = value.split("");
    return Array.from({ length }, (_, i) => valDigits[i] || "");
  }, [value, length]);

  const focusInput = (index: number) => {
    const target = inputRefs.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const char = e.target.value.slice(-1);
    // Accept only numeric digits
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    const nextVal = newDigits.join("");
    onChange(nextVal);

    if (char && index < length - 1) {
      focusInput(index + 1);
    }

    if (nextVal.length === length && !nextVal.includes("")) {
      onComplete?.(nextVal);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .trim()
      .replace(/\D/g, "")
      .slice(0, length);

    if (pastedData) {
      onChange(pastedData);
      const nextIndex = Math.min(pastedData.length, length - 1);
      focusInput(nextIndex);

      if (pastedData.length === length) {
        onComplete?.(pastedData);
      }
    }
  };

  return (
    <div className={cn("flex items-center justify-center gap-2 sm:gap-3", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-md border border-[#E5E7EB] bg-white text-[#0F172A] transition-all outline-none",
            "focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20",
            hasError && "border-[#EF4444] text-[#EF4444] focus:ring-[#EF4444]/20",
            disabled && "cursor-not-allowed opacity-50 bg-[#F1F5F9]",
          )}
          aria-label={`OTP Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
