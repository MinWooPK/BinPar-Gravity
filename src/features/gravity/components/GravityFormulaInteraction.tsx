"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { GravityVariable } from "../domain/gravitation";

export type FormulaTerm = GravityVariable | "constant" | "masses";
type Interaction = {
  active: FormulaTerm | null;
  selected: FormulaTerm | null;
  hover: (term: FormulaTerm | null) => void;
  focus: (term: FormulaTerm | null) => void;
  select: (term: FormulaTerm | null) => void;
};
const InteractionContext = createContext<Interaction | null>(null);

/** One visual state for the equation, fields, definitions and read-only simulation. */
export const GravityFormulaInteractionProvider = ({ children }: { children: ReactNode }) => {
  const [hovered, hover] = useState<FormulaTerm | null>(null);
  const [focused, focus] = useState<FormulaTerm | null>(null);
  const [selected, select] = useState<FormulaTerm | null>(null);
  const active = hovered ?? focused ?? selected;
  const value = useMemo(() => ({ active, selected, hover, focus, select }), [active, selected]);
  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>;
};

export const useGravityFormulaInteraction = () => {
  const context = useContext(InteractionContext);
  if (!context) throw new Error("Formula interactions require GravityFormulaInteractionProvider");
  return context;
};
