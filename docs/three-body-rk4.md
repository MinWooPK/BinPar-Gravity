# Tres cuerpos: cómo funcionan RK4 y las animaciones

## 1. ¿Qué hace esta parte de Gravity Lab?

La sección **Tres Cuerpos** muestra cómo se mueven tres cuerpos que se atraen por gravedad.

Tiene dos funcionalidades:

- **Galería:** reproduce seis órbitas periódicas conocidas: Lagrange, Figura de ocho, Butterfly I, Goggles, Moth I y Yin-Yang I.
- **Experimento libre:** permite modificar masas, posiciones y velocidades para calcular una trayectoria personalizada.

En los dos casos se utiliza la física de Newton y el mismo algoritmo **RK4**. No son vídeos ni animaciones con posiciones dibujadas manualmente.

## 2. ¿Qué datos necesita cada cuerpo?

Para calcular el movimiento, cada cuerpo tiene cuatro valores:

- `x`, `y`: su posición en el plano.
- `vx`, `vy`: su velocidad horizontal y vertical.

Como hay tres cuerpos, el estado completo contiene **12 números**:

```ts
// [x, y, vx, vy] para cada uno de los tres cuerpos
const state = [x1, y1, vx1, vy1, x2, y2, vx2, vy2, x3, y3, vx3, vy3];
```

También hacen falta las tres masas y la constante gravitatoria `G`. Las seis soluciones del catálogo usan unidades **adimensionales**, con `G = 1` y masas iguales a `1`; no son kilogramos ni metros reales.

## 3. ¿Cómo se usan las masas y la constante G?

**Antes de ejecutar RK4, el programa calcula la aceleración que provoca la gravedad.** Para eso aplica la ley de Newton a cada pareja de cuerpos:

\[
F = G \frac{m_1 m_2}{r^2}
\]

- **`G`** indica la intensidad de la atracción gravitatoria.
- **`m1`, `m2` y `m3`** son las masas de los tres cuerpos.
- **`r`** es la distancia entre los centros de dos cuerpos.

Como hay **tres cuerpos**, cada uno recibe la atracción de **los otros dos**. Por ejemplo, para el cuerpo 1 se suman la aceleración que provoca el cuerpo 2 y la que provoca el cuerpo 3. Se suman teniendo en cuenta la dirección horizontal y vertical.

### De la fuerza a la aceleración

La segunda ley de Newton dice que `aceleración = fuerza / masa`. Por eso, al calcular la aceleración del cuerpo 1 causada por el cuerpo 2, su propia masa se cancela:

\[
a*1 = \frac{F*{12}}{m_1} = G\frac{m_2}{r^2}
\]

Esto significa que **la masa del cuerpo 2 influye en cuánto acelera el cuerpo 1**. Y, al mismo tiempo, la masa del cuerpo 1 influye en cuánto acelera el cuerpo 2.

En `newtonian-physics.ts`, la función `derivative()` calcula las aceleraciones en los ejes X e Y:

```ts
const dx = state[b] - state[a];
const dy = state[b + 1] - state[a + 1];
const squaredDistance = dx * dx + dy * dy;
const inverseCube = 1 / (squaredDistance * Math.sqrt(squaredDistance));

result[a + 2] += G * masses[second] * dx * inverseCube;
result[a + 3] += G * masses[second] * dy * inverseCube;
result[b + 2] -= G * masses[first] * dx * inverseCube;
result[b + 3] -= G * masses[first] * dy * inverseCube;
```

**¿Por qué aparece una distancia al cubo?** La fuerza sigue la ley del inverso del cuadrado (`1 / r²`). En el código se multiplica además por `dx` o `dy` para obtener la dirección de la aceleración en cada eje; por eso aparece `1 / r³` en esa fórmula vectorial.

### ¿Qué valores uso en Gravity Lab?

|        | Seis órbitas de la galería | Experimento libre   |
| ------ | -------------------------- | ------------------- |
| `G`    | `1`                        | La elige el usuario |
| Masa 1 | `1`                        | La elige el usuario |
| Masa 2 | `1`                        | La elige el usuario |
| Masa 3 | `1`                        | La elige el usuario |

En el catálogo, `G = 1` y las masas iguales a `1` son **unidades normalizadas** para reproducir las condiciones iniciales conocidas. **No significa que la constante física real sea 1.** En el laboratorio educativo de dos cuerpos se emplea la constante real `G = 6,67430 × 10⁻¹¹` en unidades SI.

En el experimento libre, al cambiar una masa o `G` cambian las aceleraciones y, por tanto, **la trayectoria que calcula RK4**. Una trayectoria nueva no tiene por qué ser periódica.

**Para recordarlo:** primero `derivative()` calcula las aceleraciones con masas, distancias y `G`; después `rk4Step()` utiliza esas aceleraciones para avanzar el movimiento.

## 4. ¿Para qué sirve RK4?

La gravedad cambia continuamente la velocidad y la posición de cada cuerpo. No podemos saber todas sus posiciones futuras con una fórmula sencilla.

**RK4 (Runge-Kutta de cuarto orden)** es un método numérico que calcula una aproximación del siguiente estado avanzando poco a poco en el tiempo.

Para avanzar un paso, calcula cuatro estimaciones:

1. **`k1`:** cómo está cambiando el sistema al comenzar.
2. **`k2`:** cómo cambiaría a mitad del intervalo.
3. **`k3`:** vuelve a estimarlo en la mitad con los datos de `k2`.
4. **`k4`:** estima el cambio al final del intervalo.

Después combina esas cuatro estimaciones, dando más peso a las dos centrales.

```text
Estado actual
    ↓
Calcular k1, k2, k3 y k4
    ↓
Combinar las cuatro estimaciones
    ↓
Siguiente posición y velocidad de los tres cuerpos
```

La función `derivative()` devuelve las velocidades y aceleraciones calculadas a partir del estado actual, las masas y `G`. La función `rk4Step()` utiliza esos cambios para aproximar el siguiente estado.

Ambas están en `src/features/three-body/domain/newtonian-physics.ts`.

## 5. ¿Qué significa RK4 adaptativo?

Si dos cuerpos pasan muy cerca, su movimiento puede cambiar rápidamente. En esos momentos un paso de tiempo demasiado grande puede producir errores.

Por eso, `orbit-integration.ts` no utiliza siempre el mismo tamaño de paso:

1. Calcula el avance con **un paso completo**.
2. Calcula el mismo intervalo con **dos medios pasos**.
3. Compara los resultados para estimar el error.
4. Si el error es pequeño, acepta el resultado; si es grande, reduce el paso y vuelve a intentarlo.

Además, aplica una pequeña corrección numérica llamada **extrapolación de Richardson**.

**Idea importante:** cuanto más delicado es el movimiento, más pequeños pueden ser los pasos para mantener la precisión.

El integrador también mide aspectos como la variación de energía y la diferencia entre el estado final y el inicial. Son comprobaciones para evaluar el resultado, no trucos para forzar que la órbita se cierre.

## 6. ¿Cómo se reproducen las seis órbitas?

Los datos de `data/orbits.ts` contienen las condiciones iniciales y el período de cada solución conocida.

El proceso es:

1. `integrateOrbit()` calcula la trayectoria usando RK4 adaptativo.
2. Guarda **1.200 muestras** de posiciones, repartidas a lo largo del período.
3. `prepareOrbitPlayback()` convierte esas posiciones físicas a coordenadas para un SVG.
4. `OrbitAnimation.tsx` dibuja las trayectorias y los tres cuerpos.
5. `requestAnimationFrame()` actualiza su posición mientras la animación está reproduciéndose.

La animación utiliza **interpolación** para colocar los cuerpos entre dos muestras y conseguir un movimiento fluido. Los cálculos físicos se preparan antes de reproducir; no se vuelve a ejecutar RK4 en cada fotograma.

Los datos preparados se guardan en una **caché del servidor**, para no recalcular la misma órbita innecesariamente.

Como estas seis soluciones son periódicas, el reproductor puede volver al principio al alcanzar su período.

## 7. ¿Cómo funciona el experimento libre?

El usuario puede introducir una configuración diferente y pulsar **«Ejecutar simulación»**.

- `experiment-simulation.ts` calcula una nueva trayectoria con el mismo `rk4Step()`.
- `experiment.worker.ts` ejecuta el cálculo en un **Web Worker**, para no bloquear la interfaz mientras trabaja.
- `periodicity-detection.ts` analiza si los cuerpos vuelven aproximadamente a sus posiciones **y velocidades** iniciales.
- `ExperimentAnimation.tsx` muestra el movimiento y, si están activadas, sus estelas.

**Diferencia importante:** una trayectoria personalizada no tiene por qué ser periódica. Por eso, su animación no la repite automáticamente como si fuera una de las seis soluciones conocidas.

El detector puede encontrar un **retorno aproximado** dentro del tiempo simulado; no demuestra matemáticamente que la órbita se vaya a repetir para siempre.

## 8. ¿Estoy descubriendo órbitas nuevas?

**No de forma automática.**

En la galería reproduzco soluciones ya publicadas usando sus condiciones iniciales. En el experimento libre, el usuario puede probar configuraciones propias y ver si parecen producir un movimiento periódico.

El proyecto **no incluye un algoritmo que busque automáticamente nuevas condiciones iniciales** hasta encontrar una órbita periódica desconocida.

## 9. Archivos principales que debo conocer

| Archivo                                                   | Para qué sirve                                           |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `data/orbits.ts`                                          | Datos iniciales y períodos de las seis soluciones.       |
| `domain/newtonian-physics.ts`                             | Gravedad de Newton y función `rk4Step()`.                |
| `domain/orbit-integration.ts`                             | Integración adaptativa, muestras y control de precisión. |
| `application/orbitPlayback.ts`                            | Adaptación de coordenadas e interpolación para el SVG.   |
| `presentation/components/shared/OrbitAnimation.tsx`       | Animación de las órbitas conocidas.                      |
| `domain/experiment-simulation.ts`                         | Cálculo del experimento personalizado.                   |
| `presentation/components/experiment/experiment.worker.ts` | Cálculo fuera del hilo principal.                        |
| `domain/periodicity-detection.ts`                         | Análisis de posibles retornos periódicos.                |

### ¿Cómo puedo probarlo?

1. Abre Figura de ocho y comprueba pausa, reproducción, reinicio y velocidad.
2. Abre otra solución y observa que cambia la trayectoria, aunque se reutilizan el mismo integrador y el mismo reproductor.
3. En **Experimenta**, cambia una velocidad, ejecuta la simulación y comprueba que aparece una trayectoria nueva.
4. Revisa si el análisis de periodicidad informa de un retorno aproximado o de que no se ha encontrado.

**Resumen para recordar:** las **masas y G** determinan la atracción; **Newton** permite calcular las aceleraciones; **RK4** calcula cómo evolucionan las posiciones y velocidades; **SVG** dibuja el resultado. La física y la animación están separadas.
