import type { ExperimentConfiguration } from "../../../domain/experiment-simulation";
import {
  ORBIT_SEARCH_LIMITS, type OrbitSearchProgress, type OrbitSearchResult, type OrbitSearchResponse,
} from "../../../types/orbit-search.types";

export type OrbitSearchViewState =
  | { status: "idle" }
  | { status: "searching" | "cancelled"; progress: OrbitSearchProgress }
  | { status: "finished"; result: OrbitSearchResult }
  | { status: "failed" };

type SearchWorker = Pick<Worker, "postMessage" | "terminate" | "onmessage" | "onerror">;
type Timer = ReturnType<typeof setTimeout>;
type Scheduler = { set: (callback: () => void, delay: number) => Timer; clear: (timer: Timer) => void };

/** Owns cancellation, deadline and stale-message protection independently of React. */
export function createOrbitSearchController(
  createWorker: () => SearchWorker,
  onChange: (state: OrbitSearchViewState) => void,
  scheduler: Scheduler = { set: (callback, delay) => setTimeout(callback, delay), clear: (timer) => clearTimeout(timer) },
) {
  let worker: SearchWorker | null = null;
  let requestId = 0;
  let disposed = false;
  let flushTimer: Timer | null = null;
  let deadlineTimer: Timer | null = null;
  const empty = (): OrbitSearchProgress => ({ evaluations: 0, maxEvaluations: ORBIT_SEARCH_LIMITS.maxEvaluations, best: null });
  let latest = empty();
  const stop = () => {
    requestId++;
    if (flushTimer !== null) scheduler.clear(flushTimer);
    if (deadlineTimer !== null) scheduler.clear(deadlineTimer);
    flushTimer = deadlineTimer = null;
    if (worker) {
      worker.onmessage = worker.onerror = null;
      worker.terminate();
      worker = null;
    }
  };
  return {
    start(configuration: ExperimentConfiguration) {
      if (disposed) return;
      stop();
      const id = requestId;
      latest = empty();
      onChange({ status: "searching", progress: latest });
      try {
        worker = createWorker();
        worker.onmessage = (event: MessageEvent<OrbitSearchResponse>) => {
          if (!worker || id !== requestId || event.data.id !== id) return;
          const message = event.data;
          if (message.type === "progress") {
            latest = message.progress;
            if (flushTimer === null) {
              flushTimer = scheduler.set(() => {
                flushTimer = null;
                if (worker && id === requestId) onChange({ status: "searching", progress: latest });
              }, 250);
            }
          } else {
            stop();
            onChange(message.type === "result" ? { status: "finished", result: message.result } : { status: "failed" });
          }
        };
        worker.onerror = () => {
          if (id !== requestId) return;
          stop();
          onChange({ status: "failed" });
        };
        // Hard backstop, including startup. A slow/infinite individual trial
        // cannot evade the wall-clock budget by failing to post progress.
        deadlineTimer = scheduler.set(() => {
          if (id !== requestId) return;
          stop();
          const found = latest.best?.verified === true;
          onChange({ status: "finished", result: { ...latest, found, reason: found ? "found" : "timeLimit" } });
        }, ORBIT_SEARCH_LIMITS.timeMs);
        worker.postMessage({ id, configuration });
      } catch {
        stop();
        onChange({ status: "failed" });
      }
    },
    cancel() {
      if (!worker) return;
      stop();
      onChange({ status: "cancelled", progress: latest });
    },
    dispose() {
      disposed = true;
      stop();
    },
  };
}
