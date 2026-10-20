import type { SVGProps } from "react";

export const Search = (props: SVGProps<SVGSVGElement>) => (
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
    <circle cx="10" cy="10" r="6" />
    <path d="m15 15 5 5" />
  </svg>
);
