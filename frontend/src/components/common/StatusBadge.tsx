import { Badge } from "@lecode/components/ui/badge";
import { STATUS_LABEL, STATUS_TONE } from "@lecode/constants";
import type { SubmissionStatus } from "@lecode/types";

const TONE_VARIANT = {
  good: "success",
  bad: "destructive",
  muted: "secondary",
} as const;

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <Badge variant={TONE_VARIANT[STATUS_TONE[status]]}>{STATUS_LABEL[status]}</Badge>
  );
}
