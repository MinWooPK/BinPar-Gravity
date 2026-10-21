"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { usePathname } from "@/i18n/navigation";
import type { TutorContext } from "../../types/tutor.types";
import { initialParameters } from "@/features/gravity/domain/gravitation";

import {
  EnvironmentContext,
  useTutorEnvironment,
  type PublishedContext,
  type TutorLauncher,
} from "./tutorEnvironment";

import { GlobalTutor } from "../components/global-tutor/GlobalTutor";
import { TutorConversationProvider } from "../hooks/useTutorConversation";

// Comparte la conversación y las acciones entre las etapas de Gravedad.
// Su layout monta este provider exclusivamente dentro de esa sección.
export const TutorProvider = ({ children }: { children: ReactNode }) => {
  // Obtiene la ruta actual de la aplicación.
  const pathname = usePathname();

  // Almacena el contexto publicado por la página activa.
  const [published, setPublished] = useState<PublishedContext | null>(null);

  // Mantiene una referencia actualizada del contexto publicado.
  const publishedRef = useRef<PublishedContext | null>(null);

  // Almacena la función que permite resaltar elementos de la fórmula.
  const highlightRef = useRef<
    ((term: "constant" | "masses" | "distance" | null) => void) | null
  >(null);

  // Registra la función de resaltado visual de la fórmula gravitatoria.
  const registerHighlight = useCallback(
    (callback: NonNullable<typeof highlightRef.current>) => {
      highlightRef.current = callback;

      return () => {
        if (highlightRef.current === callback) highlightRef.current = null;
      };
    },
    [],
  );

  // Permite activar un resaltado visual desde el Tutor IA.
  const highlight = useCallback(
    (term: "constant" | "masses" | "distance" | null) =>
      highlightRef.current?.(term),
    [],
  );

  // Almacena la función encargada de abrir el chat global.
  const launcherRef = useRef<TutorLauncher | null>(null);

  // Permite abrir el Tutor IA desde cualquier componente.
  const openTutor = useCallback<TutorLauncher>(
    (intent, trigger) => {
      launcherRef.current?.(intent, trigger);
    },
    [],
  );

  // Registra la función que controla la apertura del Tutor IA.
  const registerLauncher = useCallback((launcher: TutorLauncher) => {
    launcherRef.current = launcher;

    return () => {
      if (launcherRef.current === launcher) launcherRef.current = null;
    };
  }, []);

  // Publica el contexto actual de una página para que
  // el Tutor IA conozca la etapa y sus datos.
  const publish = useCallback((value: PublishedContext) => {
    publishedRef.current = value;

    setPublished((previous) =>
      previous?.pathname === value.pathname &&
      JSON.stringify(previous.context) === JSON.stringify(value.context)
        ? previous
        : value,
    );

    return () => {
      if (publishedRef.current === value) publishedRef.current = null;
    };
  }, []);

  // Obtiene el contexto actual y las acciones disponibles
  // para las peticiones y propuestas del Tutor IA.
  const current = useCallback((): PublishedContext | null => {
    const value = publishedRef.current;
    // Solo se envían peticiones con el estado real publicado por Gravedad.
    return value?.pathname === pathname ? value : null;
  }, [pathname]);

  const context = useMemo<TutorContext>(
    () =>
      published?.pathname === pathname
        ? published.context
        : { kind: "gravity", stage: null, parameters: initialParameters },
    [published, pathname],
  );

  // Agrupa el contexto global, la sesión y las funciones
  // que se compartirán con los componentes del Tutor IA.
  const environment = useMemo(
    () => ({
      sessionKey: "global" as const,
      activeSessionId: "global" as const,
      context,
      publish,
      current,
      openTutor,
      registerLauncher,
      registerHighlight,
      highlight,
    }),
    [
      context,
      publish,
      current,
      openTutor,
      registerLauncher,
      registerHighlight,
      highlight,
    ],
  );

  return (
    <EnvironmentContext.Provider value={environment}>
      <TutorConversationProvider>
        {children}
        <GlobalTutor />
      </TutorConversationProvider>
    </EnvironmentContext.Provider>
  );
};

// Comunica al Tutor IA el contexto de la página o etapa activa,
// sin realizar peticiones directamente al modelo.
export const TutorContextBridge = ({
  context,
  gravity,
  active = true,
}: {
  context: TutorContext;
  gravity?: PublishedContext["gravity"];
  active?: boolean;
}) => {
  // Obtiene la ruta actual de la aplicación.
  const pathname = usePathname();

  // Obtiene la función que permite publicar el contexto.
  const { publish } = useTutorEnvironment();

  // Registra el contexto de la página cuando está activa
  // y lo desregistra cuando cambia o se desmonta el componente.
  useLayoutEffect(() => {
    if (active) return publish({ pathname, context, gravity });
  }, [publish, pathname, context, gravity, active]);

  return null;
};
