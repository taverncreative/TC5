type BadgeVariant = "default" | "sage" | "blush" | "blue" | "success" | "warning";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--tc-gray-100)] text-[var(--tc-gray-700)]",
  sage: "bg-[var(--tc-sage-light)] text-[var(--tc-gray-800)]",
  blush: "bg-[var(--tc-blush-light)] text-[var(--tc-gray-800)]",
  blue: "bg-blue-50 text-blue-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
