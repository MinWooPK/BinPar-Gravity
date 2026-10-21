import { useTranslations } from "next-intl";

import type { GravityStage } from "../../../types/journey.types";

// Muestra el número y el título de la etapa.
export const GravityStageHeading = ({
  stage,
  visuallyHidden = false,
}: {
  stage: GravityStage;
  visuallyHidden?: boolean;
}) => {
  const t = useTranslations("Gravity");

  return (
    <div
      className={
        visuallyHidden
          ? "sr-only"
          : "m-0 flex min-w-0 items-baseline gap-4 py-1 max-[600px]:gap-3"
      }
    >
      <span
        aria-hidden="true"
        className="shrink-0 text-[15px] text-[#b9a8ff] tabular-nums [font-family:var(--font-geist-mono),monospace] max-[600px]:text-xs"
      >
        {stage.number}
      </span>

      <h2
        id={`${stage.id}-heading`}
        className="min-w-0 text-[clamp(1.5rem,2vw,1.75rem)] leading-tight font-semibold tracking-tight text-[#f2f2fa] wrap-anywhere"
      >
        {t(stage.title)}
      </h2>
    </div>
  );
};
