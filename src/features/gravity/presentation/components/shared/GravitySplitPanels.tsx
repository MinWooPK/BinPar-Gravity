"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";

// Paneles disponibles.
const sides = ["left", "right"] as const;
type Side = (typeof sides)[number];

// Detecta los cambios de tamaño de pantalla.
const subscribe = (notify: () => void) => {
  const media = window.matchMedia("(min-width: 1024px)");

  media.addEventListener("change", notify);

  return () => media.removeEventListener("change", notify);
};

const desktopSnapshot = () => window.matchMedia("(min-width: 1024px)").matches;

const serverSnapshot = () => false;

// Estilos de los botones.
const buttonStyle =
  "border border-slate-600 bg-slate-900 text-violet-200 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200";

// Muestra dos paneles adaptados a móvil y escritorio.
export const GravitySplitPanels = ({
  left,
  right,
  leftLabel,
  rightLabel,
}: {
  left: ReactNode;
  right: ReactNode;
  leftLabel: string;
  rightLabel: string;
}) => {
  const t = useTranslations("Gravity.panels");
  const id = useId();

  const desktop = useSyncExternalStore(
    subscribe,
    desktopSnapshot,
    serverSnapshot,
  );

  const [selected, setSelected] = useState<Side>("left");

  const contents = useRef<Partial<Record<Side, HTMLDivElement>>>({});
  const mobileButtons = useRef<Partial<Record<Side, HTMLButtonElement>>>({});

  // Conserva el foco al cambiar de panel o pantalla.
  useLayoutEffect(() => {
    const active = document.activeElement;

    if (!active) return;

    if (desktop) {
      if (sides.some((side) => active === mobileButtons.current[side])) {
        contents.current[selected]?.focus({ preventScroll: true });
      }
    } else {
      const hidden = selected === "left" ? "right" : "left";

      if (contents.current[hidden]?.contains(active)) {
        mobileButtons.current[selected]?.focus({
          preventScroll: true,
        });
      }
    }
  }, [desktop, selected]);

  return (
    <div className="flex min-w-0 flex-1 flex-col" data-gravity-split-panels>
      {/* Selector para móvil y tablet. */}
      <div
        role="group"
        aria-label={t("choose")}
        className="sticky top-(--site-header-height,0px) z-10 mb-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-950/95 p-1 lg:hidden"
      >
        {sides.map((side) => (
          <button
            key={side}
            ref={(element) => {
              mobileButtons.current[side] = element ?? undefined;
            }}
            type="button"
            aria-label={t("show", {
              panel: side === "left" ? leftLabel : rightLabel,
            })}
            aria-expanded={selected === side}
            aria-controls={`${id}-${side}`}
            data-panel-select={side}
            onClick={() => setSelected(side)}
            className={`min-h-11 min-w-0 rounded-lg px-2 py-2 text-sm font-semibold ${buttonStyle} ${
              selected === side
                ? "border-violet-300 bg-violet-300/15 text-cyan-100"
                : ""
            }`}
          >
            {side === "left" ? leftLabel : rightLabel}
          </button>
        ))}
      </div>

      {/* Distribución de los paneles. */}
      <div
        className="grid min-w-0 grid-cols-1 lg:flex-1 lg:grid-cols-2 lg:items-stretch lg:gap-[clamp(20px,2.5vw,32px)]"
        data-selected={selected}
        data-gravity-stage-layout
      >
        {sides.map((side) => {
          // Decide si el panel está visible.
          const visible = desktop || selected === side;

          return (
            <div
              key={side}
              data-side={side}
              data-open={visible}
              className="relative min-w-0 lg:flex lg:flex-col max-lg:data-[open=false]:hidden 
              max-lg:data-[open=true]:animate-[lab-gravity-split-panel-enter_220ms_cubic-bezier(0.4,0,0.2,1)] motion-reduce:data-[open=true]:animate-none"
            >
              <div className="min-w-0 rounded-[14px] lg:flex lg:flex-1 lg:flex-col lg:overflow-clip">
                <div
                  id={`${id}-${side}`}
                  ref={(element) => {
                    contents.current[side] = element ?? undefined;
                  }}
                  tabIndex={-1}
                  inert={!visible}
                  aria-hidden={!visible}
                  className="flex min-w-0 flex-col lg:flex-[1_0_auto] *:min-w-0 *:flex-[1_0_auto] max-lg:*:flex-none"
                >
                  {side === "left" ? left : right}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
