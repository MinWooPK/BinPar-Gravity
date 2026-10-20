"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTutorEnvironment } from "@/features/ai/presentation/providers/tutorEnvironment";
import type { ThreeBodyParameterProposal } from "../../types/experiment-proposal.types";
import { createExperimentDraftState, experimentDraftReducer, parseExperimentDraft, type ExperimentDraftAction } from "../../application/experimentDraft";
import { isExperimentConfiguration } from "../../application/experimentConfiguration";

const useExperimentStore = () => {
  const [state, setState] = useState(createExperimentDraftState);
  const stateRef = useRef(state);
  const invalidators = useRef(new Set<() => void>());
  const navigator = useRef<(() => void) | null>(null);
  const router = useRouter();
  const dispatch = useCallback((action: ExperimentDraftAction) => {
    const previous = stateRef.current;
    const next = experimentDraftReducer(previous, action);
    if (next === previous) return false;
    stateRef.current = next;
    // Terminate pending workers synchronously, before React commits new inputs.
    if (next.revision !== previous.revision) invalidators.current.forEach(invalidate => invalidate());
    setState(next);
    return true;
  }, []);
  const apply = useCallback((proposal: ThreeBodyParameterProposal, expectedRevision: number) =>
    dispatch({ type: "proposal", proposal, expectedRevision }), [dispatch]);
  const registerInvalidation = useCallback((invalidate: () => void) => {
    invalidators.current.add(invalidate);
    return () => { invalidators.current.delete(invalidate); };
  }, []);
  const registerNavigator = useCallback((navigate: () => void) => {
    navigator.current = navigate;
    return () => { if (navigator.current === navigate) navigator.current = null; };
  }, []);
  const reveal = useCallback(() => {
    if (navigator.current) navigator.current();
    else router.push("/three-body#experiment", { scroll: false });
  }, [router]);
  const configuration = useMemo(() => {
    const parsed = parseExperimentDraft(state.draft);
    return isExperimentConfiguration(parsed) ? parsed : null;
  }, [state.draft]);
  return { ...state, dispatch, apply, configuration, registerInvalidation, registerNavigator, reveal };
};
const ExperimentContext = createContext<ReturnType<typeof useExperimentStore> | null>(null);

/** Lives in the module layout, including while viewing a catalogue orbit. */
export const ThreeBodyExperimentProvider = ({ children }: { children: ReactNode }) => {
  const store = useExperimentStore();
  const { registerThreeBody } = useTutorEnvironment();
  const { revision, apply, reveal, configuration } = store;
  useLayoutEffect(() => registerThreeBody({ revision, apply, reveal, configuration }),
    [registerThreeBody, revision, apply, reveal, configuration]);
  return <ExperimentContext.Provider value={store}>{children}</ExperimentContext.Provider>;
};
export const useThreeBodyExperiment = () => {
  const value = useContext(ExperimentContext);
  if (!value) throw new Error("Experiments require ThreeBodyExperimentProvider");
  return value;
};
