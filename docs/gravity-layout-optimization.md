# Optimización del layout de Gravity, etapas 01–03

Verificación realizada el 18 de octubre de 2026 en Chrome headless local.
Se reutilizó `/private/tmp/gravity-layout-before.json`; Git estaba limpio al
retomar la tarea. No se modificaron lógica física, valores SI, proveedores,
sincronización, traducciones, navegación, tutor ni Tres Cuerpos.

## Causas y correcciones

- El `body` fijado a `100dvh`, el `main` reducible y el viewport con
  `overflow-y: auto` enviaban el contenido sobrante a un scroll interno.
  Las etapas 01–03 ahora permiten que el documento crezca con su contenido.
  La introducción y la etapa 04 conservan sus reglas anteriores.
- En Comprende, la fórmula requería 609,2 px, frente a 565 px disponibles
  a 1280×800 y 533,2 px a 1440×768. Se compactaron los márgenes, el espaciado
  de los campos y la constante G. El bloque ecuación/selector pasó de 103
  a 91 px; los campos, de 198,4 a 182,4 px; y G, de 66 a 54 px.
  Todos los textos permanecen visibles y los inputs mantienen 44 px de altura.
  Las variantes Tailwind `in-[#gravity-understanding]` limitan estos ajustes
  a la calculadora de esa etapa, conservando el drawer compartido.
- En Experimenta, la suma de cabecera, sliders, comparación y explicación
  exigía 545,9 px. Se redujeron únicamente espacios verticales alrededor de
  estos bloques, sin reducir los controles ni cambiar las barras.
- En Descubre, la ecuación y su explicación científica comparten una fila en
  escritorio. Se compactaron cabecera y pestañas y se dio al SVG Tierra–Luna
  una base flexible con altura fluida y mínimo legible de 104 px.
- Se revisaron `GravityJourney.styles.ts`, `GravityStageLayout.styles.ts` y
  `GravityStageLayout.module.css`. Se conservan el Grid de dos columnas,
  `items-stretch` y los mínimos de contenido: garantizan igual altura sin
  comprimir textos o controles. No fue necesario modificar esos archivos.

No se añadió `overflow: hidden`, truncado de texto ni un nuevo scroll interno.
El crecimiento natural del documento conserva visible y alcanzable el footer.

## Medidas antes y después

Scroll vertical sobrante, en píxeles CSS. Antes correspondía al contenedor
interno; después tanto ese contenedor como el documento dan 0 en estos estados.
Mediciones ES con parámetros iniciales, sin errores de fórmula y con
«Modelo y unidades» cerrado. Descubre incluye sus cuatro pestañas.

| Resolución | Descubre | Comprende | Experimenta | Altura final de ambas tarjetas |
| --- | --- | --- | --- | --- |
| 1440×900 | 0 → 0 | 0 → 0 | 0 → 0 | 664 px |
| 1280×800 | 0 → 0 | 44 → 0 | 0 → 0 | 565 px |
| 1440×768 | 0 → 0 | 76 → 0 | 13 → 0 | 533,2 px |

EN y FR también dieron 0 px en las tres resoluciones, para las cuatro pestañas
de Descubre, Comprende y Experimenta. Las alturas y posiciones de las tarjetas
y sus hijos directos de la etapa 04 coinciden con la medición anterior.

Cuando el contenido necesita más espacio, la página crece: a 1440×768,
«Modelo y unidades» abierto produce 178 px de scroll del documento; un error
por masa fuera de rango en la fórmula produce 73 px. Ambos casos tienen 0 px
de desbordamiento interno y conservan las dos tarjetas de igual altura.

## Comprobaciones ejecutadas

- `npm run lint`: correcto.
- `npm run typecheck`: correcto.
- `npm test`: 117 tests aprobados, ninguno fallido ni omitido.
- `npm run build`: correcto, 30 páginas generadas.
- 21 mediciones finales sobre el build de producción, incluyendo la etapa 04.
- 86 estados de layout: ES/EN/FR en las tres resoluciones objetivo; además ES
  a 320×600, 375×667, 768×800, 1280×500 y 720×384; modelo expandido y error
  de fórmula. La última resolución comprueba reflow con poco espacio, no
  constituye una prueba de zoom nativo del navegador.
- Se midieron `scrollHeight`, `clientHeight`, anchos y rectángulos reales del
  DOM: sin desbordamiento horizontal, sin hijos que excedan verticalmente
  las tarjetas, sin inputs/botones inferiores a 44 px, footer tras el contenido
  y alturas iguales en escritorio. Scroll natural en los tamaños pequeños.
- Navegación con teclado por el selector de etapa y las cuatro pestañas;
  revisión de capturas de las tres etapas y las cuatro pestañas de Descubre;
  `prefers-reduced-motion` respetado. Sin errores capturados de consola,
  ejecución o hidratación durante las comprobaciones.
- Regresión funcional sobre producción: las cuatro incógnitas, edición
  automática en SI, sliders, decimales, valores inválidos y fuera de rango,
  restablecimiento, persistencia entre etapas, drawer y foco, resaltado de
  símbolos y constante G, y los tres retos con sus respuestas y comparaciones.
- Contexto del tutor comprobado con `/api/ai` interceptada localmente. No se
  verificaron respuestas del modelo real ni se realizaron llamadas al proveedor.

Los scripts y registros de esta sesión están en `/private/tmp/`:
`gravity-layout-measure.cjs`, `gravity-layout-responsive.cjs`,
`gravity-layout-functional.cjs`, `gravity-layout-before.json`,
`gravity-layout-after.json`, `gravity-layout-comparison.json` y
`gravity-layout-responsive.json`. Son artefactos temporales de auditoría.

## Archivos modificados

Rutas relativas a `src/features/gravity/presentation/components/`:

- `GravityJourney.module.css`: crecimiento natural limitado a las etapas 01–03.
- `discovery/GravityEducationalCard.tsx`: espacios de cabecera y pestañas.
- `discovery/GravityEducationalCard.module.css`: altura flexible del SVG.
- `discovery/GravityScienceCard.tsx`: distribución compacta de la referencia.
- `understanding/GravityFormula.styles.ts`: espaciado con Tailwind v4.
- `understanding/GravityFormula.module.css`: espaciado de la fracción.
- `experiment/GravityExperiment.styles.ts`: espacios entre bloques.
- `experiment/GravityExperiment.module.css`: margen de la leyenda comparativa.

Este informe se añade en `docs/gravity-layout-optimization.md`.
