"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useRouter } from "@/i18n/navigation";
import { useTutorEnvironment } from "@/features/ai/presentation/providers/tutorEnvironment";
import type { ThreeBodyParameterProposal } from "../../types/experiment-proposal.types";

import {
  createExperimentDraftState,
  experimentDraftReducer,
  parseExperimentDraft,
  type ExperimentDraftAction,
} from "../../application/experimentDraft";

import { isExperimentConfiguration } from "../../application/experimentConfiguration";

// Gestiona el estado compartido del experimento de los tres cuerpos,
// incluyendo sus parámetros, simulaciones y propuestas del Tutor IA.
const useExperimentStore = () => {
  // Almacena el estado actual del formulario del experimento.
  const [state, setState] = useState(createExperimentDraftState);

  // Mantiene una referencia actualizada del estado para procesar cambios.
  const stateRef = useRef(state);

  // Almacena las funciones que cancelan simulaciones pendientes.
  const invalidators = useRef(new Set<() => void>());

  // Guarda la función que permite navegar a la etapa Experimenta.
  const navigator = useRef<(() => void) | null>(null);

  // Obtiene el sistema de navegación de Next.js.
  const router = useRouter();

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

  // Aplica una propuesta del Tutor IA si coincide con la revisión esperada.
  const apply = useCallback(
    (proposal: ThreeBodyParameterProposal, expectedRevision: number) =>
      dispatch({ type: "proposal", proposal, expectedRevision }),
    [dispatch],
  );

  // Registra funciones para cancelar simulaciones cuando cambian los parámetros.
  const registerInvalidation = useCallback((invalidate: () => void) => {
    invalidators.current.add(invalidate);

    return () => {
      invalidators.current.delete(invalidate);
    };
  }, []);

  // Registra la función de navegación hacia la etapa Experimenta.
  const registerNavigator = useCallback((navigate: () => void) => {
    navigator.current = navigate;

    return () => {
      if (navigator.current === navigate) navigator.current = null;
    };
  }, []);

  // Muestra la etapa Experimenta utilizando la navegación registrada
  // o redirigiendo a su URL si todavía no está disponible.
  const reveal = useCallback(() => {
    if (navigator.current) navigator.current();
    else router.push("/three-body#experiment", { scroll: false });
  }, [router]);

  // Convierte los valores del formulario en una configuración física
  // y comprueba que sean válidos antes de utilizarlos.
  const configuration = useMemo(() => {
    // Convierte los campos de texto en valores numéricos.
    const parsed = parseExperimentDraft(state.draft);

    return isExperimentConfiguration(parsed) ? parsed : null;
  }, [state.draft]);

  return {
    ...state,
    dispatch,
    apply,
    configuration,
    registerInvalidation,
    registerNavigator,
    reveal,
  };
};

// Crea el contexto para compartir el estado y las funciones del experimento.
const ExperimentContext = createContext<ReturnType<
  typeof useExperimentStore
> | null>(null);

// Comparte el estado del experimento entre los componentes
// y conecta sus parámetros con las acciones del Tutor IA global.
export const ThreeBodyExperimentProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Obtiene el estado y las funciones del experimento.
  const store = useExperimentStore();

  // Obtiene la función para registrar el experimento en el Tutor IA.
  const { registerThreeBody } = useTutorEnvironment();

  // Extrae los datos y las funciones que necesita el Tutor IA.
  const { revision, apply, reveal, configuration } = store;

  // Registra las acciones del experimento en el Tutor IA
  // y actualiza su contexto cuando cambian los parámetros.
  useLayoutEffect(
    () => registerThreeBody({ revision, apply, reveal, configuration }),
    [registerThreeBody, revision, apply, reveal, configuration],
  );

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
