import Link from "next/link";
import { useRouter } from "next/router";
import { FiCode, FiColumns, FiLogOut, FiShield, FiUser } from "react-icons/fi";
import { useAuth } from "@lecode/lib/auth/AuthContext";
import { ROUTES } from "@lecode/constants";
import { cn } from "@lecode/lib/utils";
import { Button } from "@lecode/components/ui/button";
import { ThemeToggle } from "@lecode/components/common/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lecode/components/ui/dropdown-menu";

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const { pathname } = useRouter();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "relative py-4 text-sm font-medium transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
      )}
    </Link>
  );
};

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const onSolvePage = router.pathname === "/problems/[id]";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={ROUTES.problems} className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FiCode className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              le<span className="text-primary">code</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <NavLink href={ROUTES.problems} label="Problems" />
            {isAuthenticated && <NavLink href={ROUTES.submissions} label="Submissions" />}
            {isAdmin && <NavLink href={ROUTES.admin} label="Admin" />}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {onSolvePage && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Reset layout"
              title="Reset layout"
              onClick={() => window.dispatchEvent(new CustomEvent("lecode:reset-layout"))}
            >
              <FiColumns />
            </Button>
          )}
          <ThemeToggle />
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account">
                  <FiUser />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => router.push(ROUTES.admin)}>
                    <FiShield /> Admin dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    router.push(ROUTES.login);
                  }}
                >
                  <FiLogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={ROUTES.login}>Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={ROUTES.signup}>Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
