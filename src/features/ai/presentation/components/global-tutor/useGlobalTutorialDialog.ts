"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { KeyboardEvent, SyntheticEvent } from "react";
import { useTranslations } from "next-intl";

import { useTutorConversation } from "../../hooks/useTutorConversation";
import { useTutorEnvironment } from "../../providers/tutorEnvironment";

import type { TutorProposal } from "../../../types/proposal.types";

// Controla la apertura, el foco y el comportamiento del diálogo.
export const useGlobalTutorDialog = () => {
  const t = useTranslations("Tutor");

  const { session, ask } = useTutorConversation();

  const { openTutor, registerLauncher, context, highlight } =
    useTutorEnvironment();

  const [open, setOpen] = useState(false);
  const [configure, setConfigure] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const appliedRef = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Permite abrir el Tutor IA desde otras secciones.
  useLayoutEffect(
    () =>
      registerLauncher((intent, trigger) => {
        appliedRef.current = false;
        returnFocusRef.current = trigger ?? triggerRef.current;

        setOpen(true);
        setConfigure(intent === "configure_experiment");

        if (typeof intent === "object") {
          ask("explain", intent.question, intent.intent);
        }

        if (intent === "explain_experiment") {
          ask("explain", t("experimentQuestion"), intent);
        }

        if (intent === "explain_formula") {
          highlight(null);
          ask("explain", t("formulaQuestion"), intent);
        }
      }),
    [registerLauncher, ask, t, highlight],
  );

  // Sincroniza el estado de React con el diálogo nativo.
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus({ preventScroll: true });
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Ajusta el diálogo al teclado virtual del móvil.
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

  const showConfigure =
    open && configure && context.stage === "gravity-laboratory";

  // Enfoca el campo de texto durante la configuración.
  useEffect(() => {
    if (showConfigure && !session.pending) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [showConfigure, session.pending]);

  // Cierra el diálogo mediante Escape.
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
  };

  // Devuelve el foco al elemento que abrió el Tutor IA.
  const handleClose = (event: SyntheticEvent<HTMLDialogElement>) => {
    if (open || event.currentTarget.open || appliedRef.current) return;

    const origin = returnFocusRef.current;

    (origin?.isConnected &&
    !origin.closest("[inert]") &&
    origin.getClientRects().length
      ? origin
      : triggerRef.current
    )?.focus({ preventScroll: true });
  };

  // Mantiene la navegación con Tab dentro del diálogo.
  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
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
  };

  // Cierra el chat y muestra el laboratorio tras aplicar una propuesta.
  const handleApplied = (proposal: TutorProposal) => {
    appliedRef.current = true;

    dialogRef.current?.close();
    setOpen(false);
    setConfigure(false);

    proposal.source.reveal();
  };

  return {
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
  };
};
