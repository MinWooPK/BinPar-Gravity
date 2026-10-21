import { useTranslations } from "next-intl";

// Muestra los tres principios fundamentales de la gravedad:
// influencia de la masa, influencia de la distancia y atracción mutua.
export const GravityPrinciples = () => {
  // Obtiene las traducciones de los títulos y descripciones.
  const t = useTranslations("Gravity");

  return (
    <section
      aria-labelledby="gravity-principles-title"
      className="min-w-0"
    >
      <h3 id="gravity-principles-title" className="[margin:0_0_10px] [color:#e4e8f2] [font-size:1rem] font-semibold [line-height:1.4]">
        {t("principlesTitle")}
      </h3>

      <div className="grid grid-cols-1 gap-2">
        {(["mass", "distance", "mutual"] as const).map((key) => (
          <article
            key={key}
            aria-labelledby={`gravity-principle-${key}`}
            className="min-w-0 [padding:12px] border border-solid border-lab-line [border-radius:10px] [background:#111624b3] [@media(max-width:600px)]:[padding:14px] [&_h4]:[margin:8px_0_6px] [&_h4]:[color:#f2f2fa] [&_h4]:[font-size:1rem] [&_h4]:[font-weight:600] [&_h4]:[line-height:1.4] [&_h4]:[letter-spacing:-0.015em] [&_h4]:[overflow-wrap:break-word] [&_p]:[margin:0] [&_p]:[color:#b2bad0] [&_p]:[font-size:1rem] [&_p]:[line-height:1.5] [&_p]:[overflow-wrap:break-word]"
          >
            <span
              aria-hidden="true"
              className="block [width:22px] [height:3px] [border-radius:2px] [background:#aa97ff] [&[data-tone=distance]]:[background:#5ee7d5] [&[data-tone=mutual]]:[background:#f7bd79]"
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
