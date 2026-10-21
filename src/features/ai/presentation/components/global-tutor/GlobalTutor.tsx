"use client";

import { useTranslations } from "next-intl";

import { AtomIcon } from "@/components/icons";

import { useTutorConversation } from "../../hooks/useTutorConversation";
import { TutorChat } from "../tutor-chat/TutorChat";

import { GlobalTutorHeader } from "./GlobalTutorHeader";
import { useGlobalTutorDialog } from "./useGlobalTutorialDialog";
import { useTutorQuickActions } from "./useTutorQuickActions";

// Integra el botón flotante y el diálogo del Tutor IA.
export const GlobalTutor = () => {
  const t = useTranslations("Tutor");
  const { session } = useTutorConversation();

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

  const actions = useTutorQuickActions();

  return (
    <>
      {/* Botón flotante del Tutor IA. */}
      <button
        ref={triggerRef}
        id="global-tutor-trigger"
        type="button"
        aria-label={t("open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="global-tutor-dialog"
        onClick={(event) => openTutor(undefined, event.currentTarget)}
        className="fixed right-[calc(24px+env(safe-area-inset-right,0px))] bottom-[calc(24px+env(safe-area-inset-bottom,0px))] z-60 inline-flex min-h-14 min-w-14 cursor-pointer items-center justify-center gap-2.5 rounded-[999px] border border-[#438eca] [background:linear-gradient(135deg,#162d43,#10273d)] px-5 py-3 text-[14px] font-semibold whitespace-nowrap text-white [box-shadow:0_8px_24px_#0008,0_0_15px_#38bdf840] [transition:transform_220ms,box-shadow_220ms,border-color_220ms,background_220ms] [&:hover]:[transform:translateY(-3px)] [&:hover]:border-[#67e8f9] [&:hover]:[background:#1a3a53] [&:hover]:[box-shadow:0_10px_30px_#0009,0_0_24px_#38bdf877] [@media(max-width:767px)]:right-[calc(16px+env(safe-area-inset-right,0px))] [@media(max-width:767px)]:bottom-[calc(16px+env(safe-area-inset-bottom,0px))] [@media(max-width:767px)]:size-14 [@media(max-width:767px)]:p-0 motion-reduce:[transition:none]"
      >
        <AtomIcon className="size-6 shrink-0 text-[#88cfff] [@media(max-width:767px)]:size-[27px]" />
        <span className="inline [@media(max-width:767px)]:hidden">{t("shortLabel")}</span>
      </button>

      {/* Diálogo global de conversación. */}
      <dialog
        ref={dialogRef}
        id="global-tutor-dialog"
        aria-labelledby="global-tutor-title"
        data-has-messages={session.messages.length > 0}
        className="fixed m-0 w-[min(420px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-500/60 bg-linear-to-b from-[#141d30] to-[#0c1322] p-0 text-slate-100 shadow-[0_24px_80px_#0009] [container-type:size] [inset:auto_max(1rem,env(safe-area-inset-right))_calc(max(1rem,env(safe-area-inset-bottom))+var(--tutor-keyboard-offset,0px))_auto] h-[min(440px,calc(var(--tutor-available-height,100dvh)-2rem))] max-h-[calc(var(--tutor-available-height,100dvh)-2rem)] data-[has-messages=true]:h-[min(620px,calc(var(--tutor-available-height,100dvh)-2rem))] [&[open]]:flex [&[open]]:flex-col [&:not([open])]:hidden backdrop:bg-[#02071380] [@media(max-width:480px)]:[inset:auto_0_var(--tutor-keyboard-offset,0px)] [@media(max-width:480px)]:w-full [@media(max-width:480px)]:max-w-full [@media(max-width:480px)]:rounded-[1.25rem_1.25rem_0_0]"
        onCancel={handleCancel}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
      >
        <GlobalTutorHeader inputRef={inputRef} onClose={() => setOpen(false)} />

        <TutorChat
          active={open}
          id="global-tutor"
          inputRef={inputRef}
          actions={actions}
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
