"use client";

import { useCallback, useState } from "react";
import {
  changeFormulaInput,
  initialFormulaInput,
  selectFormulaUnknown,
} from "../application/formulaInput";
import type { GravityVariable } from "../domain/gravitation";

export const useGravityFormula = () => {
  const [state, setState] = useState(() =>
    selectFormulaUnknown(initialFormulaInput, "force"),
  );

  const changeValue = (key: GravityVariable, text: string) => {
    setState((current) => changeFormulaInput(current, key, text));
  };

  const selectUnknown = (key: GravityVariable) => {
    setState((current) => selectFormulaUnknown(current, key));
  };

  const resetFormula = useCallback(() => {
    setState(selectFormulaUnknown(initialFormulaInput, "force"));
  }, []);

  return { ...state, changeValue, selectUnknown, resetFormula };
};
