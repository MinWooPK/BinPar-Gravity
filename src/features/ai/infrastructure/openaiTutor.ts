import "server-only";
import type { Tutor } from "../types/tutor.types";
import { buildTutorPrompt } from "../application/tutorPrompt";
import { parseTutorReply } from "../application/tutorResponse";
import { tutorResponseFormat } from "./tutorResponseFormat";
import { requestOpenAI } from "./openaiResponse";

export const openaiTutor: Tutor = {
  async explain(request, signal) {
    const text = await requestOpenAI({
      max_output_tokens: 1200,
      text: { format: tutorResponseFormat },
      ...buildTutorPrompt(request),
    }, signal);
    return parseTutorReply(JSON.parse(text), request.context, request.intent);
  },
};
