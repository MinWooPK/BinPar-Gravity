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

// Gestiona el estado compartido del experimento de los tres cuerpos,
// y cancela cálculos pendientes cuando se editan sus parámetros.
const useExperimentStore = () => {
  // Almacena el estado actual del formulario del experimento.
  const [state, setState] = useState(createExperimentDraftState);

  // Mantiene una referencia actualizada del estado para procesar cambios.
  const stateRef = useRef(state);

  // Almacena las funciones que cancelan simulaciones pendientes.
  const invalidators = useRef(new Set<() => void>());

  // Ejecuta las acciones del reducer y cancela cálculos pendientes
  // cuando se modifica la configuración del experimento.
  const dispatch = useCallback((action: ExperimentDraftAction) => {
    // Obtiene el estado anterior del experimento.
    const previous = stateRef.current;

    // Calcula el nuevo estado mediante el reducer.
    const next = experimentDraftReducer(previous, action);

    if (next === previous) return false;

    stateRef.current = next;

    // Cancela los cálculos pendientes antes de actualizar React.
    if (next.revision !== previous.revision)
      invalidators.current.forEach((invalidate) => invalidate());

    setState(next);

    return true;
  }, []);

  // Registra funciones para cancelar simulaciones cuando cambian los parámetros.
  const registerInvalidation = useCallback((invalidate: () => void) => {
    invalidators.current.add(invalidate);

    return () => {
      invalidators.current.delete(invalidate);
    };
  }, []);

  return {
    ...state,
    dispatch,
    registerInvalidation,
  };
};

// Crea el contexto para compartir el estado y las funciones del experimento.
const ExperimentContext = createContext<ReturnType<
  typeof useExperimentStore
> | null>(null);

// Comparte el estado del experimento entre los componentes
// incluso al visitar los detalles de las órbitas.
export const ThreeBodyExperimentProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Obtiene el estado y las funciones del experimento.
  const store = useExperimentStore();

  return (
    <ExperimentContext.Provider value={store}>
      {children}
    </ExperimentContext.Provider>
  );
};

export const useThreeBodyExperiment = () => {
  const value = useContext(ExperimentContext);

  if (!value)
    throw new Error("Experiments require ThreeBodyExperimentProvider");

  return value;
};
