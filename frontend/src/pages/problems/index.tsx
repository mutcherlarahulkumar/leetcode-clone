import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { ReactElement } from "react";
import { useQuestions } from "@lecode/api/questions";
import { ROUTES } from "@lecode/constants";
import { withAppLayout } from "@lecode/lib/layouts/AppLayout";
import { Card } from "@lecode/components/ui/card";
import { CsFactLoader } from "@lecode/components/common/CsFactLoader";

export default function ProblemsPage() {
  const { data, isLoading, isError } = useQuestions();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="flex items-end justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Problems</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick one and start solving.
          </p>
        </div>
        {data && (
          <span className="font-mono text-sm text-muted-foreground">
            {data.length} live
          </span>
        )}
      </header>

      {isLoading ? (
        <Card>
          <CsFactLoader />
        </Card>
      ) : isError ? (
        <p className="text-sm text-destructive">Could not load problems. Try again.</p>
      ) : !data || data.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No problems are live yet. Check back soon.
        </Card>
      ) : (
        <Card className="divide-y overflow-hidden">
          {data.map((q, i) => (
            <Link
              key={q.id}
              href={ROUTES.problem(q.id)}
              className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
            >
              <span className="w-8 font-mono text-sm text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 font-medium group-hover:text-primary">
                {q.title}
              </span>
              <FiArrowRight className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}

ProblemsPage.getLayout = (page: ReactElement) => withAppLayout(page);
