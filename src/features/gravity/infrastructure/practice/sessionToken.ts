import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import {
  PRACTICE_QUESTION_COUNT,
  type PracticeSession,
} from "../../types/practice/practice.types";

// Genera una clave de cifrado a partir de la API Key de OpenAI.
const key = () => {
  if (!process.env.OPENAI_API_KEY) throw new Error("not_configured");

  return createHash("sha256")
    .update(`gravity-practice-v1:${process.env.OPENAI_API_KEY}`)
    .digest();
};

// Cifra los datos de la sesión y genera un token seguro para conservar su estado.
export const sealSession = (session: PracticeSession): string => {
  // Genera un vector de inicialización aleatorio y configura el cifrado AES-256-GCM.
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv);

  // Cifra los datos de la sesión convertidos a JSON.
  const data = Buffer.concat([
    cipher.update(JSON.stringify(session)),
    cipher.final(),
  ]);

  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
};

// Descifra y recupera una sesión a partir de su token,
// comprobando que no haya caducado y que respete el límite de preguntas.
export const openSession = (token: string): PracticeSession => {
  try {
    // Convierte el token recibido en datos binarios.
    const data = Buffer.from(token, "base64url");

    // Configura el descifrado utilizando la clave y el vector de inicialización.
    const cipher = createDecipheriv("aes-256-gcm", key(), data.subarray(0, 12));

    cipher.setAuthTag(data.subarray(12, 28));

    // Recupera los datos originales de la sesión.
    const session = JSON.parse(
      Buffer.concat([
        cipher.update(data.subarray(28)),
        cipher.final(),
      ]).toString(),
    ) as PracticeSession;

    if (
      session.expires < Date.now() ||
      session.history.length > PRACTICE_QUESTION_COUNT
    )
      throw new Error();

    return session;
  } catch {
    throw new Error("invalid_session");
  }
};
