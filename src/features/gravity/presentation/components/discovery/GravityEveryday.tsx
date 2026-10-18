"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/index";
import css from "./GravityEveryday.module.css";

const styles = {
  "section": "min-w-0 [padding-top:14px] [border-top:1px_solid_#30364b]",
  "heading": `${css["heading"]} [margin-bottom:12px]`,
  "eyebrow": "[margin:0_0_4px] [color:#b8b0d6] [font-size:.75rem] font-semibold [line-height:1.5] [letter-spacing:.1em] uppercase",
  "description": `${css["description"]} [margin:6px_0_0] [color:#b2bad0] [font-size:1rem] [line-height:1.5]`,
  "exampleTabs": "grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:6px] [margin-bottom:10px]",
  "exampleTab": `${css["exampleTab"]} min-w-0 [min-height:44px] [padding:8px] [border:1px_solid_#30364b] [border-radius:8px] bg-lab-surface [color:#bac2d6] [font-size:1rem] font-medium [line-height:1.4] [overflow-wrap:anywhere] cursor-pointer [transition:color_160ms,_background_160ms,_border-color_160ms] [@media(max-width:600px)]:[padding-inline:6px]`,
  "example": `${css["example"]} grid [grid-template-columns:40px_minmax(0,_1fr)] [align-items:start] [gap:12px] min-w-0 [min-height:108px] [padding:14px] [border:1px_solid_#30364b] [border-radius:10px] bg-lab-surface [@media(max-width:600px)]:min-h-0 [@media(max-width:360px)]:[gap:10px] [@media(max-width:360px)]:[padding:12px]`,
  "illustration": `${css["illustration"]} grid [place-items:center] [width:40px] [height:40px] [border-radius:9px] [color:#b9a8ff] [background:#aa97ff10]`,
} as const;

const examples = ["fall", "moon", "objects"] as const;

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

export const GravityEveryday = () => {
  const t = useTranslations("Gravity");
  const id = useId();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
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
    <section aria-labelledby={`${id}-heading`} className={styles.section}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{t("everydayEyebrow")}</p>
        <h3 id={`${id}-heading`}>{t("everydayTitle")}</h3>
        <p className={styles.description}>{t("everydayDescription")}</p>
      </div>
      <div role="tablist" aria-labelledby={`${id}-heading`} className={styles.exampleTabs}>
        {examples.map((example, index) => (
          <button
            key={example}
            ref={(element) => { buttonRefs.current[index] = element; }}
            type="button"
            role="tab"
            id={`${id}-tab-${example}`}
            aria-controls={`${id}-panel-${example}`}
            aria-selected={selectedIndex === index}
            tabIndex={selectedIndex === index ? 0 : -1}
            className={styles.exampleTab}
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
          className={styles.example}
          data-tone={example}
        >
          <span className={styles.illustration} aria-hidden="true">
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
