# Propuestas del Tutor IA

El tutor de Gravedad puede devolver una explicación y una propuesta para modificar masas o distancia. La propuesta se presenta como una tarjeta pendiente: **recibirla no modifica el laboratorio**. El código calcula la comparación de fuerzas y solo aplica los parámetros después de la confirmación del usuario.

## Dónde se permiten cambios

`TutorProvider` se monta en el layout de Gravedad. Inicio y Tres Cuerpos no muestran el tutor, y el contrato actual de `/api/ai` no admite sus contextos.

| Contexto de Gravedad                                                    | Comportamiento                                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Bienvenida (`stage: null`), Descubre y Experimenta                      | Una pregunta libre puede producir una propuesta validada                                         |
| Comprende                                                               | Solo explicación; se descartan propuestas                                                        |
| Comprueba                                                               | Solo ayuda conceptual; se descartan propuestas y no se envía automáticamente el ejercicio actual |
| Intenciones `explain_formula`, `explain_experiment` y `explain_context` | Solo explicación, incluso en una etapa que admite cambios                                        |

El prompt pide propuestas únicamente ante una solicitud explícita de modificación. Esa interpretación depende del modelo; los límites técnicos, las restricciones por etapa y la confirmación se aplican además en código.

## Flujo de una propuesta

1. La interfaz envía idioma, modo, mensajes recientes, etapa y parámetros actuales a `POST /api/ai`.
2. El servidor valida la petición y prepara el contexto físico. La fuerza actual y los ejemplos numéricos se calculan con el dominio.
3. OpenAI devuelve JSON con `text` y `proposal`. `parseTutorReply` descarta propuestas en contextos de solo lectura y valida las demás.
4. El cliente vuelve a analizar la respuesta y guarda, junto a la propuesta, los parámetros base, el contexto completo y el puerto/revisión desde los que se solicitó.
5. `TutorProposalCard` muestra valores anteriores/nuevos y fuerzas calculadas con `gravitationalForce`.
6. Al pulsar Aplicar, `decideTutorProposal` comprueba que la propuesta sigue pendiente y corresponde al laboratorio actual. El reducer vuelve a comprobar la revisión antes de actualizar los parámetros y reconstruir la fórmula.

Cancelar cambia su estado a `cancelled` sin modificar parámetros. Una confirmación válida produce `applied`; una propuesta que perdió vigencia pasa a `stale`. Una propuesta con datos inválidos se rechaza y no se ofrece como acción ejecutable.

## Contrato y unidades

La única acción admitida es `set_gravity_parameters`:

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

`null` conserva el parámetro actual. Deben estar presentes las tres claves y existir al menos un cambio real. Se rechazan acciones o propiedades ajenas al contrato.

| Parámetro        | Unidad          | Rango  | Incremento admitido |
| ---------------- | --------------- | ------ | ------------------- |
| `mass1`, `mass2` | kg              | 10–100 | 1 kg                |
| `distance`       | m entre centros | 5–20   | 0,1 m               |

No se permite modificar G, F, la incógnita ni respuestas de práctica. No se recorta silenciosamente un valor fuera del rango.

## Protección frente a propuestas antiguas

Antes de aplicar se comprueban la identidad de la función de aplicación, la revisión de origen, el contexto serializado y la igualdad de los parámetros base. El contexto vigente tampoco puede ser Comprende o Comprueba.

Por eso, modificar un slider, restablecer el laboratorio o cambiar a otra etapa puede impedir aplicar una tarjeta anterior. Volver manualmente a los mismos valores no garantiza recuperarla: la revisión puede haber cambiado.

Las propuestas viven en memoria y no se guardan en `localStorage`; al recargar se restaura el texto del historial, pero no una autorización pendiente para modificar el laboratorio. Los mensajes históricos tampoco se consideran parámetros actuales.

## Archivos principales

| Archivo desde la raíz                                                      | Responsabilidad                                          |
| -------------------------------------------------------------------------- | -------------------------------------------------------- |
| `src/app/api/ai/route.ts`                                                  | Validación HTTP, configuración, cuotas y respuesta       |
| `src/features/ai/infrastructure/openaiTutor.ts`                            | Solicitud estructurada al proveedor                      |
| `src/features/ai/application/tutorResponse.ts`                             | Validación de respuesta y restricciones por contexto     |
| `src/features/gravity/application/gravityProposal.ts`                      | Contrato, rangos, incrementos y resolución de parámetros |
| `src/features/ai/application/tutorProposal.ts`                             | Decisión y vigencia de la propuesta                      |
| `src/features/ai/presentation/hooks/useTutorRequests.ts`                   | Solicitud, cancelación y captura del origen              |
| `src/features/ai/presentation/components/tutor-chat/TutorProposalCard.tsx` | Tarjeta y confirmación                                   |
| `src/features/gravity/application/gravityState.ts`                         | Comprobación final de revisión y actualización           |

## Verificación manual

Con `OPENAI_API_KEY` y `OPENAI_MODEL` configuradas:

1. En Experimenta, restablece el laboratorio y pide por el chat «Duplica la masa 1 y explícame qué ocurre».
2. Si el modelo propone el cambio, comprueba la comparación de **40 a 80 kg** y que la fuerza propuesta es el doble. El simulador debe seguir en 40 kg hasta confirmar.
3. Aplica y comprueba que se actualizan sliders, fórmula y fuerza.
4. Solicita otra propuesta; antes de aceptarla, modifica un slider. Aplicar la tarjeta anterior debe marcarla como obsoleta sin sobrescribir el laboratorio.
5. Comprueba Cancelar y que en Comprende, Comprueba y las ayudas educativas no se ofrecen propuestas aplicables.

`tests/tutor-proposals.test.ts` y `tests/gravity-tutor-scope.test.ts` cubren partes del contrato y la confirmación sin consultar a OpenAI. La generación real de una tarjeta y la calidad de su texto necesitan comprobación con el proveedor.
