"use client";

import { createContext, useContext, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { initialParameters } from "../domain/gravitation";
import type { GravityParameters } from "../domain/gravitation";

type ParametersContext = {
  parameters: GravityParameters;
  setParameters: Dispatch<SetStateAction<GravityParameters>>;
  resetParameters: () => void;
  resetVersion: number;
};
const Context = createContext<ParametersContext | null>(null);

export const GravityParametersProvider = ({ children }: { children: ReactNode }) => {
  const [parameters, setParameters] = useState<GravityParameters>(initialParameters);
  const [resetVersion, setResetVersion] = useState(0);
  const resetParameters = () => {
    setParameters({ ...initialParameters });
    setResetVersion((version) => version + 1);
  };
  return <Context.Provider value={{ parameters, setParameters, resetParameters, resetVersion }}>{children}</Context.Provider>;
};

export const useGravityParameters = () => {
  const context = useContext(Context);
  if (!context) throw new Error("Gravity parameters require GravityParametersProvider");
  return context;
};
