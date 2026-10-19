import { searchOrbit } from "../../../domain/orbit-search";
import {
  ORBIT_SEARCH_LIMITS,
  type OrbitSearchRequest, type OrbitSearchResponse,
} from "../../../types/orbit-search.types";

self.onmessage = (event: MessageEvent<OrbitSearchRequest>) => {
  const { id, configuration } = event.data;
  const deadline = performance.now() + ORBIT_SEARCH_LIMITS.timeMs;
  try {
    const search = searchOrbit(configuration, {}, { shouldStop: () => performance.now() >= deadline });
    for (;;) {
      const step = search.next();
      if (step.done) {
        self.postMessage({ id, type: "result", result: step.value } satisfies OrbitSearchResponse);
        break;
      }
      // Small snapshots preserve the best completed trial even if terminated.
      // The controller throttles React updates to at most four per second.
      self.postMessage({ id, type: "progress", progress: step.value } satisfies OrbitSearchResponse);
    }
  } catch {
    self.postMessage({ id, type: "error" } satisfies OrbitSearchResponse);
  }
};
