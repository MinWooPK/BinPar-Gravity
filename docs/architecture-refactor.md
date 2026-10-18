# Refactorización de arquitectura — 18 de octubre de 2026

Refactorización técnica con conservación de los recorridos y del diseño. El movimiento reciente de «Modelo físico» a la tarjeta izquierda está incluido y preservado.

## Estructura final

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── gravity/
│   │   └── three-body/
│   │       └── [slug]/
│   └── api/
│       └── ai/
├── components/
│   ├── icons/
│   ├── layout/
│   └── ui/
├── features/
│   ├── ai/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── providers/
│   │   └── types/
│   ├── gravity/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── presentation/
│   │   │   ├── components/
│   │   │   │   ├── challenges/
│   │   │   │   ├── discovery/
│   │   │   │   ├── experiment/
│   │   │   │   ├── shared/
│   │   │   │   └── understanding/
│   │   │   ├── hooks/
│   │   │   └── providers/
│   │   └── types/
│   ├── home/
│   │   └── presentation/
│   │       └── components/
│   └── three-body/
│       ├── application/
│       ├── data/
│       ├── domain/
│       ├── infrastructure/
│       ├── presentation/
│       │   ├── components/
│       │   │   ├── detail/
│       │   │   ├── discovery/
│       │   │   ├── gallery/
│       │   │   └── shared/
│       │   └── providers/
│       └── types/
├── hooks/
└── i18n/
    └── hooks/
```

No se crean carpetas vacías. Gravity no tiene infraestructura propia porque no usa una integración externa independiente. Home mantiene sus pequeños tipos de props junto al componente; tampoco se añaden `types/` globales sin contratos compartidos reales.

## Responsabilidades y dependencias

- **Domain:** gravitación e integración orbital puras. No importan React, Next.js, presentación ni adaptadores.
- **Application:** coordinación de la fórmula, validación y preparación de datos orbitales, catálogo de etapas, validación/contexto/prompts del tutor y presupuesto de conversación. No depende de presentación.
- **Infrastructure:** el cache y carga orbital del servidor y la integración real compartida con OpenAI. Se conservan `server-only`, las variables de entorno, límites, cancelación y contrato HTTP de la API.
- **Presentation:** componentes agrupados por etapa, hooks y providers. Las páginas de App Router son entradas y composición. `OrbitDetail` contiene la composición científica que antes estaba en la ruta.
- **Compartido:** el fondo animado es `components/layout/SpaceStarfield.tsx`, utilizado por ambas partes. No depende de Gravity y conserva su implementación de canvas.

Los tipos van en imports `import type`. El grafo de imports de ejecución no presenta ciclos. La comprobación automática sigue también las dependencias transitivas de los Client Components para impedir que alcancen infraestructura o módulos `server-only`.

## Reutilización y componentes grandes

- `components/ui/Tabs.tsx` aporta `TabButton` y `useTabs`: roles, selección, roving tabindex y teclas Flecha/Home/End. Se utiliza en el descubrimiento y en los detalles de Tres Cuerpos, conservando el DOM y las clases visuales de cada contexto.
- `StageSelector` ya existía; Gravity ahora lo reutiliza mediante un adaptador pequeño con sus etiquetas y su indicador original. Se conservan menús, Escape, foco y navegación.
- `useTutorConversation` separa sesiones, solicitudes, errores, reintentos y cancelación del JSX de `GlobalTutor`. El diálogo, el foco y la adaptación al teclado móvil permanecen en la vista.
- `tutorEnvironment` separa el contexto del provider y del consumidor y elimina el ciclo entre `TutorProvider` y `GlobalTutor`.
- Se conserva la separación actual de contextos de parámetros y borrador de fórmula, que evita renders del laboratorio al editar el borrador. No se fragmentan innecesariamente `GravityFormula`, `OrbitGallery` ni los coordinadores de navegación: sus responsabilidades ya son cohesivas.

No se crean Button/Card/Text/Select genéricos sin una duplicidad que justifique el cambio.

## Tipos

- Gravity: `gravity.types.ts`, `formula.types.ts`, `journey.types.ts`.
- Three Body: `orbit.types.ts`, `animation.types.ts`, `gallery.types.ts`, `journey.types.ts`.
- IA: `tutor.types.ts`, `legacyTutor.types.ts`, `conversation.types.ts`.

Se mantienen los contratos de parámetros, entidades, solicitudes actuales y solicitudes heredadas. Los tipos pequeños privados de componentes o contexto permanecen locales. Se sustituyen las interfaces estructurales sin herencia ni declaration merging por `type`. No hay anotaciones explícitas `any`.

## Estilos y Tailwind CSS v4

Se han migrado las declaraciones básicas de 22 hojas: distribución, tamaños, espaciado, colores, bordes y tipografía. Las clases se mantienen estáticas para que Tailwind pueda detectarlas; cuando varios componentes comparten un conjunto se utiliza un archivo co-localizado `*.styles.ts` con strings, sin una abstracción de estilos en tiempo de ejecución. Se reutiliza el layout de Gravity mediante `GravityStageLayout.styles.ts`, sustituyendo la composición CSS anterior.

Hay tokens comunes de superficie, texto, borde, violeta y turquesa en `globals.css`, registrados con `@theme inline` de v4. Se conserva el loader existente de `@tailwindcss/turbopack`; no se instalan dependencias ni se cambia la configuración de Next.js.

Se retiran los CSS Modules de `GravityIntroduction` y `GravityDiscovery`, cuyas clases ahora reutilizan el layout compartido. También se eliminan 33 reglas antiguas de introducción/detalle de la hoja de la galería, después de separar el detalle.

### CSS específico conservado

Se mantienen keyframes, animaciones, canvas/starfield, dibujo SVG, pseudo-elementos del slider, backdrop/dialog, selectores globales `:has`, estados/descendientes y overrides de cascada que mantienen la apariencia exacta. La migración es progresiva: no se fuerzan esos casos a clases menos claras. Por ejemplo, se conserva el borde izquierdo de la nota científica y los overrides tipográficos que necesitan prevalecer sobre una regla compartida.

- `src/components/layout/SpaceStarfield.module.css`
- `src/components/ui/SpaceBackground.module.css`
- `src/features/ai/presentation/components/GlobalTutor.module.css`
- `src/features/gravity/presentation/components/GravityJourney.module.css`
- `src/features/gravity/presentation/components/challenges/GravityChallenges.module.css`
- `src/features/gravity/presentation/components/discovery/GravityEducationalCard.module.css`
- `src/features/gravity/presentation/components/discovery/GravityEveryday.module.css`
- `src/features/gravity/presentation/components/discovery/GravityPrinciples.module.css`
- `src/features/gravity/presentation/components/discovery/GravityScienceCard.module.css`
- `src/features/gravity/presentation/components/experiment/GravityExperiment.module.css`
- `src/features/gravity/presentation/components/shared/GravityStageLayout.module.css`
- `src/features/gravity/presentation/components/understanding/GravityFormula.module.css`
- `src/features/gravity/presentation/components/understanding/GravityFormulaAccess.module.css`
- `src/features/gravity/presentation/components/understanding/GravityFormulaApplication.module.css`
- `src/features/gravity/presentation/components/understanding/GravityUnderstandingSimulation.module.css`
- `src/features/home/presentation/components/HomeExperience.module.css`
- `src/features/three-body/presentation/components/ThreeBodyJourney.module.css`
- `src/features/three-body/presentation/components/detail/OrbitDetail.module.css`
- `src/features/three-body/presentation/components/discovery/ThreeBodyDiscovery.module.css`
- `src/features/three-body/presentation/components/gallery/ThreeBody.module.css`
- `src/features/three-body/presentation/components/shared/OrbitAnimation.module.css`

## Exportaciones

Los componentes, funciones y hooks propios usan `export const` cuando es equivalente. Las rutas conservan `export default` y las exportaciones especiales de Next.js. Los cuerpos de las funciones físicas no cambian: la comparación por tokens de 25 funciones e inicializadores confirma su conservación, y los datos de refinamiento son idénticos byte a byte.

## Archivos movidos, creados y eliminados

El inventario completo está en [`refactor-manifest.json`](./refactor-manifest.json), con el mapa de cada ruta anterior a su destino, los tipos extraídos, helpers nuevos y hojas migradas. Se elimina el adaptador de IA de Gravity que no tenía consumidores; la API continúa utilizando el adaptador real compartido de IA. La validación de solicitudes heredadas permanece operativa y pasa a la feature IA.

Se mantienen README, package.json, lockfile, configuración de Next.js, mensajes ES/EN/FR, recursos y datos científicos. El README original no se reescribe; esta documentación describe la estructura actual.

## Verificación ejecutada

- Fase 1: TypeScript, lint, 92 tests y build tras movimientos/imports.
- Fases 2–4: TypeScript, lint y 92 tests tras contratos, exportaciones y reutilización.
- Fase 5: build y comparación en navegador con la referencia anterior a la refactorización.
- Final: **lint, typecheck, 96 tests y build correctos**. Cuatro tests nuevos protegen límites de capas, independencia de App Router, ausencia de ciclos de ejecución y aislamiento de servidor.
- Comparación de **90 estados ES/EN/FR** a 320, 375, 768, 1280 y 1440 px: mismo número de elementos y **cero diferencias geométricas**. Las únicas diferencias de serialización de estilos son 18 colores `lab()` de las cards existentes de Home con variación subdecimal entre el CSS de desarrollo de referencia y el minificado de producción; no hay cambio de sus clases ni de sus valores de origen.
- Gravity: cuatro etapas, teclas del selector, borrador y cuatro incógnitas de la fórmula, Aplicar, validaciones, tres sliders, los tres retos, respuestas y feedback originales, estado conservado, drawer accesible y reduced-motion.
- Three Body: etapas, búsqueda/filtros/orden/grid-list, reproducción, retorno con scroll y estado, historial, las seis URLs directas y navegación siguiente.
- Detalles: períodos, condiciones efectivas, precisión completa, fuentes originales, mismo SVG y reproducción continua al cambiar de pestaña, pausa/reinicio/velocidad y encuadres sin recortar las trayectorias.
- Tutor: solicitudes contextualizadas y conversación verificadas con respuestas simuladas en el navegador; integración HTTP del proveedor con fetch simulado en tests. **No se ha realizado una llamada real de pago a OpenAI.**
- Sin errores de consola, runtime o hidratación durante los recorridos ejecutados.

## Mejoras posteriores opcionales

Continuar migrando selectores CSS especializados únicamente cuando simplifique la lectura y se pueda repetir la comparación visual. Si aumenta el número de features, añadir reglas de límites al editor además de los tests actuales. No son necesarias más capas, repositorios o factories para la escala actual.
