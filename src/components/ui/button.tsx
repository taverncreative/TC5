import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--tc-black)] text-white hover:bg-[var(--tc-gray-800)] active:bg-[var(--tc-gray-700)] shadow-[var(--tc-shadow-sm)] hover:shadow-[var(--tc-shadow-md)] transition-all duration-300 ease-out",
  secondary:
    "bg-[var(--tc-sage)] text-white hover:bg-[var(--tc-sage)]/90 active:bg-[var(--tc-sage)]/80 transition-colors",
  outline:
    "border border-[var(--tc-gray-300)] text-[var(--tc-black)] hover:border-[var(--tc-black)] hover:bg-white active:bg-[var(--tc-gray-50)] transition-colors",
  ghost:
    "text-[var(--tc-gray-600)] hover:bg-[var(--tc-gray-100)] active:bg-[var(--tc-gray-200)] transition-colors",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tc-black)] disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
