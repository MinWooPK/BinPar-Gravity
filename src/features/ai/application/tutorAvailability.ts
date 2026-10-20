import type { TutorContext } from "../types/tutor.types";

/** One conversation for every page and locale. */
export type TutorSessionId = "global";
export const getTutorSessionKey = (): TutorSessionId => "global";
export const getTutorConversationKey = (): TutorSessionId => "global";

export function routeTutorContext(pathname: string): TutorContext {
  const path = pathname.replace(/^\/(es|en|fr)(?=\/|$)/, "").replace(/\/$/, "");
  if (path === "/three-body") return { kind: "three-body", stage: null };
  const slug = path.match(/^\/three-body\/([^/]+)$/)?.[1];
  if (slug) return { kind: "three-body", stage: "orbit", slug };
  // Gravity publishes its real parameters from the existing laboratory provider.
  return { kind: "home", stage: null };
}

export const tutorContextId = (context: TutorContext) =>
  `${context.kind}:${context.stage ?? "welcome"}${context.kind === "three-body" && context.slug ? `:${context.slug}` : ""}`;
