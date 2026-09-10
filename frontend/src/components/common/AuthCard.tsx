import type { ReactNode } from "react";
import Link from "next/link";
import { FiCode } from "react-icons/fi";
import { ROUTES } from "@lecode/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lecode/components/ui/card";

// Centered card shell shared by the login and signup pages.
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Link href={ROUTES.problems} className="mb-8 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FiCode className="h-5 w-5" />
        </span>
        <span className="text-xl font-semibold tracking-tight">
          le<span className="text-primary">code</span>
        </span>
      </Link>
      <Card className="w-full max-w-sm border-t-2 border-t-primary">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <p className="mt-5 text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}
