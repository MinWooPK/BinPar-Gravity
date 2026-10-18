# Tutor contextual de los tres retos

## Flujo y alcance

`GravityLab` ya publica la etapa, el reto, la predicción seleccionada y, solo
después de comprobarla, un `attempt`. `TutorContextBridge` mantiene esa información
en una referencia; `useTutorConversation` la lee al enviar una consulta. No fue
necesario modificar estos componentes ni el estado del laboratorio.

`tutorContext.ts` deriva en el servidor un `TutorChallengeStatus`:

| Estado | Datos reales | Instrucción docente |
| --- | --- | --- |
| `awaiting-prediction` | Sin opción ni intento | Una pista, sin atribuir una respuesta |
| `prediction-pending` | Opción elegida, sin intento | Pistas sin confirmar, corregir ni revelar la solución |
| `correct` | Intento comprobado que coincide con la respuesta oficial | Reforzar el razonamiento y preguntar algo ligeramente más avanzado |
| `incorrect` | Intento comprobado distinto de la respuesta oficial | Explicar el error, dar un ejemplo sencillo y preguntar para comprobar comprensión |

La corrección procede de los tres retos existentes. Las fuerzas siguen
calculándose con `gravitationalForce`; no se cambia ninguna respuesta oficial.
Un intento de otro reto no valida el actual. El estado docente no es un campo
que el cliente pueda enviar para atribuirse un acierto.

`tutorPrompt.ts` selecciona las instrucciones de la situación actual. Mientras
la predicción está pendiente, omite la instrucción general de enumerar los
resultados de duplicar masas o distancia, para que esa explicación no adelante
la solución. Después, pide una sola pregunta breve de seguimiento y esperar la
respuesta. El diálogo existente permite continuar, sin crear perfiles, puntos,
retos permanentes ni historial de aprendizaje.

En la etapa 04, la acción rápida contextual pasa a ser «Ayúdame con este reto».
Las otras etapas conservan «Explica mi experimento» y Tres Cuerpos mantiene sus
acciones. Los textos nuevos están traducidos a ES/EN/FR.

## Demostración en una entrevista

Con el proveedor IA configurado, abrir `/es/gravity#gravity-challenges`:

1. Abrir el tutor y pulsar **Ayúdame con este reto**, sin seleccionar nada.
   Debe ofrecer una pista sin atribuir una respuesta al estudiante.
2. Elegir una opción y consultar otra vez **antes de Comprobar**. Mostrar que
   solo se envía `prediction`, sin `attempt`: sigue siendo una predicción,
   incluso cuando la opción elegida coincide con la respuesta correcta.
3. Abrir el reto 3 (distancia), elegir una opción incorrecta disponible, por
   ejemplo «Será la misma», y pulsar **Comprobar**. Consultar al tutor:
   el estado es `incorrect` y la explicación debe relacionar `r²` con una
   fuerza de una cuarta parte al pasar de 8 m a 16 m.
4. Escribir **«Yo pensaba que se reduciría a la mitad. ¿Por qué no?»** para
   demostrar el seguimiento. «La mitad» no es una opción de los retos actuales;
   esta creencia se expresa en el chat, sin inventar que fue la opción seleccionada.
5. Volver al reto 1, elegir «Será el doble», comprobar y consultar. Mostrar el
   estado `correct`, el refuerzo del razonamiento y la pregunta más avanzada.
   Responder a esa pregunta en el mismo chat: no cambia el resultado oficial.
6. En la pestaña Network, filtrar `/api/ai`: seleccionar respuestas, comprobar
   y cambiar de reto no dispara consultas. Solo lo hacen las acciones del tutor.

Para explicar la arquitectura: **React aporta el estado real; el servidor
determina el resultado con el catálogo y la física; el modelo redacta la ayuda**.
El modelo no decide la nota, no cambia parámetros y no registra un perfil.

## Verificación

- `npm run lint`, `npm run typecheck`, `npm test` (125 tests aprobados) y
  `npm run build` completados correctamente.
- Pruebas unitarias de ausencia de selección, todas las predicciones pendientes
  en los tres retos, respuestas correctas e incorrectas, intento de otro reto,
  diálogo anterior, seguimiento y rechazo de un estado docente enviado por cliente.
- Pruebas de navegador en ES/EN/FR: contexto de cada estado, reset al avanzar,
  conservación al cambiar de etapa, acción contextual, mensajes de seguimiento,
  teclado y acceso a 320×384; sin consultas automáticas ni errores de consola.
- Las pruebas de navegador interceptan `/api/ai` localmente. Comprueban el flujo
  y los datos, no la calidad de una respuesta real del modelo. El contrato del
  prompt se comprueba con tests; la demostración anterior permite revisar
  manualmente el comportamiento del proveedor real.
