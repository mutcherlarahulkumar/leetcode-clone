import type { ReactNode } from "react";
import { Navbar } from "@lecode/components/common/Navbar";

// Default shell for user-facing pages. The solve page opts out (full-height
// split view) by not using this layout.
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1 py-6">{children}</main>
    </div>
  );
}

export const withAppLayout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
