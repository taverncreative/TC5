import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTemplates } from "@/lib/db/templates";

export const metadata = { title: "Templates" };
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
            Templates
          </h1>
          <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
            Design templates that define the structure of each stationery item.
          </p>
        </div>
        <Link href="/admin/templates/new">
          <Button>New Template</Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {templates.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-[var(--tc-gray-400)]">No templates yet.</p>
              <Link href="/admin/templates/new" className="mt-2 inline-block text-sm font-medium text-[var(--tc-sage)] hover:underline">
                Create your first template
              </Link>
            </div>
          </Card>
        )}
        {templates.map((template) => (
          <Link key={template.id} href={`/admin/templates/${template.id}`}>
            <Card className="hover:border-[var(--tc-sage)] transition-colors cursor-pointer mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[var(--tc-black)]">
                    {template.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--tc-gray-500)]">
                    {template.sections?.length || 0} sections &middot; {template.category} &middot; {template.dimensions.width_mm}x{template.dimensions.height_mm}mm
                  </p>
                </div>
                <Badge variant={template.status === "active" ? "success" : template.status === "draft" ? "default" : "warning"}>
                  {template.status}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
