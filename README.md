# Gravity Lab

Aplicación educativa con Next.js 16, React, TypeScript y next-intl (español, inglés y francés).

## Ejecutar

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abre http://localhost:3000. El inicio redirige al idioma correspondiente.

Para las funciones de IA de la parte A (Gravedad), configura en `.env.local` `OPENAI_API_KEY` y `OPENAI_MODEL` con un modelo disponible en tu proyecto que admita Responses API. Reinicia el servidor después. No uses prefijos `NEXT_PUBLIC_` ni subas claves al repositorio. Las peticiones al proveedor pueden generar cargos. Sin estas variables, el laboratorio y los retos funcionan; el tutor informa de que no está disponible.

## Gravitación

`/[locale]/gravity` incluye controles de las dos masas (10–100 × 10¹² kg), distancia entre centros (5–20 km), fuerza calculada en newtons y tres retos con predicción previa. Cada reto usa una referencia fija de 40 × 10¹² kg, 40 × 10¹² kg y 8 km. El modelo usa G = 6,67430 × 10⁻¹¹ N·m²/kg². La representación es ilustrativa, sin escala ni integración de trayectorias.

La portada presenta cuatro etapas sin seleccionar ninguna: descubrir, comprender,
experimentar y comprobar. Al entrar en una, la navegación compacta reúne la flecha
para volver al recorrido, su título y `GravityStageSelector`, el selector
personalizado de etapas. Las etapas conservan su estado y posición de scroll;
los enlaces con hash y Atrás/Adelante del navegador siguen funcionando.

Descubrir presenta dos columnas en escritorio: un panel educativo con las
subpestañas ¿Qué es?, Tres ideas, Ejemplos e Historia, y una referencia científica
permanente con la ley, G y las unidades SI. El esquema Tierra–Luna es conceptual,
sin escala ni simulación orbital. Los principios y ejemplos conservan sus
componentes y su selector. En móvil y tablet, las columnas se apilan con scroll
natural. La historia distingue la síntesis de Newton de las aportaciones previas
de Galileo y Kepler y del experimento de Cavendish de 1798.

Comprender conserva dos columnas en escritorio: simulación, fuerza y valores
actuales a la izquierda; fórmula editable y constante G a la derecha. El contenido
educativo se concentra en Descubrir. Los hashes anteriores de Comprender,
Experimentar y Comprobar siguen siendo válidos tras renumerarlos como 02, 03 y 04.
El recorrido permite scroll interno; en móvil y tablet con poca altura utiliza
scroll natural del documento para mantener los controles accesibles. Los
selectores se manejan con teclado y las transiciones respetan movimiento reducido.

Referencias históricas: [NASA sobre el movimiento planetario y Newton](https://science.nasa.gov/earth/earth-observatory/planetary-motion/),
[ESA sobre Galileo y la caída libre](https://www.esa.int/Science_Exploration/Space_Science/Space_Microscope_to_test_universality_of_freefall)
y [revisión de NIST sobre las determinaciones de G](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=923829).

El panel de la fórmula muestra cuatro campos en SI y permite seleccionar explícitamente F, m₁, m₂ o r como incógnita. Los otros tres campos son editables y el resultado se calcula automáticamente en el campo de solo lectura. El resaltado vincula cada símbolo con su campo y con la representación visual; m₁ y m₂ se identifican por separado. En la calculadora, las masas se introducen en kg, la distancia en m y F en N; el dominio resuelve en SI. Los cambios permanecen en la calculadora hasta pulsar «Aplicar valores al simulador» con un resultado válido dentro del intervalo visual. Un aviso indica los valores pendientes de aplicar. Los resultados fuera del intervalo se muestran, pero conservan el experimento anterior. Restablecer la calculadora no altera los sliders.

Experimentar y Comprobar utilizan la misma simulación en una columna izquierda
compacta, con controles o retos a la derecha. Todas las vistas leen los parámetros
de `GravityParametersProvider`. El botón «Fórmula» abre un drawer con la misma
calculadora y el mismo borrador de Comprender: cerrar el panel o cambiar de etapa
conserva sus entradas y su incógnita. Escape cierra el drawer y devuelve el foco.

Los retos muestran el escenario base antes de comprobar; al comprobar se aplican
sus parámetros y aparecen feedback, comparación y explicación. Avanzar restaura
la referencia sin borrar el borrador de la fórmula. Cambiar de etapa conserva el
reto, la predicción y el resultado; al regresar se recupera el escenario de ese
reto. El tutor recibe el reto y el intento únicamente en Comprobar.

El cálculo físico y las validaciones de los retos siguen siendo deterministas;
el modelo de lenguaje no calcula ni modifica el experimento.

## Tres cuerpos

La parte B funciona exclusivamente con algoritmos físicos deterministas y métodos
numéricos. La galería, sus seis detalles y las etapas Descubrir, Galería y
Experimentar no ofrecen chatbot ni tutor IA. Las simulaciones, el detector de
periodicidad y el buscador de órbitas no necesitan una API key de OpenAI ni
servicios externos de IA.

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

## Tutor IA de Gravedad

La parte A utiliza OpenAI para la experiencia de aprendizaje: tutor, explicaciones
de la fórmula y del experimento, propuestas de cambios con confirmación, práctica
adaptativa, corrección e informes de aprendizaje. Conserva `/api/ai`, `/api/practice`
y las variables `OPENAI_API_KEY` y `OPENAI_MODEL`.

El tutor está disponible únicamente en `/{locale}/gravity`. En 02 · Comprende,
`InlineTutor` ocupa la pestaña «Tutor IA» de la tarjeta derecha; no se monta el diálogo
ni el botón flotante. Sus acciones explican la fórmula, G, las masas y la distancia
al cuadrado, además de simplificar y dar ejemplos. Los resaltados los decide la
acción local, nunca la respuesta del modelo. Toda esta etapa es de solo lectura
para el tutor: servidor y cliente descartan propuestas de cambios.

En 03 · Experimenta, el mismo `InlineTutor` ocupa su propia pestaña junto a
«Experimento» y «Calculadora». Explica el contexto actual y los ejemplos hipotéticos calculados
por el dominio; mover sliders no llama a la IA. Al cambiar los parámetros, una nota
invita a solicitar otra explicación. La acción de configuración enfoca el campo y
muestra instrucciones, sin enviar ninguna petición ni modificar valores.

`GravityContentTabs` mantiene montados los tres contenidos: Fórmula/Experimento,
Calculadora y Tutor IA. Solo el seleccionado es visible y accesible. Las flechas,
Inicio y Fin permiten navegar por las pestañas; los accesos externos al tutor
activan su pestaña y muestran la tarjeta derecha también en móvil. Cambiar de
pestaña conserva los borradores y conversaciones y no envía peticiones. La vista
educativa comparte la ecuación interactiva con la calculadora existente; ambas
calculadoras utilizan el mismo estado de `GravityParametersProvider`.

Las instrucciones escritas pueden generar una `TutorProposalCard`. Aplicar utiliza
`decideTutorProposal` y el `applyProposal` con revisión de `GravityParametersProvider`;
ese único cambio de estado actualiza sliders, fórmula, fuerza y simulación. Cancelar,
una revisión obsoleta o una propuesta fuera de rango conservan los valores. No hay
botón flotante ni diálogo del tutor en las etapas 02 y 03.

`TutorChat` comparte presentación y `useTutorConversation` comparte el almacén del
provider con el tutor flotante de Descubre y la presentación integrada de ambas etapas. Las sesiones
`gravity-understanding` y `gravity-laboratory` tienen mensajes, borradores,
peticiones y reintentos independientes. Ocultar paneles, restablecer la fórmula o
cambiar de etapa conserva el historial de cada sesión. El diálogo restante admite
Escape y devuelve el foco a su origen. Salir de Gravedad desmonta el almacén,
cierra el diálogo y aborta las peticiones pendientes; no se guarda en disco.

Las solicitudes parten únicamente de acciones explícitas del usuario y utilizan
el contexto de Gravedad publicado por su provider. El servidor obtiene los valores
físicos verificados del dominio existente. No admite contextos de Tres Cuerpos ni
importa su catálogo para elaborar instrucciones del modelo.

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
Las del tutor cubren Gravedad, el rechazo de contextos de Tres Cuerpos, datos
inválidos, límites del historial y del cuerpo, consumo y concurrencia, y el contrato
del adaptador. Las pruebas físicas cubren las seis órbitas, el simulador personalizado,
el detector de periodicidad y el buscador determinista.
Interceptan `fetch` en la prueba del proveedor: no llaman a OpenAI ni consumen
crédito. Una prueba real de credenciales y calidad de respuesta del modelo es una
verificación separada; ejecutar estos tests no la sustituye.

`node tests/browser/gravity-only-tutor.mjs` comprueba el provider y el diálogo reales
en Chrome con un router aislado: visibilidad en los tres idiomas, cierre y aborto
de peticiones al entrar en Tres Cuerpos, y reapertura al volver a Gravedad.
No necesita un servidor Next ni credenciales; intercepta las respuestas de IA.

## Pendiente de la prueba técnica

Todavía no está configurada una entrega desplegada ni Docker. La integración real de IA requiere las variables anteriores; no se simula con respuestas prefijadas.

`node tests/browser/inline-tutor.mjs` comprueba los componentes reales de las etapas
02, 03 y 04 con respuestas HTTP simuladas: fórmula y restablecimiento, preguntas,
reintentos, resaltados, aislamiento de historiales, propuestas aplicadas/canceladas/obsoletas,
límites, contexto actualizado sin peticiones automáticas, paneles y móvil.
No requiere una clave OpenAI ni realiza llamadas al proveedor.
