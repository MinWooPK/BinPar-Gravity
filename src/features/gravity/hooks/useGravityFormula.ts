"use client";

import { useState } from "react";
import {
  changeFormulaInput,
  initialFormulaInput,
  isInLaboratoryRange,
} from "../application/formulaInput";
import type { GravityVariable } from "../domain/gravitation";
import { useGravityControls } from "../components/GravityParametersProvider";

export const useGravityFormula = () => {
  const [state, setState] = useState(initialFormulaInput);
  const { setParameters } = useGravityControls();

  const changeValue = (key: GravityVariable, text: string) => {
    const next = changeFormulaInput(state, key, text);
    setState(next);
    if (next.result && isInLaboratoryRange(next.result)) {
      const { mass1, mass2, distance } = next.result;
      setParameters({ mass1, mass2, distance });
    }
  };

  return { ...state, changeValue };
};
