# Búsqueda de retornos aproximadamente periódicos

La etapa 03 permite buscar una propuesta y aplicarla explícitamente. La búsqueda
conserva G, las masas y las posiciones iniciales. Ajusta las seis componentes de
velocidad y un tiempo de retorno T. No importa datos del catálogo ni usa servicios
externos. La reproducción sigue usando el simulador habitual.

## Método numérico

`domain/orbit-search.ts` implementa un método de disparo: integra desde el estado
inicial hasta T y compara las doce componentes x, y, vx, vy de los tres cuerpos
identificados. Usa mínimos cuadrados amortiguados (una variante de
Levenberg–Marquardt), con diferencias finitas para estimar el Jacobiano. La
amortiguación permite resolver el sistema sobredeterminado incluso cuando las
direcciones del ajuste son casi dependientes. Cada movimiento local está acotado;
se acepta si reduce la suma de cuadrados de los doce residuos.

Los residuos reutilizan las escalas del detector: L es la media cuadrática de las
tres separaciones iniciales, y V es el máximo de la velocidad interna cuadrática
media y sqrt(G × masa total / L). V sigue siendo positivo con velocidades iniciales
nulas. La comparación conserva el origen, la orientación y la identidad de cada
cuerpo. No elimina la traslación del sistema para simular un retorno.

Primero se integra el intervalo configurado para localizar un período inicial con
el detector o con mínimos del error entre los pasos aceptados de RK4. Si esta
evaluación falla, se prueban intervalos más cortos. Después se exploran hasta
cuatro puntos de partida cercanos: el original y tres perturbaciones deterministas
de hasta ±0,04 V por componente y ±0,075 en log(T / duración). Un generador entero
con semilla fija produce las perturbaciones. No se usa `Math.random`.

Los siete parámetros de optimización son los desplazamientos de velocidad divididos
por V y log(T / duración). El incremento de diferencias finitas es 1e-4; cada paso
local queda limitado a 0,15 por coordenada. El error mostrado al usuario es el
máximo normalizado entre los tres errores vectoriales de posición y los tres de
velocidad. El objetivo de mínimos cuadrados ayuda a optimizar; no sustituye el
criterio de aceptación del detector.

## Límites y confirmación

Los valores predeterminados están en `types/orbit-search.types.ts`:

| Límite | Valor |
| --- | --- |
| Integraciones intentadas, incluida la confirmación | 480 |
| Puntos de partida | Hasta 4 |
| Iteraciones locales por punto | Hasta 16 |
| Tiempo real de búsqueda | 12 segundos |
| Período candidato | 20 %–100 % de la duración configurada, nunca más de 100 u.t. |
| Cada velocidad respecto a la introducida | ±0,5 V, usando la escala del estado original |
| Intentos RK4 por evaluación exploratoria | 15 000 |
| Intentos RK4 de la simulación de confirmación | 150 000, límite habitual |
| Error de posición y de velocidad requerido | Ambos ≤ 0,001 (0,1 %) |
| Alejamiento previo requerido | Al menos 0,05 L en algún cuerpo |

Los sondeos del Jacobiano, las evaluaciones fallidas y la confirmación consumen el
presupuesto. El módulo permite presupuestos explícitos para pruebas, con límites
máximos de 1000 evaluaciones, 8 inicios y 30 iteraciones. La interfaz utiliza los
valores predeterminados. Si no queda presupuesto para confirmar, un candidato
con error pequeño permanece **sin confirmar** y no se puede aplicar.

Todas las integraciones usan `simulateExperiment` y el mismo Newton/RK4 adaptativo
de `newtonian-physics.ts`: tolerancia relativa 1e-8 y absoluta 1e-9. La exploración
solicita 65 muestras visuales, pero conserva los pasos internos adaptativos. Nunca
reduce la precisión del integrador ni sustituye velocidades por interpolaciones.
Los límites de separación y singularidad siguen vigentes. Un `RangeError` numérico
descarta la evaluación; no termina toda la búsqueda.

Antes de aceptar una propuesta se vuelve a integrar desde t=0 hasta el T propuesto,
con las 601 muestras y el presupuesto completos. El extremo de esa nueva simulación
debe cumplir ambas tolerancias y `detectPeriodicity` debe detectar un retorno no
trivial. No se reutiliza el estado final de una evaluación exploratoria como
confirmación. Las propuestas positivas llevan `verified: true`.

## Ejecución y aplicación

El generador numérico no lee relojes ni conoce React. El Worker inyecta un control
de plazo basado en `performance.now`; el integrador consulta ese control durante
los pasos, también durante la confirmación y el refinamiento del detector. Su
ausencia conserva el comportamiento de las simulaciones existentes.

El Worker publica instantáneas pequeñas con el mejor candidato completado. El
controlador conserva la última instantánea y agrupa las actualizaciones de React
cada 250 ms. Un temporizador en el hilo principal limita también el arranque y los
cálculos que no respondan. Cancelar, reiniciar, editar las condiciones, restablecer
o desmontar ejecuta `worker.terminate()`, elimina los temporizadores e invalida los
mensajes pendientes. La navegación entre etapas mantiene el estado existente; el
plazo sigue corriendo si la etapa está oculta.

Solo «Aplicar configuración» modifica los campos: copia las velocidades completas
y T, conserva el texto de masas, posiciones y G, e invalida la trayectoria anterior.
La función de aplicación comprueba que la propuesta esté confirmada y que sus
parámetros fijos coincidan con los actuales. No ejecuta automáticamente una
simulación ni modifica la galería.

## Alcance de los resultados

El método es local y acotado. Puede fallar por encuentros próximos, sensibilidad
caótica, un mal período inicial, mínimos locales, una región de velocidades
insuficiente, un intervalo corto o falta de presupuesto. No toda configuración
de posiciones y masas admite un retorno cercano dentro de esos límites. Si todos
los ensayos fallan o apenas se mueven, no hay candidato que mostrar.

Sin interrupción temporal, los mismos parámetros, semilla y presupuestos producen
el mismo resultado. Un corte por tiempo puede terminar en evaluaciones distintas
según la velocidad del dispositivo; conserva lo mejor completado hasta el corte.
La precisión numérica no constituye una prueba de repetición indefinida, estabilidad
orbital ni período fundamental. El error de retorno tampoco es una cota del error
global de integración.

## Validación

`tests/orbit-search.test.mjs` cubre Lagrange, velocidades perturbadas, masas distintas,
reproducibilidad, límites, estados triviales, encuentros, aplicación explícita,
confirmación independiente, mensajes del Worker y cancelación de un Worker real.
Las suites existentes siguen comprobando el simulador y las seis órbitas del
catálogo. Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`.
