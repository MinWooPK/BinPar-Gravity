import type { SVGProps } from "react";
type Props = SVGProps<SVGSVGElement> & {
  name:
    | "arrow"
    | "play"
    | "pause"
    | "reset"
    | "search"
    | "grid"
    | "list"
    | "chevron"
    | "external"
    | "check";
};
export function Icon({ name, ...props }: Props) {
  const paths: Record<Props["name"], React.ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    play: <path d="m9 5 11 7-11 7Z" />,
    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),
    reset: (
      <>
        <path d="M4 10a8 8 0 1 1 2 8M4 4v6h6" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    list: (
      <>
        <path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    external: (
      <>
        <path d="M14 3h7v7m-11 4L21 3M10 3H3v18h18v-7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
export function OrbitMark() {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="5" fill="currentColor" />
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="10"
        transform="rotate(-35 20 20)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="33" cy="10" r="3" fill="#5ee7d5" />
    </svg>
  );
}
