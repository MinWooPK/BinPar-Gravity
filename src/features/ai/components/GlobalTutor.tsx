"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { TUTOR_MAX_MESSAGE_LENGTH, TUTOR_TIMEOUT_MS } from "../application/tutor";
import type { TutorMessage, TutorRequest } from "../application/tutor";
import { gravityStageById } from "@/features/gravity/components/gravityJourney";
import { useTutorEnvironment } from "./TutorProvider";
import { requestHistory } from "./conversation";
import styles from "./GlobalTutor.module.css";

type ChatMessage = TutorMessage & { id: number };
type Session = {
  messages: ChatMessage[];
  draft: string;
  pending: boolean;
  error: "error" | "notConfigured" | "rateLimited" | "contextUnavailable" | "";
  request?: TutorRequest;
  snapshot?: string;
};
const emptySession = (): Session => ({ messages: [], draft: "", pending: false, error: "" });

export const GlobalTutor = () => {
  const t = useTranslations("Tutor");
  const gravity = useTranslations("Gravity");
  const locale = useLocale() as TutorRequest["locale"];
  const pathname = usePathname();
  const { sessionKey, current } = useTutorEnvironment();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const sessionsRef = useRef(sessions);
  const inFlight = useRef(new Set<string>());
  const controllers = useRef(new Set<AbortController>());
  const sequence = useRef(0);
  const mounted = useRef(true);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const open = sessionKey !== null && openPath === pathname;
  const key = sessionKey ?? "";
  const session = sessions[key] ?? emptySession();

  const update = (target: string, patch: Partial<Session>) => {
    const next = { ...sessionsRef.current, [target]: { ...(sessionsRef.current[target] ?? emptySession()), ...patch } };
    sessionsRef.current = next;
    setSessions(next);
  };

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

  useEffect(() => {
    mounted.current = true;
    const activeControllers = controllers.current;
    return () => {
      mounted.current = false;
      activeControllers.forEach((controller) => controller.abort());
    };
  }, []);

  const performRequest = async (target: string, request: TutorRequest) => {
    if (inFlight.current.has(target)) return;
    inFlight.current.add(target);
    update(target, { pending: true, error: "", request, snapshot: JSON.stringify(request.context) });
    const controller = new AbortController();
    controllers.current.add(controller);
    const timeout = window.setTimeout(() => controller.abort(), TUTOR_TIMEOUT_MS + 5000);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      const data: { text?: unknown; error?: unknown } = await response.json();
      if (!mounted.current) return;
      if (!response.ok) {
        update(target, { error: data.error === "not_configured" ? "notConfigured" : response.status === 429 ? "rateLimited" : "error" });
      } else if (typeof data.text !== "string" || !data.text.trim()) {
        update(target, { error: "error" });
      } else {
        const previous = sessionsRef.current[target] ?? emptySession();
        update(target, { messages: [...previous.messages, { id: ++sequence.current, role: "assistant" as const, content: data.text.trim() }].slice(-48) });
      }
    } catch {
      if (mounted.current) update(target, { error: "error" });
    } finally {
      window.clearTimeout(timeout);
      controllers.current.delete(controller);
      inFlight.current.delete(target);
      if (mounted.current) update(target, { pending: false });
    }
  };

  const ask = (mode: TutorRequest["mode"], question: string) => {
    const content = question.trim();
    if (!sessionKey || !content || content.length > TUTOR_MAX_MESSAGE_LENGTH || inFlight.current.has(key)) return;
    const page = current();
    if (!page) { update(key, { error: "contextUnavailable" }); return; }
    const previous = sessionsRef.current[key] ?? emptySession();
    const messages: ChatMessage[] = [...previous.messages, { id: ++sequence.current, role: "user" as const, content }].slice(-48);
    update(key, { messages, draft: "" });
    void performRequest(key, { locale, mode, context: page.context, messages: requestHistory(messages) });
  };

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
