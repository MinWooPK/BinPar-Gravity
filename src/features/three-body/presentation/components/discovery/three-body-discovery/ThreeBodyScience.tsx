"use client";

import { useTranslations } from "next-intl";
import { InteractionDiagram } from "./InteractionDiagram";

// Muestra el modelo gravitatorio, la fórmula y las condiciones físicas.
export const ThreeBodyScience = ({ id }: { id: string }) => {
  const t = useTranslations("ThreeBody.discovery");

  return (
    <section
      className="flex flex-col [gap:14px] min-w-0 [padding:18px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [color:#b2bad0] [font-size:.9375rem] [line-height:1.5] [overflow-wrap:anywhere] [@media(max-width:600px)]:[padding:16px_12px] lab-three-body-discovery-science [&&]:[gap:8px] [&&]:[font-size:0.875rem] [&&]:[line-height:1.45] [&_p]:m-0"
      aria-labelledby={`${id}-science`}
      data-three-body-science
    >
      <h2
        id={`${id}-science`}
        className="m-0 text-lab-text [font-size:clamp(1.25rem,_2vw,_1.5rem)] font-semibold [line-height:1.25] [letter-spacing:-.025em]"
      >
        {t("science.title")}
      </h2>
      <InteractionDiagram id={id} />
      <div>
        <div
          className="flex justify-center [padding-block:0_7px] [color:#e4dfff] [font-family:Georgia,_serif] [font-size:1.875rem] [line-height:1.1]"
          role="img"
          aria-label={t("science.lawSpoken")}
        >
          <span
            aria-hidden="true"
            className="inline-flex items-center [gap:8px] [&_sub]:[position:static] [&_sub]:[vertical-align:sub] [&_sub]:[font-size:0.6em] [&_sub]:[line-height:0] [&_sup]:[position:static] [&_sup]:[vertical-align:super] [&_sup]:[font-size:0.6em] [&_sup]:[line-height:0]"
          >
            <span>
              F<sub>ij</sub>
            </span>
            <span className="[color:#a99bbf] [font-size:.7em]">=</span>
            <span>G</span>
            <span className="[color:#a99bbf] [font-size:.7em]">·</span>
            <span className="inline-flex flex-col [font-size:.8em] text-center [&_>_span]:[padding:2px_6px] [&_>_span:first-child]:[border-bottom:1px_solid_#a99bbf]">
              <span>
                m<sub>i</sub> m<sub>j</sub>
              </span>
              <span>
                r<sub>ij</sub>
                <sup>2</sup>
              </span>
            </span>
          </span>
        </div>
        <p>{t("science.lawDescription")}</p>
      </div>
      <dl
        className="grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:8px] m-0 [padding-top:10px] [border-top:1px_solid_#30364b] [&_dt]:[margin-bottom:4px] [&_dt]:[color:#b9c4d8] [&_dd]:m-0 [&_dd]:[color:#d8c9ff] [&_dd]:[font-family:Georgia,_serif] [&_dd]:[font-size:1rem]"
        aria-label={t("science.conditionsTitle")}
      >
        {(["masses", "positions", "velocities"] as const).map((condition) => (
          <div key={condition}>
            <dt>{t(`science.${condition}`)}</dt>
            <dd>
              {condition === "masses"
                ? "m₁, m₂, m₃"
                : condition === "positions"
                  ? "r₁, r₂, r₃"
                  : "v₁, v₂, v₃"}
            </dd>
          </div>
        ))}
      </dl>
      <aside className="[padding:9px_11px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [&_h3]:[margin:0_0_4px] [&_h3]:[color:#c2e7e1] [&_h3]:[font-size:0.875rem] [&_h3]:font-semibold">
        <h3>{t("science.normalizedTitle")}</h3>
        <p>{t("science.normalized")}</p>
      </aside>
      <p className="[.lab-three-body-discovery-science_&]:[color:#b9c4d8]">
        {t("science.periodic")}
      </p>
    </section>
  );
};
