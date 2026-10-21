"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { CircleHelp } from "@/components/icons";
import { useTutorActions } from "../providers/tutorEnvironment";

type ExplainTopic = "formula" | "simulation";
export const ExplainWithAI = ({
  topic,
}: {
  topic: ExplainTopic;
}) => {
  const t = useTranslations("Tutor");
  const { openTutor } = useTutorActions();
  const id = useId();
  return (
    <span className="group relative inline-flex shrink-0 align-middle">
      <button
        type="button"
        data-explain-topic={topic}
        aria-label={t("explainThisTopic", { topic: t(`helpTopics.${topic}`) })}
        aria-describedby={id}
        aria-haspopup="dialog"
        aria-controls="global-tutor-dialog"
        className="inline-flex size-11 items-center justify-center rounded-full text-[#F8BA00]
         transition-[color,transform,filter] duration-200 hover:scale-105 hover:text-[#ffdb70] 
         hover:drop-shadow-[0_0_5px_#F8BA0080] focus-visible:outline-2 focus-visible:outline-offset-2 
         focus-visible:outline-[#F8BA00] motion-reduce:transform-none motion-reduce:transition-none"
        onClick={(event) => {
          openTutor(
            {
              question: t(`helpQuestions.${topic}`),
              intent: "explain_context",
            },
            event.currentTarget,
          );
        }}
      >
        <CircleHelp className="size-5" />
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute right-0 bottom-full z-50 mb-1 rounded-md border
         border-amber-300/30 bg-slate-950 px-2 py-1 text-xs whitespace-nowrap text-amber-100 
         opacity-0 transition-opacity duration-200 group-hover:opacity-100 
         group-focus-within:opacity-100 motion-reduce:transition-none"
      >
        {t("explainThis")}
      </span>
    </span>
  );
};
