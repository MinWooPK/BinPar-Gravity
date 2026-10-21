import type { SVGProps } from "react";

export const Lightbulb = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M9 18v-2a6 6 0 1 1 6 0v2M9 18h6M10 21h4" />
  </svg>
);
