import type { TutorContext } from "../types/tutor.types";

// Define un identificador único para la conversación global del Tutor IA.
export type TutorSessionId = "global";

// Devuelve el identificador de sesión compartido entre todas las páginas.
export const getTutorSessionKey = (): TutorSessionId => "global";

// Devuelve la clave de conversación global, independientemente del idioma.
export const getTutorConversationKey = (): TutorSessionId => "global";

// Identifica el contexto inicial del Tutor IA según la ruta actual.
export function routeTutorContext(pathname: string): TutorContext {
  // Elimina el prefijo del idioma y la barra final de la URL.
  const path = pathname.replace(/^\/(es|en|fr)(?=\/|$)/, "").replace(/\/$/, "");

  if (path === "/three-body") return { kind: "three-body", stage: null };

  // Extrae el identificador de una órbita desde su URL.
  const slug = path.match(/^\/three-body\/([^/]+)$/)?.[1];

  if (slug) return { kind: "three-body", stage: "orbit", slug };

  // El laboratorio de gravedad proporciona su contexto
  // mediante el Provider que gestiona sus parámetros.
  return { kind: "home", stage: null };
}

// Genera un identificador del contexto actual para distinguir
// las conversaciones históricas de diferentes secciones.
export const tutorContextId = (context: TutorContext) =>
  `${context.kind}:${context.stage ?? "welcome"}${
    context.kind === "three-body" && context.slug ? `:${context.slug}` : ""
  }`;
