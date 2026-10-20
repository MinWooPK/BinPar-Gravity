import type { SVGProps } from "react";

// Preserve the slightly shorter arc used by the Gravity reset control.
type ResetProps = SVGProps<SVGSVGElement> & { variant?: "default" | "gravity" };

export const Reset = ({ variant = "default", ...props }: ResetProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path
      d={variant === "gravity"
        ? "M4 10a8 8 0 1 1 1 7M4 4v6h6"
        : "M4 10a8 8 0 1 1 2 8M4 4v6h6"}
    />
  </svg>
);
