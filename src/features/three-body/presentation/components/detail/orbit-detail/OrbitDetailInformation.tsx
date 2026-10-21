import { Icon } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import type { OrbitDefinition } from "../../../../types/orbit.types";

import { OrbitDetailTabs } from "../OrbitDetailTabs";
import { OrbitDetailHeader } from "./OrbitDetailHeader";
import { OrbitInitialConditions } from "./OrbitInitialConditions";

// Reúne la ficha científica, sus pestañas y las referencias de la órbita.
export const OrbitDetailInformation = async ({
  orbit,
  index,
  total,
  originalPeriod,
}: {
  orbit: OrbitDefinition;
  index: number;
  total: number;
  originalPeriod: number;
}) => {
  const t = await getTranslations("ThreeBody");

  return (
    <article
      className="flex flex-col [gap:12px] min-w-0 [padding:16px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [@media(max-width:374px)]:[padding:12px]"
      aria-labelledby="orbit-solution-title"
      data-orbit-detail-information
    >
      <OrbitDetailHeader orbit={orbit} index={index} total={total} />
      <OrbitDetailTabs
        explanation={
          <>
            <h3>{t("detail.explanationTitle")}</h3>
            <p lang="es">{orbit.insight}</p>
            <p className="[.lab-three-body-detail-tab-panel_&]:[color:#abb7cd] [.lab-three-body-detail-tab-panel_&]:[font-size:0.8125rem]">
              {t("detail.idealBodies")}
            </p>
          </>
        }
        conditions={
          <OrbitInitialConditions
            orbit={orbit}
            index={index}
            originalPeriod={originalPeriod}
          />
        }
      />
      <h3 id="orbit-physical-model-title">{t("detail.physicalModel")}</h3>
      <ul className="flex flex-wrap [gap:6px] [margin:0_0_6px] p-0 [list-style:none] [&_li]:[padding:5px_8px] [&_li]:[border:1px_solid_#7965af] [&_li]:[border-radius:6px] [&_li]:[background:#aa97ff18] [&_li]:[color:#e4dcff] [&_li]:text-center [&_strong]:[font-size:0.75rem] [&_strong]:font-bold [&_strong]:[line-height:1.5] [&_strong]:[letter-spacing:0.025em] [&_li:nth-child(2)]:[border-color:#48998e] [&_li:nth-child(2)]:[background:#5ee7d515] [&_li:nth-child(2)]:[color:#a7f3e5]">
        {(["equalMasses", "constant", "normalizedUnits"] as const).map(
          (concept) => (
            <li key={concept}>
              <strong>{t(`galleryScience.${concept}`)}</strong>
            </li>
          ),
        )}
      </ul>
      <section
        className="min-w-0 [padding-top:10px] border-t border-solid border-lab-line [&_h3]:[margin:0_0_6px] [&_h3]:[color:#e3e6f2] [&_h3]:[font-size:0.875rem] [&_h3]:font-semibold [&_h3]:[line-height:1.4] [&_p]:m-0 [&_p]:[color:#b6bdd0] [&_p]:[font-size:0.8125rem] [&_p]:[line-height:1.5]"
        aria-labelledby="orbit-source-title"
        data-orbit-detail-source
      >
        <h3 id="orbit-source-title">{t("detail.sourceTitle")}</h3>
        <p lang="es">{orbit.sourceLabel}</p>
        <a
          href={orbit.source}
          target="_blank"
          rel="noopener noreferrer"
          className="[&&]:inline-flex [&&]:items-center [&&]:[gap:8px] [&&]:[min-height:44px] [&&]:[color:#d0c1ff] [&&]:[font-size:0.8125rem] [&&]:[line-height:1.5] [&&]:underline [&&]:[text-underline-offset:4px] [&&]:[transition:color_160ms] [&:hover]:[color:#eee7ff] [@media_(prefers-reduced-motion:_reduce)]:[&&]:[transition:none] source-link"
        >
          {t("detail.sourceLink")} <Icon name="external" />
          <span className="sr-only">{t("detail.sourceNewTab")}</span>
        </a>
      </section>
    </article>
  );
};
