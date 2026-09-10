import type { ReactElement } from "react";
import { useAdminSubmissions } from "@lecode/api/admin/submissions";
import { withAdminLayout } from "@lecode/lib/layouts/AdminLayout";
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

export default function AdminSubmissionsPage() {
  const { data, isLoading, isError } = useAdminSubmissions();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">All submissions</h1>
      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
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
                <TableHead>User</TableHead>
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
                    <div className="font-medium">{s.user_name}</div>
                    <div className="text-xs text-muted-foreground">{s.user_email}</div>
                  </TableCell>
                  <TableCell>{s.question_title}</TableCell>
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

AdminSubmissionsPage.getLayout = (page: ReactElement) => withAdminLayout(page);
