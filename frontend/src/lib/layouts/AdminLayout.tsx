import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiFileText, FiCode, FiUsers, FiList } from "react-icons/fi";
import { Navbar } from "@lecode/components/common/Navbar";
import { RequireAuth } from "@lecode/components/common/RequireAuth";
import { ROUTES } from "@lecode/constants";
import { cn } from "@lecode/lib/utils";

const NAV = [
  { href: ROUTES.adminQuestions, label: "Questions", icon: FiFileText },
  { href: ROUTES.adminLanguages, label: "Languages", icon: FiCode },
  { href: ROUTES.adminUsers, label: "Users", icon: FiUsers },
  { href: ROUTES.adminSubmissions, label: "Submissions", icon: FiList },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useRouter();
  return (
    <RequireAuth admin>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container flex flex-1 gap-6 py-6">
          <aside className="w-48 shrink-0">
            <nav className="flex flex-col gap-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60",
                    )}
                  >
                    <Icon /> {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}

export const withAdminLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
