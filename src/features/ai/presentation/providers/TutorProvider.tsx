"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import type { TutorContext } from "../../types/tutor.types";
import { routeTutorContext } from "../../application/tutorAvailability";
import { EnvironmentContext, useTutorEnvironment, type PublishedContext, type TutorLauncher } from "./tutorEnvironment";
import { GlobalTutor } from "../components/GlobalTutor";
import { TutorConversationProvider } from "../hooks/useTutorConversation";

/** Mounted once by the locale layout; routes update context, never conversation identity. */
export const TutorProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [published, setPublished] = useState<PublishedContext | null>(null);
  const publishedRef = useRef<PublishedContext | null>(null);
  const highlightRef = useRef<((term: "constant" | "masses" | "distance" | null) => void) | null>(null);
  const registerHighlight = useCallback((callback: NonNullable<typeof highlightRef.current>) => { highlightRef.current = callback; return () => { if (highlightRef.current === callback) highlightRef.current = null; }; }, []);
  const highlight = useCallback((term: "constant" | "masses" | "distance" | null) => highlightRef.current?.(term), []);
  const launcherRef = useRef<TutorLauncher | null>(null);
  const openTutor = useCallback<TutorLauncher>((intent, trigger) => launcherRef.current?.(intent, trigger), []);
  const registerLauncher = useCallback((launcher: TutorLauncher) => {
    launcherRef.current = launcher;
    return () => { if (launcherRef.current === launcher) launcherRef.current = null; };
  }, []);
  const publish = useCallback((value: PublishedContext) => {
    publishedRef.current = value;
    setPublished(previous => previous?.pathname === value.pathname &&
      JSON.stringify(previous.context) === JSON.stringify(value.context) ? previous : value);
    return () => {
      if (publishedRef.current === value) publishedRef.current = null;
    };
  }, []);
  const current = useCallback((): PublishedContext => {
    const value = publishedRef.current;
    return value?.pathname === pathname ? value : { pathname, context: routeTutorContext(pathname) };
  }, [pathname]);
  const context = published?.pathname === pathname ? published.context : routeTutorContext(pathname);
  const environment = useMemo(() => ({ sessionKey: "global" as const, activeSessionId: "global" as const,
    context, publish, current, openTutor, registerLauncher, registerHighlight, highlight }), [context, publish, current, openTutor, registerLauncher, registerHighlight, highlight]);
  return <EnvironmentContext.Provider value={environment}>
    <TutorConversationProvider>{children}<GlobalTutor /></TutorConversationProvider>
  </EnvironmentContext.Provider>;
};

/** A route publishes only serializable, bounded facts, with no AI requests. */
export const TutorContextBridge = ({ context, gravity, active = true }: {
  context: TutorContext; gravity?: PublishedContext["gravity"]; active?: boolean;
}) => {
  const pathname = usePathname();
  const { publish } = useTutorEnvironment();
  useLayoutEffect(() => {
    if (active) return publish({ pathname, context, gravity });
  }, [publish, pathname, context, gravity, active]);
  return null;
};
