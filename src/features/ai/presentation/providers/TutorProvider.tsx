"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import type { TutorContext } from "../../types/tutor.types";
import { EnvironmentContext, useTutorEnvironment, type PublishedContext } from "./tutorEnvironment";
import { GlobalTutor } from "../components/GlobalTutor";

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
export const TutorContextBridge = ({ context, label, gravity }: { context: TutorContext; label?: string; gravity?: PublishedContext["gravity"] }) => {
  const pathname = usePathname();
  const { publish } = useTutorEnvironment();
  useLayoutEffect(() => publish({ pathname, context, label, gravity }), [publish, pathname, context, label, gravity]);
  return null;
};
