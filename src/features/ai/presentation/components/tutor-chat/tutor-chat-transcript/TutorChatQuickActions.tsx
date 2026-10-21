"use client";

import { useTranslations } from "next-intl";

import { useTutorConversation } from "@/features/ai/presentation/hooks/useTutorConversation";

import type { TutorRequest } from "@/features/ai/types/tutor.types";

export type TutorQuickAction = {
  id: string;
  label: string;
  question: string;
  mode?: TutorRequest["mode"];
  intent?: TutorRequest["intent"];
  onSelect?: () => void;
  compose?: boolean;
};

type Props = {
  actions?: readonly TutorQuickAction[];
  onConfigure?: () => void;
};

// Muestra las preguntas rápidas y gestiona su selección.
export const TutorChatQuickActions = ({ actions, onConfigure }: Props) => {
  const traducir = useTranslations("Tutor");

  const { session, ask } = useTutorConversation();

  // Preguntas disponibles por defecto.
  const accionesRapidas: readonly TutorQuickAction[] = actions ?? [
    {
      id: "explain-experiment",
      label: traducir("explainExperiment"),
      question: traducir("experimentQuestion"),
    },
    {
      id: "simplify",
      label: traducir("simplify"),
      question: traducir("simplify"),
      mode: "simplify",
    },
    {
      id: "example",
      label: traducir("example"),
      question: traducir("example"),
      mode: "example",
    },
  ];

  return (
    <div
      className="flex shrink-0 flex-wrap gap-1.5 pt-2"
      aria-label={traducir("quickActions")}
      role="group"
    >
      {accionesRapidas.map((accion) => (
        <button
          key={accion.id}
          type="button"
          disabled={session.pending}
          data-tutor-action={accion.id}
          data-explain-experiment={
            accion.id === "explain-experiment" || undefined
          }
          className="min-h-8 max-w-full cursor-pointer rounded-full border border-[#94a3b830] bg-[#64748b0a] 
          px-2.5 py-1 text-left text-xs leading-[1.4] text-[#cbd5e1] wrap-anywhere transition-colors duration-180 
          [&:hover:not(:disabled)]:border-[#67e8f960] [&:hover:not(:disabled)]:bg-[#67e8f910]
           [&:hover:not(:disabled)]:text-[#ecfeff] [.lab-tutor-chat[data-long-conversation=true]_&]:border-[#94a3b820] 
           [.lab-tutor-chat[data-long-conversation=true]_&]:bg-transparent [.lab-tutor-chat[data-long-conversation=true]_&]:text-[#94a3b8]
            [.lab-tutor-chat[data-long-conversation=true]_&:hover:not(:disabled)]:border-[#67e8f960]
             [.lab-tutor-chat[data-long-conversation=true]_&:hover:not(:disabled)]:bg-transparent
              [.lab-tutor-chat[data-long-conversation=true]_&:hover:not(:disabled)]:text-[#ecfeff] 
              motion-reduce:transition-none"
          onClick={() => {
            accion.onSelect?.();

            if (accion.compose) {
              onConfigure?.();
            } else {
              ask(accion.mode ?? "explain", accion.question, accion.intent);
            }
          }}
        >
          {accion.label}
        </button>
      ))}
    </div>
  );
};
