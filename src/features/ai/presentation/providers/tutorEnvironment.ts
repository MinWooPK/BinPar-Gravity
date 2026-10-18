"use client";

import { createContext, useContext } from "react";
import type { TutorContext, TutorIntent } from "../../types/tutor.types";
import type { GravityProposalPort } from "../../types/proposal.types";

export type PublishedContext = { pathname: string; context: TutorContext; label?: string; gravity?: GravityProposalPort };
export type TutorLauncher = (intent?: TutorIntent | "configure_experiment", trigger?: HTMLElement) => void;
type TutorEnvironment = {
  openTutor: TutorLauncher;
  registerLauncher: (launcher: TutorLauncher) => () => void;
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

/** Public educational entry point; conversation remains owned by GlobalTutor. */
export const useTutorActions = () => {
  const { openTutor } = useTutorEnvironment();
  return { openTutor };
};
