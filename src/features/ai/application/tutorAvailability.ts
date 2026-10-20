import type { TutorContext } from "../types/tutor.types";

export type TutorSessionId = "global";
export const getTutorSessionKey = (): TutorSessionId => "global";
export const getTutorConversationKey = (): TutorSessionId => "global";

/** Disabled throughout Three Body, including nested and localized routes. */
export function routeTutorContext(pathname: string): TutorContext | null {
  const path = pathname.replace(/^\/(es|en|fr)(?=\/|$)/, "").replace(/\/$/, "");
  if (path === "/three-body" || path.startsWith("/three-body/")) return null;
  // Gravity publishes its actual parameters through TutorContextBridge.
  return { kind: "home", stage: null };
}
export const tutorContextId = (context: TutorContext) =>
  `${context.kind}:${context.stage ?? "welcome"}`;
