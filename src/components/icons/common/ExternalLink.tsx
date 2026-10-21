import type { SVGProps } from "react";

export const ExternalLink = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M14 3h7v7m-11 4L21 3M10 3H3v18h18v-7" />
  </svg>
);
