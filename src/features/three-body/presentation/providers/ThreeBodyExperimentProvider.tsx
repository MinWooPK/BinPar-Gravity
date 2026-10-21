"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  createExperimentDraftState,
  experimentDraftReducer,
  type ExperimentDraftAction,
} from "../../application/experimentDraft";

// Gestiona el estado y las cancelaciones del experimento.
const useExperimentStore = () => {
  const [state, setState] = useState(createExperimentDraftState);

  const stateRef = useRef(state);
  const invalidators = useRef(new Set<() => void>());

  // Actualiza el estado y cancela simulaciones anteriores.
  const dispatch = useCallback((action: ExperimentDraftAction) => {
    const previous = stateRef.current;
    const next = experimentDraftReducer(previous, action);

    if (next === previous) return false;

    stateRef.current = next;

    if (next.revision !== previous.revision) {
      invalidators.current.forEach((invalidate) => invalidate());
    }

    setState(next);
    return true;
  }, []);

  // Registra las funciones de cancelación.
  const registerInvalidation = useCallback((invalidate: () => void) => {
    invalidators.current.add(invalidate);

    return () => {
      invalidators.current.delete(invalidate);
    };
  }, []);

  return { ...state, dispatch, registerInvalidation };
};

// Comparte el estado del experimento.
const ExperimentContext = createContext<ReturnType<
  typeof useExperimentStore
> | null>(null);

export const ThreeBodyExperimentProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const store = useExperimentStore();

  return (
    <ExperimentContext.Provider value={store}>
      {children}
    </ExperimentContext.Provider>
  );
};

// Permite acceder al estado compartido.
export const useThreeBodyExperiment = () => {
  const value = useContext(ExperimentContext);

  if (!value) {
    throw new Error("El experimento necesita ThreeBodyExperimentProvider.");
  }

  return value;
};
