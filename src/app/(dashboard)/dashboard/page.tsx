import Link from "next/link";
import { requireProfile } from "@/lib/db/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeddingHero } from "@/components/dashboard/wedding-hero";
import {
  JourneyStrip,
  type JourneyStage,
  type JourneyStatus,
} from "@/components/dashboard/journey-strip";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  // Pull everything we need in parallel
  const [designsRes, ordersRes] = await Promise.all([
    supabase
      .from("saved_designs")
      .select(
        "id, name, status, updated_at, product:products(name, slug, template:templates(category, thumbnail_url))"
      )
      .eq("customer_id", profile.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("orders")
      .select(
        "id, status, total_pence, created_at, order_number, product:products(name, slug, template:templates(category))"
      )
      .eq("customer_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const designs = (designsRes.data || []) as unknown as Array<{
    id: string;
    name: string;
    status: string;
    updated_at: string;
    product?: {
      name: string;
      slug: string;
      template?: { category?: string; thumbnail_url?: string | null } | null;
    } | null;
  }>;
  const orders = (ordersRes.data || []) as unknown as Array<{
    id: string;
    status: string;
    total_pence: number;
    created_at: string;
    order_number: string | null;
    product?: {
      name: string;
      slug: string;
      template?: { category?: string } | null;
    } | null;
  }>;

  // Compute journey stages from real design/order data
  const stages = computeJourneyStages(designs, orders, profile.wedding_date);

  // Active orders (not yet delivered)
  const activeOrders = orders.filter((o) =>
    ["pending", "printing", "payment_complete", "in_production", "shipped"].includes(
      o.status
    )
  );

  // Next action suggestion
  const nextAction = computeNextAction(profile, designs, orders, stages);

  // Days to wedding
  const daysToWedding = profile.wedding_date
    ? Math.floor(
        (new Date(profile.wedding_date).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Recent designs (most recent 2 that are editable)
  const recentDesigns = designs
    .filter((d) => d.status === "draft" || d.status === "approved")
    .slice(0, 2);

  return (
    <div className="max-w-5xl space-y-8">
      {/* Hero */}
      <WeddingHero
        partnerName1={profile.partner_name_1}
        partnerName2={profile.partner_name_2}
        weddingDate={profile.wedding_date}
        fullName={profile.full_name}
      />

      {/* What's Next — the hero action */}
      <Card className="border-[var(--tc-sage-light)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--tc-sage-light)]/40 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-[var(--tc-sage)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--tc-sage)] uppercase tracking-wide">
                What's Next
              </p>
              <p className="text-sm font-medium text-[var(--tc-black)] mt-0.5">
                {nextAction.title}
              </p>
              <p className="text-xs text-[var(--tc-gray-500)] mt-1">
                {nextAction.message}
              </p>
            </div>
          </div>
          <Link href={nextAction.href} className="flex-shrink-0">
            <Button size="sm">{nextAction.cta}</Button>
          </Link>
        </div>
      </Card>

      {/* Journey Strip */}
      <JourneyStrip stages={stages} daysToWedding={daysToWedding} />

      {/* Two-column: Recent Designs + Active Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Designs */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--tc-black)]">
              Recent Designs
            </h2>
            {designs.length > 0 && (
              <Link
                href="/dashboard/designs"
                className="text-xs text-[var(--tc-gray-500)] hover:text-[var(--tc-black)]"
              >
                View all
              </Link>
            )}
          </div>
          {recentDesigns.length === 0 ? (
            <Card>
              <div className="text-center py-6">
                <p className="text-sm text-[var(--tc-gray-500)]">
                  No designs yet
                </p>
                <Link href="/products" className="mt-3 inline-block">
                  <Button size="sm" variant="outline">
                    Start Your First Design
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentDesigns.map((design) => (
                <Card key={design.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <DesignThumb
                      thumbnailUrl={design.product?.template?.thumbnail_url || null}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--tc-black)] truncate">
                        {design.name}
                      </p>
                      <p className="text-xs text-[var(--tc-gray-400)] truncate">
                        {design.product?.name || "Design"} · Updated{" "}
                        {relativeTime(design.updated_at)}
                      </p>
                    </div>
                    {design.product?.slug && (
                      <Link
                        href={`/editor/${design.product.slug}?design=${design.id}`}
                        className="text-xs font-medium text-[var(--tc-sage)] hover:underline flex-shrink-0"
                      >
                        {design.status === "approved" ? "View" : "Continue"}
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Active Orders */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--tc-black)]">
              Active Orders
            </h2>
            {orders.length > 0 && (
              <Link
                href="/dashboard/orders"
                className="text-xs text-[var(--tc-gray-500)] hover:text-[var(--tc-black)]"
              >
                View all
              </Link>
            )}
          </div>
          {activeOrders.length === 0 ? (
            <Card>
              <div className="text-center py-6">
                <p className="text-sm text-[var(--tc-gray-500)]">
                  No active orders
                </p>
                <p className="text-xs text-[var(--tc-gray-400)] mt-1">
                  Your orders will appear here
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeOrders.slice(0, 3).map((order) => (
                <Card key={order.id} padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--tc-black)]">
                        {order.order_number || `Order ${order.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-[var(--tc-gray-400)] mt-0.5">
                        {order.product?.name || "Custom stationery"} ·{" "}
                        {formatPrice(order.total_pence)}
                      </p>
                    </div>
                    <Badge variant={statusVariant(order.status)}>
                      {formatOrderStatus(order.status)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions footer */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
          Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickLink
            href="/products"
            title="Browse All Designs"
            subtitle="Start something new"
            iconPath="M12 4.5v15m7.5-7.5h-15"
          />
          <QuickLink
            href="/dashboard/timeline"
            title="Wedding Timeline"
            subtitle="Your stationery plan"
            iconPath="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
          <QuickLink
            href="/dashboard/account"
            title="Wedding Details"
            subtitle="Names, date, contact"
            iconPath="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </div>
      </div>
    </div>
  );
}

// ——— Components ———

function DesignThumb({ thumbnailUrl }: { thumbnailUrl: string | null }) {
  if (thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnailUrl}
        alt=""
        className="w-12 h-12 rounded-md object-cover bg-[var(--tc-gray-100)] flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-md bg-[var(--tc-gray-100)] flex items-center justify-center flex-shrink-0">
      <svg
        className="w-5 h-5 text-[var(--tc-gray-400)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    </div>
  );
}

function QuickLink({
  href,
  title,
  subtitle,
  iconPath,
}: {
  href: string;
  title: string;
  subtitle: string;
  iconPath: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="hover:border-[var(--tc-sage)] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--tc-sage-light)]/30 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-[var(--tc-sage)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--tc-black)]">
              {title}
            </p>
            <p className="text-xs text-[var(--tc-gray-400)] mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ——— Helpers ———

interface DesignWithProduct {
  id: string;
  status: string;
  product?: { template?: { category?: string } | null } | null;
}

interface OrderWithProduct {
  id: string;
  status: string;
  product?: { template?: { category?: string } | null } | null;
}

function computeJourneyStages(
  designs: DesignWithProduct[],
  orders: OrderWithProduct[],
  weddingDate: string | null
): JourneyStage[] {
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

  const definitions: Array<{
    id: JourneyStage["id"];
    title: string;
    shortTitle: string;
    monthsBefore: [number, number];
  }> = [
    {
      id: "save-the-date",
      title: "Save the Dates",
      shortTitle: "Save the Dates",
      monthsBefore: [8, 12],
    },
    {
      id: "invitation",
      title: "Wedding Invitations",
      shortTitle: "Invitations",
      monthsBefore: [3, 6],
    },
    {
      id: "on-the-day",
      title: "On the Day Stationery",
      shortTitle: "On the Day",
      monthsBefore: [1, 2],
    },
    {
      id: "thank-you",
      title: "Thank You Cards",
      shortTitle: "Thank You",
      monthsBefore: [0, 0],
    },
  ];

  const daysToWedding = weddingDate
    ? Math.floor(
        (new Date(weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return definitions.map((def) => {
    let status: JourneyStatus;
    if (orderedCategories.has(def.id)) status = "completed";
    else if (designedCategories.has(def.id)) status = "in_progress";
    else {
      // Maybe recommend if in the recommended window
      if (daysToWedding !== null && def.id !== "thank-you") {
        const [min, max] = def.monthsBefore;
        const minDays = min * 30;
        const maxDays = max * 30;
        if (daysToWedding >= minDays && daysToWedding <= maxDays) {
          status = "recommended";
        } else {
          status = "not_started";
        }
      } else {
        status = "not_started";
      }
    }
    return { ...def, status };
  });
}

function computeNextAction(
  profile: { partner_name_1: string | null; wedding_date: string | null },
  designs: DesignWithProduct[],
  orders: OrderWithProduct[],
  stages: JourneyStage[]
): { title: string; message: string; cta: string; href: string } {
  if (!profile.partner_name_1 || !profile.wedding_date) {
    return {
      title: "Add your wedding details",
      message: "So we can personalise your journey and remind you of key dates",
      cta: "Add Details",
      href: "/dashboard/account",
    };
  }

  const draft = designs.find((d) => d.status === "draft");
  if (draft) {
    return {
      title: "You have a design in progress",
      message: "Pick up where you left off and get your proof ready",
      cta: "Continue",
      href: "/dashboard/designs",
    };
  }

  const recommended = stages.find((s) => s.status === "recommended");
  if (recommended) {
    return {
      title: `Time to start your ${recommended.shortTitle.toLowerCase()}`,
      message: `You're in the recommended window for ${recommended.title.toLowerCase()}`,
      cta: "Browse",
      href: `/products?category=${recommended.id}`,
    };
  }

  if (designs.length === 0) {
    return {
      title: "Start your first design",
      message: "Browse our collection and begin personalising your stationery",
      cta: "Browse Designs",
      href: "/products",
    };
  }

  const approvedNotOrdered = designs.find(
    (d) => d.status === "approved" && !orders.find((o) => o.product?.template?.category === d.product?.template?.category)
  );
  if (approvedNotOrdered) {
    return {
      title: "Ready to order your approved design",
      message: "Place the order to send it to print",
      cta: "View Designs",
      href: "/dashboard/designs",
    };
  }

  return {
    title: "You're all up to date",
    message: "Check your timeline for what's coming up next",
    cta: "View Timeline",
    href: "/dashboard/timeline",
  };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatOrderStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    printing: "At Print",
    completed: "Completed",
    cancelled: "Cancelled",
    payment_complete: "Pending",
    in_production: "At Print",
    shipped: "Dispatched",
    delivered: "Delivered",
  };
  return map[status] || status;
}

function statusVariant(
  status: string
): "default" | "sage" | "blush" | "blue" | "success" | "warning" {
  if (["printing", "in_production"].includes(status)) return "blue";
  if (["completed", "delivered", "shipped"].includes(status)) return "success";
  if (status === "cancelled") return "warning";
  return "default";
}

