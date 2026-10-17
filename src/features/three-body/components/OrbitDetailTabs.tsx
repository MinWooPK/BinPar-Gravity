"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import styles from "./OrbitDetail.module.css";

const tabs = ["explanation", "conditions"] as const;
type DetailTab = (typeof tabs)[number];

export function OrbitDetailTabs({ explanation, conditions }: { explanation: ReactNode; conditions: ReactNode }) {
  const t = useTranslations("ThreeBody.detail");
  const id = useId();
  const [selected, setSelected] = useState<DetailTab>("explanation");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % tabs.length; break;
      case "ArrowLeft": next = (index + tabs.length - 1) % tabs.length; break;
      case "Home": next = 0; break;
      case "End": next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setSelected(tabs[next]);
    tabRefs.current[next]?.focus({ preventScroll: true });
  };

  return (
    <div className={styles.informationTabs}>
      <div role="tablist" aria-label={t("tabsLabel")} className={styles.tabs}>
        {tabs.map((tab, index) => (
          <button
            key={tab}
            ref={(element) => { tabRefs.current[index] = element; }}
            type="button"
            role="tab"
            id={`${id}-tab-${tab}`}
            aria-controls={`${id}-panel-${tab}`}
            aria-selected={selected === tab}
            tabIndex={selected === tab ? 0 : -1}
            className={styles.tab}
            onClick={() => setSelected(tab)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span aria-hidden="true">{index === 0 ? "01" : "02"}</span>
            {t(tab === "explanation" ? "explanationTab" : "conditionsTab")}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab}
          role="tabpanel"
          id={`${id}-panel-${tab}`}
          aria-labelledby={`${id}-tab-${tab}`}
          tabIndex={0}
          hidden={selected !== tab}
          className={styles.tabPanel}
          data-orbit-detail-panel={tab}
        >
          {tab === "explanation" ? explanation : conditions}
        </div>
      ))}
    </div>
  );
}
