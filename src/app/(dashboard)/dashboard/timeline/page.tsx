import { requireProfile } from "@/lib/db/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Wedding Timeline" };

type StepStatus = "not_started" | "in_progress" | "completed";

interface TimelineStep {
  id: "save-the-date" | "invitation" | "on-the-day" | "thank-you";
  title: string;
  description: string;
  monthsBefore: [number, number];
  monthsBeforeLabel: string;
  status: StepStatus;
  urgency: "none" | "recommended" | "overdue";
}

export default async function TimelinePage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [designsRes, ordersRes] = await Promise.all([
    supabase
      .from("saved_designs")
      .select("product:products(template:templates(category))")
      .eq("customer_id", profile.id),
    supabase
      .from("orders")
      .select("product:products(template:templates(category))")
      .eq("customer_id", profile.id),
  ]);

  type WithCategory = {
    product?: { template?: { category?: string } | null } | null;
  };
  const designs = (designsRes.data || []) as unknown as WithCategory[];
  const orders = (ordersRes.data || []) as unknown as WithCategory[];

  const designedCategories = new Set<string>();
  const orderedCategories = new Set<string>();
  designs.forEach((d) => {
    const c = d.product?.template?.category;
    if (c) designedCategories.add(c);
  });
  orders.forEach((o) => {
    const c = o.product?.template?.category;
    if (c) orderedCategories.add(c);
  });

  const daysToWedding = profile.wedding_date
    ? Math.floor(
        (new Date(profile.wedding_date).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const definitions: Array<Omit<TimelineStep, "status" | "urgency">> = [
    {
      id: "save-the-date",
      title: "Save the Dates",
      description: "Let guests reserve the weekend well before formal invites",
      monthsBefore: [8, 12],
      monthsBeforeLabel: "8–12 months before",
    },
    {
      id: "invitation",
      title: "Wedding Invitations",
      description:
        "The formal invite with all the details — venue, RSVPs, and dress code",
      monthsBefore: [3, 6],
      monthsBeforeLabel: "3–6 months before",
    },
    {
      id: "on-the-day",
      title: "On the Day Stationery",
      description:
        "Table plans, menus, place cards, order of service — the finishing touches",
      monthsBefore: [1, 2],
      monthsBeforeLabel: "1–2 months before",
    },
    {
      id: "thank-you",
      title: "Thank You Cards",
      description: "Show your gratitude — traditionally sent within 3 months",
      monthsBefore: [0, 0],
      monthsBeforeLabel: "After the wedding",
    },
  ];

  const steps: TimelineStep[] = definitions.map((d) => {
    const status: StepStatus = orderedCategories.has(d.id)
      ? "completed"
      : designedCategories.has(d.id)
        ? "in_progress"
        : "not_started";

    let urgency: "none" | "recommended" | "overdue" = "none";
    if (status === "not_started" && daysToWedding !== null) {
      if (d.id === "thank-you") {
        if (daysToWedding < -90) urgency = "overdue";
      } else {
        const minDays = d.monthsBefore[0] * 30;
        const maxDays = d.monthsBefore[1] * 30;
        if (daysToWedding >= 0 && daysToWedding < minDays) urgency = "overdue";
        else if (daysToWedding >= minDays && daysToWedding <= maxDays)
          urgency = "recommended";
      }
    }

    return { ...d, status, urgency };
  });

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const inProgressCount = steps.filter((s) => s.status === "in_progress").length;

  // Build contextual tips based on wedding date & progress
  const tips = buildTips(profile.wedding_date, daysToWedding, steps);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
          Wedding Timeline
        </h1>
        <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
          Your stationery journey — we&apos;ll guide you through every step
        </p>
      </div>

      {/* Progress card */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-[var(--tc-black)]">
              Your Progress
            </p>
            <p className="text-xs text-[var(--tc-gray-400)] mt-0.5">
              {completedCount} ordered
              {inProgressCount > 0 && `, ${inProgressCount} in progress`}
            </p>
          </div>
          {daysToWedding !== null && daysToWedding >= 0 && (
            <div className="text-right">
              <p className="text-xl font-semibold text-[var(--tc-black)]">
                {daysToWedding}
              </p>
              <p className="text-xs text-[var(--tc-gray-400)]">days to go</p>
            </div>
          )}
        </div>
        <div className="w-full bg-[var(--tc-gray-100)] rounded-full h-2">
          <div
            className="bg-[var(--tc-sage)] h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <TimelineStepRow
            key={step.id}
            step={step}
            index={index}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>

      {/* Contextual tips */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-[var(--tc-sage)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
            />
          </svg>
          <h2 className="text-sm font-semibold text-[var(--tc-black)]">
            Tips for where you are
          </h2>
        </div>
        <ul className="space-y-2.5">
          {tips.map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-[var(--tc-gray-600)] leading-relaxed"
            >
              <span className="text-[var(--tc-sage)] mt-0.5 flex-shrink-0">
                &#x2022;
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>

      {!profile.wedding_date && (
        <Card className="bg-[var(--tc-blush-light)]/20 border-[var(--tc-blush)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--tc-black)]">
                Set your wedding date to unlock personalised recommendations
              </p>
              <p className="text-xs text-[var(--tc-gray-500)] mt-1">
                We&apos;ll tell you exactly when to order each piece
              </p>
            </div>
            <Link href="/dashboard/account" className="flex-shrink-0">
              <Button size="sm" variant="outline">
                Add Date
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

function TimelineStepRow({
  step,
  index,
  isLast,
}: {
  step: TimelineStep;
  index: number;
  isLast: boolean;
}) {
  const indicatorStyle =
    step.status === "completed"
      ? "bg-[var(--tc-sage)] text-white"
      : step.status === "in_progress"
        ? "bg-[var(--tc-sage-light)] text-[var(--tc-gray-800)]"
        : step.urgency === "overdue"
          ? "bg-red-50 text-red-600 border border-red-200"
          : step.urgency === "recommended"
            ? "bg-[var(--tc-blush-light)] text-[var(--tc-gray-800)]"
            : "bg-[var(--tc-gray-100)] text-[var(--tc-gray-400)]";

  return (
    <Card>
      <div className="flex items-start gap-4">
        {/* Step indicator with connector line */}
        <div className="flex flex-col items-center self-stretch">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${indicatorStyle}`}
          >
            {step.status === "completed" ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          {!isLast && (
            <div className="w-px flex-1 bg-[var(--tc-gray-200)] mt-1 mb-[-12px]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--tc-black)]">
                {step.title}
              </p>
              <p className="text-xs text-[var(--tc-gray-500)] mt-1">
                {step.description}
              </p>
              <p className="text-xs text-[var(--tc-gray-400)] mt-1.5">
                {step.monthsBeforeLabel}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <StatusBadge step={step} />
              <ActionLink step={step} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ step }: { step: TimelineStep }) {
  if (step.status === "completed")
    return <Badge variant="success">Ordered</Badge>;
  if (step.status === "in_progress")
    return <Badge variant="sage">In Progress</Badge>;
  if (step.urgency === "overdue")
    return <Badge variant="warning">Order urgently</Badge>;
  if (step.urgency === "recommended")
    return <Badge variant="blush">Recommended now</Badge>;
  return <Badge variant="default">Not started</Badge>;
}

function ActionLink({ step }: { step: TimelineStep }) {
  if (step.status === "completed") return null;
  if (step.status === "in_progress") {
    return (
      <Link href="/dashboard/designs">
        <Button size="sm" variant="outline">
          Continue
        </Button>
      </Link>
    );
  }
  return (
    <Link href={`/products?category=${step.id}`}>
      <Button
        size="sm"
        variant={step.urgency === "overdue" ? "primary" : "outline"}
      >
        Start
      </Button>
    </Link>
  );
}

function buildTips(
  weddingDate: string | null,
  daysToWedding: number | null,
  steps: TimelineStep[]
): string[] {
  const tips: string[] = [];

  if (!weddingDate) {
    return [
      "Set your wedding date in Account to see personalised timing for each piece",
      "Save the Dates are traditionally sent 8–12 months before the wedding",
      "Formal invitations go out 3–6 months before, with an RSVP date 4–6 weeks ahead",
      "Match your on-the-day stationery to your invitations for a cohesive look",
    ];
  }

  const months = daysToWedding !== null ? Math.floor(daysToWedding / 30) : 0;

  // Context: far out
  if (daysToWedding !== null && daysToWedding > 365) {
    tips.push(
      "You have plenty of time — focus on Save the Dates first to help guests plan travel and accommodation"
    );
  }

  // Recommended now steps
  const recommended = steps.filter((s) => s.urgency === "recommended");
  recommended.forEach((s) => {
    if (s.id === "invitation")
      tips.push(
        `You're ${months} months out — now is the sweet spot to send formal invitations with an RSVP date 4–6 weeks before the wedding`
      );
    else if (s.id === "on-the-day")
      tips.push(
        `With ${months} months to go, it's time to confirm your table plan and order menus, place cards, and order of service`
      );
    else if (s.id === "save-the-date")
      tips.push(
        `Save the Dates are most effective ${s.monthsBeforeLabel.toLowerCase()} — send them out now`
      );
  });

  // Overdue warnings
  const overdue = steps.filter((s) => s.urgency === "overdue");
  overdue.forEach((s) => {
    tips.push(
      `Your ${s.title.toLowerCase()} are running tight — place the order as soon as possible to give yourself time for proofs`
    );
  });

  // If no designs started yet
  const anyStarted = steps.some(
    (s) => s.status === "in_progress" || s.status === "completed"
  );
  if (!anyStarted && daysToWedding !== null && daysToWedding > 0) {
    tips.push(
      "Start with a style you love — you can use the same accent colour across every piece"
    );
  }

  // Post-wedding
  if (daysToWedding !== null && daysToWedding < 0) {
    const daysSince = Math.abs(daysToWedding);
    if (daysSince <= 90) {
      tips.push(
        `Thank you cards are traditionally sent within 3 months — you have ${90 - daysSince} days left`
      );
    }
  }

  // General evergreen tips to fill out
  if (tips.length < 3) {
    tips.push(
      "Match on-the-day stationery to your invitation design for a cohesive look across every piece"
    );
  }
  if (tips.length < 3) {
    tips.push(
      "Order a proof copy of your invitation before committing to your full print run"
    );
  }

  return tips;
}
