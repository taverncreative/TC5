import Link from "next/link";

export type JourneyStatus = "not_started" | "in_progress" | "completed" | "recommended";

export interface JourneyStage {
  id: "save-the-date" | "invitation" | "on-the-day" | "thank-you";
  title: string;
  shortTitle: string;
  status: JourneyStatus;
  /** Months before the wedding this is typically sent/ordered. */
  monthsBefore: [number, number];
}

interface JourneyStripProps {
  stages: JourneyStage[];
  /** Days until wedding (negative if past). Null if no wedding date set. */
  daysToWedding: number | null;
}

const statusStyles: Record<JourneyStatus, { dot: string; label: string; text: string }> = {
  not_started: {
    dot: "bg-[var(--tc-gray-200)]",
    label: "bg-[var(--tc-gray-100)] text-[var(--tc-gray-500)]",
    text: "Not started",
  },
  recommended: {
    dot: "bg-[var(--tc-blush)]",
    label: "bg-[var(--tc-blush-light)] text-[var(--tc-gray-800)]",
    text: "Start now",
  },
  in_progress: {
    dot: "bg-[var(--tc-sage)]",
    label: "bg-[var(--tc-sage-light)] text-[var(--tc-gray-800)]",
    text: "In progress",
  },
  completed: {
    dot: "bg-[var(--tc-sage)]",
    label: "bg-[var(--tc-sage-light)] text-[var(--tc-gray-800)]",
    text: "Ordered",
  },
};

export function JourneyStrip({ stages, daysToWedding }: JourneyStripProps) {
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const pct = (completedCount / stages.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-[var(--tc-black)]">
          Your Stationery Journey
        </h2>
        <p className="text-xs text-[var(--tc-gray-400)]">
          {completedCount} of {stages.length} ordered
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-[var(--tc-gray-100)] overflow-hidden">
        <div
          className="h-full bg-[var(--tc-sage)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stages grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stages.map((stage) => {
          const style = statusStyles[stage.status];
          const hint = stageHint(stage, daysToWedding);
          return (
            <Link
              key={stage.id}
              href={stageHref(stage.id)}
              className="group rounded-lg border border-[var(--tc-gray-200)] bg-white p-4 hover:border-[var(--tc-sage)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className={`text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded ${style.label}`}>
                  {style.text}
                </span>
              </div>
              <p className="text-sm font-medium text-[var(--tc-black)]">
                {stage.shortTitle}
              </p>
              {hint && (
                <p className="text-xs text-[var(--tc-gray-400)] mt-1">
                  {hint}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function stageHref(id: JourneyStage["id"]): string {
  return `/products?category=${id}`;
}

function stageHint(stage: JourneyStage, daysToWedding: number | null): string | null {
  if (stage.status === "completed") return "Sent to print";
  if (stage.status === "in_progress") return "Resume your design";
  if (daysToWedding === null) return `${stage.monthsBefore[0]}–${stage.monthsBefore[1]} months before`;

  // Computed window (approx days before)
  const [minMonths, maxMonths] = stage.monthsBefore;
  const minDays = minMonths * 30;
  const maxDays = maxMonths * 30;

  // Past: recommend sending thank-you after
  if (stage.id === "thank-you") {
    if (daysToWedding < 0) {
      const daysSince = Math.abs(daysToWedding);
      if (daysSince <= 90) return "Send within 3 months";
      return "Overdue — send soon";
    }
    return "After the wedding";
  }

  if (daysToWedding < 0) return "Wedding day passed";
  if (daysToWedding < minDays) return "Run out of time — order urgently";
  if (daysToWedding <= maxDays) return "Recommended window";
  return `${minMonths}–${maxMonths} months before`;
}
