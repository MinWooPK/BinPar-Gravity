import { TUTOR_MAX_BODY_BYTES } from "../application/tutor";

// Define la duración de la ventana de limitación de peticiones: 60 segundos.
export const TUTOR_RATE_WINDOW_MS = 60_000;

// Establece el máximo de peticiones permitidas por cliente y ventana.
export const TUTOR_REQUESTS_PER_CLIENT = 8;

// Establece el máximo de peticiones permitidas por proceso y ventana.
export const TUTOR_REQUESTS_PER_PROCESS = 40;

// Limita el número de peticiones que pueden ejecutarse simultáneamente.
export const TUTOR_MAX_CONCURRENT_REQUESTS = 4;

// Define el número máximo de clientes que se pueden registrar en memoria.
const MAX_TRACKED_CLIENTS = 1024;

// Define los contadores de peticiones y actividad de cada cliente.
type Bucket = { count: number; started: number; active: number };

// Define el resultado de solicitar permiso para realizar una petición.
type Permit =
  | { allowed: true; release: () => void }
  | { allowed: false; retryAfterSeconds: number };

// Crea un limitador de peticiones para proteger la API del Tutor IA
// frente a solicitudes excesivas y llamadas simultáneas.
export const createTutorLimiter = (now: () => number = Date.now) => {
  // Almacena los contadores de las peticiones de cada cliente.
  const clients = new Map<string, Bucket>();

  // Guarda el inicio de la ventana temporal del proceso.
  let windowStarted = now();

  // Cuenta las peticiones realizadas durante la ventana actual.
  let processCount = 0;

  // Cuenta las peticiones que se están ejecutando simultáneamente.
  let active = 0;

  return {
    // Comprueba si un cliente puede realizar una nueva petición.
    acquire(client: string): Permit {
      // Obtiene el instante actual.
      const time = now();

      if (time - windowStarted >= TUTOR_RATE_WINDOW_MS) {
        windowStarted = time;
        processCount = 0;
      }

      for (const [key, bucket] of clients) {
        if (
          time - bucket.started >= TUTOR_RATE_WINDOW_MS &&
          bucket.active === 0
        )
          clients.delete(key);
      }

      // Recupera los contadores del cliente que solicita acceso.
      let bucket = clients.get(client);

      if (bucket && time - bucket.started >= TUTOR_RATE_WINDOW_MS) {
        bucket.count = 0;
        bucket.started = time;
      }

      if (
        (!bucket && clients.size >= MAX_TRACKED_CLIENTS) ||
        processCount >= TUTOR_REQUESTS_PER_PROCESS ||
        active >= TUTOR_MAX_CONCURRENT_REQUESTS ||
        (bucket &&
          (bucket.count >= TUTOR_REQUESTS_PER_CLIENT || bucket.active >= 1))
      ) {
        // Calcula cuándo podrá volver a intentar la petición.
        const retryAt =
          Math.max(windowStarted, bucket?.started ?? windowStarted) +
          TUTOR_RATE_WINDOW_MS;

        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((retryAt - time) / 1000)),
        };
      }

      if (!bucket) {
        bucket = { count: 0, started: time, active: 0 };
        clients.set(client, bucket);
      }

      bucket.count++;
      bucket.active++;
      processCount++;
      active++;

      // Conserva la referencia al contador del cliente autorizado.
      const acquiredBucket = bucket;

      // Evita liberar el mismo permiso más de una vez.
      let released = false;

      return {
        allowed: true,
        release: () => {
          if (released) return;

          released = true;
          acquiredBucket.active--;
          active--;
        },
      };
    },
  };
};

// Define el error utilizado cuando una petición supera
// el tamaño máximo permitido.
export class TutorBodyTooLargeError extends Error {}

// Lee el contenido de una petición HTTP controlando
// su tamaño máximo y el tiempo disponible para recibirla.
export const readTutorBody = async (request: Request): Promise<string> => {
  // Obtiene el tamaño declarado de la petición, si existe.
  const declared = request.headers.get("content-length");

  if (declared && Number(declared) > TUTOR_MAX_BODY_BYTES)
    throw new TutorBodyTooLargeError();

  if (!request.body) return "";

  // Permite leer el contenido recibido por fragmentos.
  const reader = request.body.getReader();

  // Convierte los fragmentos de bytes en texto.
  const decoder = new TextDecoder();

  // Establece un tiempo máximo de lectura de cinco segundos.
  const deadline = AbortSignal.timeout(5000);

  // Acumula el tamaño total recibido en bytes.
  let bytes = 0;

  // Almacena el contenido de texto recibido.
  let text = "";

  // Cancela la lectura del contenido cuando sea necesario.
  const cancel = () => {
    void reader.cancel().catch(() => {});
  };

  deadline.addEventListener("abort", cancel, { once: true });
  request.signal.addEventListener("abort", cancel, { once: true });

  try {
    while (true) {
      // Lee el siguiente fragmento de la petición.
      const chunk = await reader.read();

      if (deadline.aborted || request.signal.aborted)
        throw new Error("Request body aborted");

      if (chunk.done) break;

      bytes += chunk.value.byteLength;

      if (bytes > TUTOR_MAX_BODY_BYTES) throw new TutorBodyTooLargeError();

      text += decoder.decode(chunk.value, { stream: true });
    }

    return text + decoder.decode();
  } finally {
    deadline.removeEventListener("abort", cancel);
    request.signal.removeEventListener("abort", cancel);
    cancel();
    reader.releaseLock();
  }
};
