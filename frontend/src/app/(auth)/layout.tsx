import type { Metadata } from "next";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Authentication | JustBuy",
  description: "Secure authentication for JustBuy marketplace",
};

export default function AuthGroupLayout({
=======
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
>>>>>>> origin/develop
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
  return <div className="min-h-full w-full">{children}</div>;
}
=======
  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8 bg-muted/20">
      {children}
    </div>
  );
}

>>>>>>> origin/develop
