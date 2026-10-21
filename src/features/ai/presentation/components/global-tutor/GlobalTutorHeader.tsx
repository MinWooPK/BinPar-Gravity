"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";

import { MessageCircle, Trash2, X } from "@/components/icons";

import { tutorContextId } from "../../../application/tutorAvailability";
import { tutorContextLabel } from "../tutorContextLabel";
import { useTutorConversation } from "../../hooks/useTutorConversation";
import { useTutorEnvironment } from "../../providers/tutorEnvironment";

type GlobalTutorHeaderProps = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
};

const headerButton =
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-400/10 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 motion-reduce:transition-none";

// Muestra el título y los botones del chat.
export const GlobalTutorHeader = ({
  inputRef,
  onClose,
}: GlobalTutorHeaderProps) => {
  const traducir = useTranslations("Tutor");

  const { session, clear } = useTutorConversation();
  const { context } = useTutorEnvironment();

  const etiqueta = tutorContextLabel(tutorContextId(context), traducir);

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-500/20 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-cyan-200/15 bg-cyan-300/10 text-cyan-200">
          <MessageCircle className="size-4.5" />
        </span>

        <div className="min-w-0">
          <h2
            id="global-tutor-title"
            className="m-0 text-base leading-snug font-semibold"
          >
            {traducir("title")}
          </h2>

          <p
            data-tutor-current-context
            className="mt-0.5 text-xs leading-snug text-slate-400 wrap-anywhere"
          >
            {etiqueta}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {/* Borra los mensajes del chat. */}
        {session.messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clear();

              requestAnimationFrame(() =>
                inputRef.current?.focus({
                  preventScroll: true,
                }),
              );
            }}
            data-tutor-clear
            aria-label={traducir("clearConversation")}
            title={traducir("clearConversation")}
            className={headerButton}
          >
            <Trash2 className="size-4.5" />
          </button>
        )}

        {/* Cierra el chat. */}
        <button
          type="button"
          data-tutor-close
          className={headerButton}
          aria-label={traducir("close")}
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
      </div>
    </header>
  );
};
