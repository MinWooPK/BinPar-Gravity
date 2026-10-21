# BinPar · Gravity Lab

Aplicación educativa desarrollada como prueba técnica para BinPar. Permite aprender la ley de gravitación de Newton, experimentar con sus variables y explorar el problema de los tres cuerpos mediante integración numérica.

**Demo:** [bin-par-gravity.vercel.app](https://bin-par-gravity.vercel.app). URL comprobada por HTTP el 21 de octubre de 2026: la raíz redirige a `/es` y responde con 200. Esta comprobación confirma la disponibilidad de la página, no las credenciales de IA ni la correspondencia exacta entre el despliegue y el código local.

**Repositorio:** [MinWooPK/BinPar-Gravity](https://github.com/MinWooPK/BinPar-Gravity).

## Tecnologías

| Tecnología                    | Uso                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| Next.js 16.4.2 y React 19     | App Router, páginas de servidor, rutas API e interfaz interactiva                                |
| TypeScript                    | Contratos, validaciones y cálculos físicos                                                       |
| Tailwind CSS 4                | Estilos y adaptación a distintos tamaños de pantalla                                             |
| next-intl 4                   | Interfaz en español, inglés y francés                                                            |
| Three.js                      | Tierra 3D de la portada, con texturas locales                                                    |
| SVG y `requestAnimationFrame` | Diagramas y reproducción de trayectorias                                                         |
| Web Worker                    | Cálculo del experimento libre fuera del hilo de la interfaz                                      |
| OpenAI Responses API          | Tutor, generación estructurada de ejercicios y explicaciones, mediante `fetch` desde el servidor |
| Vitest 5 y ESLint             | Pruebas unitarias y análisis estático                                                            |

Las rutas incluyen siempre el idioma: `/es`, `/en` y `/fr`. Algunos textos y referencias científicas del catálogo orbital permanecen en español.

## Gravedad

La ruta `/{locale}/gravity` organiza el aprendizaje en cuatro etapas:

| Etapa            | Contenido                                                                             | Hash                     |
| ---------------- | ------------------------------------------------------------------------------------- | ------------------------ |
| 01 · Descubre    | Conceptos, principios, ejemplos, historia y fundamento científico                     | `#gravity-discovery`     |
| 02 · Comprende   | Diagrama de atracción, fórmula interactiva, variables, unidades y calculadora         | `#gravity-understanding` |
| 03 · Experimenta | Controles de masas y distancia, comparación con la fuerza de referencia y calculadora | `#gravity-laboratory`    |
| 04 · Comprueba   | Práctica adaptativa de cinco preguntas, corrección e informe                          | `#gravity-challenges`    |

El laboratorio calcula `F = G · m1 · m2 / r²` con `G = 6,67430 × 10⁻¹¹ N·m²/kg²`. Las masas están en **kg**, la distancia entre centros en **m** y la fuerza en **N**. Los controles abarcan 10–100 kg por cuerpo y 5–20 m; el estado inicial es 40 kg, 40 kg y 8 m.

El dibujo es conceptual: los tamaños, la separación y las flechas no constituyen una representación a escala. Este módulo calcula la fuerza entre dos cuerpos; no integra su movimiento orbital.

La calculadora permite despejar F, m1, m2 o r. Conserva las entradas como texto y actualiza automáticamente los parámetros del simulador cuando el resultado es válido y está dentro de sus límites. Un resultado fuera de rango puede mostrarse en la fórmula mientras el simulador conserva los últimos valores válidos. No existe un paso adicional de «Aplicar valores». Las calculadoras de las distintas vistas comparten el borrador; restablecer desde la fórmula o los controles reinicia ambos estados.

Las etapas permanecen montadas al navegar dentro del módulo. La interfaz conserva su estado, utiliza hashes para la navegación y adapta los paneles a escritorio y móvil. Los subíndices matemáticos se dibujan con HTML o SVG para evitar depender de los glifos Unicode del dispositivo.

## Tres Cuerpos

`/{locale}/three-body` tiene cuatro etapas: **Descubre**, **Comprende**, **Galería** y **Experimenta**, accesibles mediante `#discover`, `#understand`, `#gallery` y `#experiment`.

### Seis soluciones conocidas

La galería reproduce Lagrange, Figura de ocho, Butterfly I, Goggles, Moth I y Yin-Yang I. Cada una tiene un detalle en `/{locale}/three-body/{slug}` con explicación, condiciones iniciales, referencia y controles de reproducción.

Las trayectorias se calculan en el servidor a partir de `data/orbits.ts`. El catálogo utiliza unidades **adimensionales**, con `G = 1` y las tres masas iguales a 1. Cuatro soluciones aplican velocidades y períodos refinados guardados por separado en `data/refinements.json`.

La integración emplea RK4 adaptativo, comparación entre un paso y dos medios pasos y corrección de Richardson. Genera por defecto 1.200 muestras equiespaciadas en tiempo. El reproductor interpola las posiciones, mantiene el color de cada cuerpo y repite el período conocido. A velocidad 1×, un segundo de reproducción equivale a una unidad de tiempo del modelo. Los datos preparados se reutilizan mediante una caché en memoria del servidor.

### Experimento libre y periodicidad

El usuario configura las tres masas, posiciones, velocidades, G y duración en unidades normalizadas. Al pulsar «Ejecutar simulación», un Worker calcula la trayectoria con RK4 adaptativo. La duración debe ser mayor que 0 y no superar 100 unidades de tiempo; se validan los números y las separaciones entre cuerpos.

La reproducción permite pausar, reiniciar, cambiar velocidad, recorrer el tiempo y mostrar estelas. A 1×, el intervalo completo se reproduce en aproximadamente 12 segundos, independientemente de su duración física. Al terminar se detiene; no se impone un bucle periódico. Editar la configuración invalida el resultado anterior y exige volver a ejecutar.

**Alcance real del análisis de periodicidad:** el catálogo calcula internamente errores de cierre del estado y diagnósticos de conservación. El experimento libre actual no incluye un detector de retornos aproximados ni una búsqueda automática de órbitas. Una trayectoria visualmente cerrada no demuestra periodicidad. [Detalles del motor numérico](docs/three-body-rk4.md).

Todo el módulo funciona sin OpenAI y no monta el Tutor IA.

## Tutor IA y evaluación adaptativa

El tutor está disponible **solo en Gravedad**. Un `TutorProvider` en su layout comparte la conversación entre las cuatro etapas. Recibe la etapa y los parámetros vigentes; el servidor valida esos datos y calcula la fuerza y los ejemplos numéricos con el dominio físico.

- Las preguntas y los botones de ayuda envían solicitudes a `POST /api/ai`. Abrir el chat o mover un control no consulta por sí solo al proveedor.
- En Comprende y Comprueba, y en las acciones educativas «Explícamelo», las respuestas son de solo lectura. En Comprueba el prompt pide ayuda conceptual: el tutor no recibe automáticamente el ejercicio, la respuesta ni su corrección.
- En los contextos que admiten cambios, el tutor puede proponer masas y distancia. La interfaz muestra una tarjeta; el usuario debe confirmar y la aplicación vuelve a validar rangos, contexto y revisión del laboratorio antes de modificar el estado.
- Se conservan hasta 30 mensajes en memoria y en `localStorage["gravity-lab:tutor:v1"]`. Al salir de Gravedad se desmonta el provider; al volver se restaura el historial disponible. Las propuestas y los borradores no se persisten.

La práctica de Comprueba utiliza **otro endpoint**, `POST /api/practice`, y una sesión independiente. TypeScript decide conceptos y dificultad según aciertos, errores y uso de pistas. OpenAI genera una definición estructurada dentro de ese plan; el enunciado y la pista visibles se construyen con las traducciones. La solución, las conversiones, la tolerancia numérica del 0,5 % y la puntuación son deterministas. OpenAI redacta la explicación y, tras cinco respuestas, un informe basado en los resultados. No decide la nota.

Las claves permanecen en el servidor. Ambas API validan JSON y origen cuando se proporciona, limitan tamaño y tiempo de lectura y aplican cuotas en memoria. Cada ruta tiene su propio limitador; no son cuotas distribuidas ni sustituyen un sistema de autenticación. [Arquitectura y límites](ARCHITECTURE.md).

## Instalación y ejecución local

Utiliza **Node.js 24.x y npm**, compatibles con las dependencias actuales, incluido Vitest 5. No basta con cumplir únicamente el mínimo de Node de Next.js.

```bash
git clone https://github.com/MinWooPK/BinPar-Gravity.git
cd BinPar-Gravity
npm ci
cp .env.example .env.local
npm run dev
```

Abre [localhost:3000](http://localhost:3000). El proxy de idiomas redirige a una ruta localizada; el idioma predeterminado es español.

Para habilitar el tutor y la práctica, completa `.env.local`:

```dotenv
OPENAI_API_KEY=tu_clave_del_servidor
OPENAI_MODEL=modelo_disponible_en_tu_proyecto
```

El modelo debe admitir Responses API y el formato JSON estructurado utilizado por los adaptadores. No hay un modelo predeterminado en el código. Reinicia el servidor después de configurar las variables. No uses el prefijo `NEXT_PUBLIC_` ni incluyas claves en Git.

Sin estas variables funcionan el contenido educativo, la calculadora y Tres Cuerpos; las API de tutor y práctica responden con `503 not_configured`. Sus llamadas reales al proveedor necesitan conexión y pueden generar costes. La sesión cifrada de práctica también depende de `OPENAI_API_KEY`: rotarla invalida los tokens existentes.

## Ejecutar en Docker

Necesitas Docker con el motor iniciado y Docker Compose **2.24 o posterior**, que admite el archivo de entorno opcional. Desde la raíz del repositorio:

```bash
docker compose up --build
```

Abre [localhost:3000](http://localhost:3000). El puerto 3000 debe estar libre; detén antes cualquier servidor local que lo utilice. La aplicación se publica solo en la interfaz local del equipo.

El contenedor puede arrancar **sin credenciales de IA** y sin crear ningún archivo de entorno. Gravedad, la calculadora, las seis órbitas y el experimento libre funcionan; solo al solicitar una respuesta del tutor o iniciar la práctica se informa de la configuración ausente.

Para habilitar ambas funciones, crea `.env.local` —o utiliza el que ya tengas— con las variables indicadas en la sección anterior:

```bash
test -f .env.local || cp .env.example .env.local
# Completa OPENAI_API_KEY y OPENAI_MODEL en .env.local.
docker compose up --build
```

No sobrescribas un `.env.local` que ya esté configurado. Compose lo carga al crear el contenedor y puede recrearlo al cambiar las variables mediante `docker compose up -d --force-recreate`. No necesitas reconstruir la imagen por cambiar una clave o el modelo. Estas variables son del servidor: no se pasan como argumentos de construcción ni se exponen con `NEXT_PUBLIC_`.

El Dockerfile utiliza **Node.js 24 Alpine**, instala con `npm ci` y el lockfile existente y genera una salida `standalone`. La imagen final ejecuta `node server.js` como usuario sin privilegios y contiene la salida necesaria, los recursos estáticos y `public/`. `.dockerignore` excluye archivos de entorno, credenciales, dependencias locales, `.next` y Git del contexto de construcción. El build necesita conexión al registro de npm y a las fuentes de Google; las consultas reales de IA necesitan acceso a OpenAI durante la ejecución.

La variable interna `GRAVITY_DOCKER_BUILD=1` activa `standalone` únicamente en la etapa de construcción de la imagen. No hace falta configurarla en `.env.local` ni en Vercel: el build habitual y el despliegue de Vercel conservan su configuración de salida.

```bash
docker compose config --quiet  # Validar la configuración sin imprimir las claves.
docker compose ps             # Estado y comprobación de salud.
docker compose logs -f app    # Consultar los logs.
docker compose down          # Detener y retirar el contenedor.
```

La comprobación de salud consulta `GET /api/ai`, que funciona sin credenciales y no llama a OpenAI. No valida la calidad ni disponibilidad del modelo.

La validación de origen de las dos API utiliza el protocolo de la petición y su cabecera `Host`, en lugar del hostname interno de escucha de Next.js. Así admite las llamadas desde `localhost:3000` sin desactivar el rechazo de orígenes ajenos.

## Comprobaciones

| Comando              | Finalidad                                  |
| -------------------- | ------------------------------------------ |
| `npm test`           | Ejecutar las pruebas Vitest una vez        |
| `npm run test:watch` | Ejecutar Vitest en modo observación        |
| `npm run lint`       | Ejecutar ESLint                            |
| `npm run typecheck`  | Comprobar TypeScript sin emitir archivos   |
| `npm run build`      | Generar la compilación de producción       |
| `npm start`          | Servir la compilación generada previamente |

Las pruebas versionadas en `tests/` cubren cálculos de gravedad, proporcionalidad, entradas y sincronización de la fórmula, propuestas y alcance del tutor, corrección de ejercicios, configuración del experimento e integración de las seis órbitas. No acreditan por sí solas la calidad de OpenAI, todos los límites HTTP, la conservación física a largo plazo ni la compatibilidad entre navegadores. No hay una suite de navegador versionada.

La revisión manual debe incluir una práctica completa y una propuesta con credenciales reales, las tres traducciones, navegación por teclado, fórmulas en móvil —incluido Samsung Internet— y una simulación libre. El build requiere acceso a las fuentes de Google utilizadas por `next/font/google`.

## Decisiones y limitaciones

- La física y las reglas de evaluación se separan de React y del proveedor de IA. Los dibujos y la reproducción consumen resultados ya calculados.
- El experimento libre usa un Worker para mantener la interfaz disponible; editar parámetros cancela o invalida cálculos anteriores.
- RK4 aproxima el movimiento con precisión finita. Los encuentros muy cercanos pueden detener el cálculo; no se modelan colisiones ni efectos relativistas.
- El cierre numérico del catálogo no es una prueba matemática de periodicidad, y sus diagnósticos no se presentan como un análisis del experimento libre.
- No hay cuentas, base de datos ni historial de aprendizaje entre dispositivos. La práctica se mantiene en memoria del cliente con un token cifrado que caduca a las 24 horas.
- Las respuestas redactadas por IA pueden contener errores aunque los resultados y acciones se validen por código. Si falla la generación de una explicación o del informe, la operación de práctica devuelve un error y permite reintentar; no hay una alternativa local equivalente.
- Las cuotas y la caché se reinician con el proceso y no se comparten entre instancias. Un despliegue público con varias réplicas necesitaría controles de consumo adicionales.

## Uso de IA durante el desarrollo

He utilizado IA de forma intensiva como apoyo para generar y refactorizar código, organizar el proyecto, desarrollar la interfaz y redactar documentación. Esta declaración describe el proceso de desarrollo; no implica que la IA verifique por sí sola la corrección del producto. Las comprobaciones deben poder reproducirse con los comandos y las revisiones indicados.

## Documentación técnica

- [Guía de demostración para el evaluador](docs/demo-guide.md)
- [Arquitectura](ARCHITECTURE.md)
- [Sincronización entre fórmula y laboratorio](docs/gravity-synchronization.md)
- [Propuestas del Tutor IA](docs/gravity-tutor-proposal.md)
- [Tutor y evaluación adaptativa](docs/gravity-challenge-tutor.md)
- [RK4, catálogo y experimento libre](docs/three-body-rk4.md)
