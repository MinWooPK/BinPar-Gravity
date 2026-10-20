import type { SVGProps } from "react";

// Lucide MessageCircle and CircleHelp (0.468.0), ISC/MIT. See lucide-LICENSE.txt.
const attributes = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;
export const MessageCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg {...attributes} {...props}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);
export const CircleHelp = (props: SVGProps<SVGSVGElement>) => (
  <svg {...attributes} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

export const AtomIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...attributes} {...props}>
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="12" rx="9" ry="3.6" />
    <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
  </svg>
);

export const Sparkles = (props: SVGProps<SVGSVGElement>) => (
  <svg {...attributes} {...props}>
    <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
    <path d="M20 2v4M18 4h4" />
  </svg>
);
export const ArrowUp = (props: SVGProps<SVGSVGElement>) => (
  <svg {...attributes} {...props}><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
);
export const Trash2 = (props: SVGProps<SVGSVGElement>) => (
  <svg {...attributes} {...props}>
    <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
  </svg>
);
export const X = (props: SVGProps<SVGSVGElement>) => (
  <svg {...attributes} {...props}><path d="m6 6 12 12M6 18 18 6" /></svg>
);
