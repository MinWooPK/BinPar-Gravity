"use client";

import { useTranslations } from "next-intl";

// Muestra la bienvenida al recorrido educativo.
export const ThreeBodyJourneyWelcome = () => {
  const t = useTranslations("ThreeBody.journey");

  return (
    <header className="min-w-0 py-[clamp(2rem,6vh,5rem)]">
      <p className="mb-[clamp(1.5rem,4vh,3rem)] text-[clamp(.75rem,1.1vw,.95rem)] font-bold tracking-[.23em] text-[#b8b0d6] uppercase">
        {t("eyebrow")}
      </p>

      <h1 className="m-0 text-[clamp(3.25rem,6.5vw,6rem)] leading-[1.05] font-extrabold tracking-[-0.065em] text-[#f8fafc] wrap-anywhere">
        {t("title")}
      </h1>

      <p className="mt-[clamp(1.5rem,4vh,3rem)] max-w-260 text-[clamp(1rem,1.5vw,1.25rem)] leading-[1.7] text-[#cbd5e1]">
        {t("description")}
      </p>
    </header>
  );
};
