"use client";

import { useTranslations } from "next-intl";

type DiscoveryTopic = "what" | "how" | "difficulty" | "history";

// Renderiza la explicación correspondiente sin alterar las traducciones ni los estilos.
export const DiscoveryTopicContent = ({ topic }: { topic: DiscoveryTopic }) => {
  const t = useTranslations("ThreeBody.discovery");

  return (
    <>
      {topic === "what" && (
        <>
          <div>
            <h3>{t("what.title")}</h3>
            <p>{t("what.description")}</p>
          </div>
          <dl className="grid [gap:14px] m-0 [&_>_div]:[padding-left:12px] [&_>_div]:[border-left:2px_solid_#746392] [&_dt]:[margin-bottom:5px] [&_dt]:[color:#dcd4f6] [&_dt]:font-semibold [&_dd]:m-0">
            {(["two", "three"] as const).map((count) => (
              <div key={count}>
                <dt>{t(`what.${count}Title`)}</dt>
                <dd>{t(`what.${count}Description`)}</dd>
              </div>
            ))}
          </dl>
          <aside className="[padding:10px_12px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [font-size:.875rem]">
            <h4>{t("what.noteTitle")}</h4>
            <p>{t("what.note")}</p>
          </aside>
        </>
      )}
      {topic === "how" && (
        <>
          <div>
            <h3>{t("how.title")}</h3>
            <p>{t("how.description")}</p>
          </div>
          <ol className="grid [gap:14px] m-0 p-0 [list-style:none] [&_li]:flex [&_li]:items-start [&_li]:[gap:10px]">
            {(["attract", "combine", "evolve"] as const).map((step, index) => (
              <li key={step}>
                <span
                  className="inline-flex [flex:0_0_auto] items-center justify-center [width:26px] [height:26px] [border:1px_solid_#4a406b] [border-radius:50%] [background:#aa97ff0a] [color:#d9cdfa] [font-size:.8125rem] [font-variant-numeric:tabular-nums]"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div>
                  <h4>{t(`how.${step}Title`)}</h4>
                  <p>{t(`how.${step}`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="[padding:10px_12px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [font-size:.875rem]">
            {t("how.note")}
          </p>
        </>
      )}
      {topic === "difficulty" && (
        <>
          <div>
            <h3>{t("difficulty.title")}</h3>
            <p>{t("difficulty.description")}</p>
          </div>
          <dl className="grid [gap:14px] m-0 [&_>_div]:[padding-left:12px] [&_>_div]:[border-left:2px_solid_#746392] [&_dt]:[margin-bottom:5px] [&_dt]:[color:#dcd4f6] [&_dt]:font-semibold [&_dd]:m-0">
            {(["chaos", "periodic"] as const).map((motion) => (
              <div key={motion}>
                <dt>{t(`difficulty.${motion}Title`)}</dt>
                <dd>{t(`difficulty.${motion}`)}</dd>
              </div>
            ))}
          </dl>
          <p className="[padding:10px_12px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [font-size:.875rem]">
            {t("difficulty.note")}
          </p>
        </>
      )}
      {topic === "history" && (
        <>
          <h3>{t("history.title")}</h3>
          <ol className="grid [gap:14px] m-0 p-0 [list-style:none] [flex:1] [align-content:space-between] [@media(max-width:1023px)]:[gap:18px] [&_li]:[padding-left:12px] [&_li]:[border-left:2px_solid_#746392]">
            {(["newton", "lagrange", "poincare"] as const).map((scientist) => (
              <li key={scientist}>
                <h4>{t(`history.${scientist}Title`)}</h4>
                <p>{t(`history.${scientist}`)}</p>
              </li>
            ))}
          </ol>
          <p className="[padding:10px_12px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [font-size:.875rem]">
            {t("history.note")}
          </p>
        </>
      )}
    </>
  );
};
