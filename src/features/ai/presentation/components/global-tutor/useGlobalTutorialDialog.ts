"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, SyntheticEvent } from "react";
import { useTranslations } from "next-intl";

import { useTutorConversation } from "../../hooks/useTutorConversation";
import { useTutorEnvironment } from "../../providers/tutorEnvironment";

import type { TutorProposal } from "../../../types/proposal.types";

// Controla la ventana del Tutor IA.
export const useGlobalTutorDialog = () => {
  const traducir = useTranslations("Tutor");

  const { session, ask } = useTutorConversation();

  const { openTutor, registerLauncher, context, highlight } =
    useTutorEnvironment();

  const [open, setOpen] = useState(false);
  const [configure, setConfigure] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const propuestaAplicadaRef = useRef(false);
  const focoAnteriorRef = useRef<HTMLElement | null>(null);

  // Permite abrir el chat desde otros componentes.
  useLayoutEffect(
    () =>
      registerLauncher((intencion, boton) => {
        propuestaAplicadaRef.current = false;
        focoAnteriorRef.current = boton ?? triggerRef.current;

        setOpen(true);
        setConfigure(intencion === "configure_experiment");

        if (typeof intencion === "object") {
          ask("explain", intencion.question, intencion.intent);
        }

        if (intencion === "explain_experiment") {
          ask("explain", traducir("experimentQuestion"), intencion);
        }

        if (intencion === "explain_formula") {
          highlight(null);
          ask("explain", traducir("formulaQuestion"), intencion);
        }
      }),
    [registerLauncher, ask, traducir, highlight],
  );

  // Abre o cierra la ventana.
  useEffect(() => {
    const dialogo = dialogRef.current;

    if (!dialogo) return;

    if (open && !dialogo.open) {
      dialogo.showModal();
      inputRef.current?.focus({ preventScroll: true });
    }

    if (!open && dialogo.open) {
      dialogo.close();
    }
  }, [open]);

  // Ajusta la ventana cuando aparece el teclado del móvil.
  useEffect(() => {
    if (!open) return;

    const vista = window.visualViewport;

    const actualizarVista = () => {
      const alto = vista?.height ?? window.innerHeight;

      const espacioTeclado = Math.max(
        0,
        window.innerHeight - alto - (vista?.offsetTop ?? 0),
      );

      dialogRef.current?.style.setProperty(
        "--tutor-available-height",
        `${Math.floor(alto)}px`,
      );

      dialogRef.current?.style.setProperty(
        "--tutor-keyboard-offset",
        `${Math.floor(espacioTeclado)}px`,
      );
    };

    actualizarVista();

    vista?.addEventListener("resize", actualizarVista);
    vista?.addEventListener("scroll", actualizarVista);
    window.addEventListener("resize", actualizarVista);

    return () => {
      vista?.removeEventListener("resize", actualizarVista);
      vista?.removeEventListener("scroll", actualizarVista);
      window.removeEventListener("resize", actualizarVista);
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

  // Cierra el chat con Escape.
  const handleCancel = (evento: SyntheticEvent<HTMLDialogElement>) => {
    evento.preventDefault();
    evento.stopPropagation();
    setOpen(false);
  };

  // Devuelve el foco al botón que abrió el chat.
  const handleClose = (evento: SyntheticEvent<HTMLDialogElement>) => {
    if (open || evento.currentTarget.open || propuestaAplicadaRef.current)
      return;

    const origen = focoAnteriorRef.current;

    (origen?.isConnected &&
    !origen.closest("[inert]") &&
    origen.getClientRects().length
      ? origen
      : triggerRef.current
    )?.focus({ preventScroll: true });
  };

  // Mantiene la navegación con Tab dentro del chat.
  const handleKeyDown = (evento: KeyboardEvent<HTMLDialogElement>) => {
    if (evento.key !== "Tab") return;

    const controles = [
      ...evento.currentTarget.querySelectorAll<HTMLElement>(
        "button:not(:disabled), textarea:not(:disabled)",
      ),
    ].filter((elemento) => elemento.getClientRects().length > 0);

    const primero = controles[0];
    const ultimo = controles[controles.length - 1];

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo?.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero?.focus();
    }
  };

  // Cierra el chat después de aplicar los cambios.
  const handleApplied = (propuesta: TutorProposal) => {
    propuestaAplicadaRef.current = true;

    dialogRef.current?.close();
    setOpen(false);
    setConfigure(false);

    propuesta.source.reveal();
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
