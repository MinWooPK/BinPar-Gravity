import "server-only";
import type { GravityTutor } from "../application/tutor";
import { parseTutorRequest } from "../../ai/application/tutorRequest";
import { openaiTutor as sharedTutor } from "../../ai/infrastructure/openaiTutor";

/** Compatibility entry point; the OpenAI integration is shared with Three Bodies. */
export const openaiTutor: GravityTutor = {
  async explain(request) {
    const normalized = parseTutorRequest(request);
    if (!normalized) throw new TypeError("Invalid tutor request");
    return sharedTutor.explain(normalized);
  },
};
