"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { useTutorConversation } from "@/features/ai/presentation/hooks/useTutorConversation";

import type { TutorProposal } from "@/features/ai/types/proposal.types";

import { TutorChatMessages } from "./TutorChatMessages";
import { TutorChatStatus } from "./TutorChatStatus";
import {
  TutorChatQuickActions,
  type TutorQuickAction,
} from "./TutorChatQuickActions";

export type { TutorQuickAction } from "./TutorChatQuickActions";

type TutorChatTranscriptProps = {
  id: string;
  active: boolean;
  configure: boolean;
  actions?: readonly TutorQuickAction[];
  onConfigure?: () => void;
  onApplied?: (proposal: TutorProposal) => void;
};

// Organiza el historial y las acciones del Tutor IA.
export const TutorChatTranscript = ({
  id,
  active,
  configure,
  actions,
  onConfigure,
  onApplied,
}: TutorChatTranscriptProps) => {
  const traducir = useTranslations("Tutor");
  const { session } = useTutorConversation();

  const historialRef = useRef<HTMLDivElement>(null);

  // Desplaza el chat hasta el último mensaje.
  useEffect(() => {
    const historial = historialRef.current;

    if (historial) {
      historial.scrollTop = historial.scrollHeight;
    }
  }, [session.messages.length, session.pending, active]);

  return (
    <div
      ref={historialRef}
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:thin] [scrollbar-color:#475569_transparent]"
      data-tutor-scroll-region
    >
      <div
        className={
          session.messages.length > 0 ? "shrink-0" : "flex flex-1 flex-col"
        }
        role="log"
        aria-label={traducir("conversation")}
        aria-live="polite"
        aria-relevant="additions"
        aria-atomic="false"
        aria-busy={session.pending}
      >
        <TutorChatMessages onApplied={onApplied} />
      </div>

      <TutorChatStatus id={id} configure={configure} />

      <TutorChatQuickActions actions={actions} onConfigure={onConfigure} />
    </div>
  );
};
