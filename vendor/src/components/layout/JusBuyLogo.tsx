import logoImg from "@/assets/logo.png";
import React from "react";

interface JusBuyLogoProps {
  className?: string;
  variant?: "primary" | "white" | "colored";
}

export const JusBuyLogo: React.FC<JusBuyLogoProps> = ({
  className = "h-10",
}) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={logoImg}
        alt="JusBuy Logo"
        className="h-full w-auto max-h-12 object-contain"
      />
    </div>
  );
};

export default JusBuyLogo;
