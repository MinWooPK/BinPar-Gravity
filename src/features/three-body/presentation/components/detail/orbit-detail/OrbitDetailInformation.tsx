import { Icon } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import type { OrbitDefinition } from "../../../../types/orbit.types";

import { OrbitDetailTabs } from "../OrbitDetailTabs";
import { OrbitDetailHeader } from "./OrbitDetailHeader";
import { OrbitInitialConditions } from "./OrbitInitialConditions";

// Muestra la información científica de la órbita.
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
      className="flex min-w-0 flex-col gap-3 rounded-[14px] border border-lab-line bg-[linear-gradient(145deg,#131724,#0e121d)] p-4 max-[374px]:p-3"
      aria-labelledby="orbit-solution-title"
      data-orbit-detail-information
    >
      <OrbitDetailHeader orbit={orbit} index={index} total={total} />

      <OrbitDetailTabs
        explanation={
          <>
            <h3>{t("detail.explanationTitle")}</h3>

            <p lang="es">{orbit.insight}</p>

            <p className="in-[.lab-three-body-detail-tab-panel]:text-[0.8125rem] in-[.lab-three-body-detail-tab-panel]:text-[#abb7cd]">
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

      <ul className="m-0 mb-1.5 flex list-none flex-wrap gap-1.5 p-0">
        {(["equalMasses", "constant", "normalizedUnits"] as const).map(
          (concept, index) => (
            <li
              key={concept}
              className={`rounded-md border px-2 py-1.25 text-center ${
                index === 1
                  ? "border-[#48998e] bg-[#5ee7d515] text-[#a7f3e5]"
                  : "border-[#7965af] bg-[#aa97ff18] text-[#e4dcff]"
              }`}
            >
              <strong className="text-xs leading-normal font-bold tracking-wide">
                {t(`galleryScience.${concept}`)}
              </strong>
            </li>
          ),
        )}
      </ul>

      <section
        className="min-w-0 border-t border-lab-line pt-2.5"
        aria-labelledby="orbit-source-title"
        data-orbit-detail-source
      >
        <h3
          id="orbit-source-title"
          className="m-0 mb-1.5 text-sm leading-[1.4] font-semibold text-[#e3e6f2]"
        >
          {t("detail.sourceTitle")}
        </h3>

        <p
          className="m-0 text-[0.8125rem] leading-normal text-[#b6bdd0]"
          lang="es"
        >
          {orbit.sourceLabel}
        </p>

        <a
          href={orbit.source}
          target="_blank"
          rel="noopener noreferrer"
          className="source-link inline-flex min-h-11 items-center gap-2 text-[0.8125rem] leading-normal text-[#d0c1ff] underline underline-offset-4 transition-colors duration-150 hover:text-[#eee7ff] motion-reduce:transition-none"
        >
          {t("detail.sourceLink")}

          <Icon name="external" />

          <span className="sr-only">{t("detail.sourceNewTab")}</span>
        </a>
      </section>
    </article>
  );
};
