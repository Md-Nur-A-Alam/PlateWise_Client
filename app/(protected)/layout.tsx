"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PageContainer } from "@/components/layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [session, isPending, router, pathname]);

  if (isPending || !isAuthorized) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </PageContainer>
    );
  }

  return <>{children}</>;
}
