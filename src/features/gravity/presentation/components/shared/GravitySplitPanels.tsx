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

// Define los dos paneles disponibles: izquierdo y derecho.
const sides = ["left", "right"] as const;

// Define el tipo de identificador permitido para cada panel.
type Side = (typeof sides)[number];

// Detecta los cambios entre la vista móvil y la de escritorio.
const subscribe = (notify: () => void) => {
  const media = window.matchMedia("(min-width: 1024px)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

// Comprueba si la pantalla tiene un ancho mínimo de 1024 píxeles.
const desktopSnapshot = () => window.matchMedia("(min-width: 1024px)").matches;

// Establece el valor inicial durante el renderizado en el servidor.
const serverSnapshot = () => false;

// Define los estilos de los botones para seleccionar los paneles.
const buttonStyle =
  "border border-slate-600 bg-slate-900 text-violet-200 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200";

// Organiza dos paneles adaptables: simultáneos en escritorio
// y seleccionables mediante botones en móvil y tablet.
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
  // Obtiene las traducciones de los controles de los paneles.
  const t = useTranslations("Gravity.panels");

  // Genera identificadores únicos para los paneles.
  const id = useId();

  // Detecta si la aplicación se está mostrando en escritorio.
  const desktop = useSyncExternalStore(
    subscribe,
    desktopSnapshot,
    serverSnapshot,
  );

  // Guarda el panel seleccionado en móvil y tablet.
  const [selected, setSelected] = useState<Side>("left");

  // Almacena las referencias del contenido de ambos paneles.
  const contents = useRef<Partial<Record<Side, HTMLDivElement>>>({});

  // Almacena las referencias de los botones de navegación móvil.
  const mobileButtons = useRef<Partial<Record<Side, HTMLButtonElement>>>({});

  // Mantiene el foco accesible al cambiar de panel o de tamaño de pantalla.
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
      {/* Selector exclusivo para móvil y tablet */}
      <div
        role="group"
        aria-label={t("choose")}
        className="sticky top-[var(--site-header-height,0px)] z-10 mb-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-950/95 p-1 lg:hidden"
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

      {/* Distribuye los paneles según el tamaño de pantalla. */}
      <div
        className="[&]:[display:grid] [&]:[grid-template-columns:minmax(0,_1fr)] [&]:[min-width:0] [@media_(min-width:_1024px)]:[&]:[flex:1] [@media_(min-width:_1024px)]:[&]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] [@media_(min-width:_1024px)]:[&]:[gap:clamp(20px,_2.5vw,_32px)] [@media_(min-width:_1024px)]:[&]:[align-items:stretch]"
        data-selected={selected}
        data-gravity-stage-layout
      >
        {sides.map((side) => {
          // Determina si el panel debe estar visible.
          const visible = desktop || selected === side;

          return (
            <div
              key={side}
              className="[&]:[position:relative] [&]:[min-width:0] [@media_(min-width:_1024px)]:[&]:[display:flex] [@media_(min-width:_1024px)]:[&]:[flex-direction:column] [@media_(max-width:_1023px)]:[&[data-open=false]]:[display:none] [@media_(max-width:_1023px)]:[&[data-open=true]]:[animation:lab-gravity-split-panel-enter_220ms_cubic-bezier(0.4,_0,_0.2,_1)] [@media_(prefers-reduced-motion:_reduce)]:[&[data-open=true]]:[animation:none]"
              data-side={side}
              data-open={visible}
            >
              <div className="[&]:[min-width:0] [&]:[border-radius:14px] [@media_(min-width:_1024px)]:[&]:[display:flex] [@media_(min-width:_1024px)]:[&]:[flex-direction:column] [@media_(min-width:_1024px)]:[&]:[flex:1] [@media_(min-width:_1024px)]:[&]:[overflow:clip]">
                <div
                  id={`${id}-${side}`}
                  ref={(element) => {
                    contents.current[side] = element ?? undefined;
                  }}
                  className="[&]:[display:flex] [&]:[flex-direction:column] [&]:[min-width:0] [&&_>_*]:[flex:1_0_auto] [&&_>_*]:[min-width:0] [@media_(min-width:_1024px)]:[&]:[flex:1_0_auto] [@media_(min-width:_1024px)]:[&]:[min-width:0] [@media_(max-width:_1023px)]:[&&_>_*]:[flex:none]"
                  tabIndex={-1}
                  inert={!visible}
                  aria-hidden={!visible}
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
