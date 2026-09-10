import type { ReactElement } from "react";
import { useAdminUsers } from "@lecode/api/admin/users";
import { withAdminLayout } from "@lecode/lib/layouts/AdminLayout";
import { Badge } from "@lecode/components/ui/badge";
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

export default function AdminUsersPage() {
  const { data, isLoading, isError } = useAdminUsers();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">Could not load users.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Submissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.submission_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

AdminUsersPage.getLayout = (page: ReactElement) => withAdminLayout(page);
