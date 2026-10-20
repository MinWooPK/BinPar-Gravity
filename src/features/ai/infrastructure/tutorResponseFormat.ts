// Define el formato JSON obligatorio de las respuestas del Tutor IA,
// incluyendo explicaciones y propuestas para Gravedad o Tres Cuerpos.
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

          // Define las propuestas para modificar el experimento de tres cuerpos.
          {
            type: "object",
            properties: {
              action: { type: "string", enum: ["set_three_body_parameters"] },

              // Define la gravedad, duración y propiedades de los tres cuerpos.
              parameters: {
                type: "object",
                properties: {
                  gravity: { type: ["number", "null"] },
                  duration: { type: ["number", "null"] },

                  // Exige exactamente tres cuerpos con sus parámetros físicos.
                  bodies: {
                    type: "array",
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        mass: { type: ["number", "null"] },
                        x: { type: ["number", "null"] },
                        y: { type: ["number", "null"] },
                        vx: { type: ["number", "null"] },
                        vy: { type: ["number", "null"] },
                      },
                      required: ["mass", "x", "y", "vx", "vy"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["gravity", "duration", "bodies"],
                additionalProperties: false,
              },
            },
            required: ["action", "parameters"],
            additionalProperties: false,
          },

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
