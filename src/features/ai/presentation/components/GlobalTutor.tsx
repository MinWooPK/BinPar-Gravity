"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { TUTOR_MAX_MESSAGE_LENGTH } from "../../application/tutor";
import { gravityStageById } from "@/features/gravity/application/gravityJourney";
import { useTutorConversation } from "../hooks/useTutorConversation";
import css from "./GlobalTutor.module.css";

const styles = {
  "trigger": `${css["trigger"]} fixed [right:max(1rem,_env(safe-area-inset-right))] [bottom:max(1rem,_env(safe-area-inset-bottom))] [z-index:60] inline-flex items-center justify-center [gap:.5rem] [min-width:56px] [min-height:56px] [padding:.75rem_1rem] [border:1px_solid_#67e8f970] [border-radius:1.25rem] [background:#102c3b] [color:#cffafe] [box-shadow:0_8px_24px_#0006] [font-size:.875rem] font-semibold cursor-pointer [transition:background_180ms,_border-color_180ms] [@media(max-width:480px)]:[min-width:48px] [@media(max-width:480px)]:[min-height:48px] [@media(max-width:480px)]:[padding:.625rem_.875rem]`,
  "panel": `${css["panel"]} [container-type:size] fixed [inset:auto_max(1rem,_env(safe-area-inset-right))_calc(max(1rem,_env(safe-area-inset-bottom))_+_var(--tutor-keyboard-offset,_0px))_auto] [width:min(420px,_calc(100vw_-_2rem))] [height:min(680px,_calc(var(--tutor-available-height,_100dvh)_-_2rem))] [max-width:calc(100vw_-_2rem)] [max-height:calc(var(--tutor-available-height,_100dvh)_-_2rem)] m-0 p-0 overflow-hidden [border:1px_solid_#6d6591] [border-radius:1.25rem] [background:#101626] [color:#f8fafc] [box-shadow:0_24px_80px_#0008] [@media(max-width:480px)]:[inset:auto_0_var(--tutor-keyboard-offset,_0px)] [@media(max-width:480px)]:w-full [@media(max-width:480px)]:max-w-full [@media(max-width:480px)]:[height:min(680px,_calc(var(--tutor-available-height,_100dvh)_-_1rem))] [@media(max-width:480px)]:[max-height:calc(var(--tutor-available-height,_100dvh)_-_1rem)] [@media(max-width:480px)]:[border-radius:1.25rem_1.25rem_0_0]`,
  "composer": `${css["composer"]} flex shrink-0 [align-items:flex-end] [gap:.5rem] [padding:.5rem_1rem] [@media(max-width:480px)]:[padding-inline:.875rem]`,
  "header": `${css["header"]} flex shrink-0 [align-items:flex-start] justify-between [gap:.75rem] [padding:1rem] [border-bottom:1px_solid_#334155] [@media(max-width:480px)]:[padding-inline:.875rem]`,
  "close": `${css["close"]} inline-flex [min-width:44px] [min-height:44px] shrink-0 items-center justify-center [border:1px_solid_#475569] [border-radius:.75rem] [background:transparent] [color:#e2e8f0] [font-size:1.5rem] cursor-pointer`,
  "transcript": "[flex:1] min-h-0 [padding:1rem] overflow-y-auto [overscroll-behavior:contain] [scrollbar-width:thin] [scrollbar-color:#75669f_#101626] [@media(max-width:480px)]:[padding-inline:.875rem]",
  "introduction": "m-0 [color:#cbd5e1] [font-size:1rem] [line-height:1.6]",
  "message": `${css["message"]} [margin:0_0_.75rem] [padding:.75rem] [border:1px_solid_#334155] [border-radius:.875rem] [background:#171f32] [font-size:1rem] [line-height:1.6]`,
  "quickActions": `${css["quickActions"]} flex shrink-0 flex-wrap [gap:.375rem] [padding:.5rem_1rem] [border-top:1px_solid_#334155] [@media(max-width:480px)]:[padding-inline:.875rem]`,
  "error": `${css["error"]} [margin:.75rem_0] [color:#fde68a] [font-size:.875rem]`,
  "disclaimer": `${css["disclaimer"]} shrink-0 [margin:.25rem_1rem_.875rem] [color:#a8b4c7] [font-size:.75rem] [line-height:1.5] [@media(max-width:480px)]:[margin-bottom:max(.75rem,_env(safe-area-inset-bottom))]`,
  "contextNote": "[margin:.75rem_0_0] [color:#a5f3fc] [font-size:.875rem] [line-height:1.5]",
} as const;

export const GlobalTutor = () => {
  const t = useTranslations("Tutor");
  const gravity = useTranslations("Gravity");
  const pathname = usePathname();
  const { sessionKey, current, key, session, update, performRequest, ask } = useTutorConversation();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const open = sessionKey !== null && openPath === pathname;
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus({ preventScroll: true });
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
  }, [session.messages.length, session.pending, open]);

  useEffect(() => {
    if (!open) return;
    const viewport = window.visualViewport;
    const updateViewport = () => {
      const height = viewport?.height ?? window.innerHeight;
      const keyboardOffset = Math.max(0, window.innerHeight - height - (viewport?.offsetTop ?? 0));
      dialogRef.current?.style.setProperty("--tutor-available-height", `${Math.floor(height)}px`);
      dialogRef.current?.style.setProperty("--tutor-keyboard-offset", `${Math.floor(keyboardOffset)}px`);
    };
    updateViewport();
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);
    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, [open]);

  const page = current();
  const stage = page?.context.kind === "gravity" ? page.context.stage : null;
  const label = page?.context.kind === "gravity"
    ? (stage ? gravity(gravityStageById[stage].title) : t("gravityContext"))
    : page?.label ?? (page?.context.kind === "three-body" && page.context.slug ? t("orbitContext", { name: page.context.slug }) : t("galleryContext"));
  const contextChanged = !!session.snapshot && !!page && session.snapshot !== JSON.stringify(page.context);

  return (
    <>
      {sessionKey && (
        <button
          ref={triggerRef}
          id="global-tutor-trigger"
          type="button"
          aria-label={t("open")}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="global-tutor-dialog"
          onClick={() => setOpenPath(pathname)}
          className={styles.trigger}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z" strokeLinejoin="round" /><path d="M7 9h10M7 13h6" strokeLinecap="round" /></svg>
          <span>{t("shortLabel")}</span>
        </button>
      )}
      <dialog
        ref={dialogRef}
        id="global-tutor-dialog"
        aria-labelledby="global-tutor-title"
        className={styles.panel}
        onCancel={(event) => { event.preventDefault(); event.stopPropagation(); setOpenPath(null); }}
        onClose={() => { setOpenPath(null); triggerRef.current?.focus({ preventScroll: true }); }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), textarea:not(:disabled)")]
            .filter((element) => element.getClientRects().length > 0);
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <header className={styles.header}>
          <div><h2 id="global-tutor-title">{t("title")}</h2><p>{label}</p></div>
          <button type="button" className={styles.close} aria-label={t("close")} onClick={() => setOpenPath(null)}>×</button>
        </header>
        <div ref={transcriptRef} className={styles.transcript} role="log" aria-label={t("conversation")} aria-live="polite" aria-busy={session.pending}>
          {session.messages.length === 0 && <p className={styles.introduction}>{t("description")}</p>}
          {session.messages.map((message) => (
            <div key={message.id} className={styles.message} data-role={message.role}>
              <span className="sr-only">{t(message.role === "user" ? "userLabel" : "assistantLabel")}: </span>
              <p>{message.content}</p>
            </div>
          ))}
          {session.pending && <p role="status">{t("thinking")}</p>}
          {session.error && (
            <div className={styles.error}>
              <p role="alert">{t(session.error)}</p>
              {session.request && <button type="button" onClick={() => {
                const page = current();
                if (session.request && page) void performRequest(key, { ...session.request, context: page.context });
              }} disabled={session.pending}>{t("retry")}</button>}
            </div>
          )}
          {contextChanged && <p className={styles.contextNote}>{t("contextChanged")}</p>}
        </div>
        <div className={styles.quickActions} aria-label={t("quickActions")} role="group">
          {(["explain", "simplify", "example"] as const).map((mode) => <button key={mode} type="button" disabled={session.pending} onClick={() => ask(mode, t(mode))}>{t(mode)}</button>)}
        </div>
        <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); ask("explain", session.draft); }}>
          <label htmlFor="global-tutor-question" className="sr-only">{t("question")}</label>
          <textarea ref={inputRef} id="global-tutor-question" rows={2} value={session.draft} maxLength={TUTOR_MAX_MESSAGE_LENGTH} placeholder={t("question")} disabled={session.pending} onChange={(event) => update(key, { draft: event.target.value })} />
          <button type="submit" disabled={session.pending || !session.draft.trim()}>{t("send")}</button>
        </form>
        <p className={styles.disclaimer}>{t("disclaimer")}</p>
      </dialog>
    </>
  );
};
