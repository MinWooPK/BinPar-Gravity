import type { SVGProps } from "react";

export const List = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1" />
  </svg>
);
