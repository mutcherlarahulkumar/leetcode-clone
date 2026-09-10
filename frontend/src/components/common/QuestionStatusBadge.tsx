import { Badge } from "@lecode/components/ui/badge";
import { QUESTION_STATUS_LABEL } from "@lecode/constants";
import { QuestionStatus } from "@lecode/types";

const VARIANT: Record<QuestionStatus, "success" | "secondary" | "warning" | "destructive"> = {
  ready: "success",
  draft: "secondary",
  generating: "warning",
  generation_failed: "destructive",
};

export function QuestionStatusBadge({ status }: { status: QuestionStatus }) {
  return <Badge variant={VARIANT[status]}>{QUESTION_STATUS_LABEL[status]}</Badge>;
}
