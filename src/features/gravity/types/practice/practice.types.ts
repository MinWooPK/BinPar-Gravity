export const concepts = [
  "attraction",
  "mass",
  "distance",
  "mutual",
  "km",
  "cm",
  "tonnes",
  "square",
  "power",
  "force",
  "reasoning",
] as const;
export type Concept = (typeof concepts)[number];
export type Difficulty = 1 | 2 | 3;
export type Locale = "es" | "en" | "fr";

export const PRACTICE_QUESTION_COUNT = 5;

export type Definition = {
  concept: Concept;
  difficulty: Difficulty;
  a: number;
  b: number;
  r: number;
  exponent: number;
  scene: "objects" | "laboratory" | "workshop";
};
export type Question = Definition & {
  id: string;
  hint: string;
  number: number;
  reinforcement: boolean;
};
export type Answer = {
  value: string;
  exponent: string;
};
export type Attempt = {
  question: Question;
  answer: Answer;
  correct: boolean;
  expected: number | string;
  actual: number | string;
  error: string | null;
  usedHint: boolean;
};
export type Report = {
  summary: string;
  strengths: string[];
  review: string[];
  recommendations: {
    stage: "gravity-discovery" | "gravity-understanding" | "gravity-laboratory";
    text: string;
  }[];
};
export type PracticeSession = {
  locale: Locale;
  expires: number;
  history: Attempt[];
  question: Question;
  phase: "question" | "checked" | "complete";
};
export type Feedback = {
  correct: boolean;
  expected: number | string;
  actual: number | string;
  error: string | null;
  explanation: string;
  steps: string[];
};
export type PracticeView = {
  token: string;
  question: Question;
  count: number;
  score: number;
  hints: number;
  feedback?: Feedback;
  report?: Report;
  history: {
    concept: Concept;
    correct: boolean;
    usedHint: boolean;
  }[];
};
export type PracticeRequest =
  | {
      action: "start";
      locale: Locale;
    }
  | {
      action: "answer";
      token: string;
      answer: Answer;
      usedHint: boolean;
    }
  | {
      action: "next";
      token: string;
    };
