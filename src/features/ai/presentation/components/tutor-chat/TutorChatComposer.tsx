"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";

import { ArrowUp } from "@/components/icons";
import { TUTOR_MAX_MESSAGE_LENGTH } from "@/features/ai/application/tutor";

import { useTutorConversation } from "@/features/ai/presentation/hooks/useTutorConversation";

type TutorChatComposerProps = {
  id: string;
  configure: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  onSubmit?: () => void;
};

// Permite escribir y enviar preguntas al Tutor IA.
export const TutorChatComposer = ({
  id,
  configure,
  inputRef,
  onSubmit,
}: TutorChatComposerProps) => {
  const t = useTranslations("Tutor");

  const { key, session, update, ask } = useTutorConversation();

  return (
    <form
      className="mx-3 flex shrink-0 items-end gap-1.5 rounded-2xl border border-slate-500/50 bg-slate-950/60 p-1.5 focus-within:border-[#67e8f980]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
        ask("explain", session.draft);
      }}
    >
      <label htmlFor={`${id}-question`} className="sr-only">
        {t("question")}
      </label>

      <textarea
        className="[field-sizing:content] min-h-11 min-w-0 max-h-[clamp(44px,20cqh,120px)] flex-1 resize-y overflow-y-auto rounded-xl [border:0] bg-transparent px-2 py-2.5 text-base leading-normal text-[#f8fafc] placeholder:text-[#94a3b8] placeholder:opacity-100"
        ref={inputRef}
        id={`${id}-question`}
        rows={1}
        aria-describedby={configure ? `${id}-configure-hint` : undefined}
        value={session.draft}
        maxLength={TUTOR_MAX_MESSAGE_LENGTH}
        placeholder={t("question")}
        disabled={session.pending}
        onChange={(event) => update(key, { draft: event.target.value })}
      />

      <button
        className="inline-flex h-11 flex-[0_0_44px] cursor-pointer items-center justify-center rounded-[0.875rem] border border-[#67e8f940] bg-[#164052] text-[#cffafe] [transition:background-color_180ms,border-color_180ms] [&:hover:not(:disabled)]:border-[#67e8f9] [&:hover:not(:disabled)]:bg-[#1e5266] motion-reduce:[transition:none]"
        type="submit"
        aria-label={t("send")}
        title={t("send")}
        disabled={session.pending || !session.draft.trim()}
      >
        <ArrowUp className="size-5" />
      </button>
    </form>
  );
};
