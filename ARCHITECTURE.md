# Arquitectura de Gravity Lab

Gravity Lab es una aplicación educativa desarrollada con **Next.js, React y TypeScript**. Utiliza **Tailwind CSS v4** para los estilos y `next-intl` para los idiomas español, inglés y francés.

La idea principal es **separar lo que ve el usuario de los cálculos y de la lógica de la aplicación**. Así resulta más fácil encontrar el código y modificar una funcionalidad sin afectar a las demás.

## 1. Organización del proyecto

```text
messages/             # Textos en español, inglés y francés

src/
├── app/             # Páginas, layouts y rutas API de Next.js
├── features/
│   ├── home/        # Página de inicio
│   ├── gravity/     # Aprendizaje y simulador de gravedad
│   ├── three-body/  # Galería y simulación de tres cuerpos
│   └── ai/          # Tutor con IA
├── components/      # Componentes compartidos (cabecera, iconos...)
├── hooks/           # Hooks compartidos
└── i18n/            # Configuración de idiomas

tests/                # Pruebas con Vitest
```

Cada funcionalidad tiene sus propios archivos para que el proyecto no dependa de una única carpeta de componentes enorme.

## 2. ¿Qué significa cada capa?

Dentro de las funcionalidades se utilizan estas carpetas cuando hacen falta:

| Carpeta           | Para qué sirve                                                 |
| ----------------- | -------------------------------------------------------------- |
| `domain/`         | Cálculos y reglas, como la fuerza gravitatoria o RK4.          |
| `application/`    | Coordina acciones y valida datos.                              |
| `infrastructure/` | Comunica con servicios externos o prepara datos del servidor.  |
| `presentation/`   | Componentes React, botones, pantallas y estado de la interfaz. |
| `types/`          | Tipos de TypeScript compartidos dentro de la funcionalidad.    |

**Ejemplo:** al modificar una masa en Gravedad, React recoge el nuevo valor, la lógica comprueba que sea válido y la fórmula calcula la fuerza. Después la pantalla muestra el resultado.

## 3. Las tres partes principales

### Gravedad (`features/gravity/`)

Tiene cuatro etapas: **Descubre, Comprende, Experimenta y Comprueba**.

- `GravityParametersProvider` comparte las masas, la distancia y las funciones para modificarlas.
- `gravityStateReducer` actualiza el estado y mantiene sincronizados los controles y la fórmula.
- `gravitation.ts` realiza el cálculo físico con la ley de Newton.
- La etapa Comprueba utiliza `/api/practice` para generar ejercicios con IA, pero las respuestas se corrigen con código de TypeScript.

### Tres Cuerpos (`features/three-body/`)

- `data/orbits.ts` contiene las condiciones iniciales de las seis órbitas conocidas.
- `domain/newtonian-physics.ts` calcula las aceleraciones y el siguiente estado mediante **RK4**.
- `domain/orbit-integration.ts` calcula las trayectorias de las órbitas del catálogo.
- Los componentes de `presentation/` dibujan y animan las trayectorias mediante SVG.
- El experimento libre permite cambiar masas, posiciones, velocidades y G. Utiliza un **Web Worker** para calcular sin bloquear la interfaz y analiza posibles retornos periódicos aproximados.

**Importante:** calcular una trayectoria personalizada no equivale a descubrir automáticamente una nueva órbita periódica.

### Tutor IA (`features/ai/`)

- El layout de `/gravity` monta `TutorProvider` y mantiene la conversación compartida entre sus cuatro etapas. Al salir se desmonta; el historial guardado se recupera al volver.
- `GlobalTutor` muestra el chat.
- `/api/ai` envía las preguntas a OpenAI desde el servidor, sin exponer la clave en el navegador.
- La IA puede explicar conceptos y proponer cambios en los parámetros de Gravedad. **Los cambios se validan y necesitan la confirmación del usuario**.
- El tutor solo está disponible en Gravedad, no en Inicio, Tres Cuerpos ni otras rutas. La evaluación de Comprueba funciona por separado mediante `/api/practice`.

## 4. ¿Por qué está organizada así?

Porque la física, la interfaz y la IA tienen responsabilidades distintas:

- **La física calcula** los resultados.
- **React muestra** los resultados y gestiona la interacción.
- **La IA explica** conceptos y propone acciones controladas.

De esta forma, cambiar un diseño no obliga a cambiar el algoritmo físico, y una respuesta de la IA no modifica directamente la simulación.

## 5. Cómo comprobar el proyecto

```bash
npm test
npm run lint
npm run typecheck
npm run build
```
