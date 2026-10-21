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

// Muestra las cuatro secciones educativas de Descubre.
export const GravityEducationalCard = () => {
  const t = useTranslations("Gravity");
  const id = useId();

  // Conserva la pestaña educativa seleccionada.
  const [selected, setSelected] = useState<TopicId>("what");

  return (
    <section
      className="min-w-0 [padding:16px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] min-[1024px]:flex min-[1024px]:flex-col [@media(max-width:600px)]:[padding:16px_12px]"
      aria-labelledby={`${id}-heading`}
      data-discovery-education
    >
      <h2
        id={`${id}-heading`}
        className="[margin:0_0_10px] text-lab-text [font-size:clamp(1.25rem,_2vw,_1.5rem)] font-semibold [line-height:1.25] [letter-spacing:-.025em] [overflow-wrap:anywhere] min-[1024px]:shrink-0"
      >
        {t("discoveryTitle")}
      </h2>

      {/* Navegación entre las cuatro pestañas. */}
      <GravityEducationTabs
        id={id}
        selected={selected}
        onSelect={setSelected}
      />

      {/* Contenido correspondiente a la pestaña seleccionada. */}
      {topics.map((topic) => (
        <div
          key={topic.id}
          role="tabpanel"
          id={`${id}-panel-${topic.id}`}
          aria-labelledby={`${id}-tab-${topic.id}`}
          tabIndex={0}
          hidden={selected !== topic.id}
          className="min-w-0 [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px] [&[hidden]]:[display:none] [&:not([hidden])]:[animation:lab-gravity-education-enter_180ms_ease-out_both] [@media_(min-width:_1024px)]:[&:not([hidden])]:[display:flex] [@media_(min-width:_1024px)]:[&:not([hidden])]:[flex:1] [@media_(min-width:_1024px)]:[&:not([hidden])]:[flex-direction:column] [@media_(prefers-reduced-motion:_reduce)]:[&:not([hidden])]:[animation:none]"
        >
          {/* Qué es la gravedad. */}
          {topic.id === "what" && (
            <div className="min-[1024px]:flex min-[1024px]:[flex:1] min-[1024px]:flex-col [&_h3]:[margin:0_0_10px] [&_h3]:[color:#e4dcff] [&_h3]:[font-size:1.125rem] [&_h3]:[font-weight:600] [&_h3]:[line-height:1.4] [&_h3]:[letter-spacing:-.015em] [&_h3]:[text-wrap:balance] [&_>_p]:[margin:0] [&_>_p]:[color:#b2bad0] [&_>_p]:[font-size:.9375rem] [&_>_p]:[line-height:1.5]">
              <h3>{t("discoveryDefinition")}</h3>

              <p>{t("discoveryExplanation")}</p>

              <EarthMoonDiagram id={id} />

              <p>{t("discoveryPhenomena")}</p>
            </div>
          )}

          {/* Principios de la gravedad. */}
          {topic.id === "principles" && <GravityPrinciples />}

          {/* Ejemplos cotidianos. */}
          {topic.id === "examples" && <GravityEveryday />}

          {/* Historia y aportaciones científicas. */}
          {topic.id === "history" && (
            <div className="min-[1024px]:flex min-[1024px]:[flex:1] min-[1024px]:flex-col [&_h3]:[margin:0_0_10px] [&_h3]:[color:#e4dcff] [&_h3]:[font-size:1.125rem] [&_h3]:[font-weight:600] [&_h3]:[line-height:1.4] [&_h3]:[letter-spacing:-.015em] [&_h3]:[text-wrap:balance]">
              <h3>{t("discoveryHistoryTitle")}</h3>

              <ol className="grid [gap:8px] m-0 p-0 [list-style:none] min-[1024px]:[flex:1] min-[1024px]:[align-content:space-between] [&_p]:[margin:0] [&_p]:[color:#b2bad0] [&_p]:[font-size:.9375rem] [&_p]:[line-height:1.5] [&_li]:[padding-left:12px] [&_li]:[border-left:2px_solid_#746392] [&_h4]:[margin:0_0_3px] [&_h4]:[color:#e4e8f2] [&_h4]:[font-size:.9375rem] [&_h4]:[font-weight:600] [&_h4]:[line-height:1.4]">
                {(["Galileo", "Kepler", "Newton"] as const).map((scientist) => (
                  <li key={scientist}>
                    <h4>{t(`discoveryHistory${scientist}Title`)}</h4>

                    <p>{t(`discoveryHistory${scientist}`)}</p>
                  </li>
                ))}
              </ol>

              <p className="[margin:8px_0_0] [padding:10px_12px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [font-size:.875rem] [line-height:1.5]">
                {t("discoveryHistoryConstant")}
              </p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
};
