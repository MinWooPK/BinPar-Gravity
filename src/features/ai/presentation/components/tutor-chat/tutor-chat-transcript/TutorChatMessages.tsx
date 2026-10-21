"use client";

import { useTranslations } from "next-intl";

import { Sparkles } from "@/components/icons";
import { useTutorConversation } from "@/features/ai/presentation/hooks/useTutorConversation";

import type { TutorProposal } from "@/features/ai/types/proposal.types";

import { tutorContextLabel } from "../../tutorContextLabel";
import { TutorProposalCard } from "../TutorProposalCard";

type Props = {
  onApplied?: (proposal: TutorProposal) => void;
};

// Muestra los mensajes y las propuestas del Tutor IA.
export const TutorChatMessages = ({ onApplied }: Props) => {
  const traducir = useTranslations("Tutor");

  const { session, decideProposal } = useTutorConversation();

  // Mensaje de bienvenida.
  if (session.messages.length === 0) {
    return (
      <div
        className="lab-tutor-introduction flex min-h-28 flex-1 flex-col items-center justify-center py-5 text-center"
        data-tutor-welcome
      >
        <Sparkles className="mb-3 size-6 text-cyan-200/80" />

        <h3 className="m-0 text-lg font-semibold leading-snug text-slate-100">
          {traducir("emptyTitle")}
        </h3>

        <p className="mt-2 max-w-64 text-sm leading-relaxed text-slate-400">
          {traducir("emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      {session.messages.map((mensaje) => (
        <div
          key={mensaje.id}
          data-role={mensaje.role}
          className="mb-3 w-fit max-w-[94%] rounded-2xl border border-slate-500/25 bg-slate-800/45 px-3 py-2.5 
          text-sm leading-relaxed text-slate-200 data-[role=user]:ml-auto data-[role=user]:rounded-br-md
           data-[role=user]:border-[#67e8f930] data-[role=user]:bg-[#16405270]
            data-[role=user]:text-[#ecfeff] data-[role=assistant]:rounded-bl-md 
            has-data-tutor-proposal:w-full has-data-tutor-proposal:max-w-full 
            [&_p]:m-0 [&_p]:whitespace-pre-wrap [&_p]:wrap-anywhere"
        >
          <span className="sr-only">
            {traducir(mensaje.role === "user" ? "userLabel" : "assistantLabel")}
            :{" "}
          </span>

          <small className="mb-1.5 block text-[11px] leading-snug text-slate-400">
            {traducir("historicalMessage", {
              context: tutorContextLabel(mensaje.contextId, traducir),
            })}
          </small>

          <p>{mensaje.content}</p>

          {/* Propuestas de cambios del laboratorio. */}
          {mensaje.proposal && (
            <TutorProposalCard
              proposal={mensaje.proposal}
              onDecision={(decision) => {
                if (decideProposal(mensaje.id, decision) && mensaje.proposal) {
                  onApplied?.(mensaje.proposal);
                }
              }}
            />
          )}
        </div>
      ))}
    </>
  );
};
