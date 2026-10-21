import { expect, test, vi } from "vitest";
import { parseTutorRequest } from "../src/features/ai/application/tutor-request/tutorRequest";
import { buildTutorContext } from "../src/features/ai/application/tutor-context/tutorContext";
import { buildTutorPrompt } from "../src/features/ai/application/tutorPrompt";
import { parseTutorReply } from "../src/features/ai/application/tutorResponse";
import { decideTutorProposal } from "../src/features/ai/application/tutorProposal";
import { restoreTutorHistory, serializeTutorHistory } from "../src/features/ai/application/tutorHistory";
import { gravityStages } from "../src/features/gravity/application/gravityJourney";
import type { TutorRequest } from "../src/features/ai/types/tutor.types";
import type { TutorProposal } from "../src/features/ai/types/proposal.types";

const request: TutorRequest = {
  locale: "es",
  mode: "explain",
  context: {
    kind: "gravity",
    stage: "gravity-laboratory",
    parameters: { mass1: 60, mass2: 30, distance: 10 },
  },
  messages: [{ role: "user", content: "Explica la atracción" }],
};

const action = {
  action: "set_gravity_parameters" as const,
  parameters: { mass1: 80, mass2: null, distance: null },
};

test("Acepta las cuatro etapas de Gravedad en ES, EN y FR con sus parámetros reales", () => {
  for (const locale of ["es", "en", "fr"] as const) {
    for (const { id: stage } of gravityStages) {
      const value = { ...request, locale, context: { ...request.context, stage } };
      expect(parseTutorRequest(value)).toEqual(value);
      expect(buildTutorContext(value.context).current).toMatchObject(request.context.parameters);
    }
  }
});

test("No admite contextos de Inicio, Tres Cuerpos ni rutas desconocidas", () => {
  for (const kind of ["home", "three-body", "unknown"]) {
    expect(parseTutorRequest({ ...request, context: { kind, stage: null } })).toBeNull();
  }
  expect(parseTutorRequest({ ...request, context: {
    ...request.context, parameters: { ...request.context.parameters, mass1: 150 },
  } })).toBeNull();
});

test("Comprueba mantiene ayuda conceptual sin propuestas ni datos de la evaluación", () => {
  const context = { ...request.context, stage: "gravity-challenges" as const };
  const prompt = buildTutorPrompt({ ...request, context });
  expect(prompt.instructions).toContain("solamente pistas conceptuales");
  expect(prompt.instructions).toContain("sistema independiente de ejercicios");
  expect(buildTutorContext(context)).not.toHaveProperty("exercise");
  expect(parseTutorReply({ text: "Una pista conceptual", proposal: action }, context))
    .toEqual({ text: "Una pista conceptual" });
});

test("Las propuestas siguen requiriendo confirmación y un laboratorio vigente", () => {
  const apply = vi.fn(() => true);
  const source = { revision: 2, apply, reveal: vi.fn() };
  const proposal: TutorProposal = {
    kind: "gravity", action, source, status: "pending",
    baseline: request.context.parameters,
    contextSnapshot: JSON.stringify(request.context),
  };
  const target = { context: request.context, gravity: source };
  expect(parseTutorReply({ text: "Puedes aumentar la masa", proposal: action }, request.context).proposal).toEqual(action);
  expect(apply).not.toHaveBeenCalled();
  expect(decideTutorProposal(proposal, "cancel", target).status).toBe("cancelled");
  expect(decideTutorProposal(proposal, "apply", null).status).toBe("stale");
  expect(decideTutorProposal(proposal, "apply", { ...target, gravity: { ...source, revision: 3 } }).status).toBe("stale");
  expect(apply).not.toHaveBeenCalled();
  expect(decideTutorProposal(proposal, "apply", target).status).toBe("applied");
  expect(apply).toHaveBeenCalledExactlyOnceWith(action, 2);
});

test("Conserva los últimos 30 mensajes, incluidos los contextos históricos de otras secciones", () => {
  const messages = Array.from({ length: 35 }, (_, id) => ({
    id, role: "user" as const, content: `Pregunta ${id}`,
    contextId: id % 2 ? "home:welcome" : "gravity:gravity-discovery",
  }));
  const restored = restoreTutorHistory(serializeTutorHistory(messages));
  expect(restored).toHaveLength(30);
  expect(restored[0]).toMatchObject({ content: "Pregunta 5", contextId: "home:welcome" });
  expect(restored.at(-1)?.content).toBe("Pregunta 34");
});
