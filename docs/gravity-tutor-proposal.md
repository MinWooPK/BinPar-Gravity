# Propuestas del Tutor IA en Gravity Lab

## ¿Qué hace esta funcionalidad?

El tutor puede explicar la gravedad y **proponer cambios en el simulador** cuando el usuario se lo pide.

Por ejemplo, si escribimos «Duplica la primera masa», el tutor puede proponer pasar de **40 kg a 80 kg**.

**La IA no cambia los valores directamente.** Primero muestra una propuesta y el usuario decide si quiere aplicarla o cancelarla.

## ¿Cómo funciona?

1. El usuario escribe una pregunta en el chat de Gravedad.
2. La aplicación envía la consulta y los datos actuales del simulador a `/api/ai`.
3. El servidor consulta a OpenAI. La respuesta puede incluir una explicación y una propuesta de parámetros.
4. La aplicación comprueba que la propuesta tenga el formato correcto y que los valores estén dentro de los límites permitidos.
5. Si es válida, aparece una tarjeta que compara los valores actuales con los nuevos y muestra cómo cambiaría la fuerza gravitatoria.
6. El usuario pulsa **Aplicar cambios** o **Cancelar**. Solo al aplicar se actualizan el simulador y la fórmula.

Una propuesta puede tener este aspecto:

```json
{
  "action": "set_gravity_parameters",
  "parameters": {
    "mass1": 80,
    "mass2": null,
    "distance": null
  }
}
```

`null` significa que ese parámetro mantiene su valor actual.

## Archivos principales

| Archivo                                                                     | Responsabilidad                                               |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `src/app/api/ai/route.ts`                                                   | Recibe la petición del chat y devuelve la respuesta.          |
| `src/features/ai/infrastructure/openaiTutor.ts`                             | Se comunica con el modelo de OpenAI.                          |
| `src/features/gravity/application/gravityProposal.ts`                       | Comprueba si los valores propuestos son válidos.              |
| `src/features/ai/presentation/components/TutorProposalCard.tsx`             | Muestra los cambios propuestos y los botones de confirmación. |
| `src/features/gravity/presentation/providers/GravityParametersProvider.tsx` | Comparte y actualiza el estado del simulador.                 |
| `src/features/gravity/application/gravityState.ts`                          | Aplica la propuesta mediante el reducer.                      |

## ¿Qué medidas de seguridad tiene?

- La IA solo puede proponer cambios en **masa 1, masa 2 y distancia**.
- Los valores deben respetar los límites del laboratorio.
- El usuario debe confirmar la propuesta.
- Si el simulador ha cambiado desde que se creó la propuesta, se impide aplicar una propuesta antigua.
- La fuerza gravitatoria la calcula el código de la aplicación, **no la IA**.

## ¿Cómo puedo probarlo?

1. Abre la etapa **Experimenta** de Gravedad.
2. Restablece los valores del simulador.
3. Abre el tutor y escribe: **«Duplica la masa 1 y explícame qué ocurre»**.
4. Comprueba que aparece una tarjeta con el cambio de 40 kg a 80 kg.
5. Antes de confirmar, comprueba que el simulador **no ha cambiado**.
6. Pulsa **Aplicar cambios** y comprueba que se actualizan los valores y la fuerza.

Para esta prueba, el tutor debe estar configurado con las variables de entorno de OpenAI.
