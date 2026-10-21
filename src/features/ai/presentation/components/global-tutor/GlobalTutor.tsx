"use client";

import { useTranslations } from "next-intl";
import { AtomIcon } from "@/components/icons";

import { useTutorConversation } from "../../hooks/useTutorConversation";
import { TutorChat } from "../tutor-chat/TutorChat";

import { GlobalTutorHeader } from "./GlobalTutorHeader";
import { useGlobalTutorDialog } from "./useGlobalTutorialDialog";
import { useTutorQuickActions } from "./useTutorQuickActions";

// Muestra el botón flotante y el chat del Tutor IA.
export const GlobalTutor = () => {
  const traducir = useTranslations("Tutor");
  const { session } = useTutorConversation();

  // Controla la apertura y el cierre del chat.
  const {
    open,
    setOpen,
    setConfigure,
    showConfigure,
    openTutor,
    dialogRef,
    triggerRef,
    inputRef,
    handleCancel,
    handleClose,
    handleKeyDown,
    handleApplied,
  } = useGlobalTutorDialog();

  const acciones = useTutorQuickActions();

  return (
    <>
      {/* Botón para abrir el Tutor IA. */}
      <button
        ref={triggerRef}
        id="global-tutor-trigger"
        type="button"
        aria-label={traducir("open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="global-tutor-dialog"
        onClick={(evento) => openTutor(undefined, evento.currentTarget)}
        className=" fixed right-4 bottom-4 z-60 inline-flex size-14 items-center justify-center gap-2.5  rounded-full border border-sky-500/60
           bg-linear-to-br from-slate-800 to-slate-900 cursor-pointer text-sm font-semibold whitespace-nowrap text-white  shadow-xl shadow-sky-400/25
           transition-all duration-200
           hover:-translate-y-1
         hover:border-cyan-300
         hover:from-slate-700 hover:to-slate-800
           hover:shadow-sky-400/40
           md:right-6 md:bottom-6 md:w-auto md:px-5
           motion-reduce:hover:translate-y-0
           motion-reduce:transition-none
           "
      >
        <AtomIcon className="size-6.75 shrink-0 text-[#88cfff] md:size-6" />-{" "}
        <span className="hidden md:inline">{traducir("shortLabel")}</span>
      </button>

      {/* Ventana del chat. */}
      <dialog
        ref={dialogRef}
        id="global-tutor-dialog"
        aria-labelledby="global-tutor-title"
        data-has-messages={session.messages.length > 0}
        className=" fixed top-auto left-auto right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(max(1rem,env(safe-area-inset-bottom))+var(--tutor-keyboard-offset,0px))]
        m-0 hidden w-[calc(100vw-2rem)] max-w-105 h-110 max-h-[calc(var(--tutor-available-height,100dvh)-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-500/60
        bg-linear-to-b from-[#141d30] to-[#0c1322] p-0 text-slate-100 shadow-[0_24px_80px_#0009]
        @container-size
        open:flex
        data-[has-messages=true]:h-155  backdrop:bg-[#02071380]
         max-[480px]:inset-x-0
         max-[480px]:bottom-(--tutor-keyboard-offset,0px)
         max-[480px]:w-full
         max-[480px]:max-w-full
         max-[480px]:rounded-t-[1.25rem]
         max-[480px]:rounded-b-none"
        onCancel={handleCancel}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
      >
        {/* Cabecera del chat. */}
        <GlobalTutorHeader inputRef={inputRef} onClose={() => setOpen(false)} />

        {/* Conversación con la IA. */}
        <TutorChat
          active={open}
          id="global-tutor"
          inputRef={inputRef}
          actions={acciones}
          configure={showConfigure}
          onConfigure={() => {
            setConfigure(true);
            inputRef.current?.focus();
          }}
          onSubmit={() => setConfigure(false)}
          onApplied={handleApplied}
        />
      </dialog>
    </>
  );
};
