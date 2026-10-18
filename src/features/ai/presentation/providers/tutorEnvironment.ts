"use client";

import { createContext, useContext } from "react";
import type { TutorContext } from "../../types/tutor.types";

export type PublishedContext = { pathname: string; context: TutorContext; label?: string };
type TutorEnvironment = {
  sessionKey: string | null;
  publish: (value: PublishedContext) => () => void;
  current: () => PublishedContext | null;
};
export const EnvironmentContext = createContext<TutorEnvironment | null>(null);

export const useTutorEnvironment = () => {
  const value = useContext(EnvironmentContext);
  if (!value) throw new Error("Tutor components require TutorProvider");
  return value;
};
