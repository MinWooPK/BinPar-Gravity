import { useTranslations } from "next-intl";
import styles from "./GravityIntroduction.module.css";
import { GravityFormula } from "./GravityFormula";

export const GravityIntroduction = () => {
  const t = useTranslations("Gravity");

  return (
    <section aria-labelledby="gravity-intro-title" className={styles.introduction}>
      <div className={styles.chapter}>
        <span>{t("introChapter")}</span>
        <span>{t("introChapterNote")}</span>
      </div>
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("introEyebrow")}</p>
          <h1 id="gravity-intro-title">{t("introTitle")}</h1>
          <p>{t("introParagraph")}</p>
          <p>{t("introNewton")}</p>
          <a href="#gravity-laboratory" className={styles.link}>
            {t("tryLaboratory")}
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h16m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
        <GravityFormula />
      </div>
    </section>
  );
};
