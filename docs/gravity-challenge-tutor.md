# Tutor IA y evaluación adaptativa de Gravedad

La etapa **04 · Comprueba** utiliza una práctica de cinco preguntas. El chat y la evaluación son dos funciones independientes: el tutor ofrece ayuda conceptual, mientras que `/api/practice` coordina preguntas, corrección e informe.

## Reparto de responsabilidades

| Función             | Código determinista                                                                | OpenAI                                                            |
| ------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Plan de aprendizaje | Elige conceptos permitidos, dificultad y refuerzo                                  | Recibe ese plan y el historial como datos                         |
| Pregunta            | Valida la definición, evita repeticiones y construye el enunciado con traducciones | Propone concepto permitido, valores, escena y estrategia de pista |
| Corrección          | Calcula solución, conversiones, acierto, error típico y puntuación                 | No decide si la respuesta es correcta                             |
| Explicación         | Envía la corrección ya calculada                                                   | Redacta una explicación y pasos                                   |
| Informe             | Calcula aciertos, pistas y evidencia por concepto                                  | Redacta resumen, puntos de repaso y recomendaciones               |
| Tutor de chat       | Publica etapa y parámetros del laboratorio                                         | Responde con ayuda conceptual según el prompt                     |

La IA no genera libremente un enunciado que luego se intente interpretar. Devuelve una definición estructurada; `PracticeQuestionPanel` y los archivos de `messages/` determinan el texto visible. Las pistas también son traducciones seleccionadas mediante una clave validada.

## Sesión de práctica

Las acciones de `POST /api/practice` son:

1. **`start`:** recibe `locale`, genera la primera pregunta e inicia una sesión con caducidad de 24 horas.
2. **`answer`:** recibe token, respuesta y uso de pista. Solo se admite en fase `question`. `evaluateAnswer` calcula el resultado antes de pedir a OpenAI la explicación.
3. **`next`:** solo se admite tras corregir y antes de completar cinco respuestas. Genera la siguiente pregunta con el historial acumulado.
4. Al corregir la quinta respuesta se genera también el informe y la sesión pasa a `complete`. La interfaz muestra el informe y permite iniciar una práctica nueva.

La respuesta HTTP contiene el token actualizado, pregunta, progreso, puntuación, uso de pistas e historial resumido; añade feedback o informe cuando corresponda. No hay una llamada separada para pedir el informe final.

`usePracticeSession` conserva el estado en memoria, bloquea envíos simultáneos, cancela al desmontar y permite reintentar la última acción. La práctica se conserva al cambiar de etapa mientras su componente permanece montado; no se restaura automáticamente después de recargar o salir del módulo.

## Cómo se adapta

`application/practice/adaptation.ts` toma las decisiones principales:

- La primera pregunta comienza en dificultad 1.
- Un fallo propone refuerzo y reduce un nivel la dificultad, sin bajar de 1.
- Dos aciertos recientes sin pistas permiten subir un nivel, hasta 3; en los demás casos se mantiene la dificultad anterior.
- Se parte de un itinerario de conceptos y se ajusta para reforzar errores y cubrir teoría, conversiones y cálculo durante las cinco preguntas.

El modelo elige una definición dentro de los conceptos y dificultad del plan; no tiene libertad para cambiar esas reglas. `generateQuestion` valida números, claves, pista, resultado calculable y repetición de la definición. Si falla la validación, la operación devuelve error: no se sustituye por un ejercicio local prefijado.

Los conceptos admitidos incluyen atracción, masas, distancia, igualdad de fuerzas, conversiones, cuadrados, notación científica y cálculo de F. No todos aparecen necesariamente en cada sesión de cinco preguntas.

## Corrección, unidades y puntuación

`domain/practice/evaluation.ts` obtiene la respuesta esperada mediante reglas y la ley de Newton. En los ejercicios de fuerza convierte a SI antes de calcular: la primera masa puede venir en toneladas en dificultad 3 y la distancia en km en dificultades 2 y 3. La segunda masa se expresa en kg. Los ejercicios de conversión también incluyen cm.

Las respuestas numéricas aceptan una tolerancia relativa del **0,5 %**. Las preguntas de opción se comparan con la opción esperada. Se identifican algunos errores típicos —por ejemplo, no convertir unidades o no elevar la distancia al cuadrado— sin asumir que ese diagnóstico demuestra el razonamiento del estudiante.

La puntuación es el número de aciertos sobre cinco. El uso de pistas se registra y afecta al plan, pero no resta automáticamente un acierto. OpenAI recibe el resultado autorizado para redactar feedback; no lo recalcula ni determina la nota.

La operación depende también de la generación de texto: si falla la explicación o, en la última respuesta, el informe, la API devuelve un error en lugar de entregar una operación parcialmente completada. El cliente conserva la posibilidad de reintentar.

## Alcance del chat en Comprueba

El tutor no recibe automáticamente el enunciado actual, la respuesta, el intento ni el informe. Su contexto incluye la etapa y los parámetros del laboratorio. El prompt le pide dar pistas conceptuales sin resolver ni calificar ejercicios; `parseTutorReply` descarta propuestas de modificación en esta etapa.

Esto es una separación de datos y responsabilidades, no una garantía absoluta sobre todo texto que pueda redactar el modelo. Si el usuario copia un ejercicio dentro del chat, ese contenido sí forma parte de su mensaje.

La práctica no utiliza las preguntas del chat como respuestas ni modifica los sliders al comprobar un ejercicio. Las antiguas definiciones de tres retos que aún existen en `gravitation.ts` no son el flujo visible de Comprueba: la interfaz monta `GravityPractice`.

## Sesión y seguridad

La sesión completa viaja cifrada y autenticada con **AES-256-GCM** en un token. La clave se deriva de `OPENAI_API_KEY`; no hace falta otra variable de entorno. El servidor comprueba el token, la caducidad y la fase, pero no mantiene una base de datos ni revoca tokens anteriores. El cifrado no convierte la práctica en un examen con identidad verificada ni impide reutilizar un token anterior válido.

La ruta exige JSON, comprueba origen cuando se proporciona y comparte el lector limitado y la implementación de cuotas del tutor, con una instancia propia. La clave y el modelo se usan únicamente en el servidor. Sin configuración, devuelve `503 not_configured`.

## Rutas actuales

Las rutas de la tabla son relativas a la raíz del repositorio:

| Archivo                                                                                            | Responsabilidad                                              |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/features/gravity/presentation/components/practice/gravity-practice/GravityPractice.tsx`       | Vista de preguntas e informe                                 |
| `src/features/gravity/presentation/components/practice/gravity-practice/PracticeQuestionPanel.tsx` | Enunciado traducido, pista y envío                           |
| `src/features/gravity/presentation/components/practice/usePracticeSession.ts`                      | Estado cliente y peticiones                                  |
| `src/app/api/practice/route.ts`                                                                    | Configuración, cuotas y errores HTTP                         |
| `src/app/api/practice/_lib/handlePracticeAction.ts`                                                | Adaptación entre API y sesión                                |
| `src/features/gravity/application/practice/session.ts`                                             | Inicio, corrección y avance                                  |
| `src/features/gravity/application/practice/adaptation.ts`                                          | Plan y evidencia de aprendizaje                              |
| `src/features/gravity/domain/practice/evaluation.ts`                                               | Solución, tolerancia y corrección                            |
| `src/features/gravity/infrastructure/practice/openai-practice/openaiPractice.ts`                   | Entrada a los generadores de pregunta, explicación e informe |
| `src/features/gravity/infrastructure/practice/sessionToken.ts`                                     | Token cifrado y caducidad                                    |
| `src/features/ai/application/tutorPrompt.ts`                                                       | Instrucciones de ayuda conceptual para el chat               |

## Demostración manual

Con las dos variables de OpenAI configuradas, abre Comprueba e inicia una sesión. Consulta una pista, responde, revisa la corrección y completa las cinco preguntas para ver el informe. Abre el chat por separado para mostrar que no conoce automáticamente el ejercicio y que no decide la puntuación. Comprueba también errores de configuración y reintentos.

`tests/gravity-practice.test.ts` cubre cálculo, corrección y validación de peticiones; `tests/gravity-tutor-scope.test.ts` comprueba el alcance conceptual del tutor. Esas pruebas no consultan al proveedor ni acreditan la calidad de las preguntas, explicaciones o informes reales.
