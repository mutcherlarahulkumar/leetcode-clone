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
      <Link href={ROUTES.problems} className="mb-6 flex items-center gap-2 text-xl font-bold">
        <FiCode className="text-primary" />
        <span>
          le<span className="text-primary">code</span>
        </span>
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <p className="mt-4 text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}
