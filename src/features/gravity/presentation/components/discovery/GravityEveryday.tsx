"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons";

// Define los tres ejemplos de gravedad disponibles.
const examples = ["fall", "moon", "objects"] as const;

// Define las ilustraciones SVG de la caída y la atracción entre objetos.
const illustrations = {
  fall: (
    <>
      <circle cx="24" cy="9" r="4" />
      <path d="M24 20v17m-6-6 6 6 6-6M10 43h28" />
    </>
  ),
  objects: (
    <>
      <circle cx="8" cy="24" r="5" />
      <circle cx="40" cy="24" r="5" />
      <path d="M16 24h5m-3-3 3 3-3 3m14-3h-5m3-3-3 3 3 3" />
    </>
  ),
};

// Muestra ejemplos cotidianos de gravedad mediante pestañas interactivas.
export const GravityEveryday = () => {
  // Obtiene las traducciones de la sección.
  const t = useTranslations("Gravity");

  // Genera identificadores únicos para relacionar las pestañas y sus paneles.
  const id = useId();

  // Guarda el índice del ejemplo seleccionado.
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Almacena las referencias de los botones para gestionar el foco.
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Gestiona la navegación entre ejemplos mediante el teclado.
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    // Determina el índice de la siguiente pestaña.
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % examples.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + examples.length) % examples.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = examples.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setSelectedIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus({ preventScroll: true });
  };

  return (
    <section aria-labelledby={`${id}-heading`} className="min-w-0 [padding-top:14px] [border-top:1px_solid_#30364b]">
      <div className="[margin-bottom:12px] [&_h3]:[margin:0] [&_h3]:[color:#f2f2fa] [&_h3]:[font-size:1rem] [&_h3]:[font-weight:600] [&_h3]:[line-height:1.4] [&_h3]:[overflow-wrap:anywhere]">
        <p className="[margin:0_0_4px] [color:#b8b0d6] [font-size:.75rem] font-semibold [line-height:1.5] [letter-spacing:.1em] uppercase">{t("everydayEyebrow")}</p>
        <h3 id={`${id}-heading`}>{t("everydayTitle")}</h3>
        <p className="[margin:6px_0_0] [color:#b2bad0] [font-size:1rem] [line-height:1.5] [@media_(max-width:_600px)]:[&]:[font-size:1rem]">{t("everydayDescription")}</p>
      </div>

      <div
        role="tablist"
        aria-labelledby={`${id}-heading`}
        className="grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:6px] [margin-bottom:10px]"
      >
        {examples.map((example, index) => (
          <button
            key={example}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${example}`}
            aria-controls={`${id}-panel-${example}`}
            aria-selected={selectedIndex === index}
            tabIndex={selectedIndex === index ? 0 : -1}
            className="min-w-0 [min-height:44px] [padding:8px] [border:1px_solid_#30364b] [border-radius:8px] bg-lab-surface [color:#bac2d6] [font-size:1rem] font-medium [line-height:1.4] [overflow-wrap:anywhere] cursor-pointer [transition:color_160ms,_background_160ms,_border-color_160ms] [@media(max-width:600px)]:[padding-inline:6px] [&:hover]:[color:#f2f2fa] [&:hover]:[border-color:#aa97ff70] [&:hover]:[background:#1b2032] [&[aria-selected=true]]:[color:#e4dcff] [&[aria-selected=true]]:[border-color:#aa97ff90] [&[aria-selected=true]]:[background:#aa97ff18] [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
            onClick={() => setSelectedIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {t(`everyday_${example}_title`)}
          </button>
        ))}
      </div>

      {examples.map((example, index) => (
        <div
          key={example}
          id={`${id}-panel-${example}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${example}`}
          tabIndex={0}
          hidden={selectedIndex !== index}
          className="grid [grid-template-columns:40px_minmax(0,_1fr)] [align-items:start] [gap:12px] min-w-0 [min-height:108px] [padding:14px] [border:1px_solid_#30364b] [border-radius:10px] bg-lab-surface [@media(max-width:600px)]:min-h-0 [@media(max-width:360px)]:[gap:10px] [@media(max-width:360px)]:[padding:12px] [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px] [&[hidden]]:[display:none] [&:not([hidden])]:[animation:lab-gravity-example-enter_180ms_ease-out_both] [&_>_div]:[min-width:0] [&_h4]:[margin:0_0_5px] [&_h4]:[color:#e9e7f4] [&_h4]:[font-size:1rem] [&_h4]:[font-weight:600] [&_h4]:[line-height:1.4] [&_h4]:[overflow-wrap:anywhere] [&_p]:[margin:0] [&_p]:[color:#b2bad0] [&_p]:[font-size:1rem] [&_p]:[line-height:1.5] [&_p]:[overflow-wrap:anywhere] [&[data-tone=moon]_.lab-gravity-everyday-illustration]:[color:#5ee7d5] [&[data-tone=moon]_.lab-gravity-everyday-illustration]:[background:#5ee7d510] [&[data-tone=objects]_.lab-gravity-everyday-illustration]:[color:#f7bd79] [&[data-tone=objects]_.lab-gravity-everyday-illustration]:[background:#f7bd7910] [@media_(max-width:_600px)]:[&_p]:[font-size:1rem] [@media_(prefers-reduced-motion:_reduce)]:[&:not([hidden])]:[animation:none]"
          data-tone={example}
        >
          <span className="lab-gravity-everyday-illustration grid [place-items:center] [width:40px] [height:40px] [border-radius:9px] [color:#b9a8ff] [background:#aa97ff10] [&_svg]:[display:block] [&_svg]:[width:30px] [&_svg]:[height:30px]" aria-hidden="true">
            {example === "moon" ? (
              <Icon name="orbit" />
            ) : (
              <svg
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                {illustrations[example]}
              </svg>
            )}
          </span>
          <div>
            <h4>{t(`everyday_${example}_title`)}</h4>
            <p>{t(`everyday_${example}_description`)}</p>
          </div>
        </div>
      ))}
    </section>
  );
};
