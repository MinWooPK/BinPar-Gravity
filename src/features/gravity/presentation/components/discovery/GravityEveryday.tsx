"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";

import { Icon } from "@/components/icons";

// Ejemplos cotidianos de gravedad.
const examples = ["fall", "moon", "objects"] as const;

// Dibujos de los ejemplos.
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

// Colores de las ilustraciones.
const illustrationStyles = {
  fall: "text-[#b9a8ff] bg-[#aa97ff10]",
  moon: "text-[#5ee7d5] bg-[#5ee7d510]",
  objects: "text-[#f7bd79] bg-[#f7bd7910]",
};

// Muestra ejemplos cotidianos de gravedad.
export const GravityEveryday = () => {
  const t = useTranslations("Gravity");
  const id = useId();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Permite cambiar de pestaña con el teclado.
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
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
    <section
      aria-labelledby={`${id}-heading`}
      className="border-t border-[#30364b] pt-3.5"
    >
      {/* Título y descripción. */}
      <div className="mb-3">
        <p className="mb-1 text-xs leading-normal font-semibold tracking-widest text-[#b8b0d6] uppercase">
          {t("everydayEyebrow")}
        </p>

        <h3
          id={`${id}-heading`}
          className="text-base leading-[1.4] font-semibold text-[#f2f2fa] wrap-anywhere"
        >
          {t("everydayTitle")}
        </h3>

        <p className="mt-1.5 text-base leading-normal text-[#b2bad0]">
          {t("everydayDescription")}
        </p>
      </div>

      {/* Pestañas de los ejemplos. */}
      <div
        role="tablist"
        aria-labelledby={`${id}-heading`}
        className="mb-2.5 grid grid-cols-3 gap-1.5"
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
            className="min-h-11 min-w-0 cursor-pointer rounded-lg border border-[#30364b] bg-lab-surface
             p-2 text-base leading-[1.4] font-medium text-[#bac2d6] wrap-anywhere transition-colors 
             duration-160 hover:border-[#aa97ff70] hover:bg-[#1b2032] hover:text-[#f2f2fa]
              aria-selected:border-[#aa97ff90] aria-selected:bg-[#aa97ff18] aria-selected:text-[#e4dcff] 
              focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c0b3ff] 
              max-[600px]:px-1.5 motion-reduce:transition-none"
            onClick={() => setSelectedIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {t(`everyday_${example}_title`)}
          </button>
        ))}
      </div>

      {/* Contenido del ejemplo seleccionado. */}
      {examples.map((example, index) => (
        <div
          key={example}
          id={`${id}-panel-${example}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${example}`}
          tabIndex={0}
          hidden={selectedIndex !== index}
          data-tone={example}
          className={`min-h-27 min-w-0 grid-cols-[40px_minmax(0,1fr)] items-start gap-3 rounded-[10px] border border-[#30364b] 
            bg-lab-surface p-3.5 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c0b3ff] 
            max-[600px]:min-h-0 max-[360px]:gap-2.5 max-[360px]:p-3 ${
            selectedIndex === index
              ? "grid animate-[lab-gravity-example-enter_180ms_ease-out_both] motion-reduce:animate-none"
              : "hidden"
          }`}
        >
          {/* Ilustración. */}
          <span
            className={`grid size-10 place-items-center rounded-[9px] [&_svg]:block [&_svg]:size-7.5 ${illustrationStyles[example]}`}
            aria-hidden="true"
          >
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

          {/* Explicación del ejemplo. */}
          <div className="min-w-0">
            <h4 className="mb-1.25 text-base leading-[1.4] font-semibold text-[#e9e7f4] wrap-anywhere">
              {t(`everyday_${example}_title`)}
            </h4>

            <p className="text-base leading-normal text-[#b2bad0] wrap-anywhere">
              {t(`everyday_${example}_description`)}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
};
