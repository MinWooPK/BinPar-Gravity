# Propuestas del tutor para el laboratorio

Continuación del commit `a7f2396` (`wip(ai): implement gravity simulator actions`), verificada el 18 de octubre de 2026. Sin dependencias nuevas ni cambios en la física o en Tres Cuerpos.

## Estado recuperado y trabajo completado

El WIP ya contenía:

- Respuesta JSON estructurada de OpenAI para Gravity; respuesta de texto original para Tres Cuerpos.
- La única acción `set_gravity_parameters`, con `mass1`, `mass2` y `distance`; `null` conserva el valor actual.
- Validación de propiedades, tipos, límites y pasos en `gravityProposal.ts` y reutilización de `laboratoryLimits` e `isWithinLaboratoryRange`.
- Comunicación tipada desde `TutorContextBridge` hasta el tutor global. La capacidad local contiene la revisión y el callback del provider; no se envía al modelo.
- Tarjeta de confirmación en `GlobalTutor`, con las fuerzas calculadas mediante `gravitationalForce`.
- Confirmación mediante el reducer existente y revisión incremental para rechazar propuestas antiguas, incluso después de cambiar parámetros y volver a sus valores originales.

Esta continuación completa el tratamiento educativo de propuestas rechazadas: se descarta tanto la acción inválida como su posible explicación numérica errónea. La API responde con un texto seguro traducido, sin acción aplicable. El cliente vuelve a validar y dispone de la misma alternativa localizada. También se han actualizado las pruebas que esperaban la antigua respuesta de texto o un reset sin revisión, y añadido pruebas de las decisiones y del recorrido API/adaptador.

## Flujo y responsabilidades

1. El usuario consulta explícitamente; mover sliders, abrir el tutor o comprobar retos no dispara consultas.
2. El servidor construye el contexto físico desde el dominio y pide una respuesta estructurada. El modelo propone valores, nunca ejecuta código ni modifica el estado.
3. El servidor valida la propuesta. Valores fuera de los límites, pasos inválidos, acciones desconocidas o una propuesta sin cambios no producen una acción aplicable.
4. El cliente valida de nuevo, conserva la instantánea del contexto y la capacidad del provider que existían al iniciar la consulta y presenta la tarjeta. Las fuerzas anterior y nueva se calculan en el dominio.
5. Cancelar solo cambia el estado de la tarjeta. Aplicar requiere que coincidan contexto, parámetros, revisión y la identidad del provider.
6. El provider comprueba de nuevo revisión y parámetros de forma atómica y usa su reducer para actualizar simulación, sliders, fórmula y fuerza. Una segunda pulsación no puede reaplicar la propuesta.

El contador de revisión detecta cambios y retornos A → B → A. La identidad del callback impide reutilizar una propuesta después de desmontar y volver a montar el laboratorio. La comprobación final del reducer también cubre una actualización anterior a que el bridge publique su siguiente revisión.

## Archivos modificados en esta continuación

- `src/features/ai/application/tutorResponse.ts`: señal de rechazo seguro de propuestas inválidas.
- `src/features/ai/types/tutor.types.ts`: resultado tipado de ese rechazo.
- `src/app/api/ai/route.ts`: alternativa educativa traducida, sin propuesta.
- `src/features/ai/presentation/hooks/useTutorConversation.ts`: lectura de JSON como `unknown`, validación y alternativa localizada del cliente.
- `messages/es.json`, `messages/en.json`, `messages/fr.json`: explicación del rechazo y de los límites.
- `tests/tutor-proposals.test.mjs`: confirmación, cancelación, límites/pasos, acciones arbitrarias, doble aplicación, cambios y retornos, resets, cambios de contexto/provider, carrera de revisión y sincronización de todos los campos de fórmula.
- `tests/global-tutor.test.mjs`: respuesta estructurada del adaptador, propuestas válidas/rechazadas, formato original de Tres Cuerpos y respuesta de la API en los tres idiomas.
- `tests/gravity-state.test.mjs`: expectativa del contador de revisión después de restablecer.
- Este documento.

Se conservaron los cambios locales anteriores de Home y el formato de `gravity.types.ts`.

## Verificación ejecutada

- `npm run lint`: correcto.
- `npm run typecheck`: correcto.
- `npm test`: 136 pruebas correctas.
- `npm run build`: correcto, 30 páginas generadas.
- Chrome con la API simulada en ES/EN/FR: propuesta pendiente sin aplicar, cancelación, confirmación por teclado, foco conservado, sincronización de sliders/fórmula/SVG, propuesta obsoleta tras A → B → A, rechazo fuera de rango, chat normal y contexto actualizado.
- Medidas del DOM del diálogo y de la tarjeta: sin desbordamiento horizontal en 320×600, 375×667, 768×800, 1280×800 y 320×384; botones de al menos 44 px de altura.
- Los tres retos en ES/EN/FR: predicción pendiente, respuesta incorrecta y correcta, siguiente reto, restablecimiento del escenario, persistencia entre etapas y contexto de las consultas. Las consultas se simularon; no se evaluó pedagógicamente una respuesta real del modelo en cada reto.
- Chrome sobre la compilación de producción: cancelación, propuesta obsoleta por cambios durante la petición pendiente y aplicación conjunta de masa 1, masa 2 y distancia, con comprobación de fórmula y fuerza.
- Sin errores de consola, ejecución o hidratación observados en esos recorridos de navegador.
- Una consulta real a `/api/ai` con el modelo configurado: HTTP 200, explicación educativa y propuesta `{action: "set_gravity_parameters", parameters: {mass1: 80, mass2: null, distance: null}}`. Esa consulta no modifica el laboratorio. No se expusieron ni cambiaron credenciales.

Las pruebas del modelo están acotadas a esa consulta real; el resto de casos usa respuestas controladas para verificar la aplicación de forma determinista.

## Demostración en la entrevista

1. Abre Gravity → Experimenta y restablece: 40 kg, 40 kg y 8 m.
2. Escribe «Duplica la masa 1 y explícame qué ocurre».
3. Señala que los sliders siguen en sus valores iniciales. La tarjeta muestra 40 → 80 kg, 40 kg y 8 m, además de las fuerzas anterior y propuesta (aproximadamente 1,669 × 10⁻⁹ y 3,337 × 10⁻⁹ N).
4. Pulsa Aplicar cambios. Comprueba el slider, el tamaño ilustrativo del primer cuerpo y la fuerza; cambia a Comprende para mostrar la fórmula sincronizada.
5. Restablece, pide otra propuesta y cancela: no cambia el laboratorio.
6. Genera otra propuesta, cierra el tutor, cambia masa 1 de 40 a 41 y vuelve a 40; al intentar aplicarla se informa de que ha quedado obsoleta.
7. Pide un valor fuera de rango, como 200 kg: el tutor debe explicar el límite sin ofrecer una acción aplicable. Pregunta después qué representa G para mostrar que el chat normal continúa disponible.

Explicación técnica breve: el modelo sugiere una acción de un contrato cerrado; la aplicación valida y el usuario confirma. Solo el provider existente puede cambiar el laboratorio y solo las funciones físicas del dominio calculan fuerzas.
