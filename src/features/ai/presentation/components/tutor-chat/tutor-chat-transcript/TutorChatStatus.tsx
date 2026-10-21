"use client";

import { useTranslations } from "next-intl";

import { useTutorConversation } from "@/features/ai/presentation/hooks/useTutorConversation";
import { useTutorEnvironment } from "@/features/ai/presentation/providers/tutorEnvironment";

type Props = {
  id: string;
  configure: boolean;
};

// Muestra errores, avisos y el estado de respuesta del Tutor IA.
export const TutorChatStatus = ({ id, configure }: Props) => {
  const traducir = useTranslations("Tutor");

  const { key, session, performRequest } = useTutorConversation();
  const { context } = useTutorEnvironment();

  const contextoCambiado =
    !!session.snapshot &&
    !!context &&
    session.snapshot !== JSON.stringify(context);

  return (
    <>
      {/* Indica que la IA está respondiendo. */}
      <div
        className="text-xs leading-relaxed text-cyan-200"
        aria-atomic="true"
        role="status"
      >
        {session.pending ? traducir("thinking") : ""}
      </div>

      {/* Error al enviar una petición. */}
      {session.error && (
        <div className="my-2 rounded-xl border border-amber-300/20 bg-amber-950/20 p-2.5 text-sm text-amber-100">
          <p role="alert" className="mb-2">
            {traducir(session.error)}
          </p>

          {session.request && (
            <button
              type="button"
              className="min-h-9 cursor-pointer rounded-[10px] border border-[#67e8f940] px-2.5 py-1.5 text-[#cffafe]"
              disabled={session.pending}
              onClick={() => {
                if (session.request) {
                  void performRequest(key, session.request);
                }
              }}
            >
              {traducir("retry")}
            </button>
          )}
        </div>
      )}

      {/* Avisa de un cambio de contexto. */}
      {contextoCambiado && (
        <p
          data-tutor-context-changed
          className="my-2 text-xs leading-relaxed text-slate-400"
        >
          {traducir("contextChanged")}
        </p>
      )}

      {/* Ayuda para configurar el laboratorio. */}
      {configure && (
        <p
          id={`${id}-configure-hint`}
          role="status"
          className="my-2 text-sm leading-relaxed text-cyan-100"
        >
          {traducir("configureInvitation")}
        </p>
      )}
    </>
  );
};
