# Tres Cuerpos: modelo físico, RK4 y reproducción

Tres Cuerpos tiene un catálogo de seis soluciones conocidas y un experimento configurable. Ambos calculan trayectorias con las ecuaciones de Newton en 2D. Comparten la derivada y el paso RK4, pero utilizan integradores adaptativos distintos, con tolerancias y límites adecuados a cada recorrido.

No son vídeos ni posiciones dibujadas a mano. La integración se ejecuta antes de reproducir y la interfaz interpola las muestras calculadas.

## Modelo y unidades

Cada cuerpo aporta `[x, y, vx, vy]`. El estado a integrar es un vector de **12 números**; las tres masas y G se pasan por separado.

La derivada devuelve velocidades para las componentes de posición y aceleraciones para las de velocidad. Para cada pareja, utiliza la separación entre cuerpos y suma contribuciones iguales y opuestas a la fuerza, teniendo en cuenta las masas al obtener la aceleración:

```text
a_i = G · suma sobre j ≠ i de [m_j · (r_j − r_i) / |r_j − r_i|³]
```

El factor cúbico corresponde a la expresión vectorial: al multiplicarlo por el vector de separación se obtiene la dependencia de magnitud `1/r²`.

| Propiedad                | Catálogo                     | Experimento libre                         |
| ------------------------ | ---------------------------- | ----------------------------------------- |
| G                        | 1                            | Positiva, configurable                    |
| Masas                    | 1, 1, 1                      | Tres masas positivas configurables        |
| Posiciones y velocidades | Condiciones de cada solución | Configurables por cuerpo                  |
| Tiempo de integración    | Período conocido/refinado    | Duración elegida, mayor que 0 y hasta 100 |
| Unidades                 | Adimensionales               | Normalizadas, sin conversión a SI         |

Que G valga 1 en estas unidades no modifica la constante física real. El módulo de Gravedad, por separado, trabaja en kg, m y N con `G = 6,67430 × 10⁻¹¹ N·m²/kg²`.

Los cuerpos son masas puntuales y solo actúa su atracción newtoniana. No hay suavizado de la fuerza, tratamiento de colisiones, relatividad ni integración de una Tierra 3D: el modelo Three.js de la portada es visual.

## RK4 y control adaptativo

`rk4Step` aproxima el siguiente estado mediante cuatro evaluaciones de la derivada: inicio, dos estimaciones intermedias y final del intervalo. Combina esos cambios con los pesos `1, 2, 2, 1` divididos entre 6.

Cada integrador adaptativo:

1. Calcula un paso completo y dos medios pasos RK4.
2. Estima la corrección con `(dosMediosPasos − pasoCompleto) / 15`.
3. Normaliza el error usando tolerancias absoluta y relativa por componente.
4. Acepta el estado corregido si el error está dentro de la tolerancia; en caso contrario reduce el paso y reintenta.
5. Ajusta el paso siguiente y comprueba finitud y límites de trabajo.

La corrección de Richardson mejora la aproximación; no mueve artificialmente los cuerpos para cerrar la curva.

| Configuración actual               | Catálogo | Experimento libre |
| ---------------------------------- | -------- | ----------------- |
| Tolerancia relativa                | `2e-12`  | `1e-8`            |
| Tolerancia absoluta                | `2e-13`  | `1e-9`            |
| Máximo de intentos de paso         | 100.000  | 150.000           |
| Muestras de posiciones por defecto | 1.200    | 601               |
| Rango admitido de muestras         | 2–20.000 | 2–2.000           |

Los pasos internos varían según el error; las muestras de posiciones para dibujar están espaciadas uniformemente en tiempo. Un límite de tolerancia local no garantiza un error global máximo ni conservación exacta a largo plazo.

## Catálogo de seis órbitas

| Solución       | Slug del detalle |
| -------------- | ---------------- |
| Lagrange       | `lagrange`       |
| Figura de ocho | `figura-de-ocho` |
| Butterfly I    | `butterfly-i`    |
| Goggles        | `goggles`        |
| Moth I         | `moth-i`         |
| Yin-Yang I     | `yin-yang-i`     |

Los detalles están en `/{locale}/three-body/{slug}`. El recorrido principal tiene Descubre, Comprende, Galería y Experimenta; la configuración libre pertenece a la etapa **04**, no a la 03.

`data/orbits.ts` separa `publishedOrbits` de `orbits`, el catálogo efectivo. Para Butterfly I, Goggles, Moth I y Yin-Yang I, este último sustituye velocidades y período por los valores almacenados en `data/refinements.json`. No se ejecuta una búsqueda de esos refinamientos en tiempo de uso. Los campos `seedClosure` y `refinedClosure` del JSON son datos guardados, no resultados recalculados por la interfaz.

Lagrange parte de un triángulo equilátero de radio al baricentro 1, con lado √3 y `ω² = 1/√3`; sus velocidades se construyen como `ω(−y, x)`. Las soluciones colineales parten de posiciones `(−1, 0)`, `(1, 0)`, `(0, 0)` y velocidades que compensan el momento total. Figura de ocho conserva su configuración específica.

Las referencias de procedencia y las convenciones están en cada definición del catálogo. El detalle presenta condiciones iniciales y un enlace a su fuente; no se deben mezclar semillas y períodos de variantes diferentes, especialmente en Yin-Yang I.

## Preparación y animación del catálogo

`getOrbitPlayback` se ejecuta en el servidor:

1. Busca el slug en una caché `Map` del proceso.
2. Obtiene la definición efectiva e integra hasta su período con `integrateOrbit`.
3. `prepareOrbitPlayback` adapta las muestras al SVG y redondea solo las coordenadas visuales a tres decimales.
4. Guarda y devuelve slug, período y posiciones para el cliente.

La caché no se comparte entre procesos. `ThreeBodyScreen` prepara las seis soluciones; los detalles utilizan la misma función.

`useOrbitAnimationPlayback` interpola posiciones según el tiempo y actualiza transformaciones SVG mediante referencias y `requestAnimationFrame`. A 1× avanza una unidad de tiempo del modelo por segundo. La reproducción vuelve al comienzo mediante el período conocido; ese bucle visual no es una comprobación matemática del cierre.

Las trayectorias completas permanecen dibujadas y cada cuerpo conserva su color. El reproductor permite pausa, reinicio y velocidad; suspende el avance cuando no está visible o la pestaña está oculta. No ejecuta RK4 por fotograma.

## Experimento libre

El formulario conserva los campos como texto en `ThreeBodyExperimentProvider`. `parseExperimentDraft` los convierte a números y `experimentConfigurationError` comprueba finitud, G y masas positivas, duración y separación inicial.

La interfaz exige una separación inicial de al menos **0,05** unidades. Durante la integración, `validateExperimentState` rechaza estados con separación menor de **0,001**. Son límites numéricos, no radios físicos de los cuerpos. También se aborta ante valores no finitos, pasos demasiado pequeños o exceso de intentos.

Al ejecutar:

1. `useExperimentSimulation` valida y copia la configuración.
2. Crea un Worker de módulo desde `experiment.worker.ts` y envía un identificador de solicitud.
3. `simulateExperiment` calcula las posiciones y conserva internamente estados aceptados con sus tiempos y velocidades.
4. El Worker devuelve únicamente `duration`, `samples` y `bounds`; no envía los estados completos ni un informe de periodicidad.
5. El hook termina el Worker y entrega la trayectoria a `ExperimentAnimation`.

Cambiar datos físicos invalida el resultado y termina cualquier cálculo activo. Seleccionar otro cuerpo sin editarlo no cambia la revisión física. Los identificadores evitan aceptar una respuesta de un cálculo anterior. Si el Worker no puede iniciarse o falla, se muestra un error; no hay un integrador alternativo en el hilo principal.

El reproductor interpola posiciones y dibuja estelas hasta el tiempo seleccionado. A 1× recorre toda la duración en unos **12 segundos**: no comparte la escala temporal del catálogo. Se pausa al salir de la etapa o al ocultar la pestaña y se detiene al llegar al final. Reiniciar la reproducción vuelve a utilizar la trayectoria existente; modificar parámetros requiere ejecutar otra vez.

## Qué se comprueba sobre periodicidad

El catálogo calcula diagnósticos internos mediante `orbit-invariants.ts`:

- `closure`: diferencia cuadrática media, expresada como raíz, entre los 12 componentes del estado final e inicial.
- `positionClosure`: medida equivalente para las seis coordenadas de posición.
- Variación relativa máxima de energía y variación absoluta máxima del momento angular.
- Magnitud máxima del momento lineal, posición del centro de masas, separación mínima y pasos aceptados/rechazados.

Estas medidas evalúan el cálculo al finalizar un período ya proporcionado. **No estiman un período desconocido ni buscan retornos en una trayectoria arbitraria.** Además, `prepareOrbitPlayback` no incluye esos diagnósticos en los datos enviados al reproductor.

El experimento libre **no contiene actualmente un detector de periodicidad aproximada**, aunque el dominio conserve estados completos y exporte una función para refinarlos en otro instante. No hay una llamada del Worker o de la interfaz que busque candidatos y confirme retornos de posiciones y velocidades.

Un posible detector de retorno aproximado tendría que comprobar el estado completo con tolerancias e informar de sus límites; un retorno aislado seguiría sin demostrar periodicidad indefinida. Esa funcionalidad no debe presentarse como implementada. Tampoco existe una búsqueda automática de condiciones iniciales ni descubrimiento automático de nuevas órbitas.

## Rutas actuales

Todas las rutas siguientes son relativas a `src/features/three-body/`:

| Archivo o directorio                                                                  | Responsabilidad                                       |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `data/orbits.ts`, `data/refinements.json`                                             | Definiciones y refinamientos almacenados              |
| `domain/newtonian-physics/newtonian-derivative.ts`                                    | Velocidades y aceleraciones de Newton                 |
| `domain/newtonian-physics/rk4-step.ts`                                                | Paso RK4 compartido                                   |
| `domain/orbit-integration/integrate-orbit.ts`                                         | Integración del catálogo y resultado con diagnósticos |
| `domain/orbit-integration/orbit-adaptive-integrator.ts`                               | Pasos adaptativos del catálogo                        |
| `domain/orbit-integration/orbit-invariants.ts`                                        | Conservación y cierre                                 |
| `domain/experiment-simulation/experiment-trajectory.ts`                               | Trayectoria del experimento libre                     |
| `domain/experiment-simulation/adaptive-integrator.ts`                                 | Integrador adaptativo y refinamiento de estado        |
| `application/experimentConfiguration.ts`                                              | Validación previa de la configuración                 |
| `application/orbitPlayback.ts`                                                        | Proyección visual e interpolación del catálogo        |
| `infrastructure/orbitPlayback.ts`                                                     | Integración y caché en servidor                       |
| `presentation/components/shared/orbit-animation/useOrbitAnimationPlayback.ts`         | Reproducción SVG del catálogo                         |
| `presentation/components/experiment/experiment.worker.ts`                             | Cálculo del experimento fuera del hilo principal      |
| `presentation/components/experiment/three-body-experiment/useExperimentSimulation.ts` | Worker, cancelación y resultado                       |
| `presentation/components/experiment/three-body-experiment/useExperimentPlayback.ts`   | Tiempo y controles de reproducción libre              |
| `presentation/components/experiment/ExperimentAnimation.tsx`                          | Posiciones y estelas del experimento                  |

`domain/newtonian-physics.ts`, `domain/orbit-integration.ts` y `domain/experiment-simulation.ts` son entradas de reexportación; la implementación está en los subdirectorios de la tabla.

## Verificación

`tests/orbit-integration.test.ts` genera muestras de las seis órbitas y comprueba estructura, finitud y entradas inválidas. `tests/experiment-simulation.test.ts` comprueba trayectorias, cambios al modificar una masa y rechazo de algunos parámetros inválidos. `tests/experiment-draft.test.ts` cubre edición, selección y restablecimiento.

Estas pruebas no certifican conservación física a largo plazo, estabilidad de toda configuración ni detección de periodicidad. Para revisar la interfaz, reproduce varias órbitas, prueba pausa/reinicio/velocidad y ejecuta una configuración libre. Cambia después un parámetro para comprobar la invalidación y repite la ejecución. Ninguna de estas operaciones necesita IA ni credenciales.
