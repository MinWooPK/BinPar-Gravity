# Paneles y navegación de Gravity

Las etapas 01–03 conservan `GravitySplitPanels`: dos tarjetas al 50 % en escritorio, una barra de 48 px cuando se pliega una y alternancia entre tarjetas en móvil. Los hijos permanecen montados. `inert` y `aria-hidden` evitan acceder al contenido cerrado; los controles conservan `aria-controls`, `aria-expanded` y foco visible. La transición del Grid dura 250 ms y se desactiva con `prefers-reduced-motion`.

Esta continuación conserva ese componente y cambia solamente la presentación y navegación de Gravity:

- `GravityJourneyNavigation.tsx`: cuatro tags traducidos, una sola navegación visible, `aria-current="step"` y las rutas hash existentes. En móvil forman dos columnas. La portada del recorrido conserva sus accesos iniciales; no se muestran junto a los tags.
- `GravityStageSelector.tsx`: eliminado al quedar sin referencias. El selector compartido que utiliza Tres Cuerpos no cambia.
- `GravityLab.tsx`: la etapa 04 muestra la tarjeta de retos a ancho completo, sin simulación ni paneles plegables. En escritorio, pregunta y respuestas se distribuyen en dos zonas; el feedback y la comparación también aprovechan dos columnas. En móvil se apilan. Los handlers, parámetros compartidos, respuestas oficiales, progreso y contexto del tutor no cambian.
- `GravityFormulaAccess.tsx`: el foco de respaldo al cerrar el drawer apunta al tag activo.
- `messages/es.json`, `en.json`, `fr.json`: etiquetas de los tags y textos de escenario que hacen referencia a los parámetros del laboratorio, sin anunciar una simulación visible en la etapa 04.
- `tests/browser/gravity-panels.mjs`: adaptada a tres etapas plegables, tags y retos a ancho completo.

## Repetir la prueba de navegador

Con el servidor local iniciado:

```sh
node tests/browser/gravity-panels.mjs
```

Admite `PANELS_URL` y `CHROME_PATH`. Utiliza Chrome/Chromium mediante CDP sin dependencias adicionales. Los resultados de medidas del layout se guardan en `gravity-panels-results.json` dentro del directorio temporal del sistema.

La prueba verifica:

- 1440×900, 1280×800, 1440×768, 375×667 y 320×600.
- Columnas al 50 %, barras de 48 px, transición interpolada, restauración y alturas iguales.
- Las cuatro pestañas de Descubre.
- Alternancia móvil, controles inaccesibles dentro de paneles cerrados, transferencia de foco y movimiento reducido.
- Conservación del borrador literal de fórmula y del propio nodo DOM, sliders y selección de Descubre.
- Tags en ES/EN/FR, navegación con teclado sin recargar y ausencia de desbordamiento horizontal.
- Etapa 04 a ancho completo y sin controles de plegado o simulación.
- Respuestas pendientes y comprobadas conservadas al navegar; los tres retos, feedback correcto/incorrecto y finalización.
- Ausencia de llamadas automáticas al tutor y de errores observados de consola/hidratación.

Validación realizada: prueba de navegador correcta, lint, typecheck, 136 tests y build correctos. Se revisaron capturas de los tags y de los retos antes/después de comprobar una respuesta en escritorio y móvil. No se ejecutaron consultas reales a OpenAI ni se modificó la Parte B.
