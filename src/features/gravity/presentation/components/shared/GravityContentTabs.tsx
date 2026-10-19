"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useGravityFormulaInteraction } from "../understanding/GravityFormulaInteraction";
import { useRevealGravityContent } from "./GravitySplitPanels";

type TutorPanel = { active: boolean; onActivate: () => void; embedded: true };

/** Every panel stays mounted; switching tabs only changes visibility and focus. */
export const GravityContentTabs = ({ primary, children, calculator, tutor }: {
  primary: "formula" | "experiment";
  children: ReactNode;
  calculator: ReactNode;
  tutor: (panel: TutorPanel) => ReactNode;
}) => {
  const t = useTranslations("Gravity");
  const tutorText = useTranslations("Tutor");
  const id = useId();
  const [selected, setSelected] = useState<string>(primary);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const { hover, focus } = useGravityFormulaInteraction();
  const reveal = useRevealGravityContent();
  const activateTutor = useCallback(() => {
    reveal?.();
    setSelected("tutor");
  }, [reveal]);
  const tabs = [
    { key: primary, label: t(`experimentViews.${primary}`) },
    { key: "calculator", label: t("calculatorTab") },
    { key: "tutor", label: tutorText("shortLabel") },
  ];
  const select = (key: string) => {
    hover(null);
    focus(null);
    setSelected(key);
  };
  return (
    <section data-gravity-content-tabs={primary}
      className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-lab-line bg-linear-to-br from-[#131724] to-[#0e121d] text-lab-text">
      <div role="tablist" aria-label={t("experimentViews.label")}
        className="m-2.5 grid shrink-0 grid-cols-3 gap-1 rounded-xl border border-violet-300/25 bg-slate-950/30 p-1">
        {tabs.map((tab, index) => (
          <button key={tab.key} ref={element => { buttons.current[index] = element; }}
            type="button" role="tab" id={`${id}-tab-${tab.key}`} data-content-tab={tab.key}
            aria-selected={selected === tab.key} aria-controls={`${id}-panel-${tab.key}`}
            tabIndex={selected === tab.key ? 0 : -1}
            className="min-h-11 min-w-0 rounded-lg border border-transparent px-1 py-2 text-xs font-semibold text-slate-300 transition-colors duration-200 hover:bg-violet-300/10 aria-selected:border-violet-300/60 aria-selected:bg-violet-300/15 aria-selected:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 motion-reduce:transition-none sm:px-2 sm:text-sm"
            onClick={() => select(tab.key)} onKeyDown={event => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 :
                (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
              select(tabs[next].key);
              buttons.current[next]?.focus();
            }}>
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map(tab => (
        <div key={tab.key} role="tabpanel" id={`${id}-panel-${tab.key}`}
          aria-labelledby={`${id}-tab-${tab.key}`} tabIndex={0}
          hidden={selected !== tab.key} inert={selected !== tab.key} aria-hidden={selected !== tab.key}
          className={selected === tab.key ? "flex min-h-0 min-w-0 flex-1 flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-300" : "hidden"}>
          {tab.key === primary ? children : tab.key === "calculator" ? calculator :
            tutor({ active: selected === "tutor", onActivate: activateTutor, embedded: true })}
        </div>
      ))}
    </section>
  );
};
