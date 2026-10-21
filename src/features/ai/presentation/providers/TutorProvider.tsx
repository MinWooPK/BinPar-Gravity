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
import { initialParameters } from "@/features/gravity/domain/gravitation";

import type { TutorContext } from "../../types/tutor.types";

import {
  EnvironmentContext,
  useTutorEnvironment,
  type PublishedContext,
  type TutorLauncher,
} from "./tutorEnvironment";

import { GlobalTutor } from "../components/global-tutor/GlobalTutor";
import { TutorConversationProvider } from "../hooks/useTutorConversation";

// Comparte el Tutor IA entre las páginas.
export const TutorProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  const [published, setPublished] = useState<PublishedContext | null>(null);
  const publishedRef = useRef<PublishedContext | null>(null);

  const highlightRef = useRef<
    ((term: "constant" | "masses" | "distance" | null) => void) | null
  >(null);

  // Registra los elementos que puede resaltar la IA.
  const registerHighlight = useCallback(
    (callback: NonNullable<typeof highlightRef.current>) => {
      highlightRef.current = callback;

      return () => {
        if (highlightRef.current === callback) {
          highlightRef.current = null;
        }
      };
    },
    [],
  );

  // Resalta un elemento de la fórmula.
  const highlight = useCallback(
    (term: "constant" | "masses" | "distance" | null) =>
      highlightRef.current?.(term),
    [],
  );

  const launcherRef = useRef<TutorLauncher | null>(null);

  // Abre el chat del Tutor IA.
  const openTutor = useCallback<TutorLauncher>(
    (intent, trigger) => launcherRef.current?.(intent, trigger),
    [],
  );

  // Registra la función que abre el chat.
  const registerLauncher = useCallback((launcher: TutorLauncher) => {
    launcherRef.current = launcher;

    return () => {
      if (launcherRef.current === launcher) {
        launcherRef.current = null;
      }
    };
  }, []);

  // Guarda el contexto de la página.
  const publish = useCallback((value: PublishedContext) => {
    publishedRef.current = value;

    setPublished((previous) =>
      previous?.pathname === value.pathname &&
      JSON.stringify(previous.context) === JSON.stringify(value.context)
        ? previous
        : value,
    );

    return () => {
      if (publishedRef.current === value) {
        publishedRef.current = null;
      }
    };
  }, []);

  // Obtiene el contexto de la página actual.
  const current = useCallback((): PublishedContext | null => {
    const value = publishedRef.current;

    return value?.pathname === pathname ? value : null;
  }, [pathname]);

  // Utiliza el contexto publicado o los valores iniciales.
  const context = useMemo<TutorContext>(
    () =>
      published?.pathname === pathname
        ? published.context
        : { kind: "gravity", stage: null, parameters: initialParameters },
    [published, pathname],
  );

  // Comparte el contexto y las funciones del Tutor IA.
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

// Comunica al Tutor IA la etapa y sus parámetros.
export const TutorContextBridge = ({
  context,
  gravity,
  active = true,
}: {
  context: TutorContext;
  gravity?: PublishedContext["gravity"];
  active?: boolean;
}) => {
  const pathname = usePathname();
  const { publish } = useTutorEnvironment();

  // Registra el contexto mientras la etapa está activa.
  useLayoutEffect(() => {
    if (active) {
      return publish({ pathname, context, gravity });
    }
  }, [publish, pathname, context, gravity, active]);

  return null;
};
