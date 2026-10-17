# Gravity Lab architecture

The project uses Next.js App Router with feature modules. Clean Architecture
boundaries are applied where there is behavior to separate; there are no empty
domain layers or placeholder repositories.

## Current responsibilities

- `src/app`: Next.js entry points, route composition, metadata, layouts and HTTP
  responses. Pages render feature screens. The locale layout composes the shell.
- `src/features/home/components`: home screen.
- `src/features/gravity/components`: gravity screen, formula legend and sliders.
- `src/features/gravity/application`: pure formula input transitions and tutor validation/contract.
- `src/features/gravity/hooks`: calculator state and laboratory synchronization.
- `src/features/three-body/components`: gallery, orbit detail presentation and playback.
- `src/features/three-body/domain`: physical types, numerical integration and diagnostics.
- `src/features/three-body/data`: documented orbit seeds and local refinements.
- `src/features/three-body/server`: server-only integration and playback cache.
- `src/hooks`: shared browser preferences (reduced motion).
- `src/components/layout`: shared header and footer.
- `src/components/ui`: shared UI presentation, including the language menu.
- `src/i18n`: routing, request configuration, navigation and locale interaction.
  `hooks/useLanguageSwitcher.ts` owns menu state, focus, keyboard handling and
  locale navigation. These are presentation concerns, not domain rules.
- `messages`: translation dictionaries.
- `src/proxy.ts`: Next.js request routing integration.

Feature screens remain Server Components. Only interactive UI and hooks use
`"use client"`. Reusable modules do not import files from `app`; ESLint enforces
this boundary.

## Adding simulations

Add pure physics types, formulas and numerical integration functions under
`src/features/<feature>/domain/`. They must not import React, Next.js, translation
libraries, UI or infrastructure. ESLint enforces the framework and internal layer
import restrictions. Test the mathematical behavior independently from rendering.

Add `application/` when a feature needs to coordinate domain operations or an
external capability. Define required interfaces there and inject implementations;
application code must not depend on concrete infrastructure or components.
Components call application operations or pure domain functions, as needed.

Add `infrastructure/` only for actual external integrations. Keep credentials and
provider SDKs in server modules, protected with `import "server-only"`. A route
handler parses and validates HTTP input, invokes the operation and maps the result
to an HTTP response. Keep framework request/response types out of the domain.

`app/api/ai/route.ts` handles HTTP input and delegates validation to
`application/tutorRequest.ts` and explanations to the OpenAI adapter.
`features/gravity/application/tutor.ts` defines the framework-independent tutor
contract. The adapter uses server-only environment variables and the Responses API.
The client never imports infrastructure. Domain functions compute force; the model
only explains supplied results. `GravityLab` owns local experiment and challenge
state, and `GravityTutor` owns its asynchronous request state.

The calculator delegates parsing and unknown selection to pure application
functions; `useGravityFormula` applies valid results to the laboratory. Physical
formulas stay in the domain. Separate value/action contexts let the calculator
receive resets without subscribing to slider changes. Reset remounts the editor
and restores focus to its reset button when appropriate.

`GravityJourney` in `GravityJourneyTabs.tsx` owns tab selection and per-stage
scroll positions. `GravityScreen` stays on the server and passes the existing
educational components as children. All three panels stay mounted; `hidden`
removes inactive content from layout and keyboard navigation without resetting
formula inputs, challenge state or in-flight tutor requests. A shared scroll
viewport keeps the tablist visible. The tutor remains a single shared instance.

`GravityJourneyNavigation` uses automatic activation, roving tab stops and
Left/Right/Home/End keyboard navigation. `GravityStageLink` changes the panel and
focuses it without scrolling the document. Existing stage hashes open the right
panel after hydration; the initial server/client selection is deterministic.
CSS handles the short fade/translation and disables it for reduced motion.

`GalleryProvider` persists filters, scroll and playback across gallery/detail
navigation in the three-body layout. The server computes trajectories once per
slug; the browser only projects/interpolates samples and updates SVG refs through
`requestAnimationFrame`. Keep numerical integration outside the client graph.

## Verification

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

When changing presentation, also check mobile and desktop rendering, locale
navigation and keyboard behavior in a browser.
