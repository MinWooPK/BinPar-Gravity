"use client";

import { createContext, useContext } from "react";

import type { TutorContext, TutorIntent } from "../../types/tutor.types";
import type { GravityProposalPort } from "../../types/proposal.types";
import type { TutorSessionId } from "../../application/tutorAvailability";

// Información que recibe el Tutor IA de cada página.
export type PublishedContext = {
  pathname: string;
  context: TutorContext;
  gravity?: GravityProposalPort;
};

// Formas de abrir el Tutor IA.
export type TutorLaunch =
  | TutorIntent
  | "configure_experiment"
  | { question: string; intent?: TutorIntent };

export type TutorLauncher = (
  intent?: TutorLaunch,
  trigger?: HTMLElement,
) => void;

// Datos y funciones compartidos del Tutor IA.
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

// Accede a los datos y funciones del Tutor IA.
export const useTutorEnvironment = () => {
  const value = useContext(EnvironmentContext);

  if (!value) throw new Error("Tutor components require TutorProvider");

  return value;
};

// Permite abrir el Tutor IA desde cualquier componente.
export const useTutorActions = () => {
  const { openTutor } = useTutorEnvironment();

  return { openTutor };
};
