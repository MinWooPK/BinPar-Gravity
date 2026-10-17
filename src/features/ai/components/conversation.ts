import { TUTOR_MAX_MESSAGES, TUTOR_MAX_MESSAGE_LENGTH, TUTOR_MAX_TOTAL_MESSAGE_LENGTH } from "../application/tutor";
import type { TutorMessage } from "../application/tutor";

/** Retain recent turns without exceeding the server's bounded conversation budget. */
export const requestHistory = (messages: readonly TutorMessage[]): TutorMessage[] => {
  const selected: TutorMessage[] = [];
  let characters = 0;
  for (let index = messages.length - 1; index >= 0 && selected.length < TUTOR_MAX_MESSAGES; index--) {
    const message = messages[index];
    const content = message.content.slice(0, TUTOR_MAX_MESSAGE_LENGTH);
    if (characters + content.length > TUTOR_MAX_TOTAL_MESSAGE_LENGTH) break;
    selected.unshift({ role: message.role, content });
    characters += content.length;
  }
  // A conversation supplied to the model begins with a user turn.
  while (selected[0]?.role === "assistant") selected.shift();
  return selected;
};
