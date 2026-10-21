import { useTranslations } from "next-intl";
import type { GravityStage } from "../../../types/journey.types";

export const GravityStageHeading = ({
  stage,
  visuallyHidden = false,
}: {
  stage: GravityStage;
  visuallyHidden?: boolean;
}) => {
  const t = useTranslations("Gravity");
  return (
    <div className={visuallyHidden ? "sr-only" : "flex min-w-0 items-baseline [gap:1rem] m-0 [padding:.25rem_0] [@media(max-width:600px)]:[gap:.75rem] [&_h2]:[min-width:0] [&_h2]:[margin:0] [&_h2]:[color:#f2f2fa] [&_h2]:[font-size:clamp(1.5rem,_2vw,_1.75rem)] [&_h2]:[font-weight:600] [&_h2]:[line-height:1.25] [&_h2]:[letter-spacing:-0.025em] [&_h2]:[overflow-wrap:anywhere]"}>
      <span aria-hidden="true" className="shrink-0 [color:#b9a8ff] [font-family:var(--font-geist-mono),_monospace] [font-size:15px] [font-variant-numeric:tabular-nums] [@media(max-width:600px)]:[font-size:12px]">
        {stage.number}
      </span>
      <h2 id={`${stage.id}-heading`}>{t(stage.title)}</h2>
    </div>
  );
};
