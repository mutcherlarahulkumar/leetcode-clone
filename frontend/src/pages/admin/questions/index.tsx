import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { useAdminQuestions } from "@lecode/api/admin/questions";
import { ROUTES, QUESTION_STATUS_LABEL } from "@lecode/constants";
import { QuestionStatus } from "@lecode/types";
import { withAdminLayout } from "@lecode/lib/layouts/AdminLayout";
import { QuestionStatusBadge } from "@lecode/components/common/QuestionStatusBadge";
import { CsFactLoader } from "@lecode/components/common/CsFactLoader";
import { Button } from "@lecode/components/ui/button";
import { Card } from "@lecode/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lecode/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lecode/components/ui/table";

const ALL = "all";

export default function AdminQuestionsPage() {
  const { data, isLoading, isError } = useAdminQuestions();
  const [status, setStatus] = useState<string>(ALL);

  const filtered = useMemo(
    () => (data ?? []).filter((q) => status === ALL || q.status === status),
    [data, status],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Questions</h1>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {Object.values(QuestionStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {QUESTION_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href={ROUTES.adminQuestionNew}>
              <FiPlus /> New question
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <CsFactLoader />
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">Could not load questions.</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            {data && data.length > 0 ? "No questions with this status." : "No questions yet."}
          </p>
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
              {filtered.map((q) => (
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
