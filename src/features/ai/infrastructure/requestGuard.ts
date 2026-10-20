import { TUTOR_MAX_BODY_BYTES } from "../application/tutor";

export const TUTOR_RATE_WINDOW_MS = 60_000;
export const TUTOR_REQUESTS_PER_CLIENT = 8;
export const TUTOR_REQUESTS_PER_PROCESS = 40;
export const TUTOR_MAX_CONCURRENT_REQUESTS = 4;
const MAX_TRACKED_CLIENTS = 1024;

type Bucket = { count: number; started: number; active: number };
type Permit =
  | { allowed: true; release: () => void }
  | { allowed: false; retryAfterSeconds: number };

/** Best-effort process-local limits; distributed deployments need a shared gateway/quota. */
export const createTutorLimiter = (now: () => number = Date.now) => {
  const clients = new Map<string, Bucket>();
  let windowStarted = now();
  let processCount = 0;
  let active = 0;

  return {
    acquire(client: string): Permit {
      const time = now();
      if (time - windowStarted >= TUTOR_RATE_WINDOW_MS) {
        windowStarted = time;
        processCount = 0;
      }
      for (const [key, bucket] of clients) {
        if (
          time - bucket.started >= TUTOR_RATE_WINDOW_MS &&
          bucket.active === 0
        )
          clients.delete(key);
      }
      let bucket = clients.get(client);
      if (bucket && time - bucket.started >= TUTOR_RATE_WINDOW_MS) {
        bucket.count = 0;
        bucket.started = time;
      }
      if (
        (!bucket && clients.size >= MAX_TRACKED_CLIENTS) ||
        processCount >= TUTOR_REQUESTS_PER_PROCESS ||
        active >= TUTOR_MAX_CONCURRENT_REQUESTS ||
        (bucket &&
          (bucket.count >= TUTOR_REQUESTS_PER_CLIENT || bucket.active >= 1))
      ) {
        const retryAt =
          Math.max(windowStarted, bucket?.started ?? windowStarted) +
          TUTOR_RATE_WINDOW_MS;
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((retryAt - time) / 1000)),
        };
      }
      if (!bucket) {
        bucket = { count: 0, started: time, active: 0 };
        clients.set(client, bucket);
      }
      bucket.count++;
      bucket.active++;
      processCount++;
      active++;
      const acquiredBucket = bucket;
      let released = false;
      return {
        allowed: true,
        release: () => {
          if (released) return;
          released = true;
          acquiredBucket.active--;
          active--;
        },
      };
    },
  };
};

export class TutorBodyTooLargeError extends Error {}

/** Limit bytes while reading, including bodies without a truthful Content-Length. */
export const readTutorBody = async (request: Request): Promise<string> => {
  const declared = request.headers.get("content-length");
  if (declared && Number(declared) > TUTOR_MAX_BODY_BYTES)
    throw new TutorBodyTooLargeError();
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  const deadline = AbortSignal.timeout(5000);
  let bytes = 0;
  let text = "";
  const cancel = () => {
    void reader.cancel().catch(() => {});
  };
  deadline.addEventListener("abort", cancel, { once: true });
  request.signal.addEventListener("abort", cancel, { once: true });
  try {
    while (true) {
      const chunk = await reader.read();
      if (deadline.aborted || request.signal.aborted)
        throw new Error("Request body aborted");
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > TUTOR_MAX_BODY_BYTES) throw new TutorBodyTooLargeError();
      text += decoder.decode(chunk.value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    deadline.removeEventListener("abort", cancel);
    request.signal.removeEventListener("abort", cancel);
    cancel();
    reader.releaseLock();
  }
};
