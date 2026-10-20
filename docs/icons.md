# Iconos de interfaz

Los iconos se importan desde `@/components/icons` o desde su archivo individual.
Cada componente acepta `SVGProps<SVGSVGElement>` y conserva la geometría original.
Los tamaños, colores y transiciones de cada control siguen en sus consumidores.

```text
src/components/icons/
├── index.ts                 # Exportaciones públicas
├── Icon.tsx                 # API existente por nombre para controles de galería
├── common/
│   ├── AlertTriangle.tsx
│   ├── ArrowLeft.tsx
│   ├── ArrowRight.tsx
│   ├── ArrowUp.tsx
│   ├── Atom.tsx
│   ├── Check.tsx
│   ├── ChevronDown.tsx
│   ├── CircleHelp.tsx
│   ├── ExternalLink.tsx
│   ├── Globe.tsx
│   ├── Grid.tsx
│   ├── Lightbulb.tsx
│   ├── List.tsx
│   ├── Menu.tsx
│   ├── MessageCircle.tsx
│   ├── MessageSquareText.tsx
│   ├── Orbit.tsx
│   ├── Pause.tsx
│   ├── Play.tsx
│   ├── Reset.tsx
│   ├── Search.tsx
│   ├── Sparkles.tsx
│   ├── Trash2.tsx
│   └── X.tsx
├── tutor/
│   └── AtomIcon.tsx          # Símbolo original del lanzador, con tres elipses
└── lucide-LICENSE.txt
```

`ChevronDown compact` conserva el chevrón más estrecho del selector de idioma.
`Reset variant="gravity"` conserva el arco original del laboratorio.
`Atom` y `tutor/AtomIcon` tienen geometrías distintas preexistentes; no son copias.

Los siete componentes de `TutorIcons.tsx` se han distribuido en archivos
individuales conservando sus nombres y las licencias. El menú móvil reutiliza
`X`; las tres navegaciones reutilizan `ArrowLeft`.

## Accesibilidad

Por defecto, los iconos son decorativos (`aria-hidden="true"`). Los botones
conservan su texto o nombre accesible. Si un icono transmite significado por sí
solo, hay que hacerlo visible para lectores de pantalla y darle un nombre:

```tsx
import { AlertTriangle, X } from "@/components/icons";

<button aria-label={closeLabel} onClick={close}>
  <X className="size-5" />
</button>
<AlertTriangle role="img" aria-hidden={false} aria-label={warningLabel} />
```

Ningún icono extraído necesita identificadores internos. Si se añaden gradientes,
filtros o máscaras, sus identificadores deben ser únicos por instancia.

## SVG que permanecen en las funcionalidades

Las ilustraciones de caída y atracción de `GravityEveryday`, los diagramas
educativos de Gravedad y Tres Cuerpos, las barras de comparación de fuerza,
`HomeGravityPreview`, `GravityUnderstandingSimulation`, `OrbitAnimation`,
`ExperimentAnimation` y la vista previa de `ThreeBodyExperiment` permanecen en
sus módulos: representan fenómenos físicos o geometría de simulaciones, no
controles de interfaz. El fondo `public/backgrounds/space-stars.svg` también
permanece como recurso visual.

## Consumidores actualizados

- Interfaz compartida: `Header`, `LanguageSwitcher`, `StageSelector`.
- Tutor: `ExplainWithAI`, `GlobalTutor`, `TutorChat` (solo importaciones).
- Inicio: `HomeExperience`.
- Gravedad: `GravityJourneyNavigation`, `GravityEveryday` (solo importación),
  `GravityExperiment`, `GravityFormula`, `GravityFormulaTutorButton`.
- Tres Cuerpos: `ThreeBodyJourneyNavigation`, `OrbitDetail`, `OrbitPlayer`,
  `OrbitGallery` (los tres últimos solo cambian su importación).

El manifiesto de organización apunta ahora a `icons/index.ts`. El test de
arquitectura también resuelve archivos `index.ts`, además de `index.tsx`.
