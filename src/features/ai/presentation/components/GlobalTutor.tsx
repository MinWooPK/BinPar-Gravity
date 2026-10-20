"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useTutorConversation } from "../hooks/useTutorConversation";
import { AtomIcon, MessageCircle, Trash2, X } from "@/components/icons/TutorIcons";
import { tutorContextId } from "../../application/tutorAvailability";
import { tutorContextLabel } from "./tutorContextLabel";
import { TutorChat, type TutorQuickAction } from "./TutorChat";
import { useTutorEnvironment } from "../providers/tutorEnvironment";

import css from "./GlobalTutor.module.css";

const styles = {
  trigger: `${css["trigger"]} fixed [right:max(1rem,_env(safe-area-inset-right))] [bottom:max(1rem,_env(safe-area-inset-bottom))] [z-index:60] inline-flex items-center justify-center [gap:.5rem] [min-width:56px] [min-height:56px] [padding:.75rem_1rem] [border:1px_solid_#67e8f970] [border-radius:1.25rem] [background:#102c3b] [color:#cffafe] [box-shadow:0_8px_24px_#0006] [font-size:.875rem] font-semibold cursor-pointer [transition:background_180ms,_border-color_180ms] [@media(max-width:480px)]:[min-width:48px] [@media(max-width:480px)]:[min-height:48px] [@media(max-width:480px)]:[padding:.625rem_.875rem]`,
  panel: `${css.panel} fixed m-0 w-[min(420px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-500/60 bg-linear-to-b from-[#141d30] to-[#0c1322] p-0 text-slate-100 shadow-[0_24px_80px_#0009]`,
  header: "flex shrink-0 items-center justify-between gap-2 border-b border-slate-500/20 px-3 py-2.5",
  headerButton: "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-400/10 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 motion-reduce:transition-none",
} as const;

export const GlobalTutor = () => {
  const t = useTranslations("Tutor");
  const { session, ask, clear } = useTutorConversation();
  const [configure, setConfigure] = useState(false);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { openTutor, registerLauncher, context, highlight } =
    useTutorEnvironment();
  const returnFocusRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(
    () =>
      registerLauncher((intent, trigger) => {
        returnFocusRef.current = trigger ?? triggerRef.current;
        setOpen(true);
        setConfigure(intent === "configure_experiment");
        if (typeof intent === "object")
          ask("explain", intent.question, intent.intent);
        if (intent === "explain_experiment")
          ask("explain", t("experimentQuestion"), intent);
        if (intent === "explain_formula") {
          highlight(null);
          ask("explain", t("formulaQuestion"), intent);
        }
      }),
    [registerLauncher, ask, t, highlight],
  );
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
    if (!open) return;
    const viewport = window.visualViewport;
    const updateViewport = () => {
      const height = viewport?.height ?? window.innerHeight;
      const keyboardOffset = Math.max(
        0,
        window.innerHeight - height - (viewport?.offsetTop ?? 0),
      );
      dialogRef.current?.style.setProperty(
        "--tutor-available-height",
        `${Math.floor(height)}px`,
      );
      dialogRef.current?.style.setProperty(
        "--tutor-keyboard-offset",
        `${Math.floor(keyboardOffset)}px`,
      );
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

  const stage = context.stage;
  const label = tutorContextLabel(tutorContextId(context), t);
  const showConfigure = open && configure && stage === "gravity-laboratory";
  useEffect(() => {
    if (showConfigure && !session.pending)
      inputRef.current?.focus({ preventScroll: true });
  }, [showConfigure, session.pending]);
  const actions: TutorQuickAction[] =
    context.kind === "gravity" && stage === "gravity-understanding"
      ? [
          {
            id: "formula",
            label: t("explainFormula"),
            question: t("formulaQuestion"),
            intent: "explain_formula",
            onSelect: () => highlight(null),
          },
          ...(["constant", "masses", "distance"] as const).map((term) => ({
            id: term,
            label: t(
              `formula${term === "constant" ? "Constant" : term === "masses" ? "Masses" : "Distance"}Question`,
            ),
            question: t(
              `formula${term === "constant" ? "Constant" : term === "masses" ? "Masses" : "Distance"}Question`,
            ),
            onSelect: () => highlight(term),
          })),
        ]
      : context.kind === "gravity" && stage === "gravity-laboratory"
        ? [
            {
              id: "explain-experiment",
              label: t("explainExperiment"),
              question: t("experimentQuestion"),
              intent: "explain_experiment",
            },
            {
              id: "increase-mass",
              label: t("experimentMassQuestion"),
              question: t("experimentMassQuestion"),
              intent: "explain_experiment",
            },
            {
              id: "increase-distance",
              label: t("experimentDistanceQuestion"),
              question: t("experimentDistanceQuestion"),
              intent: "explain_experiment",
            },
            {
              id: "configure-experiment",
              label: t("experimentConfigureAction"),
              question: "",
              compose: true,
            },
          ]
        : [
            {
              id: "current",
              label: t("explainCurrent"),
              question: t(
                stage === "gravity-challenges"
                  ? "practiceHintQuestion"
                  : "currentQuestion",
              ),
            },
          ];
  actions.push(
    {
      id: "simplify",
      label: t("simplify"),
      question: t("simplify"),
      mode: "simplify",
    },
    {
      id: "example",
      label: t("example"),
      question: t("example"),
      mode: "example",
    },
  );

  return (
    <>
      {
        <button
          ref={triggerRef}
          id="global-tutor-trigger"
          type="button"
          aria-label={t("open")}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="global-tutor-dialog"
          onClick={(event) => openTutor(undefined, event.currentTarget)}
          className={styles.trigger}
        >
          <AtomIcon />
          <span className={css.triggerText}>{t("shortLabel")}</span>
        </button>
      }
      <dialog
        ref={dialogRef}
        id="global-tutor-dialog"
        aria-labelledby="global-tutor-title"
        data-has-messages={session.messages.length > 0}
        className={styles.panel}
        onCancel={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }}
        onClose={(event) => {
          if (open || event.currentTarget.open) return;
          const origin = returnFocusRef.current;
          (origin?.isConnected &&
          !origin.closest("[inert]") &&
          origin.getClientRects().length
            ? origin
            : triggerRef.current
          )?.focus({ preventScroll: true });
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled), textarea:not(:disabled)",
            ),
          ].filter((element) => element.getClientRects().length > 0);
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
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-cyan-200/15 bg-cyan-300/10 text-cyan-200">
              <MessageCircle className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <h2 id="global-tutor-title" className="m-0 text-base leading-snug font-semibold">{t("title")}</h2>
              <p data-tutor-current-context className="mt-0.5 text-xs leading-snug text-slate-400 [overflow-wrap:anywhere]">{label}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {session.messages.length > 0 && <button
              type="button"
              onClick={() => {
                clear();
                requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
              }}
              data-tutor-clear
              aria-label={t("clearConversation")}
              title={t("clearConversation")}
              className={styles.headerButton}
            >
              <Trash2 className="size-[18px]" />
            </button>}
            <button
              type="button"
              data-tutor-close
              className={styles.headerButton}
              aria-label={t("close")}
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
        </header>
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
        />
      </dialog>
    </>
  );
};
