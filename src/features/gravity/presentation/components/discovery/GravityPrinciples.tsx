import { useTranslations } from "next-intl";

// Muestra los tres principios de la gravedad.
export const GravityPrinciples = () => {
  const t = useTranslations("Gravity");

  return (
    <section aria-labelledby="gravity-principles-title" className="min-w-0">
      <h3
        id="gravity-principles-title"
        className="mb-2.5 text-base leading-[1.4] font-semibold text-[#e4e8f2]"
      >
        {t("principlesTitle")}
      </h3>

      {/* Principios de masa, distancia y atracción mutua. */}
      <div className="grid grid-cols-1 gap-2">
        {(["mass", "distance", "mutual"] as const).map((key) => (
          <article
            key={key}
            aria-labelledby={`gravity-principle-${key}`}
            className="min-w-0 rounded-[10px] border border-lab-line bg-[#111624b3] p-3 max-[600px]:p-3.5"
          >
            {/* Color identificativo de cada principio. */}
            <span
              aria-hidden="true"
              data-tone={key}
              className="block h-0.75 w-5.5 rounded-xs bg-[#aa97ff] data-[tone=distance]:bg-[#5ee7d5] data-[tone=mutual]:bg-[#f7bd79]"
            />

            <h4
              id={`gravity-principle-${key}`}
              className="mt-2 mb-1.5 text-base leading-[1.4] font-semibold tracking-[-0.015em] text-[#f2f2fa] wrap-break-word"
            >
              {t(`principle_${key}_title`)}
            </h4>

            <p className="text-base leading-normal text-[#b2bad0] wrap-break-word">
              {t(`principle_${key}_description`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};
