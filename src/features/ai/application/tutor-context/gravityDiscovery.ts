// Información educativa que utiliza el Tutor IA en Descubre.
export const gravityDiscovery = {
  definition:
    "Every body with mass attracts other bodies with mass. Gravity acts at a distance; the forces on two bodies have equal magnitude and opposite directions.",

  effects: ["falling objects", "the motion of the Moon and planets", "tides"],

  illustration:
    "The Earth–Moon diagram is conceptual: sizes and distances are not to scale, and it is not an orbital simulation.",

  history: [
    {
      name: "Galileo Galilei",
      contribution:
        "Studied motion and free fall through experiments and mathematical descriptions.",
    },
    {
      name: "Johannes Kepler",
      contribution:
        "Formulated laws describing planetary orbits from astronomical observations.",
    },
    {
      name: "Isaac Newton",
      year: 1687,
      contribution:
        "Published the law of universal gravitation in the Principia, building on earlier work and relating falling bodies to the motion of the Moon and planets. He was not the first person to observe gravity.",
    },
    {
      name: "Henry Cavendish",
      year: 1798,
      contribution:
        "Measured the Earth's mean density using attraction between masses. This was a fundamental precursor to experimental determinations of G; he did not originally report the result as a value of G.",
    },
  ],

  gravitationalConstant:
    "G is a fixed physical constant determined by experiments, not an adjustable laboratory parameter.",

  siUnits: {
    kg: "kilogram: unit of mass",
    m: "metre: unit of distance; r is measured between the centres of the two bodies",
    N: "newton: unit of force; 1 N = 1 kg·m/s²",
    G: "N·m²/kg²",
  },
} as const;
