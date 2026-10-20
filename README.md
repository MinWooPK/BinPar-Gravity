# Gravity Lab

Aplicación educativa con Next.js 16, React, TypeScript y next-intl (español, inglés y francés).

## Ejecutar

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abre http://localhost:3000. El inicio redirige al idioma correspondiente.

Para el Tutor IA global y la evaluación adaptativa, configura en `.env.local` `OPENAI_API_KEY` y `OPENAI_MODEL` con un modelo disponible en tu proyecto que admita Responses API. Reinicia el servidor después. No uses prefijos `NEXT_PUBLIC_` ni subas claves al repositorio. Las peticiones al proveedor pueden generar cargos. Sin estas variables, los simuladores funcionan; el tutor y la evaluación adaptativa informan de que no están disponibles.

## Gravitación

`/[locale]/gravity` incluye controles de las dos masas (10–100 × 10¹² kg), distancia entre centros (5–20 km), fuerza calculada en newtons y tres retos con predicción previa. Cada reto usa una referencia fija de 40 × 10¹² kg, 40 × 10¹² kg y 8 km. El modelo usa G = 6,67430 × 10⁻¹¹ N·m²/kg². La representación es ilustrativa, sin escala ni integración de trayectorias.

La portada presenta cuatro etapas sin seleccionar ninguna: descubrir, comprender,
experimentar y comprobar. Al entrar en una, la navegación compacta reúne la flecha
para volver al recorrido, su título y `GravityStageSelector`, el selector
personalizado de etapas. Las etapas conservan su estado y posición de scroll;
los enlaces con hash y Atrás/Adelante del navegador siguen funcionando.

Descubrir presenta dos columnas en escritorio: un panel educativo con las
subpestañas ¿Qué es?, Tres ideas, Ejemplos e Historia, y una referencia científica
permanente con la ley, G y las unidades SI. El esquema Tierra–Luna es conceptual,
sin escala ni simulación orbital. Los principios y ejemplos conservan sus
componentes y su selector. En móvil y tablet, las columnas se apilan con scroll
natural. La historia distingue la síntesis de Newton de las aportaciones previas
de Galileo y Kepler y del experimento de Cavendish de 1798.

Comprender conserva dos columnas en escritorio: simulación, fuerza y valores
actuales a la izquierda; fórmula editable y constante G a la derecha. El contenido
educativo se concentra en Descubrir. Los hashes anteriores de Comprender,
Experimentar y Comprobar siguen siendo válidos tras renumerarlos como 02, 03 y 04.
El recorrido permite scroll interno; en móvil y tablet con poca altura utiliza
scroll natural del documento para mantener los controles accesibles. Los
selectores se manejan con teclado y las transiciones respetan movimiento reducido.

Referencias históricas: [NASA sobre el movimiento planetario y Newton](https://science.nasa.gov/earth/earth-observatory/planetary-motion/),
[ESA sobre Galileo y la caída libre](https://www.esa.int/Science_Exploration/Space_Science/Space_Microscope_to_test_universality_of_freefall)
y [revisión de NIST sobre las determinaciones de G](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=923829).

El panel de la fórmula muestra cuatro campos en SI y permite seleccionar explícitamente F, m₁, m₂ o r como incógnita. Los otros tres campos son editables y el resultado se calcula automáticamente en el campo de solo lectura. El resaltado vincula cada símbolo con su campo y con la representación visual; m₁ y m₂ se identifican por separado. En la calculadora, las masas se introducen en kg, la distancia en m y F en N; el dominio resuelve en SI. Los cambios permanecen en la calculadora hasta pulsar «Aplicar valores al simulador» con un resultado válido dentro del intervalo visual. Un aviso indica los valores pendientes de aplicar. Los resultados fuera del intervalo se muestran, pero conservan el experimento anterior. Restablecer la calculadora no altera los sliders.

Experimentar y Comprobar utilizan la misma simulación en una columna izquierda
compacta, con controles o retos a la derecha. Todas las vistas leen los parámetros
de `GravityParametersProvider`. El botón «Fórmula» abre un drawer con la misma
calculadora y el mismo borrador de Comprender: cerrar el panel o cambiar de etapa
conserva sus entradas y su incógnita. Escape cierra el drawer y devuelve el foco.

Los retos muestran el escenario base antes de comprobar; al comprobar se aplican
sus parámetros y aparecen feedback, comparación y explicación. Avanzar restaura
la referencia sin borrar el borrador de la fórmula. Cambiar de etapa conserva el
reto, la predicción y el resultado; al regresar se recupera el escenario de ese
reto. La evaluación adaptativa utiliza su propio endpoint; el tutor no recibe
sus enunciados, respuestas ni intentos y ofrece únicamente pistas conceptuales.

El cálculo físico y las validaciones de los retos siguen siendo deterministas;
el modelo de lenguaje no calcula ni modifica el experimento.

## Tres cuerpos

La parte B funciona exclusivamente con algoritmos físicos deterministas y métodos
numéricos. La galería, sus seis detalles y las etapas Descubrir, Galería y
Experimentar comparten el tutor global. Los cálculos, simulaciones y el detector
de periodicidad son deterministas y no necesitan una API key ni servicios de IA.

En la etapa 03, el usuario configura manualmente masas, posiciones, velocidades,
gravedad y duración. «Ejecutar simulación» calcula la trayectoria en un Web Worker
y analiza posibles retornos aproximados de posiciones y velocidades dentro del
intervalo simulado. Los resultados incluyen reproducción y análisis de periodicidad.

`/[locale]/three-body` muestra las seis órbitas de Lagrange, figura de ocho,
Butterfly I, Goggles, Moth I y Yin-Yang I. Las tarjetas animan los tres cuerpos;
cada detalle permite pausar, reiniciar y cambiar la velocidad. A 1×, un segundo
reproduce una unidad de tiempo adimensional. Las trayectorias completas quedan
visibles como referencia y los colores conservan la identidad de cada cuerpo.

Las muestras se calculan en el servidor a partir de las posiciones y velocidades
de `src/features/three-body/data/orbits.ts`, con G = m₁ = m₂ = m₃ = 1. Las semillas publicadas y los
ajustes de velocidades y períodos de `src/features/three-body/data/refinements.json` se conservan por separado.
El integrador usa las fuerzas de Newton con RK4 adaptativo, duplicación de paso y
corrección de Richardson, sin suavizar la gravedad ni forzar el cierre del período.
La reproducción interpola 1.200 muestras espaciadas en tiempo físico, de modo que
los encuentros cercanos no se recorren a velocidad geométrica constante.

Para Lagrange, un radio al baricentro R = 1 da un lado √3 y una aceleración radial
1/√3. Por tanto, ω² = 1/√3 y cada velocidad inicial es ω(−y, x).

La animación empieza pausada cuando se prefiere movimiento reducido y puede
activarse explícitamente. Se suspende fuera de pantalla y con la pestaña oculta.

## Tutor IA global

Un solo `TutorProvider` del layout de idiomas mantiene la conversación en Inicio,
Gravedad (sus cuatro etapas). En `/three-body` y todas sus subrutas no se monta
la interfaz del tutor ni se permiten consultas o propuestas para ese módulo.
El historial global se conserva al entrar y salir de Tres Cuerpos. La única
interfaz es `GlobalTutor`: botón flotante MessageCircle, diálogo con teclado/Escape,
scroll interno y adaptación al teclado virtual y safe areas. Los dos iconos Lucide
se incluyen como SVG locales con su licencia; no se instala otra dependencia.

Las tarjetas de las etapas 02 y 03 mantienen sus pestañas educativas y calculadora,
sin un chat duplicado. `ExplainWithAI` muestra CircleHelp dorado y un tooltip
traducido; cada tema envía una pregunta específica una sola vez al pulsarlo.
Los resaltados de símbolos siguen siendo acciones locales. Abrir el tutor, mover
controles, cambiar de ruta o restaurar historial no llama automáticamente a OpenAI.

`useTutorConversation` conserva 30 mensajes en memoria y en
`localStorage["gravity-lab:tutor:v1"]`. Restaura después de la hidratación y valida
versión, roles, tamaño y texto; solo guarda mensajes e identificadores de contexto.
No persiste propuestas, permisos, claves, peticiones ni borradores. «Borrar
conversación» vacía el historial y aborta peticiones pendientes. Si el navegador
bloquea el almacenamiento, la conversación continúa en memoria.

Cada pregunta usa el contexto actual publicado por `TutorContextBridge`. Gravedad
aporta parámetros reales; el servidor calcula fuerzas y ejemplos con el dominio.
Los mensajes anteriores se identifican como históricos, nunca como valores actuales.

La fórmula e Inicio no autorizan cambios desde el tutor. Las
propuestas de Gravedad siguen requiriendo «Aplicar» y superar la validación de
rangos, contexto y revisión de parámetros. Las ayudas «Explícamelo» son de solo
lectura. En Comprueba el tutor proporciona pistas conceptuales sin resolver ni
calificar ejercicios; `/api/practice` conserva la evaluación, corrección e informes.
El tutor no recibe los enunciados ni respuestas de esa evaluación independiente.

`POST /api/ai` conserva su única integración con OpenAI, `OPENAI_API_KEY`,
`OPENAI_MODEL`, `store: false` y un máximo de 1.200 tokens de salida. Envía como
máximo 12 mensajes recientes, con 1.200 caracteres por mensaje y 6.000 en total.
Las claves permanecen en el servidor y no se necesita otra variable de entorno.

El endpoint limita el cuerpo a 32 KiB mientras lo lee, comprueba el origen cuando
se proporciona, admite solo JSON, corta la lectura a los 5 segundos y la llamada
al proveedor a los 25 segundos. Los límites en memoria son 8 solicitudes por
minuto y cliente, 40 por minuto y proceso, 1 simultánea por cliente y 4 por proceso.
El exceso devuelve HTTP 429 con `Retry-After`; una configuración ausente devuelve
503 y los fallos del proveedor, 502. El identificador de cliente utiliza la IP
remitida por el proxy cuando existe; el límite global también se aplica si falta
o se manipula esa cabecera. Estos límites se reinician con el proceso y no se
comparten entre instancias: para un despliegue público con varias réplicas se
necesita una cuota distribuida o una pasarela externa, además del presupuesto del
proveedor. No se requiere ninguna variable de entorno nueva.

## Arquitectura

- `app/`: rutas y adaptador HTTP; valida entradas del tutor y gestiona errores.
- `features/gravity/domain/`: física y retos sin dependencias del framework.
- `features/gravity/application/`: entradas de la calculadora y compatibilidad con solicitudes antiguas del tutor.
- `features/gravity/infrastructure/`: entrada de compatibilidad que delega en el tutor compartido.
- `features/gravity/components/`: recorrido, laboratorio, retos, fórmula, aplicación explícita y contenido educativo.
- `features/gravity/hooks/`: estado de la calculadora; su sesión aísla los borradores del laboratorio.
- `features/ai/application/`: contrato, validación, contexto físico verificado y construcción de instrucciones del tutor.
- `features/ai/infrastructure/`: único adaptador OpenAI protegido con `server-only`, lectura limitada y control de consumo; fetch y Responses API, sin SDK adicional.
- `features/ai/components/`: provider persistente, puente de contexto y asistente flotante compartido.
- `features/three-body/domain/`: tipos físicos, integración Newtoniana y diagnósticos numéricos independientes de React.
- `features/three-body/data/`: catálogo de órbitas y refinamientos numéricos documentados.
- `features/three-body/server/`: cálculo y caché de muestras para las seis órbitas.
- `features/three-body/components/`: proyección SVG y reproducción sin renders React por fotograma.
- `components/`, `hooks/` e `i18n/`: interfaz compartida, preferencias de movimiento e internacionalización.

Consulta también [ARCHITECTURE.md](ARCHITECTURE.md) y el registro de [auditoría y refactorización](REFACTORING.md). Se ha utilizado IA para ayudar con implementación, estructura y textos.

## Comprobar

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

Las pruebas verifican unidades SI, simetría, proporcionalidad con las masas, ley
del inverso del cuadrado, calculadora, retos, integrador y conservación física.
Las del tutor cubren los contextos de Inicio y Gravedad, el rechazo de contextos
de Tres Cuerpos, datos
inválidos, límites del historial y del cuerpo, consumo y concurrencia, y el contrato
del adaptador. Las pruebas físicas cubren las seis órbitas, el simulador personalizado
y el detector de periodicidad.
Interceptan `fetch` en la prueba del proveedor: no llaman a OpenAI ni consumen
crédito. Una prueba real de credenciales y calidad de respuesta del modelo es una
verificación separada; ejecutar estos tests no la sustituye.

`node tests/browser/global-tutor.mjs` comprueba el tutor y los componentes reales
con Chrome, rutas aisladas y respuestas de IA interceptadas: conversación compartida
entre Inicio y Gravedad, ausencia del tutor en las seis rutas orbitales,
recarga exacta de los últimos 30 mensajes,
propuestas confirmadas y obsoletas, preguntas de ayuda sin duplicados, reintento tras
errores, borrado persistente y cancelación de peticiones, teclado y tamaños
móvil/escritorio. Comprueba también la simulación y periodicidad reales de Tres
Cuerpos y el endpoint independiente de evaluación. No necesita credenciales ni
un servidor Next.

`TUTOR_ONLY=1 node tests/browser/global-tutor.mjs` ejecuta esas verificaciones
sin la comprobación adicional del aviso de límites del drawer de calculadora.

`node tests/browser/three-body-no-ai.mjs` verifica las seis órbitas, las cuatro
etapas y una simulación manual con periodicidad en ES/EN/FR sobre la aplicación
local (`TUTOR_URL`, por defecto `http://localhost:3000`). Comprueba que no haya
controles de IA ni peticiones a `/api/ai`.

## Pendiente de la prueba técnica

Todavía no está configurada una entrega desplegada ni Docker. La integración real de IA requiere las variables anteriores; no se simula con respuestas prefijadas.

Los antiguos comandos de navegador `inline-tutor.mjs`, `gravity-only-tutor.mjs`,
`gravity-formula-tutor.mjs` y `gravity-experiment-tutor.mjs` delegan en
`global-tutor.mjs` para conservar un único conjunto de comprobaciones del tutor.
