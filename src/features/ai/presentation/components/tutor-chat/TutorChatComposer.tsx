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
  const traducir = useTranslations("Tutor");
  const { key, session, update, ask } = useTutorConversation();

  return (
    <form
      className="mx-3 flex shrink-0 items-end gap-1.5 rounded-2xl border border-slate-500/50 bg-slate-950/60 p-1.5 focus-within:border-[#67e8f980]"
      onSubmit={(evento) => {
        evento.preventDefault();
        onSubmit?.();
        ask("explain", session.draft);
      }}
    >
      {/* Campo para escribir la pregunta. */}
      <label htmlFor={`${id}-question`} className="sr-only">
        {traducir("question")}
      </label>

      <textarea
        ref={inputRef}
        id={`${id}-question`}
        rows={1}
        className="field-sizing-content min-h-11 min-w-0 max-h-[clamp(44px,20cqh,120px)] flex-1 resize-y overflow-y-auto rounded-xl border-0 bg-transparent px-2 py-2.5 text-base leading-normal text-[#f8fafc] placeholder:text-[#94a3b8] placeholder:opacity-100"
        aria-describedby={configure ? `${id}-configure-hint` : undefined}
        value={session.draft}
        maxLength={TUTOR_MAX_MESSAGE_LENGTH}
        placeholder={traducir("question")}
        disabled={session.pending}
        onChange={(evento) => update(key, { draft: evento.target.value })}
      />

      {/* Envía la pregunta. */}
      <button
        type="submit"
        className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-[#67e8f940] bg-[#164052] text-[#cffafe] transition-colors duration-180 [&:hover:not(:disabled)]:border-[#67e8f9] [&:hover:not(:disabled)]:bg-[#1e5266] motion-reduce:transition-none"
        aria-label={traducir("send")}
        title={traducir("send")}
        disabled={session.pending || !session.draft.trim()}
      >
        <ArrowUp className="size-5" />
      </button>
    </form>
  );
};
