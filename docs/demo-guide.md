# Guía de demostración · Gravity Lab

## 1. Introducción

Gravity Lab demuestra aprendizaje interactivo, cálculos físicos e integración controlada de IA. Se divide en **Gravedad**, con cuatro etapas educativas, y **Tres Cuerpos**, con catálogo orbital y experimento libre.

Abre la [demo](https://bin-par-gravity.vercel.app) o ejecuta localmente según el [README](../README.md#instalación-y-ejecución-local). Tutor y práctica necesitan `OPENAI_API_KEY` y `OPENAI_MODEL` en el servidor. Esta guía propone comprobaciones; no certifica pruebas ejecutadas.

## 2. Parte A · Gravedad

Abre `/es/gravity`. En móvil, alterna entre simulación y contenido con los selectores de panel.

### 01 · Descubre

1. Recorre **¿Qué es?**, **Tres ideas**, **Ejemplos** e **Historia**.
2. Consulta **Base científica** y localiza la ley de Newton, el valor de G y la tabla de unidades.
3. Identifica el esquema Tierra–Luna como ilustración conceptual, sin cálculo orbital.

### 02 · Comprende

1. En **Fórmula**, selecciona símbolos y relaciona su resaltado con las definiciones.
2. Abre **Calculadora**, pulsa **Restablecer** y deja F como incógnita. Los valores iniciales son 40 kg, 40 kg y 8 m.
3. Cambia la primera masa a **60 kg**. Revisa fuerza y diagrama; comprueba ese valor también en Experimenta.
4. Introduce **150 kg** en la calculadora. Revisa el aviso de rango: el simulador conserva los últimos parámetros válidos.
5. Restablece y selecciona r como incógnita: identifica el resultado y los tres campos editables. Los cálculos válidos sincronizan automáticamente.

### 03 · Experimenta

1. Pulsa **Restablecer** en los controles: referencia de 40 kg, 40 kg y 8 m.
2. Cambia solo la primera masa a **80 kg**. La comparación con la referencia debe mostrar el doble de fuerza.
3. Restablece y cambia solo la distancia a **16 m**. La fuerza pasa a una cuarta parte de la referencia.
4. Revisa la sincronización en Calculadora. El dibujo muestra fuerzas opuestas, sin integrar el movimiento.

### 04 · Comprueba — requiere IA configurada

1. Pulsa **Empezar práctica** y lee la primera pregunta.
2. Abre **Necesito una pista**, introduce una respuesta y pulsa **Comprobar**. Revisa el acierto, la respuesta esperada y la explicación.
3. Completa las **cinco preguntas**. Conceptos y dificultad se adaptan según resultados y pistas.
4. Revisa el informe final, la puntuación y las recomendaciones de repaso.

La corrección y la puntuación las calcula TypeScript. OpenAI propone definiciones de preguntas y redacta explicaciones e informes; no decide la nota.

## 3. Tutor IA

En Gravedad, pulsa el botón flotante inferior derecho **Abrir tutor de IA** y envía «¿Por qué la distancia aparece al cuadrado?».

Para demostrar una modificación controlada:

1. En Experimenta, restablece el laboratorio y pide por el chat: **«Duplica la masa 1 y explícame qué ocurre»**.
2. Si el modelo devuelve una propuesta, revisa la tarjeta de **40 a 80 kg** y la comparación de fuerzas. Recibirla no modifica los parámetros.
3. Pulsa **Aplicar cambios** y revisa sliders, fórmula y fuerza. Pide «Fija la distancia en 12 m» y prueba **Cancelar**.
4. Pide «Fija la masa 2 en 60 kg», cambia un slider antes de confirmar e intenta aplicar: debe rechazarse la propuesta obsoleta.

**Solo las propuestas requieren confirmación**, no los sliders o la fórmula. Comprende, Comprueba y las ayudas educativas son de solo lectura. El chat no recibe automáticamente el ejercicio ni lo califica: la evaluación tiene sesión y API independientes.

## 4. Parte B · Tres Cuerpos

### Galería, detalle y reproducción

1. Abre `/es/three-body`. Consulta Descubre y Comprende y entra en **03 · Galería**.
2. Usa la paginación para localizar las seis soluciones: **Lagrange, Figura de ocho, Butterfly I, Goggles, Moth I y Yin-Yang I**. Prueba el botón de reproducción de una tarjeta.
3. Abre Figura de ocho y revisa explicación, condiciones iniciales y enlace a la fuente.
4. Copia la URL y ábrela en otra pestaña: `/es/three-body/figura-de-ocho`, sobre el mismo dominio. Comparte la solución, no el instante de reproducción.
5. Prueba **Reproducir/Pausar**, velocidades **0,5×, 1× y 2×** y **Reiniciar**. Reanuda si está pausada. Abre después otra solución.

El catálogo usa unidades adimensionales, G = 1 y masas iguales a 1. Reproduce numéricamente períodos conocidos.

### Experimento libre y alcance de la periodicidad

1. En **04 · Experimenta**, restablece y fija la duración en **2 u.t.** Revisa posiciones y flechas de velocidad en la vista previa.
2. Pulsa **Ejecutar simulación**. El cálculo de trayectorias se realiza en un Web Worker mediante RK4 adaptativo.
3. Prueba pausa, reinicio, velocidad, barra de tiempo y **Mostrar trayectorias**. Se detiene al finalizar, sin bucle automático.
4. En Cuerpo 1 introduce masa `1.1`, Posición X `1.05` y Velocidad Y `0.75`. Alterna entre cuerpos y comprueba sus entradas. Editar invalida la trayectoria anterior: ejecuta otra vez para comparar.
5. Introduce temporalmente masa **0** y revisa la validación; restaura un valor positivo antes de ejecutar.

**El experimento libre no incluye análisis aproximado de periodicidad.** El catálogo calcula diagnósticos internos de cierre y conservación; no son un detector disponible en esta pantalla. Una curva cerrada no demuestra periodicidad y no se descubren órbitas automáticamente. Véase el [alcance numérico](three-body-rk4.md#qué-se-comprueba-sobre-periodicidad).

## 5. Comprobaciones generales

- **Estado:** cambia de etapa y usa Atrás/Adelante. Revisa fórmula y práctica dentro de Gravedad, y filtro/página al volver del detalle orbital. Recargar puede perder formularios y práctica; el chat restaura hasta 30 mensajes, sin propuestas pendientes, si dispone de almacenamiento.
- **Pantallas:** revisa escritorio y 360–412 px, incluidos subíndices, controles, desplazamiento y teclado virtual. Prueba Chrome y Samsung Internet si dispones del dispositivo.
- **Accesibilidad:** usa Tab/Shift+Tab, revisa foco visible y mueve sliders con flechas. Cierra el tutor con Escape y comprueba el retorno del foco. Revisa zoom al 200 %.
- **Idiomas:** cambia entre español, inglés y francés desde la cabecera y repite una interacción. Algunos textos y referencias del catálogo permanecen en español.
- **Sin credenciales:** en una ejecución local sin las variables de OpenAI, revisa contenido, calculadora, galería y simulación libre. Enviar una pregunta o iniciar práctica debe informar de falta de configuración; sus API responden con 503.
- **Con credenciales:** configura ambas variables, reinicia el servidor y recorre tutor, propuesta y práctica completa. Registra errores o respuestas inesperadas.

## 6. Limitaciones conocidas

- Gravedad calcula fuerzas en SI y su dibujo no está a escala. Tres Cuerpos usa unidades normalizadas y precisión numérica finita.
- El experimento libre admite duración mayor que 0 y hasta 100 u.t.; encuentros muy cercanos o cálculos extremos pueden detenerlo. No modela colisiones ni efectos relativistas.
- La URL orbital comparte una solución del catálogo; no serializa una configuración libre. No hay cuentas ni historial de aprendizaje entre dispositivos.
- Tutor y práctica requieren el proveedor configurado. Los textos de IA pueden contener errores; sus límites de consumo son locales a cada proceso y no constituyen una cuota distribuida.

Para detalles de implementación y comandos de comprobación, consulta el [README](../README.md) y la [arquitectura](../ARCHITECTURE.md).
