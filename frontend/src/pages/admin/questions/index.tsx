import Link from "next/link";
import type { ReactElement } from "react";
import { FiPlus } from "react-icons/fi";
import { useAdminQuestions } from "@lecode/api/admin/questions";
import { ROUTES } from "@lecode/constants";
import { withAdminLayout } from "@lecode/lib/layouts/AdminLayout";
import { QuestionStatusBadge } from "@lecode/components/common/QuestionStatusBadge";
import { Button } from "@lecode/components/ui/button";
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

export default function AdminQuestionsPage() {
  const { data, isLoading, isError } = useAdminQuestions();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Questions</h1>
        <Button asChild>
          <Link href={ROUTES.adminQuestionNew}>
            <FiPlus /> New question
          </Link>
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">Could not load questions.</p>
        ) : !data || data.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No questions yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Link href={ROUTES.adminQuestion(q.id)} className="font-medium hover:text-primary">
                      {q.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <QuestionStatusBadge status={q.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString()}
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

AdminQuestionsPage.getLayout = (page: ReactElement) => withAdminLayout(page);
