//identifica el contexto del historial de conversaciones guardadas.
export function tutorContextLabel(
  id: string | undefined,
  t: (key: string) => string,
): string {
  const [kind, stage, slug] = (id ?? "").split(":");

  const known = [
    "gravity-discovery",
    "gravity-understanding",
    "gravity-laboratory",
    "gravity-challenges",
    "discover",
    "gallery",
    "experiment",
    "orbit",
  ];

  const label = t(
    `contexts.${known.includes(stage) ? stage : kind === "gravity" ? "gravity" : kind === "three-body" ? "threeBody" : "home"}`,
  );

  return slug ? `${label} · ${slug}` : label;
}
