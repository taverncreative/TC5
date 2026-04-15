import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  /**
   * When true, swap the 1px border for a soft paper shadow with a subtle
   * hover lift. Use on public shop surfaces. Default bordered look stays
   * on dashboard / admin for clarity.
   */
  elevated?: boolean;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  padding = "md",
  elevated = false,
  className = "",
  children,
  ...props
}: CardProps) {
  const surface = elevated
    ? "bg-white shadow-[var(--tc-shadow-sm)] hover:shadow-[var(--tc-shadow-md)] transition-shadow duration-300 ease-out"
    : "bg-white border border-[var(--tc-gray-200)]";

  return (
    <div
      className={`rounded-lg ${surface} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
