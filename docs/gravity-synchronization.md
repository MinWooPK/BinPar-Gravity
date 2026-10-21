# Sincronización del laboratorio de gravedad

## ¿Para qué sirve?

En Gravity Lab, la fórmula, los controles deslizantes (_sliders_) y la simulación utilizan los mismos valores de masa y distancia.

La idea es sencilla: **si el usuario cambia un valor en una parte de la aplicación, las demás muestran el resultado actualizado**. Así evitamos que la fórmula indique unos datos y el simulador utilice otros.

## ¿Cómo funciona?

Utilizo un **estado compartido de React** para guardar los parámetros del laboratorio:

- `mass1`: masa del primer cuerpo.
- `mass2`: masa del segundo cuerpo.
- `distance`: distancia entre los cuerpos.

`GravityParametersProvider` permite que los componentes consulten y modifiquen ese estado sin tener que pasar los valores manualmente de un componente a otro.

Los cambios se gestionan con `gravityStateReducer`, una función que recibe el estado actual y una acción, y devuelve el nuevo estado.

### Ejemplo: cambiar una masa

1. El usuario cambia la primera masa de **40 kg** a **60 kg** desde un slider o desde la fórmula.
2. La aplicación comprueba que los valores sean válidos.
3. El reducer actualiza los parámetros compartidos.
4. La simulación, los sliders y la fórmula muestran los valores actualizados.
5. La fuerza gravitatoria se vuelve a calcular mediante `gravitationalForce`.

**No hace falta pulsar «Aplicar» para sincronizar la fórmula:** cuando los valores introducidos son correctos y están dentro del rango permitido, el laboratorio se actualiza automáticamente.

## Validación de los valores

Para evitar resultados incorrectos, el laboratorio tiene unos límites:

| Parámetro | Valores permitidos |
| --------- | ------------------ |
| Masa 1    | 10–100 kg          |
| Masa 2    | 10–100 kg          |
| Distancia | 5–20 m             |

Si el usuario escribe un valor incorrecto, por ejemplo una masa de **150 kg**, el campo puede mostrar lo que ha escrito y avisar del problema, pero **la simulación conserva los últimos parámetros válidos**.

También se permiten decimales. El texto de entrada se conserva mientras el usuario escribe, incluso si todavía está incompleto.

## La fórmula interactiva

La fórmula utiliza la ley de gravitación universal de Newton:

**F = G · (m₁ · m₂) / r²**

Con **G = 6,67430 × 10⁻¹¹ N·m²/kg²**.

El usuario puede elegir qué valor quiere calcular: fuerza, primera masa, segunda masa o distancia. Los otros campos se utilizan para obtener el resultado.

Si el resultado permite actualizar el laboratorio y está dentro de los límites, el cambio se refleja en la simulación. Si no es válido, se muestra el problema sin alterar los últimos valores correctos.

La fórmula de la etapa «Comprende» y la que aparece en el panel lateral comparten el mismo estado. Por eso, cambiar de etapa o cerrar ese panel no borra los datos introducidos.

## Restablecer y retos

Al pulsar **«Restablecer»**, los parámetros vuelven a sus valores iniciales:

- Masa 1: **40 kg**.
- Masa 2: **40 kg**.
- Distancia: **8 m**.
- Incógnita de la fórmula: **fuerza (F)**.

El restablecimiento del laboratorio no borra por sí solo el progreso de los retos educativos. Cada reto conserva su propia lógica de predicciones y resultados.

## Archivos principales

| Archivo                                                                         | Responsabilidad                                                              |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/features/gravity/presentation/providers/GravityParametersProvider.tsx`     | Comparte los parámetros y las funciones de actualización entre componentes.  |
| `src/features/gravity/application/gravityState.ts`                              | Contiene el reducer que gestiona los cambios del laboratorio.                |
| `src/features/gravity/application/formulaInput.ts`                              | Gestiona las entradas y los cálculos de la fórmula.                          |
| `src/features/gravity/domain/gravitation.ts`                                    | Calcula la fuerza gravitatoria y define los límites físicos del laboratorio. |
| `src/features/gravity/presentation/components/understanding/GravityFormula.tsx` | Muestra la fórmula y permite editar sus valores.                             |
| `src/features/gravity/presentation/components/experiment/GravityExperiment.tsx` | Muestra los controles para experimentar con la gravedad.                     |

## Cómo comprobarlo

1. Abre **Gravedad → Comprende**.
2. Cambia la masa 1 de 40 kg a 60 kg en la fórmula.
3. Comprueba que la simulación refleja el cambio y recalcula la fuerza.
4. Introduce una masa de 150 kg: debe aparecer la validación sin modificar los últimos valores válidos de la simulación.
5. Entra en **Experimenta** y cambia un slider. Vuelve a **Comprende** para comprobar que la fórmula se ha actualizado.
6. Pulsa **Restablecer** y verifica que reaparecen los valores iniciales.

Las pruebas unitarias relacionadas están en `tests/gravity-state.test.ts`, `tests/formula-input.test.ts` y `tests/gravitation.test.ts`. Se pueden ejecutar con `npm test`.
