import type { SVGProps } from "react";

// The language menu uses the original, narrower 8-unit chevron.
type ChevronDownProps = SVGProps<SVGSVGElement> & { compact?: boolean };

export const ChevronDown = ({ compact = false, ...props }: ChevronDownProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}
  >
    <path
      d={compact ? "m6 8 4 4 4-4" : "m5 7 5 5 5-5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
