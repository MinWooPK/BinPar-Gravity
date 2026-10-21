"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";

import { useTutorConversation } from "@/features/ai/presentation/hooks/useTutorConversation";

import type { TutorProposal } from "@/features/ai/types/proposal.types";
import type { TutorQuickAction } from "./tutor-chat-transcript/TutorChatTranscript";

import { TutorChatTranscript } from "./tutor-chat-transcript/TutorChatTranscript";
import { TutorChatComposer } from "./TutorChatComposer";

export type { TutorQuickAction } from "./tutor-chat-transcript/TutorChatTranscript";

type TutorChatProps = {
  id: string;
  actions?: readonly TutorQuickAction[];
  active?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  configure?: boolean;
  onApplied?: (proposal: TutorProposal) => void;
  onSubmit?: () => void;
  onConfigure?: () => void;
};

// Muestra los mensajes y el formulario del Tutor IA.
export const TutorChat = ({
  id,
  actions,
  active = true,
  inputRef,
  configure = false,
  onSubmit,
  onConfigure,
  onApplied,
}: TutorChatProps) => {
  const traducir = useTranslations("Tutor");
  const { session } = useTutorConversation();

  return (
    <div
      className="lab-tutor-chat flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden
        [&_:is(button,textarea):focus-visible]:outline-2
        [&_:is(button,textarea):focus-visible]:outline-offset-2
        [&_:is(button,textarea):focus-visible]:outline-cyan-200
        [&_:is(button,textarea):disabled]:cursor-not-allowed
        [&_:is(button,textarea):disabled]:opacity-45"
      data-long-conversation={session.messages.length >= 8}
    >
      {/* Mensajes del chat. */}
      <TutorChatTranscript
        id={id}
        active={active}
        configure={configure}
        actions={actions}
        onConfigure={onConfigure}
        onApplied={onApplied}
      />

      {/* Campo para enviar preguntas. */}
      <TutorChatComposer
        id={id}
        configure={configure}
        inputRef={inputRef}
        onSubmit={onSubmit}
      />

      {/* Aviso del Tutor IA. */}
      <p className="lab-tutor-disclaimer mx-4 mt-2 mb-3 shrink-0 text-center text-[11px] leading-snug text-slate-400">
        {traducir("disclaimer")}
      </p>
    </div>
  );
};
