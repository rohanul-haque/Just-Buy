import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Card className={cn("w-full max-w-md shadow-md border-border bg-card", className)}>
      <CardHeader className="space-y-3 text-center pb-6">
        <div className="flex justify-center pb-2">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="JustBuy Logo"
              width={130}
              height={40}
              className="h-9 w-auto dark:invert"
              priority
            />
          </Link>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {children}
        {footer && (
          <div className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

