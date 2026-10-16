"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import styles from "./GravityPrinciples.module.css";

export const GravityPrinciples = ({ onCheck }: { onCheck: () => void }) => {
  const t = useTranslations("Gravity");
  const id = useId();
  return (
    <section aria-labelledby={`${id}-title`} className={styles.section}>
      <h2 id={`${id}-title`} className="sr-only">{t("principlesTitle")}</h2>
      <div className={styles.principles}>
        {(["mass", "distance", "mutual"] as const).map((key, index) => (
          <article key={key} className={styles.principle}>
            <span aria-hidden="true" className={styles.number} data-tone={key}>{String(index + 1).padStart(2, "0")}</span>
            <h3>{t(`principle_${key}_title`)}</h3>
            <p>{t(`principle_${key}_description`)}</p>
          </article>
        ))}
      </div>
      <div className={styles.challenge}>
        <span aria-hidden="true" className={styles.question}>?</span>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("tryChallengeLabel")}</p>
          <h3>{t("tryChallengeTitle")}</h3>
          <p>{t("tryChallengeDescription")}</p>
        </div>
        <button type="button" onClick={onCheck} className={styles.button}>
          {t("checkInLab")}
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h16m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </section>
  );
};
