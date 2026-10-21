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

// Genera la clave de cifrado.
const key = () => {
  if (!process.env.OPENAI_API_KEY) throw new Error("not_configured");

  return createHash("sha256")
    .update(`gravity-practice-v1:${process.env.OPENAI_API_KEY}`)
    .digest();
};

// Cifra la sesión y genera un token.
export const sealSession = (session: PracticeSession): string => {
  // Prepara el cifrado.
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);

  // Cifra los datos de la sesión.
  const data = Buffer.concat([
    cipher.update(JSON.stringify(session)),
    cipher.final(),
  ]);

  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
};

// Recupera la sesión a partir de su token.
export const openSession = (token: string): PracticeSession => {
  try {
    // Convierte el token en datos binarios.
    const data = Buffer.from(token, "base64url");

    // Prepara el descifrado.
    const cipher = createDecipheriv("aes-256-gcm", key(), data.subarray(0, 12));

    cipher.setAuthTag(data.subarray(12, 28));

    // Recupera los datos de la sesión.
    const session = JSON.parse(
      Buffer.concat([
        cipher.update(data.subarray(28)),
        cipher.final(),
      ]).toString(),
    ) as PracticeSession;

    // Comprueba la caducidad y el límite de preguntas.
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
