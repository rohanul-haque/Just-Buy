"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group font-sans"
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans text-sm",
          description: "group-[.toast]:text-muted-foreground text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium rounded-lg px-3 py-1.5",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground rounded-lg px-3 py-1.5",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground",
          success:
            "group-[.toaster]:border-emerald-500/20 group-[.toaster]:bg-emerald-50/90 dark:group-[.toaster]:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100",
          error:
            "group-[.toaster]:border-destructive/20 group-[.toaster]:bg-rose-50/90 dark:group-[.toaster]:bg-rose-950/40 text-rose-900 dark:text-rose-100",
          info: "group-[.toaster]:border-blue-500/20 group-[.toaster]:bg-blue-50/90 dark:group-[.toaster]:bg-blue-950/40 text-blue-900 dark:text-blue-100",
          warning:
            "group-[.toaster]:border-amber-500/20 group-[.toaster]:bg-amber-50/90 dark:group-[.toaster]:bg-amber-950/40 text-amber-900 dark:text-amber-100",
        },
      }}
      {...props}
    />
  );
}

