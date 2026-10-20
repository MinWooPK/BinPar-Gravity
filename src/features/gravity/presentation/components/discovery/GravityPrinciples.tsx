import { useTranslations } from "next-intl";
import css from "./GravityPrinciples.module.css";

// Define los estilos de la sección y las tarjetas de los principios gravitatorios.
const styles = {
  section: "min-w-0",
  heading:
    "[margin:0_0_10px] [color:#e4e8f2] [font-size:1rem] font-semibold [line-height:1.4]",
  principles: "grid grid-cols-1 gap-2",
  principle: `${css["principle"]} min-w-0 [padding:12px] border border-solid border-lab-line [border-radius:10px] [background:#111624b3] [@media(max-width:600px)]:[padding:14px]`,
  marker: `${css["marker"]} block [width:22px] [height:3px] [border-radius:2px] [background:#aa97ff]`,
} as const;

// Muestra los tres principios fundamentales de la gravedad:
// influencia de la masa, influencia de la distancia y atracción mutua.
export const GravityPrinciples = () => {
  // Obtiene las traducciones de los títulos y descripciones.
  const t = useTranslations("Gravity");

  return (
    <section
      aria-labelledby="gravity-principles-title"
      className={styles.section}
    >
      <h3 id="gravity-principles-title" className={styles.heading}>
        {t("principlesTitle")}
      </h3>

      <div className={styles.principles}>
        {(["mass", "distance", "mutual"] as const).map((key) => (
          <article
            key={key}
            aria-labelledby={`gravity-principle-${key}`}
            className={styles.principle}
          >
            <span
              aria-hidden="true"
              className={styles.marker}
              data-tone={key}
            />
            <h4 id={`gravity-principle-${key}`}>
              {t(`principle_${key}_title`)}
            </h4>
            <p>{t(`principle_${key}_description`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
