// Define el formato JSON obligatorio de las respuestas del Tutor IA,
// incluyendo explicaciones y propuestas para Gravedad.
export const tutorResponseFormat = {
  type: "json_schema",
  name: "gravity_tutor_reply",
  strict: true,

  // Establece la estructura que debe cumplir la respuesta del modelo.
  schema: {
    type: "object",
    properties: {
      // Contiene la explicación en texto generada por el Tutor IA.
      text: { type: "string" },

      // Permite devolver una propuesta de modificación o null
      // cuando el Tutor IA solamente debe responder.
      proposal: {
        anyOf: [
          { type: "null" },

          // Define las propuestas para modificar el laboratorio de gravedad.
          {
            type: "object",
            properties: {
              action: { type: "string", enum: ["set_gravity_parameters"] },

              // Permite proponer cambios en las dos masas y la distancia.
              parameters: {
                type: "object",
                properties: {
                  mass1: { type: ["number", "null"] },
                  mass2: { type: ["number", "null"] },
                  distance: { type: ["number", "null"] },
                },
                required: ["mass1", "mass2", "distance"],
                additionalProperties: false,
              },
            },
            required: ["action", "parameters"],
            additionalProperties: false,
          },
        ],
      },
    },
    required: ["text", "proposal"],
    additionalProperties: false,
  },
} as const;
