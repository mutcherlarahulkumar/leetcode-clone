import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import type { ReactElement } from "react";
import { useQuestions } from "@lecode/api/questions";
import { ROUTES } from "@lecode/constants";
import { withAppLayout } from "@lecode/lib/layouts/AppLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lecode/components/ui/table";
import { Card } from "@lecode/components/ui/card";
import { Skeleton } from "@lecode/components/ui/skeleton";

export default function ProblemsPage() {
  const { data, isLoading, isError } = useQuestions();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Problems</h1>
        <p className="text-sm text-muted-foreground">Pick a problem and start solving.</p>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">Could not load problems.</p>
        ) : !data || data.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No problems yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((q, i) => (
                <TableRow key={q.id} className="cursor-pointer">
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <Link href={ROUTES.problem(q.id)} className="font-medium hover:text-primary">
                      {q.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={ROUTES.problem(q.id)} aria-label={`Open ${q.title}`}>
                      <FiChevronRight className="text-muted-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

ProblemsPage.getLayout = (page: ReactElement) => withAppLayout(page);
