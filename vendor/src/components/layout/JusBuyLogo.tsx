import React from "react";

interface JusBuyLogoProps {
  className?: string;
  variant?: "primary" | "white" | "colored";
}

export const JusBuyLogo: React.FC<JusBuyLogoProps> = ({
  className = "h-10",
  variant = "primary",
}) => {
  const isWhite = variant === "white";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Shopping Bag Icon with Smile Tag */}
      <div className="relative flex-shrink-0">
        <svg
          viewBox="0 0 44 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10"
        >
          {/* Handle */}
          <path
            d="M15 14V11C15 7.13401 18.134 4 22 4C25.866 4 29 7.13401 29 11V14"
            stroke={isWhite ? "#FFFFFF" : "#4F46E5"}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Bag Body */}
          <path
            d="M6 14H38L35.5 42C35.5 43.1046 34.6046 44 33.5 44H10.5C9.39543 44 8.5 43.1046 8.5 42L6 14Z"
            fill={isWhite ? "#FFFFFF" : "#6366F1"}
          />
          {/* Smile / Tag cut */}
          <path
            d="M16 26C18 30 26 30 28 26"
            stroke={isWhite ? "#4F46E5" : "#FFFFFF"}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Fold accent */}
          <path
            d="M38 14L34 22L35 40"
            stroke={isWhite ? "rgba(79,70,229,0.2)" : "rgba(255,255,255,0.4)"}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex items-center gap-1.5 text-2xl font-bold tracking-tight">
        <span className={isWhite ? "text-white" : "text-[#0F172A]"}>
          JUS
        </span>
        <span
          className={
            isWhite ? "text-white font-extrabold" : "text-[#4F46E5] font-extrabold"
          }
        >
          BUY
        </span>
      </div>
    </div>
  );
};

export default JusBuyLogo;
