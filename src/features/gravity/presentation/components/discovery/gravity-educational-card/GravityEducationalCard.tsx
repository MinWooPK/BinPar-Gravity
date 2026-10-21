"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

import { GravityEveryday } from "../GravityEveryday";
import { GravityPrinciples } from "../GravityPrinciples";
import { EarthMoonDiagram } from "./EarthMoonDiagram";

import {
  GravityEducationTabs,
  topics,
  type TopicId,
} from "./GravityEducationTabs";

// Muestra las cuatro pestañas de Descubre.
export const GravityEducationalCard = () => {
  const t = useTranslations("Gravity");
  const id = useId();

  const [selected, setSelected] = useState<TopicId>("what");

  return (
    <section
      className="min-w-0 rounded-[14px] border border-lab-line bg-[linear-gradient(145deg,#131724,#0e121d)] p-4 max-[600px]:px-3 min-[1024px]:flex min-[1024px]:flex-col"
      aria-labelledby={`${id}-heading`}
      data-discovery-education
    >
      <h2
        id={`${id}-heading`}
        className="mb-2.5 text-[clamp(1.25rem,2vw,1.5rem)] leading-tight font-semibold tracking-tight text-lab-text wrap-anywhere min-[1024px]:shrink-0"
      >
        {t("discoveryTitle")}
      </h2>

      {/* Pestañas educativas. */}
      <GravityEducationTabs
        id={id}
        selected={selected}
        onSelect={setSelected}
      />

      {/* Contenido de cada pestaña. */}
      {topics.map((topic) => (
        <div
          key={topic.id}
          role="tabpanel"
          id={`${id}-panel-${topic.id}`}
          aria-labelledby={`${id}-tab-${topic.id}`}
          tabIndex={0}
          hidden={selected !== topic.id}
          className={`min-w-0 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c0b3ff] ${
            selected === topic.id
              ? "animate-[lab-gravity-education-enter_180ms_ease-out_both] min-[1024px]:flex min-[1024px]:flex-1 min-[1024px]:flex-col motion-reduce:animate-none"
              : "hidden"
          }`}
        >
          {/* Qué es la gravedad. */}
          {topic.id === "what" && (
            <div className="min-[1024px]:flex min-[1024px]:flex-1 min-[1024px]:flex-col">
              <h3 className="mb-2.5 text-lg leading-[1.4] font-semibold tracking-[-0.015em] text-[#e4dcff] text-balance">
                {t("discoveryDefinition")}
              </h3>

              <p className="text-[15px] leading-normal text-[#b2bad0]">
                {t("discoveryExplanation")}
              </p>

              <EarthMoonDiagram id={id} />

              <p className="text-[15px] leading-normal text-[#b2bad0]">
                {t("discoveryPhenomena")}
              </p>
            </div>
          )}

          {/* Principios de gravedad. */}
          {topic.id === "principles" && <GravityPrinciples />}

          {/* Ejemplos cotidianos. */}
          {topic.id === "examples" && <GravityEveryday />}

          {/* Historia de la gravedad. */}
          {topic.id === "history" && (
            <div className="min-[1024px]:flex min-[1024px]:flex-1 min-[1024px]:flex-col">
              <h3 className="mb-2.5 text-lg leading-[1.4] font-semibold tracking-[-0.015em] text-[#e4dcff] text-balance">
                {t("discoveryHistoryTitle")}
              </h3>

              <ol className="grid list-none gap-2 p-0 min-[1024px]:flex-1 min-[1024px]:content-between">
                {(["Galileo", "Kepler", "Newton"] as const).map((scientist) => (
                  <li
                    key={scientist}
                    className="border-l-2 border-[#746392] pl-3"
                  >
                    <h4 className="mb-0.75 text-[15px] leading-[1.4] font-semibold text-[#e4e8f2]">
                      {t(`discoveryHistory${scientist}Title`)}
                    </h4>

                    <p className="text-[15px] leading-normal text-[#b2bad0]">
                      {t(`discoveryHistory${scientist}`)}
                    </p>
                  </li>
                ))}
              </ol>

              <p className="mt-2 rounded-lg border border-[#294543] bg-[#5ee7d508] px-3 py-2.5 text-sm leading-normal text-[#b8d3d2]">
                {t("discoveryHistoryConstant")}
              </p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
};
