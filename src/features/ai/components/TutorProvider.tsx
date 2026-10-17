"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import type { TutorContext } from "../application/tutor";
import { GlobalTutor } from "./GlobalTutor";

type PublishedContext = { pathname: string; context: TutorContext; label?: string };
type TutorEnvironment = {
  sessionKey: string | null;
  publish: (value: PublishedContext) => () => void;
  current: () => PublishedContext | null;
};
const EnvironmentContext = createContext<TutorEnvironment | null>(null);

export const useTutorEnvironment = () => {
  const value = useContext(EnvironmentContext);
  if (!value) throw new Error("Tutor components require TutorProvider");
  return value;
};

/** One persistent assistant for the localized app; page data is published explicitly. */
export const TutorProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const publishedRef = useRef<PublishedContext | null>(null);
  const sessionKey = pathname === "/gravity" ? "gravity"
    : pathname === "/three-body" ? "three-body"
      : /^\/three-body\/[a-z0-9-]+$/.test(pathname) ? pathname.slice(1) : null;
  const publish = useCallback((value: PublishedContext) => {
    publishedRef.current = value;
    return () => {
      if (publishedRef.current === value) publishedRef.current = null;
    };
  }, []);
  const current = useCallback(() => {
    const value = publishedRef.current;
    return value?.pathname === pathname ? value : null;
  }, [pathname]);
  const environment = useMemo(() => ({ sessionKey, publish, current }), [sessionKey, publish, current]);
  return (
    <EnvironmentContext.Provider value={environment}>
      {children}
      <GlobalTutor />
    </EnvironmentContext.Provider>
  );
};

/** Updates a ref, not UI state: moving sliders never renders the chat or requests AI. */
export const TutorContextBridge = ({ context, label }: { context: TutorContext; label?: string }) => {
  const pathname = usePathname();
  const { publish } = useTutorEnvironment();
  useLayoutEffect(() => publish({ pathname, context, label }), [publish, pathname, context, label]);
  return null;
};
