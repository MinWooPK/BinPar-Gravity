import type { SVGProps } from "react";

// Lucide MessageCircle and CircleHelp (0.468.0), ISC/MIT. See lucide-LICENSE.txt.
const attributes = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
export const MessageCircle = (props: SVGProps<SVGSVGElement>) => <svg {...attributes} {...props}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>;
export const CircleHelp = (props: SVGProps<SVGSVGElement>) => <svg {...attributes} {...props}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>;
