import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@lecode/lib/auth/AuthContext";
import { ROUTES } from "@lecode/constants";
import { Skeleton } from "@lecode/components/ui/skeleton";

// Client-side guard. `admin` also requires the admin role. Auth lives entirely
// in the browser (JWT), so gating is client-side; the API enforces the real
// rules regardless.
export function RequireAuth({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { isAuthenticated, isAdmin, ready } = useAuth();
  const router = useRouter();

  const allowed = isAuthenticated && (!admin || isAdmin);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace(`${ROUTES.login}?next=${encodeURIComponent(router.asPath)}`);
    } else if (admin && !isAdmin) {
      router.replace(ROUTES.problems);
    }
  }, [ready, isAuthenticated, isAdmin, admin, router]);

  if (!ready || !allowed) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  return <>{children}</>;
}
