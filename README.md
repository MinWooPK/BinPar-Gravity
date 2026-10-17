# Gravity Lab

Aplicación educativa con Next.js 16, React, TypeScript y next-intl (español, inglés y francés).

## Ejecutar

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abre http://localhost:3000. El inicio redirige al idioma correspondiente.

Para el tutor, configura en `.env.local` `OPENAI_API_KEY` y `OPENAI_MODEL` con un modelo disponible en tu proyecto que admita Responses API. Reinicia el servidor después. No uses prefijos `NEXT_PUBLIC_` ni subas claves al repositorio. Las peticiones al proveedor pueden generar cargos. Sin estas variables, el laboratorio y los retos funcionan; el tutor informa de que no está disponible.

## Gravitación

`/[locale]/gravity` incluye controles de las dos masas (10–100 × 10¹² kg), distancia entre centros (5–20 km), fuerza calculada en newtons y tres retos con predicción previa. Cada reto usa una referencia fija de 40 × 10¹² kg, 40 × 10¹² kg y 8 km. El modelo usa G = 6,67430 × 10⁻¹¹ N·m²/kg². La representación es ilustrativa, sin escala ni integración de trayectorias.

La portada presenta las tres etapas sin seleccionar ninguna: comprender,
experimentar y comprobar. Al entrar en una, una cabecera compacta reúne la flecha
para volver al recorrido, su título y `GravityStageSelector`, el selector
personalizado de etapas. Las etapas conservan su estado y posición de scroll;
los enlaces con hash y Atrás/Adelante del navegador siguen funcionando.

Comprender conserva dos columnas en escritorio: simulación, fuerza y valores
actuales a la izquierda; fórmula editable y leyenda a la derecha. Debajo de la
simulación, «Descubre cómo funciona la gravedad» permite alternar entre La ley,
Tres ideas y Ejemplos. Mantiene las explicaciones completas y el selector de
ejemplos cotidianos sin desmontar la simulación. En móvil se apilan las columnas;
cuando la altura disponible no basta, el contenido permite scroll interno. Los
selectores se manejan con teclado y las transiciones respetan movimiento reducido.

El panel de la fórmula permite introducir tres valores positivos entre F, m₁, m₂ y r para calcular el cuarto automáticamente. La incógnita se mantiene fija hasta restablecer. En la calculadora, las masas se introducen en kg, la distancia en m y F en N; el dominio resuelve en SI. Los cambios permanecen en la calculadora hasta pulsar «Aplicar al laboratorio» con un resultado válido dentro del intervalo visual. Un aviso indica los valores pendientes de aplicar. Los resultados fuera del intervalo se muestran, pero conservan el experimento anterior. Restablecer la calculadora no altera los sliders.

El cálculo físico y las validaciones de los retos siguen siendo deterministas;
el modelo de lenguaje no calcula ni modifica el experimento.

## Tres cuerpos

`/[locale]/three-body` muestra las seis órbitas de Lagrange, figura de ocho,
Butterfly I, Goggles, Moth I y Yin-Yang I. Las tarjetas animan los tres cuerpos;
cada detalle permite pausar, reiniciar y cambiar la velocidad. A 1×, un segundo
reproduce una unidad de tiempo adimensional. Las trayectorias completas quedan
visibles como referencia y los colores conservan la identidad de cada cuerpo.

Las muestras se calculan en el servidor a partir de las posiciones y velocidades
de `src/features/three-body/data/orbits.ts`, con G = m₁ = m₂ = m₃ = 1. Las semillas publicadas y los
ajustes de velocidades y períodos de `src/features/three-body/data/refinements.json` se conservan por separado.
El integrador usa las fuerzas de Newton con RK4 adaptativo, duplicación de paso y
corrección de Richardson, sin suavizar la gravedad ni forzar el cierre del período.
La reproducción interpola 1.200 muestras espaciadas en tiempo físico, de modo que
los encuentros cercanos no se recorren a velocidad geométrica constante.

Para Lagrange, un radio al baricentro R = 1 da un lado √3 y una aceleración radial
1/√3. Por tanto, ω² = 1/√3 y cada velocidad inicial es ω(−y, x).

La animación empieza pausada cuando se prefiere movimiento reducido y puede
activarse explícitamente. Se suspende fuera de pantalla y con la pestaña oculta.

## Tutor IA compartido

Un único asistente flotante está disponible en Gravedad, en la galería de Tres
Cuerpos y en el detalle de sus seis órbitas. Abre un diálogo de hasta 420 px en
escritorio y un panel adaptado al móvil, con historial desplazable, pregunta libre,
acciones Explicar/Simplificar/Dar un ejemplo, cierre con Escape y reintento. El
foco vuelve al botón al cerrar. Las conversaciones se conservan mientras el
layout siga montado, separadas entre Gravedad, galería y cada slug de órbita;
cerrar el panel no las borra. No se guardan en disco ni sobreviven a una recarga.

Las solicitudes parten únicamente de acciones explícitas del usuario. En Gravedad
incluyen la etapa, parámetros y reto/predicción disponibles. El servidor calcula
la fuerza y el resultado del reto mediante el dominio existente. En Tres Cuerpos
recibe solo el tipo de vista y el slug: el servidor recupera catálogo, condiciones
iniciales, período, modelo y fuente desde `orbits.ts`, distinguiendo semillas
publicadas y refinamientos locales. El contexto se publica mediante un provider,
sin inspeccionar el DOM ni mezclar los datos de ambas funcionalidades.

`POST /api/ai` valida el contexto y el historial y utiliza una sola integración
servidor con [Responses API y estado de conversación](https://developers.openai.com/api/docs/guides/conversation-state).
Usa exactamente `OPENAI_MODEL`, `store: false` y un máximo de 1.200 tokens de
salida. Las claves permanecen exclusivamente en el servidor. La interfaz conserva
hasta 48 mensajes por conversación y envía como máximo los 12 más recientes,
con 1.200 caracteres por mensaje y 6.000 en total, terminando en una pregunta.
No se envían muestras de trayectorias ni otros datos ajenos al contexto educativo.

El endpoint limita el cuerpo a 32 KiB mientras lo lee, comprueba el origen cuando
se proporciona, admite solo JSON, corta la lectura a los 5 segundos y la llamada
al proveedor a los 25 segundos. Los límites en memoria son 8 solicitudes por
minuto y cliente, 40 por minuto y proceso, 1 simultánea por cliente y 4 por proceso.
El exceso devuelve HTTP 429 con `Retry-After`; una configuración ausente devuelve
503 y los fallos del proveedor, 502. El identificador de cliente utiliza la IP
remitida por el proxy cuando existe; el límite global también se aplica si falta
o se manipula esa cabecera. Estos límites se reinician con el proceso y no se
comparten entre instancias: para un despliegue público con varias réplicas se
necesita una cuota distribuida o una pasarela externa, además del presupuesto del
proveedor. No se requiere ninguna variable de entorno nueva.

## Arquitectura

- `app/`: rutas y adaptador HTTP; valida entradas del tutor y gestiona errores.
- `features/gravity/domain/`: física y retos sin dependencias del framework.
- `features/gravity/application/`: entradas de la calculadora y compatibilidad con solicitudes antiguas del tutor.
- `features/gravity/infrastructure/`: entrada de compatibilidad que delega en el tutor compartido.
- `features/gravity/components/`: recorrido, laboratorio, retos, fórmula, aplicación explícita y contenido educativo.
- `features/gravity/hooks/`: estado de la calculadora; su sesión aísla los borradores del laboratorio.
- `features/ai/application/`: contrato, validación, contexto físico verificado y construcción de instrucciones del tutor.
- `features/ai/infrastructure/`: único adaptador OpenAI protegido con `server-only`, lectura limitada y control de consumo; fetch y Responses API, sin SDK adicional.
- `features/ai/components/`: provider persistente, puente de contexto y asistente flotante compartido.
- `features/three-body/domain/`: tipos físicos, integración Newtoniana y diagnósticos numéricos independientes de React.
- `features/three-body/data/`: catálogo de órbitas y refinamientos numéricos documentados.
- `features/three-body/server/`: cálculo y caché de muestras para las seis órbitas.
- `features/three-body/components/`: proyección SVG y reproducción sin renders React por fotograma.
- `components/`, `hooks/` e `i18n/`: interfaz compartida, preferencias de movimiento e internacionalización.

Consulta también [ARCHITECTURE.md](ARCHITECTURE.md) y el registro de [auditoría y refactorización](REFACTORING.md). Se ha utilizado IA para ayudar con implementación, estructura y textos.

## Comprobar

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

Las pruebas verifican unidades SI, simetría, proporcionalidad con las masas, ley
del inverso del cuadrado, calculadora, retos, integrador y conservación física.
Las del tutor cubren ambos contextos, las seis órbitas, datos inválidos, límites
del historial y del cuerpo, consumo y concurrencia, y el contrato del adaptador.
Interceptan `fetch` en la prueba del proveedor: no llaman a OpenAI ni consumen
crédito. Una prueba real de credenciales y calidad de respuesta del modelo es una
verificación separada; ejecutar estos tests no la sustituye.

## Pendiente de la prueba técnica

Todavía no está configurada una entrega desplegada ni Docker. La integración real de IA requiere las variables anteriores; no se simula con respuestas prefijadas.
