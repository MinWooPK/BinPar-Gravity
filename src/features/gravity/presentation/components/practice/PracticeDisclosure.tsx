"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "@/components/icons";

// Muestra un panel desplegable que permite mostrar u ocultar
// contenido adicional de la práctica educativa.
export const PracticeDisclosure = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  // Controla si el panel está abierto o cerrado.
  const [open, setOpen] = useState(false);

  return (
    <details
      className="group min-w-0 rounded-xl border border-slate-600/50 bg-slate-950/30"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary
        aria-expanded={open}
        className="flex min-h-12 scroll-mb-24 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-400/5 focus-visible:outline-2 focus-visible:outline-violet-300 [&::-webkit-details-marker]:hidden"
      >
        {label}
        <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>

      <div className="min-w-0 border-t border-slate-600/40 p-4">{children}</div>
    </details>
  );
};
