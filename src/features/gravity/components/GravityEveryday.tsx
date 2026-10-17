import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons";
import styles from "./GravityEveryday.module.css";

const examples = ["fall", "moon", "objects"] as const;

const illustrations = {
  fall: (
    <>
      <circle cx="24" cy="9" r="4" />
      <path d="M24 20v17m-6-6 6 6 6-6M10 43h28" />
    </>
  ),
  objects: (
    <>
      <circle cx="8" cy="24" r="5" />
      <circle cx="40" cy="24" r="5" />
      <path d="M16 24h5m-3-3 3 3-3 3m14-3h-5m3-3-3 3 3 3" />
    </>
  ),
};

export const GravityEveryday = () => {
  const t = useTranslations("Gravity");

  return (
    <section
      aria-labelledby="gravity-everyday-title"
      className={styles.section}
    >
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{t("everydayEyebrow")}</p>
        <h2 id="gravity-everyday-title">{t("everydayTitle")}</h2>
        <p className={styles.description}>{t("everydayDescription")}</p>
      </div>
      <ul className={styles.examples}>
        {examples.map((example) => (
          <li key={example} className={styles.example} data-tone={example}>
            <span className={styles.illustration} aria-hidden="true">
              {example === "moon" ? (
                <Icon name="orbit" />
              ) : (
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  focusable="false"
                >
                  {illustrations[example]}
                </svg>
              )}
            </span>
            <div>
              <h3>{t(`everyday_${example}_title`)}</h3>
              <p>{t(`everyday_${example}_description`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
