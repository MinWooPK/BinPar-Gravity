"use client";

import { useTranslations } from "next-intl";
import { TabButton, useTabs } from "@/components/ui/Tabs";
import { DiscoveryTopicContent } from "./DiscoveryTopicContent";

// Define los temas y el orden de las pestañas educativas.
const topics = ["what", "how", "difficulty", "history"] as const;

// Gestiona las pestañas con el mismo teclado, foco y visibilidad que el original.
export const ThreeBodyEducation = ({ id }: { id: string }) => {
  const t = useTranslations("ThreeBody.discovery");
  const { selected, setSelected, tabRefs, handleTabKeyDown } = useTabs(
    topics,
    "what",
  );

  return (
    <section
      className="flex flex-col [gap:14px] min-w-0 [padding:18px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [color:#b2bad0] [font-size:.9375rem] [line-height:1.5] [overflow-wrap:anywhere] [@media(max-width:600px)]:[padding:16px_12px]"
      aria-labelledby={`${id}-education`}
      data-three-body-education
    >
      <h2
        id={`${id}-education`}
        className="m-0 text-lab-text [font-size:clamp(1.25rem,_2vw,_1.5rem)] font-semibold [line-height:1.25] [letter-spacing:-.025em]"
      >
        {t("title")}
      </h2>
      <div
        role="tablist"
        aria-labelledby={`${id}-education`}
        className="grid [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:6px] [@media(max-width:600px)]:[gap:5px] [@media(max-width:360px)]:[grid-template-columns:repeat(2,_minmax(0,_1fr))]"
      >
        {topics.map((topic, index) => (
          <TabButton
            key={topic}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            id={`${id}-tab-${topic}`}
            aria-controls={`${id}-panel-${topic}`}
            selected={selected === topic}
            className="min-w-0 [padding:8px_5px] [border:1px_solid_#30364b] [border-radius:8px] bg-lab-surface [color:#bac2d6] [font-size:.875rem] font-medium [line-height:1.4] [overflow-wrap:anywhere] [transition:color_160ms,_background_160ms,_border-color_160ms] [&:hover]:[color:#f2f2fa] [&:hover]:[border-color:#aa97ff70] [&:hover]:[background:#1b2032] [&[aria-selected=true]]:[color:#e4dcff] [&[aria-selected=true]]:[border-color:#aa97ff90] [&[aria-selected=true]]:[background:#aa97ff18] [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&&]:[transition:none]"
            onClick={() => setSelected(topic)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {t(`tabs.${topic}`)}
          </TabButton>
        ))}
      </div>
      {topics.map((topic) => (
        <div
          key={topic}
          role="tabpanel"
          id={`${id}-panel-${topic}`}
          aria-labelledby={`${id}-tab-${topic}`}
          tabIndex={0}
          hidden={selected !== topic}
          className="min-w-0 [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px] [&[hidden]]:hidden [&:not([hidden])]:flex [&:not([hidden])]:[flex:1] [&:not([hidden])]:flex-col [&:not([hidden])]:justify-between [&:not([hidden])]:[gap:18px] [&:not([hidden])]:[animation:lab-three-body-discovery-topic-enter_180ms_ease-out_both] [&_h3]:[margin:0_0_10px] [&_h3]:[color:#e4dcff] [&_h3]:[font-size:1.125rem] [&_h3]:font-semibold [&_h3]:[line-height:1.4] [&_h3]:[letter-spacing:-0.015em] [&_h4]:[margin:0_0_4px] [&_h4]:[color:#e4e8f2] [&_h4]:[font-size:0.9375rem] [&_h4]:font-semibold [&_h4]:[line-height:1.4] [&_p]:m-0 [@media_(max-width:_1023px)]:[&:not([hidden])]:justify-start [@media_(prefers-reduced-motion:_reduce)]:[&:not([hidden])]:animate-none"
        >
          <DiscoveryTopicContent topic={topic} />
        </div>
      ))}
    </section>
  );
};
