# Tutor IA y ejercicios de gravedad

## ¿Para qué sirve?

En la etapa **04 · Comprueba**, el usuario practica lo que ha aprendido sobre la gravedad de Newton.

Hay **dos funcionalidades diferentes**:

- **Tutor IA:** responde preguntas y da pistas generales para entender los conceptos. No conoce la pregunta concreta que está haciendo el usuario ni decide si su respuesta es correcta.
- **Práctica adaptativa:** muestra ejercicios, comprueba las respuestas y ofrece explicaciones. Utiliza OpenAI para generar preguntas y explicar los resultados, pero la corrección matemática la hace nuestro código.

Separar estas funciones evita que el chat sustituya a la evaluación.

## ¿Cómo funciona la práctica?

1. El usuario entra en **Comprueba** y pulsa **Empezar**.
2. La aplicación solicita una pregunta a `/api/practice`. OpenAI genera una pregunta siguiendo unas reglas y el historial del usuario.
3. El usuario puede consultar una **pista** y después introducir su respuesta.
4. Al pulsar **Comprobar**, una función de TypeScript calcula la solución y decide si la respuesta es correcta.
5. OpenAI redacta una explicación a partir del resultado ya comprobado.
6. Al avanzar, se prepara otra pregunta teniendo en cuenta los aciertos, errores y pistas utilizadas.
7. Al completar **cinco preguntas**, se muestra un informe con el resultado y recomendaciones de repaso.

**Importante:** OpenAI ayuda a crear y explicar los ejercicios, pero **no decide la nota ni sustituye los cálculos físicos**.

## ¿Qué hace el Tutor IA en Comprueba?

El botón flotante abre el tutor de Gravity Lab. En esta etapa está preparado para **explicar conceptos sin resolver el ejercicio por el usuario**.

Por ejemplo, si el usuario pregunta «¿Qué representa la distancia en la fórmula?», el tutor puede explicar el significado de `r` y su relación con la gravedad.

El tutor no recibe el enunciado ni la respuesta de la práctica actual. La corrección se realiza de manera independiente en `/api/practice`.

## ¿Qué archivos intervienen?

| Archivo                                     | Responsabilidad                                                       |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `GravityPractice.tsx`                       | Muestra preguntas, pistas, respuestas y resultados.                   |
| `usePracticeSession.ts`                     | Guarda el estado de la práctica y llama a la API.                     |
| `src/app/api/practice/route.ts`             | Recibe las peticiones y coordina la sesión.                           |
| `application/practice/session.ts`           | Controla el inicio, la corrección y el avance entre preguntas.        |
| `domain/practice/evaluation.ts`             | Calcula la respuesta correcta y comprueba lo que contestó el usuario. |
| `infrastructure/practice/openaiPractice.ts` | Usa OpenAI para generar preguntas, explicaciones e informes.          |
| `features/ai/application/tutorPrompt.ts`    | Indica al Tutor IA que en Comprueba solo dé ayuda conceptual.         |

Los archivos de práctica están dentro de `src/features/gravity/`, salvo la ruta API y el prompt compartido de IA.

## ¿Cómo demostrarlo en la entrevista?

1. Abre **Gravedad → 04 · Comprueba** y empieza una práctica.
2. Muestra la pregunta y abre la pista; explica que el usuario puede pedir ayuda antes de responder.
3. Abre el Tutor IA y haz una pregunta conceptual, sin pedir que resuelva el ejercicio.
4. Responde a la pregunta y pulsa **Comprobar**. Enseña la corrección y la explicación.
5. Avanza para mostrar que las preguntas pueden adaptarse al historial.
6. Al terminar las cinco preguntas, muestra el informe final.

La generación de preguntas y explicaciones necesita las variables `OPENAI_API_KEY` y `OPENAI_MODEL` configuradas en el servidor.
