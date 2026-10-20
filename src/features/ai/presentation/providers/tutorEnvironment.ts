"use client";

import { createContext, useContext } from "react";
import type { TutorContext, TutorIntent } from "../../types/tutor.types";
import type { GravityProposalPort, ThreeBodyProposalPort } from "../../types/proposal.types";

export type PublishedContext = { pathname: string; context: TutorContext; gravity?: GravityProposalPort; threeBody?: ThreeBodyProposalPort };
export type TutorLaunch = TutorIntent | "configure_experiment" | { question: string; intent?: TutorIntent };
export type TutorLauncher = (intent?: TutorLaunch, trigger?: HTMLElement) => void;
import type { TutorSessionId } from "../../application/tutorAvailability";

type TutorEnvironment = {
  registerThreeBody: (port: ThreeBodyProposalPort) => () => void;
  activeSessionId: TutorSessionId;
  context: TutorContext;
  openTutor: TutorLauncher;
  registerLauncher: (launcher: TutorLauncher) => () => void;
  registerHighlight: (callback: (term: "constant" | "masses" | "distance" | null) => void) => () => void;
  highlight: (term: "constant" | "masses" | "distance" | null) => void;
  sessionKey: "global";
  publish: (value: PublishedContext) => () => void;
  current: () => PublishedContext | null;
};
export const EnvironmentContext = createContext<TutorEnvironment | null>(null);

export const useTutorEnvironment = () => {
  const value = useContext(EnvironmentContext);
  if (!value) throw new Error("Tutor components require TutorProvider");
  return value;
};

/** Public educational entry point; conversation remains owned by the shared provider. */
export const useTutorActions = () => {
  const { openTutor } = useTutorEnvironment();
  return { openTutor };
};
