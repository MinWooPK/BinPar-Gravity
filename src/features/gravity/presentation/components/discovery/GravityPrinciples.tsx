import { useTranslations } from "next-intl";
import { GravityStageLink } from "../GravityJourneyTabs";
import css from "./GravityPrinciples.module.css";

const styles = {
  "section": "min-w-0",
  "heading": "[margin:0_0_10px] [color:#e4e8f2] [font-size:1rem] font-semibold [line-height:1.4]",
  "principles": "grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:8px] [@media(max-width:600px)]:[grid-template-columns:minmax(0,_1fr)]",
  "principle": `${css["principle"]} min-w-0 [padding:12px] border border-solid border-lab-line [border-radius:10px] [background:#111624b3] [@media(max-width:600px)]:[padding:14px]`,
  "marker": `${css["marker"]} block [width:22px] [height:3px] [border-radius:2px] [background:#aa97ff]`,
  "compactLink": `${css["compactLink"]} inline-flex items-center justify-center [gap:8px] [min-height:44px] max-w-full [padding:8px] [border-radius:8px] [color:#c9bcff] [font-size:.875rem] font-semibold`,
} as const;

export const GravityPrinciples = () => {
  const t = useTranslations("Gravity");
  return (
    <section aria-labelledby="gravity-principles-title" className={styles.section}>
      <h3 id="gravity-principles-title" className={styles.heading}>
        {t("principlesTitle")}
      </h3>
      <div className={styles.principles}>
        {(["mass", "distance", "mutual"] as const).map((key) => (
          <article key={key} aria-labelledby={`gravity-principle-${key}`} className={styles.principle}>
            <span aria-hidden="true" className={styles.marker} data-tone={key} />
            <h4 id={`gravity-principle-${key}`}>{t(`principle_${key}_title`)}</h4>
            <p>{t(`principle_${key}_description`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export const GravityPrinciplesChallenge = () => {
  const t = useTranslations("Gravity");
  return (
    <GravityStageLink
      stageId="gravity-laboratory"
      className={styles.compactLink}
      title={t("tryChallengeTitle")}
    >
      {t("learningExperiment")} <span aria-hidden="true">→</span>
    </GravityStageLink>
  );
};
