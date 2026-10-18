# Sincronización del laboratorio de gravedad

`GravityParametersProvider` conserva una única instancia de `gravityStateReducer`.
La simulación, los sliders, el tutor y ambas presentaciones de la fórmula leen ese
mismo estado. La fuerza visible se deriva mediante `gravitationalForce`; G sigue
siendo 6,67430 × 10⁻¹¹ N·m²/kg². Tres Cuerpos conserva su modelo independiente.

## Edición y precedencia

- Inicio: 40 kg, 40 kg, 8 m; F es la incógnita y ya aparece calculada.
- Rangos compartidos: masas de 10–100 kg; distancia de 5–20 m. `laboratoryLimits` es la fuente
  de límites para fórmula, sliders y validación del contexto del tutor.
- Cada edición resuelve los tres campos conocidos con `solveGravity`. Solo un
  resultado finito y dentro de rango actualiza los parámetros físicos, en la misma
  transición del reducer. No hay efecto de sincronización ni botón Aplicar.
- Se conserva literalmente el texto editado (incluidos coma decimal, exponente
  incompleto y ceros finales). Una entrada inválida o fuera de rango no cambia
  los últimos parámetros válidos. La interfaz indica el problema; no se recorta.
- Un cambio externo —slider o escenario de reto— sustituye el texto pendiente por
  los parámetros actuales y conserva la incógnita seleccionada. También actualiza
  el drawer cerrado. Cambiar entre Comprender y Experimentar conserva el estado.
- Elegir otra incógnita conserva la física ya conocida, evitando volver a invertir
  los valores válidos y acumular errores de coma flotante en los límites.
- Los despejes corrigen únicamente el ruido de coma flotante junto a un límite
  (tolerancia de ocho épsilon de máquina): invertir el escenario 10 kg/10 kg/5,8 m
  puede producir 9,999999999999998 kg. Los valores escritos no se corrigen ni se
  recortan; las salidas fuera de rango por encima de esa tolerancia se rechazan.
- La presentación de la incógnita usa hasta doce cifras significativas para
  evitar ruido binario visible. El solver y el estado conservan la precisión
  completa; el formato no se utiliza como entrada de nuevos cálculos.
- El slider avanza 1 kg o 0,1 m. Si la fórmula aporta un decimal entre esos pasos, lo
  representa exactamente; el ajuste al paso ocurre únicamente al arrastrarlo.
  El teclado suma/resta el paso al valor actual.

## Restablecer y retos

Restablecer desde la fórmula (integrada o drawer) o Experimentar devuelve **todos**
los parámetros a 40 kg/40 kg/8 m, elimina la edición pendiente y selecciona F. Esta acción
no reinicia el progreso educativo de los retos. Entrar en un reto restaura su
escenario base o su resultado ya comprobado, como antes; avanzar restaura la base.
Los tres resultados siguen siendo 2×, 4× y ¼ de la fuerza inicial.

## Comprobaciones automatizadas

`tests/gravity-state.test.mjs` verifica las transiciones usadas por el proveedor:
los cuatro despejes, sincronización en ambos sentidos, decimales, edición inválida,
valores fuera de rango, restablecimiento y escenarios de los tres retos.
`formula-input`, `gravitation`, `gravity-visualization` y los tests del tutor cubren
la ley física, los límites SI, el SVG y el contexto validado en servidor.

## Archivos de esta actualización

| Archivo | Cambio |
| --- | --- |
| `docs/architecture-refactor.md` | Modificado |
| `docs/gravity-synchronization.md` | Creado |
| `messages/en.json` | Modificado |
| `messages/es.json` | Modificado |
| `messages/fr.json` | Modificado |
| `src/features/ai/application/legacyTutorRequest.ts` | Modificado |
| `src/features/ai/application/tutorContext.ts` | Modificado |
| `src/features/ai/application/tutorPrompt.ts` | Modificado |
| `src/features/ai/application/tutorRequest.ts` | Modificado |
| `src/features/gravity/application/formulaInput.ts` | Modificado |
| `src/features/gravity/application/gravityState.ts` | Creado |
| `src/features/gravity/domain/gravitation.ts` | Modificado |
| `src/features/gravity/presentation/components/GravityIntroduction.tsx` | Modificado |
| `src/features/gravity/presentation/components/challenges/GravityLab.tsx` | Modificado |
| `src/features/gravity/presentation/components/experiment/GravityExperiment.tsx` | Modificado |
| `src/features/gravity/presentation/components/experiment/GravitySlider.tsx` | Modificado |
| `src/features/gravity/presentation/components/understanding/GravityFormula.tsx` | Modificado |
| `src/features/gravity/presentation/components/understanding/GravityFormulaAccess.tsx` | Modificado |
| `src/features/gravity/presentation/components/understanding/GravityFormulaApplication.module.css` | Retirado: aplicación manual obsoleta |
| `src/features/gravity/presentation/components/understanding/GravityFormulaApplication.tsx` | Retirado: aplicación manual obsoleta |
| `src/features/gravity/presentation/components/understanding/GravityUnderstandingSimulation.module.css` | Modificado |
| `src/features/gravity/presentation/components/understanding/GravityUnderstandingSimulation.tsx` | Modificado |
| `src/features/gravity/presentation/gravityVisualization.ts` | Modificado |
| `src/features/gravity/presentation/hooks/useGravityFormula.ts` | Retirado: aplicación manual obsoleta |
| `src/features/gravity/presentation/providers/GravityParametersProvider.tsx` | Modificado |
| `tests/compare-gravitation.test.mjs` | Modificado |
| `tests/formula-input.test.mjs` | Modificado |
| `tests/global-tutor.test.mjs` | Modificado |
| `tests/gravitation.test.mjs` | Modificado |
| `tests/gravity-state.test.mjs` | Creado |
| `tests/gravity-visualization.test.mjs` | Modificado |
| `tests/translations.test.mjs` | Modificado |
| `tests/tutor-request.test.mjs` | Modificado |

## Validación de esta versión

- `npm test`: 117 tests correctos, incluidos 14 casos del reducer compartido.
- `npm run lint`: correcto, sin avisos.
- `npm run typecheck`: correcto.
- `npm run build`: correcto; 30 páginas estáticas generadas.
- Navegador Chrome sobre la build de producción: sincronización en ambos sentidos,
  los cuatro despejes, decimales (incluidos valores entre pasos y próximos al paso),
  edición incompleta/inválida/fuera de rango, foco/cursor, restablecimiento, drawer
  cerrado/abierto, persistencia entre etapas y los tres retos con barras correctas.
- Responsive: 90 estados (ES/EN/FR × 320/375/768/1280/1440 px × alturas de
  600/900 px × Comprender/Experimentar/Retos) y 30 drawers, sin desbordamiento
  horizontal ni errores de consola/hidratación. Teclado y reduced-motion comprobados.
- Tutor: contexto enviado comprobado con respuestas simuladas; no se han hecho
  llamadas al modelo real. Los tests de servidor validan también el contexto SI.
- Inspección visual adicional: Comprender a 1440×900 y 375×812, con sus valores iniciales.
- Entorno de la auditoría visual: Chrome con viewport emulado, sin dispositivos
  físicos ni lector de pantalla real. Se observaron excepciones de runtime y
  `console.error`; no fue una revisión exhaustiva de todos los logs del servidor.
