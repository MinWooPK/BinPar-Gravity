"use client";

import type { FormulaTerm } from "../../../types/formula.types";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

// Define el estado y las funciones para interactuar con los elementos de la fórmula.
type Interaction = {
  active: FormulaTerm | null;
  selected: FormulaTerm | null;
  hover: (term: FormulaTerm | null) => void;
  focus: (term: FormulaTerm | null) => void;
  select: (term: FormulaTerm | null) => void;
};

// Crea el contexto para compartir las interacciones de la fórmula.
const InteractionContext = createContext<Interaction | null>(null);

// Comparte el estado de interacción entre la fórmula,
// los campos, las explicaciones y la simulación gravitatoria.
export const GravityFormulaInteractionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Guarda el elemento sobre el que se encuentra el cursor.
  const [hovered, hover] = useState<FormulaTerm | null>(null);

  // Guarda el elemento que tiene el foco.
  const [focused, focus] = useState<FormulaTerm | null>(null);

  // Guarda el elemento seleccionado por el usuario.
  const [selected, select] = useState<FormulaTerm | null>(null);

  // Determina el elemento activo según el cursor, el foco o la selección.
  const active = hovered ?? focused ?? selected;

  // Agrupa el estado y las funciones que se comparten mediante el contexto.
  const value = useMemo(
    () => ({ active, selected, hover, focus, select }),
    [active, selected],
  );

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  );
};

// Permite acceder al estado y a las funciones de interacción
// desde cualquier componente incluido dentro del Provider.
export const useGravityFormulaInteraction = () => {
  // Obtiene el contexto compartido de la fórmula.
  const context = useContext(InteractionContext);

  if (!context)
    throw new Error(
      "Formula interactions require GravityFormulaInteractionProvider",
    );

  return context;
};
