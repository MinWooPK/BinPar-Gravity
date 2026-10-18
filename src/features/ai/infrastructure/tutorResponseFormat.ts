/** Responses API Structured Outputs; application validation enforces ranges and steps. */
export const tutorResponseFormat = {
  type: "json_schema",
  name: "gravity_tutor_reply",
  strict: true,
  schema: {
    type: "object",
    properties: {
      text: { type: "string" },
      proposal: {
        anyOf: [
          { type: "null" },
          {
            type: "object",
            properties: {
              action: { type: "string", enum: ["set_gravity_parameters"] },
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
