"use client";

import { useId, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TabButton, useTabs } from "@/components/ui/Tabs";
import { orbitDetailStyles as styles } from "./OrbitDetail.styles";

const tabs = ["explanation", "conditions"] as const;

export const OrbitDetailTabs = ({ explanation, conditions }: { explanation: ReactNode; conditions: ReactNode }) => {
  const t = useTranslations("ThreeBody.detail");
  const id = useId();
  const { selected, setSelected, tabRefs, handleTabKeyDown } = useTabs(tabs, "explanation");

  return (
    <div className={styles.informationTabs}>
      <div role="tablist" aria-label={t("tabsLabel")} className={styles.tabs}>
        {tabs.map((tab, index) => (
          <TabButton
            key={tab}
            ref={(element) => { tabRefs.current[index] = element; }}
            id={`${id}-tab-${tab}`}
            aria-controls={`${id}-panel-${tab}`}
            selected={selected === tab}
            className={styles.tab}
            onClick={() => setSelected(tab)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            <span aria-hidden="true">{index === 0 ? "01" : "02"}</span>
            {t(tab === "explanation" ? "explanationTab" : "conditionsTab")}
          </TabButton>
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
};
