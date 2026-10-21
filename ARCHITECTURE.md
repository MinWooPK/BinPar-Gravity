# Arquitectura de Gravity Lab

El proyecto se organiza por funcionalidades. La física y las reglas de la aplicación son funciones de TypeScript; React presenta los resultados y coordina las interacciones. Las rutas de Next.js conectan esas piezas con el navegador y los servicios externos.

## Estructura actual

```text
messages/                         Traducciones ES, EN y FR
public/                           Icono, fondos y texturas de la Tierra
src/
├── app/
│   ├── [locale]/
│   │   ├── gravity/               Página y layout con TutorProvider
│   │   └── three-body/[slug]/     Recorrido y detalles orbitales
│   └── api/
│       ├── ai/route.ts            API del tutor
│       └── practice/              API de práctica y adaptadores HTTP en _lib/
├── features/
│   ├── gravity/
│   │   ├── domain/               Gravitación, comparaciones y corrección
│   │   ├── application/          Fórmula, reducer, propuestas y práctica
│   │   ├── infrastructure/       Generación con OpenAI y token de sesión
│   │   ├── presentation/         components/, providers/ y visualización
│   │   └── types/
│   ├── three-body/
│   │   ├── domain/               Newton, RK4 e integradores adaptativos
│   │   ├── application/          Configuración, borrador, recorrido y reproducción
│   │   ├── infrastructure/       Preparación y caché orbital del servidor
│   │   ├── data/                 Catálogo y refinamientos almacenados
│   │   ├── presentation/         components/ y providers/
│   │   └── types/
│   ├── ai/
│   │   ├── application/          Contratos, contexto, prompts e historial
│   │   ├── infrastructure/       Responses API, esquemas y límites de petición
│   │   ├── presentation/         components/, hooks/ y providers/
│   │   └── types/
│   └── home/presentation/        Portada, temas y Tierra 3D
├── components/                   UI, iconos y layout compartidos
├── hooks/                        Preferencia de movimiento reducido
├── i18n/                         Idiomas y navegación localizada
└── proxy.ts                      Enrutamiento de idiomas
tests/                            Pruebas unitarias con Vitest
```

Los directorios de componentes complejos contienen una entrada y varias piezas con responsabilidades acotadas: por ejemplo, `gravity-formula/`, `global-tutor/` y `three-body-experiment/`. Algunas rutas cortas de `presentation/components/` y `presentation/providers/` son reexportaciones para mantener estables las importaciones; la implementación vive en el subdirectorio correspondiente.

## Responsabilidades de las capas

| Capa | Responsabilidad y ejemplo |
| --- | --- |
| Domain | Reglas y cálculos independientes de React: `gravitationalForce`, `evaluateAnswer`, `derivative`, `rk4Step` e integración de trayectorias |
| Application | Coordinar estados y acciones: validar una configuración, resolver un borrador, aceptar una propuesta o planificar la siguiente pregunta |
| Infrastructure | Comunicar con OpenAI, cifrar sesiones y preparar/cachear datos orbitales en el servidor |
| Presentation | Componentes, Context, hooks, accesibilidad, entrada de datos, Worker y reproducción visual |
| Types | Contratos compartidos dentro de cada funcionalidad |

La separación se aplica donde aporta utilidad: Home solo tiene presentación y AI no tiene un directorio `domain/`. No hay una abstracción de repositorios o una base de datos que documentar.

## Gravedad: parámetros y borrador

`src/features/gravity/presentation/providers/gravity-parameters/GravityParametersProvider.tsx` comparte un estado gestionado por `gravityStateReducer`, en `application/gravityState.ts`. Usa `useState` y una referencia al estado vigente para procesar acciones; el reducer es una función pura, aunque no se invoque mediante `useReducer`.

El estado distingue:

- `parameters`: masas y distancia válidas utilizadas por el laboratorio.
- `formula`: textos editables, incógnita, resultado y error numérico.
- `revision`: cambia al modificar parámetros y al restablecer; protege frente a propuestas antiguas.
- `resetVersion`: permite reiniciar las vistas de la calculadora.

Tres Context separan parámetros/fuerza, controles y borrador. Los hooks `useGravityParameters`, `useGravityControls` y `useGravityFormulaDraft` exponen esas partes.

Editar un campo recalcula el borrador. Solo un resultado válido dentro del intervalo visual actualiza `parameters`; las entradas incompletas o fuera de rango permanecen en la fórmula. Un cambio desde los sliders o una propuesta aceptada reconstruye la fórmula con los nuevos parámetros. Restablecer reinicia ambos estados. La fuerza siempre se obtiene del dominio con unidades SI. [Flujo detallado](docs/gravity-synchronization.md).

El resaltado de símbolos vive en `GravityFormulaInteraction`, separado del estado físico. El recorrido conserva los paneles montados y gestiona hash, foco y scroll mediante `useGravityJourneyState`. La práctica tiene su propio estado en `usePracticeSession`; no utiliza el borrador de fórmula como respuesta.

## Tres Cuerpos: cálculo y reproducción

`domain/newtonian-physics/` implementa la derivada de Newton y el paso RK4 sobre 12 componentes: posición y velocidad de los tres cuerpos en 2D. No importa componentes ni realiza dibujos.

Hay dos integradores adaptativos que reutilizan `rk4Step`:

| Recorrido | Código | Ejecución |
| --- | --- | --- |
| Seis órbitas conocidas | `domain/orbit-integration/` | Servidor; período y condiciones del catálogo, tolerancias más estrictas y diagnósticos de conservación/cierre |
| Experimento libre | `domain/experiment-simulation/` | Worker del navegador; masas y G configurables, duración limitada y control de separaciones |

Ambos comparan un paso completo con dos medios pasos, aceptan o rechazan según el error y aplican Richardson. No se fuerza el cierre ni se suaviza la fuerza gravitatoria. Las tolerancias y los límites de trabajo son diferentes en cada caso.

`infrastructure/orbitPlayback.ts` integra el catálogo, adapta las coordenadas con `application/orbitPlayback.ts` y guarda el resultado en un `Map` del proceso. `ThreeBodyScreen` prepara las seis órbitas; los detalles reutilizan la misma función. No hay una caché distribuida.

`GalleryProvider` conserva filtros, paginación, scroll y reproducción entre el recorrido y los detalles dentro del layout de Tres Cuerpos. `ThreeBodyExperimentProvider` conserva el formulario de texto y el cuerpo seleccionado; su revisión invalida el resultado cuando cambian datos físicos. La trayectoria y el estado de reproducción pertenecen a `useExperimentSimulation`, por lo que no se garantiza conservarlos al desmontar esa vista.

`useExperimentSimulation` crea `experiment.worker.ts`, identifica las solicitudes y descarta respuestas obsoletas. Editar parámetros termina el Worker y limpia la simulación anterior. El Worker devuelve solo duración, muestras de posiciones y límites para dibujar.

La reproducción no ejecuta RK4 por fotograma. En el catálogo, `useOrbitAnimationPlayback` interpola muestras y actualiza transformaciones SVG mediante referencias; se suspende fuera de pantalla y con la pestaña oculta. En el experimento, `useExperimentPlayback` actualiza el tiempo y `ExperimentAnimation` dibuja posiciones y estelas. Se detiene al final de la duración.

Los diagnósticos de cierre del catálogo permanecen en el resultado del dominio y no forman parte de `OrbitPlayback`. El experimento libre actual no expone ni ejecuta un detector de periodicidad. [Motor numérico y límites](docs/three-body-rk4.md).

## Tutor IA y estado de conversación

El layout `src/app/[locale]/gravity/layout.tsx` monta `TutorProvider`. Inicio y Tres Cuerpos no montan ese provider ni la interfaz del tutor; el contrato actual de `/api/ai` solo admite contexto de Gravedad.

`TutorContextBridge`, utilizado por `GravityLab`, publica etapa, parámetros y un puerto para aplicar propuestas. `tutorEnvironment.ts` comparte ese contexto y las acciones de apertura/resaltado. `GlobalTutor` representa la única interfaz de chat.

Los hooks separan responsabilidades: `useTutorSessions` restaura/persiste mensajes, `useTutorRequests` controla solicitudes y cancelaciones, y `useConversatinStore.ts` coordina envío y decisiones. `useTutorConversation` los expone mediante Context. La sesión interna se llama `global`, pero su alcance de montaje es Gravedad.

El historial conserva hasta 30 mensajes en `localStorage`, sin propuestas ni claves. Borrar la conversación cancela peticiones y elimina lo guardado. Salir de Gravedad desmonta el provider y cancela sus solicitudes; el historial puede restaurarse al volver.

`POST /api/ai` valida el contexto; `tutor-context/tutorContext.ts` calcula datos físicos con el dominio y `tutorPrompt.ts` construye las instrucciones. `openaiTutor.ts` solicita una respuesta JSON, y `tutorResponse.ts` la valida. Comprende, Comprueba y las intenciones educativas descartan propuestas. En los contextos permitidos, aplicarlas requiere confirmación, coincidencia del contexto y una revisión vigente. [Contrato y confirmación](docs/gravity-tutor-proposal.md).

## Evaluación independiente

`POST /api/practice` delega la lectura HTTP y la coordinación en su directorio `_lib/`. Las acciones son `start`, `answer` y `next`.

`application/practice/adaptation.ts` decide conceptos y dificultad. El adaptador `infrastructure/practice/openai-practice/` genera definiciones estructuradas, explicaciones e informes mediante la integración compartida de OpenAI. `domain/practice/evaluation.ts` calcula la solución y el acierto antes de pedir la explicación. Los enunciados y pistas se representan con `messages/`.

La sesión viaja en un token AES-256-GCM, con clave derivada de `OPENAI_API_KEY` y caducidad de 24 horas. No hay una tabla de sesiones ni estado de aprendizaje persistido en el servidor. El tutor no recibe automáticamente el historial de evaluación. [Práctica y adaptación](docs/gravity-challenge-tutor.md).

## Integración y límites de seguridad

`features/ai/infrastructure/openaiResponse.ts`, protegido con `server-only`, usa `fetch` contra Responses API. Comparte `OPENAI_API_KEY`, `OPENAI_MODEL`, `store: false` y un plazo de 25 segundos por llamada. El tutor limita la salida a 1.200 tokens; las llamadas de práctica usan el límite común de 2.200. El código no usa el SDK de OpenAI ni envía claves al navegador.

Ambos endpoints exigen JSON, comprueban el origen si se proporciona y leen como máximo 32 KiB con un plazo de 5 segundos. Cada ruta crea su propia instancia de `createTutorLimiter`: 8 peticiones/minuto y 1 simultánea por cliente; 40/minuto y 4 simultáneas por instancia del limitador. La identificación utiliza `x-forwarded-for` o `unknown`. `/api/ai` añade `Retry-After` al responder 429; `/api/practice` no lo añade.

Son controles básicos de consumo, no autenticación ni una cuota conjunta de todo el despliegue. Los contadores se reinician con el proceso y no se comparten entre réplicas. La comprobación de origen tampoco impide solicitudes directas sin esa cabecera. Los tokens de práctica no implementan revocación ni protección frente a la reutilización de un token anterior válido.

## Validación del proyecto

Los comandos disponibles están en `package.json`: `npm test`, `npm run test:watch`, `npm run lint`, `npm run typecheck`, `npm run build` y `npm start` tras compilar. Las pruebas están en `tests/`; no existe una suite de navegador versionada.

La comprobación con credenciales reales, el comportamiento en navegadores móviles y la configuración del despliegue necesitan revisión manual. Este documento describe responsabilidades y mecanismos del código, sin atribuir a las pruebas una cobertura que no tienen.
