# Auditoría y refactorización

## Organización aplicada

Las rutas del App Router conservan sus URLs y su composición en Server Components.
Cada funcionalidad reúne su presentación y sus datos; los módulos compartidos
permanecen en `components`, `hooks` e `i18n`.

| Responsabilidad | Ubicación |
| --- | --- |
| Fórmulas y retos de gravitación | `features/gravity/domain` |
| Parser y transición de entradas de la calculadora | `features/gravity/application` |
| Estado y sincronización de la calculadora | `features/gravity/hooks` |
| Validación y contrato del tutor | `features/gravity/application` |
| Integración real con OpenAI | `features/gravity/infrastructure` |
| Galería, estado persistente y reproductor orbital | `features/three-body/components` |
| Catálogo y refinamientos orbitales | `features/three-body/data` |
| Tipos e integración física orbital | `features/three-body/domain` |
| Cálculo y caché de trayectorias en servidor | `features/three-body/server` |
| Preferencia compartida de movimiento reducido | `hooks/useReducedMotion.ts` |

## Limpieza comprobada

- Eliminados `GravityPreview` y `relativeAttraction`: sin consumidores en la aplicación.
- Eliminados `OrbitMark`, dos variantes de iconos y exportaciones internas sin consumidores.
- Eliminado JSX comentado del encabezado y sus propiedades sin uso.
- Eliminadas once clases obsoletas de la introducción, selectores del editor anterior
  y declaraciones sobrescritas; conservados los selectores globales activos.
- Eliminados once SVG sin referencias en código, configuración, traducciones ni
  documentación: cinco de plantilla y seis previews sustituidos por SVG animado
  (227.097 bytes). Conservado el favicon.
- Revisadas todas las dependencias directas: todas tienen usos en código,
  configuración o herramientas de desarrollo. No se añadieron ni eliminaron paquetes.
- Conservados los archivos convencionales de Next, las rutas dinámicas, los
  diccionarios completos y la configuración de internacionalización.

## Separación y rendimiento

`GravityFormula` delega la inferencia de incógnita y los resultados a una función
pura, el estado a un hook y la leyenda a un componente. `GravitySlider` reúne los
controles y su presentación. Se eliminaron búsquedas de metadatos con aserciones
no nulas y factores de escala constantes de valor uno.

El contexto de gravitación separa valores y acciones: la calculadora recibe los
resets sin suscribirse a los cambios de sliders. Los valores del contexto de la
galería y sus acciones conservan referencias estables cuando el estado no cambia.
La restauración de scroll usa su valor inicial sin suprimir reglas de hooks.

La animación orbital conserva `useMemo` para las trazas, integración y caché en
servidor, actualización de SVG por refs y suspensión fuera de pantalla o con la
pestaña oculta. Los filtros de seis órbitas y los cálculos sencillos mantienen su
implementación directa, sin memoización adicional.

La validación del tutor se prueba como función pura y el adaptador HTTP conserva
sus límites, coerciones, códigos de respuesta y cabeceras. La petición real al
proveedor, sus instrucciones, modelo configurable y timeouts permanecen intactos.

TypeScript sigue en modo estricto y ahora comprueba también variables, parámetros
e imports sin uso. `npm run typecheck` ofrece una comprobación reproducible.

## Invariantes y verificación

No se modificaron las fórmulas gravitatorias, el integrador, las condiciones
iniciales, los refinamientos ni los resultados matemáticos. Los cambios de los
archivos físicos se limitan a imports y una exportación de tipo interna.

- Base inicial: 54 pruebas correctas.
- Resultado: 66 pruebas correctas, incluidas 12 nuevas sobre entradas de la
  calculadora y validación del tutor.
- `npm run lint`, `npm run typecheck` y compilación de producción correctos.
- Chrome headless sobre la compilación de producción: entradas SI, cálculo
  automático, foco al restablecer, validación de un reto, filtros persistentes
  al volver del detalle, movimiento reducido, reproducción y reinicio de órbitas.
- Rutas ES/EN/FR, ausencia de excepciones/errores de consola y comprobación de
  desbordamiento a 360, 768 y 1.440 px en gravitación; galería a 360 px.
- Adaptador HTTP: GET y rechazos 403/415/400/413 comprobados en servidor local
  con entradas inválidas, sin peticiones al proveedor.
- Los módulos CSS conservan las propiedades activas en 18 anchuras y ambas
  preferencias de movimiento; LightningCSS compila los módulos limpiados.

La verificación no realiza llamadas de pago al modelo. La conexión real con
credenciales sigue siendo una comprobación externa al conjunto automatizado.
