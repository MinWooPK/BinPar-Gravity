"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { initialParameters } from "../domain/gravitation";
import type { GravityParameters } from "../domain/gravitation";

type GravityControls = {
  setParameters: Dispatch<SetStateAction<GravityParameters>>;
  resetParameters: () => void;
  resetVersion: number;
};
const ParametersContext = createContext<GravityParameters | null>(null);
const ControlsContext = createContext<GravityControls | null>(null);

export const GravityParametersProvider = ({ children }: { children: ReactNode }) => {
  const [parameters, setParameters] = useState<GravityParameters>(initialParameters);
  const [resetVersion, setResetVersion] = useState(0);
  const resetParameters = useCallback(() => {
    setParameters({ ...initialParameters });
    setResetVersion((version) => version + 1);
  }, []);
  // Formula consumers need reset notifications and actions, but no slider values.
  const controls = useMemo(
    () => ({ setParameters, resetParameters, resetVersion }),
    [resetParameters, resetVersion],
  );
  return (
    <ControlsContext.Provider value={controls}>
      <ParametersContext.Provider value={parameters}>
        {children}
      </ParametersContext.Provider>
    </ControlsContext.Provider>
  );
};

export const useGravityControls = () => {
  const context = useContext(ControlsContext);
  if (!context) throw new Error("Gravity parameters require GravityParametersProvider");
  return context;
};

export const useGravityParameters = () => {
  const parameters = useContext(ParametersContext);
  const controls = useGravityControls();
  if (!parameters) throw new Error("Gravity parameters require GravityParametersProvider");
  return { parameters, ...controls };
};
