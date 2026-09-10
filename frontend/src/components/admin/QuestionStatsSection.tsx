import { useMemo } from "react";
import { useAdminSubmissions } from "@lecode/api/admin/submissions";
import { SubmissionStatus } from "@lecode/types";
import { StatusBadge } from "@lecode/components/common/StatusBadge";
import { CsFactLoader } from "@lecode/components/common/CsFactLoader";
import { Card, CardContent } from "@lecode/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lecode/components/ui/table";

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold" style={tone ? { color: tone } : undefined}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export function QuestionStatsSection({ questionId }: { questionId: string }) {
  const { data, isLoading, isError } = useAdminSubmissions({ questionId });

  const stats = useMemo(() => {
    const subs = data ?? [];
    const total = subs.length;
    const accepted = subs.filter((s) => s.status === SubmissionStatus.accepted).length;
    const users = new Set(subs.map((s) => s.user_id)).size;
    return {
      total,
      accepted,
      users,
      rate: total ? `${Math.round((accepted / total) * 100)}%` : "—",
    };
  }, [data]);

  if (isLoading) return <CsFactLoader />;
  if (isError) return <p className="text-sm text-destructive">Could not load submissions.</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Submissions" value={String(stats.total)} />
        <Stat label="Solvers" value={String(stats.users)} />
        <Stat label="Accepted" value={String(stats.accepted)} tone="hsl(var(--success))" />
        <Stat label="Acceptance" value={stats.rate} tone="hsl(var(--info))" />
      </div>

      <Card>
        {stats.total === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No one has submitted to this question yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Passed</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.user_name}</div>
                    <div className="text-xs text-muted-foreground">{s.user_email}</div>
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
