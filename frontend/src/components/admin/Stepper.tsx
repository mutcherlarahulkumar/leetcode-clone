import { FiCheck } from "react-icons/fi";
import { cn } from "@lecode/lib/utils";

export interface Step {
  key: string;
  label: string;
}

// Horizontal, clickable step nav. `done` marks steps the user may jump back to;
// all steps are clickable here since editing is allowed at any stage.
export function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: Step[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-xs",
                  active ? "border-primary-foreground" : "border-current",
                )}
              >
                {done ? <FiCheck className="h-3 w-3" /> : i + 1}
              </span>
              {s.label}
            </button>
            {i < steps.length - 1 && <span className="h-px w-6 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
