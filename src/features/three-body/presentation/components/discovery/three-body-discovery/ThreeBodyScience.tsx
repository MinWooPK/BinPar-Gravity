"use client";

import { useTranslations } from "next-intl";
import { InteractionDiagram } from "./InteractionDiagram";

// Muestra el modelo gravitatorio, la fórmula y las condiciones físicas.
export const ThreeBodyScience = ({ id }: { id: string }) => {
  const t = useTranslations("ThreeBody.discovery");

  return (
    <section
      className="flex flex-col gap-3.5 min-w-0 p-4.5 border border-solid border-lab-line 
      rounded-[14px] [background:linear-gradient(145deg,#131724,#0e121d)] text-[#b2bad0]
       text-[.9375rem] leading-normal wrap-anywhere [@media(max-width:600px)]:p-[16px_12px] 
       lab-three-body-discovery-science [&&]:gap-2 [&&]:text-[0.875rem] [&&]:leading-[1.45] [&_p]:m-0"
      aria-labelledby={`${id}-science`}
      data-three-body-science
    >
      <h2
        id={`${id}-science`}
        className="m-0 text-lab-text text-[clamp(1.25rem,2vw,1.5rem)] font-semibold leading-tight tracking-tight"
      >
        {t("science.title")}
      </h2>
      <InteractionDiagram id={id} />
      <div>
        <div
          className="flex justify-center py-[0_7px] text-[#e4dfff] font-[Georgia,serif] text-[1.875rem] leading-[1.1]"
          role="img"
          aria-label={t("science.lawSpoken")}
        >
          <span
            aria-hidden="true"
            className="inline-flex items-center gap-2 [&_sub]:static [&_sub]:align-sub [&_sub]:text-[0.6em] 
            [&_sub]:leading-0 [&_sup]:static [&_sup]:align-super [&_sup]:text-[0.6em] [&_sup]:leading-0"
          >
            <span>
              F<sub>ij</sub>
            </span>
            <span className="text-[#a99bbf] text-[.7em]">=</span>
            <span>G</span>
            <span className="text-[#a99bbf] text-[.7em]">·</span>
            <span className="inline-flex flex-col text-[.8em] text-center [&_>_span]:p-[2px_6px] [&_>_span:first-child]:[border-bottom:1px_solid_#a99bbf]">
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
        className="grid grid-cols-3 gap-2 m-0 pt-2.5 [border-top:1px_solid_#30364b] [&_dt]:mb-1 [&_dt]:text-[#b9c4d8]
         [&_dd]:m-0 [&_dd]:text-[#d8c9ff] [&_dd]:font-[Georgia,serif] [&_dd]:text-[1rem]"
        aria-label={t("science.conditionsTitle")}
      >
        {(["masses", "positions", "velocities"] as const).map((condition) => (
          <div key={condition}>
            <dt>{t(`science.${condition}`)}</dt>
            <dd>
              {[1, 2, 3].map((index) => (
                <span key={index}>
                  {index > 1 && ", "}
                  {condition === "masses" ? "m" : condition === "positions" ? "r" : "v"}
                  <sub className="static align-sub text-[0.65em] leading-0">{index}</sub>
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <aside
        className="p-[9px_11px] [border:1px_solid_#294543] rounded-lg [background:#5ee7d508] text-[#b8d3d2] 
      [&_h3]:m-[0_0_4px] [&_h3]:text-[#c2e7e1] [&_h3]:text-[0.875rem] [&_h3]:font-semibold"
      >
        <h3>{t("science.normalizedTitle")}</h3>
        <p>{t("science.normalized")}</p>
      </aside>
      <p className="in-[.lab-three-body-discovery-science]:text-[#b9c4d8]">
        {t("science.periodic")}
      </p>
    </section>
  );
};
