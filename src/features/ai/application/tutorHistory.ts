import type { ChatMessage } from "../types/conversation.types";

export const TUTOR_HISTORY_KEY = "gravity-lab:tutor:v1";
export const TUTOR_HISTORY_LIMIT = 30;
const MAX_STORED_LENGTH = 4000;

/** Storage is untrusted. Never restore proposals, callbacks, requests or authorization. */
export function restoreTutorHistory(raw: string | null): ChatMessage[] {
  if (!raw || raw.length > 150_000) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (
      !data ||
      typeof data !== "object" ||
      !("version" in data) ||
      data.version !== 1 ||
      !("messages" in data) ||
      !Array.isArray(data.messages)
    )
      return [];
    return data.messages
      .slice(-TUTOR_HISTORY_LIMIT)
      .flatMap((item: unknown, index) => {
        if (
          !item ||
          typeof item !== "object" ||
          !("role" in item) ||
          !("content" in item) ||
          (item.role !== "user" && item.role !== "assistant") ||
          typeof item.content !== "string" ||
          !item.content.trim() ||
          item.content.length > MAX_STORED_LENGTH
        )
          return [];
        const contextId =
          "contextId" in item &&
          typeof item.contextId === "string" &&
          /^(home|gravity|three-body):[a-z-]+(?::[a-z0-9-]+)?$/.test(
            item.contextId,
          ) &&
          item.contextId.length <= 100
            ? item.contextId
            : undefined;
        return [
          {
            id: index + 1,
            role: item.role,
            content: item.content,
            ...(contextId && { contextId }),
          },
        ];
      });
  } catch {
    return [];
  }
}

export function serializeTutorHistory(
  messages: readonly ChatMessage[],
): string {
  return JSON.stringify({
    version: 1,
    messages: messages
      .slice(-TUTOR_HISTORY_LIMIT)
      .map(({ role, content, contextId }) => ({
        role,
        content: content.slice(0, MAX_STORED_LENGTH),
        ...(contextId && { contextId }),
      })),
  });
}
