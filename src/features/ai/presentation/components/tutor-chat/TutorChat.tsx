"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";

import { useTutorConversation } from "@/features/ai/presentation/hooks/useTutorConversation";

import type { TutorProposal } from "@/features/ai/types/proposal.types";
import type { TutorQuickAction } from "./TutorChatTranscript";

import { TutorChatTranscript } from "./TutorChatTranscript";
import { TutorChatComposer } from "./TutorChatComposer";

// Mantiene disponible el tipo para los componentes que lo importan.
export type { TutorQuickAction } from "./TutorChatTranscript";

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

// Integra los mensajes y el formulario del Tutor IA.
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
  const t = useTranslations("Tutor");
  const { session } = useTutorConversation();

  return (
    <div
      className="lab-tutor-chat flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden [&_button:focus-visible]:[outline:2px_solid_#a5f3fc] [&_button:focus-visible]:outline-offset-2 [&_textarea:focus-visible]:[outline:2px_solid_#a5f3fc] [&_textarea:focus-visible]:outline-offset-2 [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-45 [&_textarea:disabled]:cursor-not-allowed [&_textarea:disabled]:opacity-45"
      data-long-conversation={session.messages.length >= 8}
    >
      <TutorChatTranscript
        id={id}
        active={active}
        configure={configure}
        actions={actions}
        onConfigure={onConfigure}
        onApplied={onApplied}
      />

      <TutorChatComposer
        id={id}
        configure={configure}
        inputRef={inputRef}
        onSubmit={onSubmit}
      />

      <p className="lab-tutor-disclaimer mx-4 mt-2 mb-3 shrink-0 text-center text-[11px] leading-snug text-slate-400">{t("disclaimer")}</p>
    </div>
  );
};
