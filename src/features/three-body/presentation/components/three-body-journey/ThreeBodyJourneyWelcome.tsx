"use client";

import { useTranslations } from "next-intl";

// Pantalla inicial del recorrido. Se mantiene montada solo si no hay etapa activa.
export const ThreeBodyJourneyWelcome = () => {
  const t = useTranslations("ThreeBody.journey");

  return (
          <header className="min-w-0 [padding-block:clamp(2rem,_6vh,_5rem)] [&_h1]:m-0 [&_h1]:[color:#f8fafc] [&_h1]:[font-size:clamp(3.25rem,_6.5vw,_6rem)] [&_h1]:[font-weight:800] [&_h1]:[line-height:1.05] [&_h1]:[letter-spacing:-0.065em] [&_h1]:[overflow-wrap:anywhere]">
            <p className="[margin:0_0_clamp(1.5rem,_4vh,_3rem)] [color:#b8b0d6] [font-size:clamp(.75rem,_1.1vw,_.95rem)] font-bold [letter-spacing:.23em] uppercase">{t("eyebrow")}</p>
            <h1>{t("title")}</h1>
            <p className="[max-width:65rem] [margin:clamp(1.5rem,_4vh,_3rem)_0_0] [color:#cbd5e1] [font-size:clamp(1rem,_1.5vw,_1.25rem)] [line-height:1.7]">{t("description")}</p>
          </header>
  );
};
