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
    <div className="min-w-0 [flex:1]">
      <div role="tablist" aria-label={t("tabsLabel")} className="flex flex-wrap [gap:4px_8px] [padding-bottom:8px] border-b border-solid border-lab-line">
        {tabs.map((tab, index) => (
          <TabButton
            key={tab}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            id={`${id}-tab-${tab}`}
            aria-controls={`${id}-panel-${tab}`}
            selected={selected === tab}
            className="inline-flex [flex:1_1_auto] items-center justify-center [gap:8px] min-w-0 [padding:8px_10px] [border:1px_solid_transparent] [border-radius:8px] [background:transparent] [color:#b6bdd0] [font-size:.875rem] [line-height:1.4] [transition:color_160ms,_background_160ms,_border-color_160ms] [&_>_span]:[color:#b9a8f5] [&_>_span]:[font-size:0.75rem] [&:hover]:[background:#aa97ff12] [&:hover]:[color:#eee7ff] [&[aria-selected=true]]:[border-color:#706091] [&[aria-selected=true]]:[background:#aa97ff20] [&[aria-selected=true]]:[color:#eee7ff] [@media_(prefers-reduced-motion:_reduce)]:[&&]:[transition:none]"
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
          className="lab-three-body-detail-tab-panel min-w-0 [min-height:150px] [padding-top:12px] [border-radius:4px] [&&]:[animation:lab-three-body-detail-reveal_180ms_ease-out] [&[hidden]]:hidden [&_h3]:[margin:0_0_6px] [&_h3]:[font-size:1rem] [&_h3]:font-semibold [&_h3]:[line-height:1.4] [&_p]:[margin:0_0_8px] [&_p]:[color:#c4ccde] [&_p]:[font-size:0.875rem] [&_p]:[line-height:1.5] [&_p:last-child]:[margin-bottom:0] [@media_(prefers-reduced-motion:_reduce)]:[&&]:animate-none"
          data-orbit-detail-panel={tab}
        >
          {tab === "explanation" ? explanation : conditions}
        </div>
      ))}
    </div>
  );
};
