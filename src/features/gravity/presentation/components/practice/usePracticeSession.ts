"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";

import type {
  Answer,
  Locale,
  PracticeRequest,
  PracticeView,
} from "../../../types/practice/practice.types";

// Gestiona las preguntas y respuestas de la práctica.
export const usePracticeSession = () => {
  const locale = useLocale() as Locale;

  const [view, setView] = useState<PracticeView | null>(null);
  const [answer, setAnswer] = useState<Answer>({
    value: "",
    exponent: "",
  });

  const [hintOpen, setHintOpen] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lock = useRef(false);
  const abort = useRef<AbortController | null>(null);
  const last = useRef<PracticeRequest | null>(null);

  // Cancela la petición al desmontar el componente.
  useEffect(() => () => abort.current?.abort(), []);

  // Envía peticiones y actualiza la sesión.
  const request = async (body: PracticeRequest) => {
    if (lock.current) return;

    lock.current = true;
    setPending(true);
    setError(null);
    last.current = body;

    // Cancela la petición si supera los 65 segundos.
    const controller = new AbortController();
    abort.current = controller;

    const timeout = setTimeout(() => controller.abort(), 65000);

    try {
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const data = await response.json();

      // Gestiona los errores de la API.
      if (!response.ok) {
        setError(
          [
            "not_configured",
            "rate_limited",
            "invalid_session",
            "invalid_answer",
          ].includes(data.error)
            ? data.error
            : "unavailable",
        );
        return;
      }

      setView(data as PracticeView);

      // Limpia la respuesta al comenzar o avanzar.
      if (body.action !== "answer") {
        setAnswer({ value: "", exponent: "" });
        setHintOpen(false);
        setUsedHint(false);
      }
    } catch {
      if (abort.current === controller) {
        setError("unavailable");
      }
    } finally {
      clearTimeout(timeout);
      lock.current = false;
      setPending(false);
    }
  };

  // Estado y acciones de la práctica.
  return {
    view,
    answer,
    setAnswer,
    hintOpen,
    pending,
    error,

    toggleHint: () => {
      setHintOpen((value) => !value);
      setUsedHint(true);
    },

    start: () => void request({ action: "start", locale }),

    check: () => {
      if (view) {
        void request({
          action: "answer",
          token: view.token,
          answer,
          usedHint,
        });
      }
    },

    next: () => {
      if (view) {
        void request({ action: "next", token: view.token });
      }
    },

    retry: () => {
      if (last.current) {
        void request(last.current);
      }
    },
  };
};
