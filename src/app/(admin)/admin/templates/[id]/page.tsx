import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/db/templates";
import { TemplateBuilderForm } from "@/components/admin/template-builder-form";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const template = await getTemplate(id);
  return { title: template ? `Edit ${template.name}` : "Template Not Found" };
}

export default async function EditTemplatePage({ params }: Props) {
  const { id } = await params;
  const template = await getTemplate(id);

  if (!template) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
        Edit Template
      </h1>
      <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
        {template.name}
      </p>
      <div className="mt-6">
        <TemplateBuilderForm initialData={template} />
      </div>
    </div>
  );
}
