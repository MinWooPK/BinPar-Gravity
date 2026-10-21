import { TUTOR_MAX_BODY_BYTES } from "../application/tutor";

// Límites de peticiones a la IA.
export const TUTOR_RATE_WINDOW_MS = 60_000;
export const TUTOR_REQUESTS_PER_CLIENT = 8;
export const TUTOR_REQUESTS_PER_PROCESS = 40;
export const TUTOR_MAX_CONCURRENT_REQUESTS = 4;

const MAX_TRACKED_CLIENTS = 1024;

// Next.js puede construir request.url con el hostname interno del contenedor.
// Host conserva el destino de la petición del navegador, incluido su puerto.
export const isSameOriginRequest = (request: Request): boolean => {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const url = new URL(request.url);
    const host = request.headers.get("host");
    const target = host ? new URL(`${url.protocol}//${host}`) : url;

    if (
      host &&
      (target.username ||
        target.password ||
        target.pathname !== "/" ||
        target.search ||
        target.hash)
    ) {
      return false;
    }

    return origin === target.origin;
  } catch {
    return false;
  }
};

// Guarda las peticiones de cada cliente.
type Registro = {
  cantidad: number;
  inicio: number;
  activas: number;
};

// Resultado de comprobar si una petición está permitida.
type Permiso =
  | { allowed: true; release: () => void }
  | { allowed: false; retryAfterSeconds: number };

// Controla cuántas peticiones pueden hacerse a la IA.
export const createTutorLimiter = (ahora: () => number = Date.now) => {
  const clientes = new Map<string, Registro>();

  let inicioVentana = ahora();
  let totalPeticiones = 0;
  let activas = 0;

  return {
    acquire(cliente: string): Permiso {
      const tiempo = ahora();

      // Reinicia el contador cada 60 segundos.
      if (tiempo - inicioVentana >= TUTOR_RATE_WINDOW_MS) {
        inicioVentana = tiempo;
        totalPeticiones = 0;
      }

      // Elimina los registros antiguos.
      for (const [clave, registro] of clientes) {
        if (
          tiempo - registro.inicio >= TUTOR_RATE_WINDOW_MS &&
          registro.activas === 0
        )
          clientes.delete(clave);
      }

      let registro = clientes.get(cliente);

      if (registro && tiempo - registro.inicio >= TUTOR_RATE_WINDOW_MS) {
        registro.cantidad = 0;
        registro.inicio = tiempo;
      }

      // Comprueba si se ha superado algún límite.
      if (
        (!registro && clientes.size >= MAX_TRACKED_CLIENTS) ||
        totalPeticiones >= TUTOR_REQUESTS_PER_PROCESS ||
        activas >= TUTOR_MAX_CONCURRENT_REQUESTS ||
        (registro &&
          (registro.cantidad >= TUTOR_REQUESTS_PER_CLIENT ||
            registro.activas >= 1))
      ) {
        const proximoIntento =
          Math.max(inicioVentana, registro?.inicio ?? inicioVentana) +
          TUTOR_RATE_WINDOW_MS;

        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((proximoIntento - tiempo) / 1000),
          ),
        };
      }

      // Registra un cliente nuevo.
      if (!registro) {
        registro = { cantidad: 0, inicio: tiempo, activas: 0 };
        clientes.set(cliente, registro);
      }

      // Cuenta la nueva petición.
      registro.cantidad++;
      registro.activas++;
      totalPeticiones++;
      activas++;

      const registroAutorizado = registro;
      let liberado = false;

      return {
        allowed: true,

        // Libera el permiso al terminar la petición.
        release: () => {
          if (liberado) return;

          liberado = true;
          registroAutorizado.activas--;
          activas--;
        },
      };
    },
  };
};

// Error cuando la petición es demasiado grande.
export class TutorBodyTooLargeError extends Error {}

// Lee una petición y controla su tamaño y tiempo de espera.
export const readTutorBody = async (peticion: Request): Promise<string> => {
  const declarado = peticion.headers.get("content-length");

  if (declarado && Number(declarado) > TUTOR_MAX_BODY_BYTES)
    throw new TutorBodyTooLargeError();

  if (!peticion.body) return "";

  const lector = peticion.body.getReader();
  const decodificador = new TextDecoder();

  // Tiempo máximo de lectura: 5 segundos.
  const plazo = AbortSignal.timeout(5000);

  let bytes = 0;
  let texto = "";

  // Cancela la lectura cuando sea necesario.
  const cancelar = () => {
    void lector.cancel().catch(() => {});
  };

  plazo.addEventListener("abort", cancelar, { once: true });
  peticion.signal.addEventListener("abort", cancelar, { once: true });

  try {
    while (true) {
      const fragmento = await lector.read();

      if (plazo.aborted || peticion.signal.aborted)
        throw new Error("Request body aborted");

      if (fragmento.done) break;

      // Comprueba el tamaño recibido.
      bytes += fragmento.value.byteLength;

      if (bytes > TUTOR_MAX_BODY_BYTES) throw new TutorBodyTooLargeError();

      texto += decodificador.decode(fragmento.value, { stream: true });
    }

    return texto + decodificador.decode();
  } finally {
    // Limpia los recursos al terminar.
    plazo.removeEventListener("abort", cancelar);
    peticion.signal.removeEventListener("abort", cancelar);
    cancelar();
    lector.releaseLock();
  }
};
