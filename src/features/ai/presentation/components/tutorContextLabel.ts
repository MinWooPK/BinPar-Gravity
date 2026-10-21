// Identifica la sección de los mensajes guardados.
export function tutorContextLabel(
  id: string | undefined,
  traducir: (clave: string) => string,
): string {
  const [tipo, etapa, slug] = (id ?? "").split(":");

  // Etapas que puede reconocer el Tutor IA.
  const etapas = [
    "gravity-discovery",
    "gravity-understanding",
    "gravity-laboratory",
    "gravity-challenges",
    "discover",
    "gallery",
    "experiment",
    "orbit",
  ];

  // Busca la traducción correspondiente.
  let clave = "home";

  if (etapas.includes(etapa)) {
    clave = etapa;
  } else if (tipo === "gravity") {
    clave = "gravity";
  } else if (tipo === "three-body") {
    clave = "threeBody";
  }

  const etiqueta = traducir(`contexts.${clave}`);

  return slug ? `${etiqueta} · ${slug}` : etiqueta;
}
