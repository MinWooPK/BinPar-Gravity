import type { SVGProps } from "react";

export const Check = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    {...props}
  >
    <path
      d="m4 10 4 4 8-8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
