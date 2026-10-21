"use client";

import { useId, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TabButton, useTabs } from "@/components/ui/Tabs";

const tabs = ["explanation", "conditions"] as const;

export const OrbitDetailTabs = ({
  explanation,
  conditions,
}: {
  explanation: ReactNode;
  conditions: ReactNode;
}) => {
  const t = useTranslations("ThreeBody.detail");
  const id = useId();

  const { selected, setSelected, tabRefs, handleTabKeyDown } = useTabs(
    tabs,
    "explanation",
  );

  return (
    <div className="min-w-0 flex-1">
      <div
        role="tablist"
        aria-label={t("tabsLabel")}
        className="flex flex-wrap gap-x-2 gap-y-1 border-b border-lab-line pb-2"
      >
        {tabs.map((tab, index) => (
          <TabButton
            key={tab}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            id={`${id}-tab-${tab}`}
            aria-controls={`${id}-panel-${tab}`}
            selected={selected === tab}
            className="inline-flex min-w-0 flex-[1_1_auto] items-center justify-center gap-2 rounded-lg border border-transparent 
            bg-transparent px-2.5 py-2 text-sm leading-[1.4] text-[#b6bdd0] transition-[color,background,border-color] 
            duration-160 hover:bg-[#aa97ff12] hover:text-[#eee7ff] aria-selected:border-[#706091]
             aria-selected:bg-[#aa97ff20] aria-selected:text-[#eee7ff] motion-reduce:transition-none"
            onClick={() => setSelected(tab)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            <span aria-hidden="true" className="text-xs text-[#b9a8f5]">
              {index === 0 ? "01" : "02"}
            </span>

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
          className="lab-three-body-detail-tab-panel min-h-37.5 min-w-0 rounded-sm pt-3 
          animate-[lab-three-body-detail-reveal_180ms_ease-out] [[hidden]]:hidden 
          [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:leading-[1.4] [&_h3]:font-semibold [&_p]:mb-2 [&_p]:text-sm 
          [&_p]:leading-normal [&_p]:text-[#c4ccde] [&_p:last-child]:mb-0 motion-reduce:animate-none"
          data-orbit-detail-panel={tab}
        >
          {tab === "explanation" ? explanation : conditions}
        </div>
      ))}
    </div>
  );
};
