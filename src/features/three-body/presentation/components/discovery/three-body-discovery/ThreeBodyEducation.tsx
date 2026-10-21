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
      className="flex flex-col gap-3.5 min-w-0 p-4.5 border border-solid border-lab-line rounded-[14px]
       [background:linear-gradient(145deg,#131724,#0e121d)] text-[#b2bad0] text-[.9375rem] leading-normal wrap-anywhere [@media(max-width:600px)]:p-[16px_12px]"
      aria-labelledby={`${id}-education`}
      data-three-body-education
    >
      <h2
        id={`${id}-education`}
        className="m-0 text-lab-text text-[clamp(1.25rem,2vw,1.5rem)] font-semibold leading-tight tracking-tight"
      >
        {t("title")}
      </h2>
      <div
        role="tablist"
        aria-labelledby={`${id}-education`}
        className="grid grid-cols-4 gap-1.5 [@media(max-width:600px)]:gap-1.25 [@media(max-width:360px)]:grid-cols-2"
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
            className="min-w-0 p-[8px_5px] [border:1px_solid_#30364b] rounded-lg bg-lab-surface text-[#bac2d6] text-[.875rem] 
            font-medium leading-[1.4] wrap-anywhere [transition:color_160ms,background_160ms,border-color_160ms]
             [&:hover]:text-[#f2f2fa] [&:hover]:border-[#aa97ff70] [&:hover]:[background:#1b2032]
              aria-selected:text-[#e4dcff] aria-selected:border-[#aa97ff90] 
              aria-selected:[background:#aa97ff18] focus-visible:[outline:2px_solid_#c0b3ff] 
              focus-visible:outline-offset-[3px] motion-reduce:[&&]:[transition:none]"
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
          className="min-w-0 focus-visible:[outline:2px_solid_#c0b3ff] focus-visible:outline-offset-[3px]
           [[hidden]]:hidden [&:not([hidden])]:flex [&:not([hidden])]:flex-1 [&:not([hidden])]:flex-col [&:not([hidden])]:justify-between 
           [&:not([hidden])]:gap-4.5 [&:not([hidden])]:animate-[lab-three-body-discovery-topic-enter_180ms_ease-out_both] 
           [&_h3]:m-[0_0_10px] [&_h3]:text-[#e4dcff] [&_h3]:text-[1.125rem] 
           [&_h3]:font-semibold [&_h3]:leading-[1.4] [&_h3]:tracking-[-0.015em] [&_h4]:m-[0_0_4px]
            [&_h4]:text-[#e4e8f2] [&_h4]:text-[0.9375rem] [&_h4]:font-semibold [&_h4]:leading-[1.4] 
            [&_p]:m-0 [@media_(max-width:_1023px)]:[&:not([hidden])]:justify-start motion-reduce:[&:not([hidden])]:animate-none"
        >
          <DiscoveryTopicContent topic={topic} />
        </div>
      ))}
    </section>
  );
};
