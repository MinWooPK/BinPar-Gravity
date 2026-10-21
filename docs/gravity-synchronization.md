# Sincronización entre fórmula y laboratorio

Gravedad utiliza un estado compartido para sus cuatro etapas. Ese estado contiene tanto los parámetros válidos del laboratorio como el borrador de la calculadora. Pueden diferir mientras se escribe una entrada incompleta o se calcula un resultado fuera de los límites visuales.

## Qué guarda cada parte

| Estado                   | Contenido                                                 | Uso                                                    |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------ |
| `parameters`             | `mass1`, `mass2`, `distance` numéricos y dentro del rango | Simulador, sliders, comparaciones y contexto del tutor |
| `formula.values`         | Texto de F, m1, m2 y r                                    | Conservar exactamente las entradas mientras se editan  |
| `formula.unknown`        | Variable que se despeja                                   | Campo calculado de solo lectura                        |
| `formula.result`         | Resultado numérico o `null`                               | Mostrar la solución y decidir si se sincroniza         |
| `formula.numericalError` | Fallo al resolver con los datos disponibles               | Informar de un problema numérico                       |
| `revision`               | Revisión del laboratorio                                  | Rechazar propuestas de IA obsoletas                    |
| `resetVersion`           | Versión de restablecimiento                               | Reiniciar las vistas de la calculadora                 |

`GravityParametersProvider` publica tres Context: parámetros/fuerza, controles y fórmula. Sus hooks son `useGravityParameters`, `useGravityControls` y `useGravityFormulaDraft`. Las calculadoras de Comprende, Experimenta y el diálogo comparten el mismo borrador; no son sesiones independientes.

## Unidades y límites reales

La física usa `F = G · m1 · m2 / r²`, con `G = 6,67430 × 10⁻¹¹ N·m²/kg²`.

| Parámetro  | Unidad          | Intervalo del laboratorio | Paso del slider |
| ---------- | --------------- | ------------------------- | --------------- |
| `mass1`    | kg              | 10–100                    | 1               |
| `mass2`    | kg              | 10–100                    | 1               |
| `distance` | m entre centros | 5–20                      | 0,1             |
| F          | N               | Resultado calculado       | No tiene slider |

El estado inicial es **40 kg, 40 kg y 8 m**, con F como incógnita. No hay una conversión implícita a billones de kg ni a km. La escala del dibujo es ilustrativa.

Los pasos de los sliders no restringen todos los números de la fórmula. La sincronización de la calculadora comprueba finitud y rango; admite decimales dentro de esos límites. Las propuestas de IA sí deben respetar también los incrementos de los controles.

## Al editar la fórmula

1. `changeValue` envía una acción `formula` al reducer.
2. `changeFormulaInput` conserva el texto y analiza los tres valores conocidos. Acepta números positivos finitos, coma o punto decimal y notación con `e`.
3. `solveGravity` despeja F, m1, m2 o r. Si faltan entradas válidas, el resultado es `null`; si el cálculo falla, se marca `numericalError`.
4. Si el resultado está dentro del intervalo del laboratorio, el reducer copia sus masas y distancia a `parameters` y actualiza la revisión cuando esos valores cambian.
5. Si el resultado no es válido o está fuera del intervalo, `parameters` conserva los últimos valores aceptados y el borrador sigue mostrando lo escrito.

**La sincronización es automática: no existe un botón adicional para aplicar la fórmula.** Por ejemplo, con F como incógnita, cambiar m1 de 40 a 60 kg actualiza el laboratorio. Escribir 150 kg puede producir una fuerza válida matemáticamente, pero no mueve el simulador fuera de su intervalo.

Al cambiar la incógnita, `selectFormulaUnknown` reutiliza el resultado anterior como valor conocido cuando existe. Si fórmula y laboratorio estaban sincronizados, el reducer conserva la solución física vigente para evitar diferencias de redondeo.

## Al usar sliders o aceptar una propuesta

La acción `parameters` valida los nuevos parámetros, actualiza el laboratorio y reconstruye el borrador mediante `formulaInputFromParameters`. Mantiene la incógnita seleccionada, o utiliza F si no había ninguna.

Esto significa que un cambio desde los controles puede sustituir una entrada pendiente o fuera de rango de la fórmula. El borrador se conserva al cambiar de vista, pero no está aislado de las actualizaciones físicas.

Una propuesta aceptada del tutor recorre este mismo flujo después de comprobar su contrato y revisión. La confirmación de propuestas es distinta de la edición de la fórmula: **solo las propuestas necesitan «Aplicar cambios»**.

## Restablecer y navegar

Restablecer desde la calculadora o los controles ejecuta la acción `reset`: vuelve a 40 kg, 40 kg y 8 m, selecciona F y reconstruye el borrador. También incrementa `revision` y `resetVersion`, invalidando propuestas anteriores.

Cambiar de etapa o cerrar el diálogo de fórmula conserva el estado mientras `GravityParametersProvider` siga montado. No se persiste en almacenamiento del navegador; abandonar el módulo y volver puede crear un laboratorio nuevo.

La práctica de Comprueba es independiente. Sus preguntas, respuestas, token e informe no forman parte de `GravityState`. El reinicio del laboratorio no equivale a reiniciar la práctica.

## Rutas de implementación

Todas estas rutas parten de la raíz del repositorio:

| Archivo                                                                                                | Responsabilidad                                |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `src/features/gravity/presentation/providers/gravity-parameters/GravityParametersProvider.tsx`         | Estado compartido y acciones                   |
| `src/features/gravity/presentation/providers/gravity-parameters/GravityParametersContext.ts`           | Context y hooks de acceso                      |
| `src/features/gravity/application/gravityState.ts`                                                     | Transiciones entre parámetros y borrador       |
| `src/features/gravity/application/formulaInput.ts`                                                     | Entradas, incógnita y resultado                |
| `src/features/gravity/application/parseFormulaValue.ts`                                                | Análisis del texto numérico                    |
| `src/features/gravity/domain/gravitation.ts`                                                           | Fuerza, despejes y límites                     |
| `src/features/gravity/presentation/components/understanding/gravity-formula/GravityFormulaContent.tsx` | Composición de la calculadora y estado visible |
| `src/features/gravity/presentation/components/understanding/gravity-formula/GravityFormulaFields.tsx`  | Campos y selector de incógnita                 |
| `src/features/gravity/presentation/components/experiment/GravityExperiment.tsx`                        | Sliders y comparación de fuerzas               |

## Verificación manual

1. En Comprende, abre la calculadora y deja F como incógnita. Cambia m1 de 40 a 60 kg; comprueba el cambio del diagrama y de los controles de Experimenta.
2. Introduce 150 kg. La fórmula debe avisar del rango y el laboratorio conservar 60 kg.
3. Cambia un slider en Experimenta: la fórmula debe reconstruirse con los parámetros del laboratorio, sustituyendo los 150 kg del borrador.
4. Selecciona otra incógnita y cambia de etapa o abre/cierra el diálogo. Comprueba que la selección y las entradas se conservan.
5. Restablece desde la fórmula y verifica 40 kg, 40 kg, 8 m y F seleccionada también en las otras vistas.

`tests/gravity-state.test.ts`, `tests/formula-input.test.ts` y `tests/gravitation.test.ts` comprueban partes de este flujo y de sus cálculos. Se ejecutan con `npm test`; no sustituyen la revisión de interacción y presentación.
