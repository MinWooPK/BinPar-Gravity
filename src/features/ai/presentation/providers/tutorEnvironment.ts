"use client";

import { createContext, useContext } from "react";
import type { TutorContext, TutorIntent } from "../../types/tutor.types";
import type { GravityProposalPort } from "../../types/proposal.types";
import type { TutorSessionId } from "../../application/tutorAvailability";

// Define el contexto que comparte cada página con el Tutor IA.
export type PublishedContext = {
  pathname: string;
  context: TutorContext;
  gravity?: GravityProposalPort;
};

// Define las acciones que pueden abrir el Tutor IA.
export type TutorLaunch =
  | TutorIntent
  | "configure_experiment"
  | { question: string; intent?: TutorIntent };

export type TutorLauncher = (
  intent?: TutorLaunch,
  trigger?: HTMLElement,
) => void;

// Agrupa el estado y las funciones compartidas del Tutor IA.
type TutorEnvironment = {
  activeSessionId: TutorSessionId;
  context: TutorContext;
  openTutor: TutorLauncher;
  registerLauncher: (launcher: TutorLauncher) => () => void;
  registerHighlight: (
    callback: (term: "constant" | "masses" | "distance" | null) => void,
  ) => () => void;
  highlight: (term: "constant" | "masses" | "distance" | null) => void;
  sessionKey: "global";
  publish: (value: PublishedContext) => () => void;
  current: () => PublishedContext | null;
};

export const EnvironmentContext = createContext<TutorEnvironment | null>(null);

// Permite acceder al contexto del Tutor IA.
export const useTutorEnvironment = () => {
  const value = useContext(EnvironmentContext);

  if (!value) throw new Error("Tutor components require TutorProvider");

  return value;
};

// Permite abrir el Tutor IA desde otros componentes.
export const useTutorActions = () => {
  const { openTutor } = useTutorEnvironment();

  return { openTutor };
};
