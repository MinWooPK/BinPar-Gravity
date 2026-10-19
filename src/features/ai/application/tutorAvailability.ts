import type { TutorContext } from "../types/tutor.types";

/** Tutor routes only; hashes do not affect availability within Gravity. */
export const getTutorSessionKey = (pathname: string): "gravity" | null => {
  const path = pathname.replace(/^\/(es|en|fr)(?=\/|$)/, "").replace(/\/$/, "");
  return path === "/gravity" ? "gravity" : null;
};

/** Separate educational histories; independent of how a conversation is displayed. */
export type TutorSessionId = "gravity" | "gravity-understanding" | "gravity-laboratory";
export const getTutorConversationKey = (context: TutorContext): TutorSessionId =>
  context.stage === "gravity-understanding" || context.stage === "gravity-laboratory"
    ? context.stage : "gravity";
