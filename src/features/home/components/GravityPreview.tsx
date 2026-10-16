"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { relativeAttraction } from "@/features/gravity/domain/relativeAttraction";

export const GravityPreview = () => {
  const t = useTranslations("Home");
  const sliderId = useId();
  const [distance, setDistance] = useState(100);
  const force = relativeAttraction(distance);
  const distanceText =
    distance === 100
      ? t("distanceInitial")
      : distance === 50
        ? t("distanceHalf")
        : distance === 200
          ? t("distanceDouble")
          : distance < 100
            ? t("distanceCloser", { percent: 100 - distance })
            : t("distanceFarther", { percent: distance - 100 });
  const forceText =
    distance === 100
      ? t("forceInitial")
      : distance === 50
        ? t("forceFour")
        : distance === 200
          ? t("forceQuarter")
          : distance < 100
            ? t("forceStronger", { percent: Math.round((force - 1) * 100) })
            : t("forceWeaker", { percent: Math.round((1 - force) * 100) });
  const offset = 16 + ((distance - 50) / 150) * 20;

  return (
    <section
      aria-labelledby={`${sliderId}-title`}
      className="overflow-hidden rounded-3xl border border-sky-300/25 bg-slate-900 text-white shadow-2xl shadow-sky-950/15"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
        <h2 id={`${sliderId}-title`} className="text-base font-semibold">
          {t("previewTitle")}
        </h2>
        <span className="rounded-full bg-sky-300/10 px-3 py-1 text-sm font-medium text-sky-200">
          {t("tryIt")}
        </span>
      </div>
      <p className="px-5 pt-5 text-base leading-relaxed text-slate-200 sm:px-7">
        {t("previewInstruction")}
      </p>
      <div
        aria-hidden="true"
        className="relative h-52 overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12),transparent_70%)] sm:h-64"
      >
        <div className="absolute inset-x-8 top-1/2 border-t border-dashed border-sky-200/30" />
        <div
          style={{ left: `${50 - offset}%` }}
          className="absolute top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_25%,#bae6fd,#0284c7_65%,#0c4a6e)] shadow-[0_0_40px_#38bdf830] transition-[left] duration-150 motion-reduce:transition-none sm:size-20"
        />
        <div
          style={{ left: `${50 + offset}%` }}
          className="absolute top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_25%,#fde68a,#f59e0b_65%,#92400e)] shadow-[0_0_35px_#fbbf2420] transition-[left] duration-150 motion-reduce:transition-none sm:size-14"
        />
      </div>
      <div className="space-y-5 px-5 pb-6 sm:px-7 sm:pb-7">
        <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-base text-slate-200">{t("attraction")}</span>
          <output
            htmlFor={sliderId}
            className="block w-full text-xl leading-relaxed font-semibold text-sky-200"
          >
            {forceText}
          </output>
        </div>
        <div>
          <label
            htmlFor={sliderId}
            className="flex flex-wrap justify-between gap-2 text-base font-medium"
          >
            <span>{t("distance")}</span>
            <span className="text-sky-200">{distanceText}</span>
          </label>
          <input
            id={sliderId}
            type="range"
            min={50}
            max={200}
            step={1}
            aria-valuetext={distanceText}
            aria-describedby={`${sliderId}-note`}
            value={distance}
            onChange={(event) => setDistance(Number(event.target.value))}
            className="mt-2 h-11 w-full cursor-pointer accent-sky-300 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
          />
          <p
            id={`${sliderId}-note`}
            className="text-sm leading-relaxed text-slate-300"
          >
            {t("previewNote")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDistance(100)}
          className="min-h-11 rounded-lg px-3 text-base font-medium text-sky-200 underline decoration-sky-200/40 underline-offset-4 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-sky-300"
        >
          {t("reset")}
        </button>
      </div>
    </section>
  );
};
