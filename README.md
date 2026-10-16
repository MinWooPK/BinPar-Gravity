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

El panel de la fórmula permite introducir tres valores positivos entre F, m₁, m₂ y r para calcular el cuarto automáticamente. La incógnita se mantiene fija hasta restablecer. En la calculadora, las masas se introducen en kg, la distancia en m y F en N; el dominio resuelve en SI. Solo los resultados dentro del intervalo visual se trasladan al laboratorio. Los demás se muestran con un aviso y conservan el experimento anterior.

El tutor recibe los valores actuales, la última predicción y el idioma. Puede explicar el experimento, simplificarlo o dar un ejemplo. Las llamadas son explícitas: mover los controles no consume IA. La UI marca respuestas que pertenecen a valores anteriores y permite reintentar errores. El cálculo físico no depende del modelo.

## Tres cuerpos

`/[locale]/three-body` muestra las seis órbitas de Lagrange, figura de ocho,
Butterfly I, Goggles, Moth I y Yin-Yang I. Las tarjetas animan los tres cuerpos;
cada detalle permite pausar, reiniciar y cambiar la velocidad. A 1×, un segundo
reproduce una unidad de tiempo adimensional. Las trayectorias completas quedan
visibles como referencia y los colores conservan la identidad de cada cuerpo.

Las muestras se calculan en el servidor a partir de las posiciones y velocidades
de `src/data/orbits.ts`, con G = m₁ = m₂ = m₃ = 1. Las semillas publicadas y los
ajustes de velocidades y períodos de `refinements.json` se conservan por separado.
El integrador usa las fuerzas de Newton con RK4 adaptativo, duplicación de paso y
corrección de Richardson, sin suavizar la gravedad ni forzar el cierre del período.
La reproducción interpola 1.200 muestras espaciadas en tiempo físico, de modo que
los encuentros cercanos no se recorren a velocidad geométrica constante.

Para Lagrange, un radio al baricentro R = 1 da un lado √3 y una aceleración radial
1/√3. Por tanto, ω² = 1/√3 y cada velocidad inicial es ω(−y, x).

La animación empieza pausada cuando se prefiere movimiento reducido y puede
activarse explícitamente. Se suspende fuera de pantalla y con la pestaña oculta.

## Arquitectura

- `app/`: rutas y adaptador HTTP; valida entradas del tutor y gestiona errores.
- `features/gravity/domain/`: física y retos sin dependencias del framework.
- `features/gravity/application/`: contrato del tutor.
- `features/gravity/infrastructure/`: adaptador OpenAI protegido con `server-only`; usa fetch y Responses API, sin SDK adicional.
- `features/gravity/components/`: laboratorio, retos, fórmula y tutor.
- `features/three-body/domain/`: integración Newtoniana y diagnósticos numéricos independientes de React.
- `features/three-body/server/`: cálculo y caché de muestras para las seis órbitas.
- `features/three-body/components/`: proyección SVG y reproducción sin renders React por fotograma.
- `components/` e `i18n/`: interfaz compartida e internacionalización.

Consulta también `ARCHITECTURE.md`. Se ha utilizado IA para ayudar con implementación, estructura y textos.

## Comprobar

```bash
npm test
npm run lint
npx tsc --noEmit --incremental false
npm run build
npm start
```

Las pruebas verifican unidades SI, simetría, proporcionalidad con las masas, ley del inverso del cuadrado, retos y valores inválidos. La conexión real al proveedor necesita credenciales y debe verificarse antes de entregar. El endpoint limita contexto y salida, valida los rangos y tiene timeout. Antes de un despliegue público, añade un límite de peticiones persistente apropiado al hosting y configura un presupuesto del proveedor.

## Pendiente de la prueba técnica

Todavía no está configurada una entrega desplegada ni Docker. La integración real de IA requiere las variables anteriores; no se simula con respuestas prefijadas.
