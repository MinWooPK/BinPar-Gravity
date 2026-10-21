import refinements from "./refinements.json";
import type { Body, OrbitDefinition, State } from "../types/orbit.types";

// Referencias científicas de las órbitas.
const paper = "https://arxiv.org/pdf/1312.6796";
const guide = "https://doi.org/10.1119/1.4867608";

// Crea las condiciones iniciales de tres cuerpos alineados.
const collinear = (vx: number, vy: number): State => [
  [-1, 0, vx, vy],
  [1, 0, vx, vy],
  [0, 0, -2 * vx, -2 * vy],
];

// Unidades y condiciones de las órbitas colineales.
const convention =
  "G = 1; masas = (1, 1, 1); r₁ = (−1, 0), r₂ = (1, 0), r₃ = (0, 0); v₁ = v₂ = (vx, vy), v₃ = −2v₁. Unidades adimensionales.";

// Velocidad angular de la órbita de Lagrange.
const omega = Math.sqrt(1 / Math.sqrt(3));

// Calcula la posición y velocidad de cada cuerpo.
const circularBody = (index: number): Body => {
  const angle = (index * 2 * Math.PI) / 3;

  return [
    Math.cos(angle),
    Math.sin(angle),
    -omega * Math.sin(angle),
    omega * Math.cos(angle),
  ];
};

// Condiciones iniciales de Lagrange.
const lagrange: State = [circularBody(0), circularBody(1), circularBody(2)];

// Seis órbitas con sus datos y referencias científicas.
export const publishedOrbits: readonly OrbitDefinition[] = [
  {
    slug: "lagrange",
    name: "Lagrange",
    category: "Clásica",
    year: "1772",
    description: "Tres cuerpos. Un triángulo que gira sin perder su forma.",
    insight:
      "Los tres cuerpos ocupan los vértices de un triángulo equilátero. La atracción conjunta apunta al centro y permite una rotación circular uniforme.",
    initial: lagrange,
    period: (2 * Math.PI) / omega,
    source: "https://arxiv.org/html/1303.0181v1",
    sourceLabel:
      "Solución equilátera clásica; normalización derivada en el README",
    convention:
      "G = m₁ = m₂ = m₃ = 1. Radio al baricentro R = 1, lado √3, ω² = 1/√3. v = ω(−y, x).",
  },
  {
    slug: "figura-de-ocho",
    name: "Figura de ocho",
    category: "Coreografía",
    year: "1993 / 2000",
    description: "Tres viajeros recorren el mismo ocho, por turnos.",
    insight:
      "Cada cuerpo recorre la misma curva, separado de los demás por un tercio del período. Cruzar la misma posición en momentos distintos no implica una colisión.",
    initial: [
      [-0.97000436, 0.24308753, -0.466203685, -0.43236573],
      [0.97000436, -0.24308753, -0.466203685, -0.43236573],
      [0, 0, 0.93240737, 0.86473146],
    ],
    period: 6.32591398,
    source: "https://people.ucsc.edu/~rmont/Nbdy/NbdyB.html",
    sourceLabel: "Richard Montgomery · datos de Carles Simó",
    convention:
      "G = masas = 1. Posiciones y velocidades de Simó publicadas por Montgomery. Período aproximado 6,32591398; no se rota ni reescala el estado.",
  },
  {
    slug: "butterfly-i",
    name: "Butterfly I",
    category: "Periódica",
    year: "2013",
    description: "Una danza de bucles con simetría de mariposa.",
    insight:
      "Las aproximaciones entre los cuerpos obligan al integrador a reducir su paso temporal. Un paso fijo demasiado grande deforma los bucles.",
    initial: collinear(0.306892758965492, 0.125506782829762),
    period: 6.23564136316479,
    source: paper,
    sourceLabel: "Šuvakov–Dmitrašinović · tabla I recogida por Li–Liao",
    convention,
  },
  {
    slug: "goggles",
    name: "Goggles",
    category: "Periódica",
    year: "2013",
    description: "Lazos entrelazados que recuerdan a unas gafas.",
    insight:
      "La velocidad no es constante: los cuerpos aceleran en los encuentros cercanos. El reproductor conserva el tiempo físico de la integración.",
    initial: collinear(0.0833000564575194, 0.127889282226563),
    period: 10.4668176954385,
    source: paper,
    sourceLabel: "Šuvakov–Dmitrašinović · tabla I recogida por Li–Liao",
    convention,
  },
  {
    slug: "moth-i",
    name: "Moth I",
    category: "Periódica",
    year: "2013",
    description: "Un delicado patrón de alas bajo una misma ley.",
    insight:
      "Las mismas ecuaciones pueden producir figuras muy diferentes. Aquí solo cambian las velocidades iniciales, manteniendo masas y posiciones.",
    initial: collinear(0.464445237398184, 0.396059973403921),
    period: 14.8939113169584,
    source: guide,
    sourceLabel:
      "Šuvakov–Dmitrašinović · A guide to hunting periodic three-body orbits, tabla I",
    convention,
  },
  {
    slug: "yin-yang-i",
    name: "Yin-Yang I",
    category: "Periódica",
    year: "2013",
    description: "Una órbita de contrastes alrededor del equilibrio.",
    insight:
      "Se utiliza la variante II.C.2a. La publicación también recoge una variante 2b relacionada por cambio de escala y de fase: no conviene mezclar sus velocidades y períodos.",
    initial: collinear(0.513938054919243, 0.304736003875733),
    period: 17.328369755004,
    source: paper,
    sourceLabel: "Šuvakov–Dmitrašinović · variante II.C.2a, tabla I de Li–Liao",
    convention,
  },
];

// Aplica los valores refinados cuando están disponibles.
export const orbits: readonly OrbitDefinition[] = publishedOrbits.map(
  (orbit) => {
    const refined = (
      refinements as Record<string, { vx: number; vy: number; period: number }>
    )[orbit.slug];

    return refined
      ? {
          ...orbit,
          initial: collinear(refined.vx, refined.vy),
          period: refined.period,
        }
      : orbit;
  },
);

// Busca una órbita por su identificador.
export const getOrbit = (slug: string) =>
  orbits.find((orbit) => orbit.slug === slug);
