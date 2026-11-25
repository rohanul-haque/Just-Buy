"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import {
  updateBuyerProfileSchema,
  type UpdateBuyerProfileFormValues,
} from "@/features/buyer/schemas";
import {
  useBuyerProfile,
  useUpdateBuyerProfile,
} from "@/features/buyer/hooks/use-buyer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import notify from "@/lib/toast";

export function ProfileForm() {
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useBuyerProfile();

  const updateProfileMutation = useUpdateBuyerProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateBuyerProfileFormValues>({
    resolver: zodResolver(updateBuyerProfileSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      gender: undefined,
      address: "",
    },
  });

  // Populate form values when profile loads
  React.useEffect(() => {
    if (profile) {
      reset({
        name: profile.buyer?.name || "",
        phoneNumber: profile.phoneNumber || "",
        gender: profile.gender || undefined,
        address: profile.address || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: UpdateBuyerProfileFormValues) => {
    updateProfileMutation.mutate(
      {
        name: values.name?.trim(),
        phoneNumber: values.phoneNumber?.trim() || "",
        gender: values.gender,
        address: values.address?.trim() || "",
      },
      {
        onSuccess: () => {
          notify.success("Profile saved successfully!");
        },
        onError: (err) => {
          notify.apiError(err, "Failed to update profile.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 w-full">
        <Skeleton className="h-7 w-56 bg-muted" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-[52px] w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-[52px] w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-[52px] w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-[52px] w-full rounded-md" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-[52px] w-full rounded-md" />
          </div>
        </div>
        <div className="flex justify-center pt-6">
          <Skeleton className="h-12 w-44 rounded-md" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load profile"
        message={error?.message || "Could not retrieve your buyer profile data."}
        onRetry={() => refetch()}
      />
    );
  }

  const isPending = isSubmitting || updateProfileMutation.isPending;
  const displayEmail = profile?.buyer?.email || "";

  return (
    <div className="w-full">
      {/* Section Title matching mockup */}
      <h1 className="text-xl sm:text-2xl font-medium text-[#ff6200] tracking-tight mb-7 sm:mb-8">
        Personal Information :
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* 2-Column Responsive Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          {/* Name Field (Directly Editable) */}
          <div>
            <label
              htmlFor="name"
              className="block text-base sm:text-lg font-normal text-neutral-900 mb-2"
            >
              Name :
            </label>
            <input
              id="name"
              type="text"
              placeholder="Cameron Williamson"
              disabled={isPending}
              className="w-full h-[52px] rounded-md border border-neutral-700/80 bg-white px-4 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] transition-colors"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number Field (Directly Editable) */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-base sm:text-lg font-normal text-neutral-900 mb-2"
            >
              Phone Number :
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="+1 145528 455265"
              disabled={isPending}
              className="w-full h-[52px] rounded-md border border-neutral-700/80 bg-white px-4 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] transition-colors"
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Email Field (Readonly) */}
          <div>
            <label
              htmlFor="email"
              className="block text-base sm:text-lg font-normal text-neutral-900 mb-2"
            >
              Email :
            </label>
            <input
              id="email"
              type="email"
              value={displayEmail}
              disabled
              placeholder="deana@gmail.com"
              className="w-full h-[52px] rounded-md border border-neutral-700/80 bg-white px-4 text-sm sm:text-base text-neutral-500 cursor-not-allowed select-none"
            />
          </div>

          {/* Gender Field (Directly Editable) */}
          <div>
            <label
              htmlFor="gender"
              className="block text-base sm:text-lg font-normal text-neutral-900 mb-2"
            >
              Gander :
            </label>
            <div className="relative">
              <select
                id="gender"
                disabled={isPending}
                className="w-full h-[52px] rounded-md border border-neutral-700/80 bg-white px-4 pr-10 text-sm sm:text-base text-neutral-900 appearance-none focus:outline-none focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] transition-colors cursor-pointer"
                {...register("gender")}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-800">
                <ChevronRight className="size-5 stroke-[2]" />
              </div>
            </div>
            {errors.gender && (
              <p className="text-xs text-red-500 mt-1">{errors.gender.message}</p>
            )}
          </div>

          {/* Address Field (Directly Editable, Full Width) */}
          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="block text-base sm:text-lg font-normal text-neutral-900 mb-2"
            >
              Address :
            </label>
            <input
              id="address"
              type="text"
              placeholder="Address Here..."
              disabled={isPending}
              className="w-full h-[52px] rounded-md border border-neutral-700/80 bg-white px-4 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] transition-colors"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
            )}
          </div>
        </div>

        {/* Action Button: Save Changes */}
        <div className="flex items-center justify-center pt-8">
          <Button
            type="submit"
            disabled={isPending}
            className="px-14 py-3 h-12 font-medium text-sm sm:text-base rounded-md bg-[#ff6200] hover:bg-[#e65800] text-white transition-colors min-w-[170px] shadow-none cursor-pointer"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
