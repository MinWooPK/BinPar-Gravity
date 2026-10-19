import type { ExperimentConfiguration } from "../domain/experiment-simulation";
import type { ReturnErrors } from "../domain/periodicity-detection";

/** Small policy module shared with the UI without importing numerical code. */
export const ORBIT_SEARCH_LIMITS = {
  maxEvaluations: 480,
  starts: 4,
  iterations: 16,
  timeMs: 12_000,
  seed: 0x6d2b79f5,
  velocityRadius: 0.5,
  minimumPeriodRatio: 0.2,
} as const;

export type OrbitSearchOptions = Readonly<{
  maxEvaluations?: number;
  starts?: number;
  iterations?: number;
  seed?: number;
}>;

export type OrbitSearchCandidate = Readonly<{
  configuration: ExperimentConfiguration;
  period: number;
  errors: ReturnErrors;
  verified: boolean;
}>;

export type OrbitSearchProgress = Readonly<{
  evaluations: number;
  maxEvaluations: number;
  best: OrbitSearchCandidate | null;
}>;

export type OrbitSearchResult = OrbitSearchProgress & Readonly<{
  found: boolean;
  reason: "found" | "completed" | "evaluationLimit" | "timeLimit";
}>;

export type OrbitSearchRequest = Readonly<{
  id: number;
  configuration: ExperimentConfiguration;
}>;

export type OrbitSearchResponse =
  | { id: number; type: "progress"; progress: OrbitSearchProgress }
  | { id: number; type: "result"; result: OrbitSearchResult }
  | { id: number; type: "error" };
