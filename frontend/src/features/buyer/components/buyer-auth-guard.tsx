"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

interface BuyerAuthGuardProps {
  children: React.ReactNode;
}

export function BuyerAuthGuard({ children }: BuyerAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMounted = useIsMounted();
  const { data: user, isLoading } = useCurrentUser();

  React.useEffect(() => {
    if (isMounted && !isLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isMounted, isLoading, user, router, pathname]);

  if (!isMounted || isLoading) {
    return (
      <Container className="py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-60 space-y-4">
            <Skeleton className="size-20 rounded-full mx-auto" />
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

