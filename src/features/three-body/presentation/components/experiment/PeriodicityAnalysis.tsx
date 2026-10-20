import { ExplainWithAI } from "@/features/ai/presentation/components/ExplainWithAI";
import { useFormatter, useTranslations } from "next-intl";
import type { PeriodicityResult } from "../../../domain/periodicity-detection";

export const PeriodicityAnalysis = ({ result, duration }: {
  result: PeriodicityResult;
  duration: number;
}) => {
  const t = useTranslations("ThreeBody.experiment.periodicity");
  const format = useFormatter();
  const time = (value: number) => format.number(value, { maximumSignificantDigits: 6 });
  const percent = (value: number) => format.number(value, {
    style: "percent", maximumSignificantDigits: 3,
  });

  return (
    <section className="space-y-3 rounded-xl border border-[#60517f] bg-[#19182c] p-4">
      <h4 className="font-semibold text-slate-100">{t("title")} <ExplainWithAI topic="periodicity" /></h4>
      <p role="status" className={result.detected ? "font-medium text-[#5ee7d5]" : "font-medium text-[#d3c5ff]"}>
        {t(result.detected ? "possibleOrbit" : "notDetected")}
      </p>
      {result.estimatedPeriod !== null && (
        <p className="text-sm text-slate-200">
          {t("estimatedPeriod", { period: time(result.estimatedPeriod) })}
        </p>
      )}
      <dl className="grid min-w-0 gap-3 text-sm sm:grid-cols-3">
        {([
          ["positionError", result.positionError],
          ["velocityError", result.velocityError],
          ["combinedError", result.combinedError],
        ] as const).map(([key, value]) => (
          <div key={key} className="min-w-0">
            <dt className="text-xs text-slate-400">{t(key)}</dt>
            <dd className="mt-1 break-words font-medium tabular-nums text-slate-100">{percent(value)}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs leading-5 text-slate-400">
        {t("errorHelp", { tolerance: percent(result.tolerance), time: time(result.evaluatedTime) })}
      </p>
      <p className="text-sm leading-6 text-slate-300">
        {result.reason === "insufficientMotion"
          ? t("insufficientMotion")
          : t("explanation")}
      </p>
      <p className="text-xs leading-5 text-slate-400">
        {result.detected
          ? t("approximateOnly")
          : t("intervalOnly", { duration: time(duration) })}
      </p>
    </section>
  );
};
