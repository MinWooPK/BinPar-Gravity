"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import type { TutorContext } from "../../types/tutor.types";
import { EnvironmentContext, useTutorEnvironment, type PublishedContext, type TutorLauncher } from "./tutorEnvironment";
import { GlobalTutor } from "../components/GlobalTutor";
import { TutorConversationProvider } from "../hooks/useTutorConversation";
import { getTutorSessionKey, getTutorConversationKey } from "../../application/tutorAvailability";

/** A shared store preserves separate stage histories while presentation changes. */
export const TutorProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const sessionKey = getTutorSessionKey(pathname);
  const [location, setLocation] = useState<Pick<PublishedContext, "pathname" | "context"> | null>(null);
  const launcherRef = useRef<TutorLauncher | null>(null);
  const openTutor = useCallback<TutorLauncher>((intent, trigger) => {
    if (sessionKey === "gravity") launcherRef.current?.(intent, trigger);
  }, [sessionKey]);
  const registerLauncher = useCallback((launcher: TutorLauncher) => {
    launcherRef.current = launcher;
    return () => { if (launcherRef.current === launcher) launcherRef.current = null; };
  }, []);
  const publishedRef = useRef<PublishedContext | null>(null);
  const publish = useCallback((value: PublishedContext) => {
    publishedRef.current = value;
    setLocation(previous => previous?.pathname === value.pathname && previous.context.stage === value.context.stage
      ? previous : { pathname: value.pathname, context: value.context });
    return () => {
      if (publishedRef.current === value) publishedRef.current = null;
    };
  }, []);
  const current = useCallback(() => {
    const value = publishedRef.current;
    return sessionKey === "gravity" && value?.pathname === pathname ? value : null;
  }, [pathname, sessionKey]);
  const activeContext = location?.pathname === pathname ? location.context : null;
  const activeSessionId = activeContext ? getTutorConversationKey(activeContext) : "gravity";
  const practiceActive = activeContext?.stage === "gravity-challenges";
  const inlineActive = activeContext?.stage === "gravity-understanding" || activeContext?.stage === "gravity-laboratory";
  const environment = useMemo(() => ({ sessionKey, activeSessionId, inlineActive, publish, current, openTutor, registerLauncher, practiceActive }),
    [sessionKey, activeSessionId, inlineActive, publish, current, openTutor, registerLauncher, practiceActive]);
  return (
    <EnvironmentContext.Provider value={environment}>
      {sessionKey === "gravity" ? (
        <TutorConversationProvider key={pathname}>
          {children}
          {!inlineActive && <GlobalTutor />}
        </TutorConversationProvider>
      ) : children}
    </EnvironmentContext.Provider>
  );
};

/** Updates a ref, not UI state: moving sliders never renders the chat or requests AI. */
export const TutorContextBridge = ({ context, gravity }: { context: TutorContext; gravity?: PublishedContext["gravity"] }) => {
  const pathname = usePathname();
  const { publish } = useTutorEnvironment();
  useLayoutEffect(() => publish({ pathname, context, gravity }), [publish, pathname, context, gravity]);
  return null;
};
