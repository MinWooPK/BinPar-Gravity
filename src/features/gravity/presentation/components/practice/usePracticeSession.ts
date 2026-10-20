"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";

import type {
  Answer,
  Locale,
  PracticeRequest,
  PracticeView,
} from "../../../types/practice/practice.types";

// Gestiona el estado y las peticiones de la práctica educativa,
// manteniendo la sesión al cambiar entre las etapas de Gravity Lab.
export const usePracticeSession = () => {
  // Obtiene el idioma actual de la aplicación.
  const locale = useLocale() as Locale;

  // Almacena la pregunta, corrección e informe de la sesión.
  const [view, setView] = useState<PracticeView | null>(null);

  // Guarda la respuesta introducida por el usuario.
  const [answer, setAnswer] = useState<Answer>({
    value: "",
    exponent: "",
  });

  // Controla la visibilidad de las pistas y si el usuario las ha utilizado.
  const [hintOpen, setHintOpen] = useState(false),
    [usedHint, setUsedHint] = useState(false);

  // Controla el estado de las peticiones y los posibles errores.
  const [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null);

  // Guarda el bloqueo de peticiones, su controlador y la última solicitud.
  const lock = useRef(false),
    abort = useRef<AbortController | null>(null),
    last = useRef<PracticeRequest | null>(null);

  // Cancela cualquier petición pendiente cuando se desmonta el componente.
  useEffect(() => () => abort.current?.abort(), []);

  // Envía peticiones a la API de práctica y actualiza
  // el estado de la sesión con la respuesta recibida.
  const request = async (body: PracticeRequest) => {
    if (lock.current) return;

    lock.current = true;
    setPending(true);
    setError(null);
    last.current = body;

    // Crea un controlador para cancelar la petición.
    const controller = new AbortController();
    abort.current = controller;

    // Establece un tiempo máximo de espera de 65 segundos.
    const timeout = setTimeout(() => controller.abort(), 65000);

    try {
      // Envía la solicitud al endpoint de la práctica.
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      // Obtiene los datos devueltos por la API.
      const data = await response.json();

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

  // Expone el estado de la práctica y las funciones para
  // iniciar, corregir, avanzar, mostrar pistas y reintentar.
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
      if (view)
        void request({
          action: "answer",
          token: view.token,
          answer,
          usedHint,
        });
    },

    next: () => {
      if (view) void request({ action: "next", token: view.token });
    },

    retry: () => {
      if (last.current) void request(last.current);
    },
  };
};
