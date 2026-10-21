import type { ReactNode } from "react";

// Resalta los conceptos principales de los textos traducidos.
export const Highlight = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-[#d3c5ff]">{children}</strong>
);
