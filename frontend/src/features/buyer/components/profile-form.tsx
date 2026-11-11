"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateBuyerProfileSchema,
  type UpdateBuyerProfileFormValues,
} from "@/features/buyer/schemas";
import {
  useBuyerProfile,
  useUpdateBuyerProfile,
} from "@/features/buyer/hooks/use-buyer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import notify from "@/lib/toast";

export function ProfileForm() {
  const [isEditing, setIsEditing] = React.useState(false);

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
      phoneNumber: "",
      gender: undefined,
      address: "",
    },
  });

  // Populate form values when profile loads
  React.useEffect(() => {
    if (profile) {
      reset({
        phoneNumber: profile.phoneNumber || "",
        gender: profile.gender || undefined,
        address: profile.address || "",
      });
    }
  }, [profile, reset]);

  const handleCancelEdit = () => {
    if (profile) {
      reset({
        phoneNumber: profile.phoneNumber || "",
        gender: profile.gender || undefined,
        address: profile.address || "",
      });
    }
    setIsEditing(false);
  };

  const onSubmit = async (values: UpdateBuyerProfileFormValues) => {
    updateProfileMutation.mutate(
      {
        phoneNumber: values.phoneNumber || "",
        gender: values.gender,
        address: values.address || "",
      },
      {
        onSuccess: () => {
          notify.success("Profile updated successfully!");
          setIsEditing(false);
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
        <Skeleton className="h-7 w-48 bg-muted" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex justify-center pt-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
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

  return (
    <div className="space-y-6 w-full">
      {/* Section Title matching Figma */}
      <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
        Personal Information :
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* 2-Column Responsive Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          {/* Name Field (Readonly) */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Name :
            </Label>
            <Input
              id="name"
              type="text"
              value={profile?.buyer?.name || ""}
              disabled
              className="bg-muted/30 text-foreground cursor-not-allowed border-border"
            />
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-foreground"
            >
              Phone Number :
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 145528 455265"
              disabled={!isEditing || isPending}
              hasError={Boolean(errors.phoneNumber)}
              className={!isEditing ? "bg-muted/20 cursor-default" : "bg-background"}
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-destructive">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Email Field (Readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email :
            </Label>
            <Input
              id="email"
              type="email"
              value={profile?.buyer?.email || ""}
              disabled
              className="bg-muted/30 text-foreground cursor-not-allowed border-border"
            />
          </div>

          {/* Gender Field */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium text-foreground">
              Gander :
            </Label>
            <div className="relative">
              <select
                id="gender"
                disabled={!isEditing || isPending}
                className={`h-9 w-full appearance-none rounded-md border border-input px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  !isEditing
                    ? "bg-muted/20 cursor-default text-foreground"
                    : "bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                }`}
                {...register("gender")}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground text-xs">
                &gt;
              </div>
            </div>
            {errors.gender && (
              <p className="text-xs text-destructive">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Address Field (Full Width) */}
          <div className="sm:col-span-2 space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-medium text-foreground"
            >
              Address :
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="Address Here..."
              disabled={!isEditing || isPending}
              hasError={Boolean(errors.address)}
              className={!isEditing ? "bg-muted/20 cursor-default" : "bg-background"}
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>
        </div>

        {/* Action Button: Edit vs Save Changes matching Figma */}
        <div className="flex items-center justify-center gap-4 pt-4">
          {!isEditing ? (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-10 py-2.5 font-medium rounded-xl min-w-[140px]"
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isPending}
                className="px-6 py-2.5 font-medium rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="px-10 py-2.5 font-medium rounded-xl min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

