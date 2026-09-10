import Link from "next/link";
import type { ReactElement } from "react";
import { useMySubmissions } from "@lecode/api/submissions";
import { ROUTES } from "@lecode/constants";
import { withAppLayout } from "@lecode/lib/layouts/AppLayout";
import { RequireAuth } from "@lecode/components/common/RequireAuth";
import { StatusBadge } from "@lecode/components/common/StatusBadge";
import { Card } from "@lecode/components/ui/card";
import { Skeleton } from "@lecode/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lecode/components/ui/table";

function SubmissionsInner() {
  const { data, isLoading, isError } = useMySubmissions();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">My submissions</h1>
      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">Could not load submissions.</p>
        ) : !data || data.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Passed</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link href={ROUTES.problem(s.question_id)} className="font-medium hover:text-primary">
                      {s.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.language}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.passed_count}/{s.total_count}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
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

export default function SubmissionsPage() {
  return (
    <RequireAuth>
      <SubmissionsInner />
    </RequireAuth>
  );
}

SubmissionsPage.getLayout = (page: ReactElement) => withAppLayout(page);
