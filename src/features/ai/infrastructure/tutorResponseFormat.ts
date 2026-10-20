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
              action: { type: "string", enum: ["set_three_body_parameters"] },
              parameters: {
                type: "object",
                properties: {
                  gravity: { type: ["number", "null"] },
                  duration: { type: ["number", "null"] },
                  bodies: {
                    type: "array", minItems: 3, maxItems: 3,
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
