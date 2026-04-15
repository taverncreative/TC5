import Link from "next/link";
import { requireProfile } from "@/lib/db/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DesignCard, type DesignCardData } from "@/components/dashboard/design-card";

export const metadata = { title: "My Designs" };

export default async function DesignsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: designsRaw } = await supabase
    .from("saved_designs")
    .select(
      "id, name, status, updated_at, product:products(name, slug, template:templates(thumbnail_url))"
    )
    .eq("customer_id", profile.id)
    .order("updated_at", { ascending: false });

  const designs = (designsRaw || []) as unknown as DesignCardData[];

  const drafts = designs.filter((d) => d.status === "draft");
  const approved = designs.filter((d) => d.status === "approved");
  const locked = designs.filter((d) => d.status === "locked");

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
            My Designs
          </h1>
          <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
            {designs.length === 0
              ? "Your saved wedding stationery will appear here"
              : `${designs.length} ${designs.length === 1 ? "design" : "designs"} saved`}
          </p>
        </div>
        <Link href="/products">
          <Button size="sm">New Design</Button>
        </Link>
      </div>

      {designs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--tc-sage-light)]/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[var(--tc-sage)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--tc-black)]">
              No designs yet
            </p>
            <p className="text-xs text-[var(--tc-gray-500)] mt-1 max-w-sm mx-auto">
              Browse our collection and start personalising your wedding
              stationery — your work is saved automatically
            </p>
            <Link href="/products" className="mt-4 inline-block">
              <Button size="sm">Browse Designs</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {drafts.length > 0 && (
            <DesignSection
              title="Drafts"
              subtitle="Works in progress — continue editing when you're ready"
              designs={drafts}
            />
          )}
          {approved.length > 0 && (
            <DesignSection
              title="Approved"
              subtitle="Ready to order — your proof has been approved"
              designs={approved}
            />
          )}
          {locked.length > 0 && (
            <DesignSection
              title="Sent to Print"
              subtitle="These designs are locked and cannot be edited"
              designs={locked}
            />
          )}
        </>
      )}
    </div>
  );
}

function DesignSection({
  title,
  subtitle,
  designs,
}: {
  title: string;
  subtitle: string;
  designs: DesignCardData[];
}) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[var(--tc-black)]">
          {title}{" "}
          <span className="font-normal text-[var(--tc-gray-400)]">
            ({designs.length})
          </span>
        </h2>
        <p className="text-xs text-[var(--tc-gray-400)] mt-0.5">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {designs.map((design) => (
          <DesignCard key={design.id} design={design} />
        ))}
      </div>
    </div>
  );
}

