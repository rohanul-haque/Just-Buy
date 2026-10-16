"use client";

/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import React from "react";
import Image from "next/image";
import type { IllustrationProps } from "@/types";

export type { IllustrationProps };

/**
 * 1. Login Illustration
 * Uses public/illustration/login.svg
 */
export function LoginIllustration({
  imageSrc = "/illustration/login.svg",
  alt = "JustBuy Login Illustration",
  className = "",
}: IllustrationProps) {
  return (
    <div
      className={`relative w-full max-w-[540px] mx-auto flex items-center justify-center p-2 select-none ${className}`}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={598}
        height={547}
        priority
        className="w-full h-auto max-h-[500px] object-contain drop-shadow-xs"
      />
    </div>
  );
}

/**
 * 2. Forgot Password Illustration
 * Uses public/illustration/forgot_password.svg
 */
export function ForgotPasswordIllustration({
  imageSrc = "/illustration/forgot_password.svg",
  alt = "JustBuy Password Recovery Illustration",
  className = "",
}: IllustrationProps) {
  return (
    <div
      className={`relative w-full max-w-[500px] mx-auto flex items-center justify-center p-2 select-none ${className}`}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={485}
        height={436}
        priority
        className="w-full h-auto max-h-[460px] object-contain drop-shadow-xs"
      />
    </div>
  );
}

/**
 * 3. Verify OTP Illustration
 * Uses public/illustration/verify_otp.svg
 */
export function VerifyOtpIllustration({
  imageSrc = "/illustration/verify_otp.svg",
  alt = "JustBuy Verify OTP Illustration",
  className = "",
}: IllustrationProps) {
  return (
    <div
      className={`relative w-full max-w-[520px] mx-auto flex items-center justify-center p-2 select-none ${className}`}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={552}
        height={489}
        priority
        className="w-full h-auto max-h-[460px] object-contain drop-shadow-xs"
      />
    </div>
  );
}

/**
 * 4. Reset Password Illustration
 * Uses public/illustration/updet_password.svg
 */
export function ResetPasswordIllustration({
  imageSrc = "/illustration/updet_password.svg",
  alt = "JustBuy Reset Password Illustration",
  className = "",
}: IllustrationProps) {
  return (
    <div
      className={`relative w-full max-w-[500px] mx-auto flex items-center justify-center p-2 select-none ${className}`}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={450}
        height={396}
        priority
        className="w-full h-auto max-h-[460px] object-contain drop-shadow-xs"
      />
    </div>
  );
}
