import { TemplateBuilderForm } from "@/components/admin/template-builder-form";

export const metadata = { title: "New Template" };

export default function NewTemplatePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
        Create Template
      </h1>
      <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
        Define the structure and style of a new stationery design.
      </p>
      <div className="mt-6">
        <TemplateBuilderForm />
      </div>
    </div>
  );
}
