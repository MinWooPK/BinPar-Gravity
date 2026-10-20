# Gravity Lab architecture

The project uses Next.js App Router with feature modules. Clean Architecture
boundaries are applied where there is behavior to separate; there are no empty
domain layers or placeholder repositories.

## Current responsibilities

- `src/app`: Next.js entry points, route composition, metadata, layouts and HTTP
  responses. Pages render feature screens. The locale layout composes the shell.
- `src/features/home/components`: home screen.
- `src/features/gravity/components`: journey, laboratory, calculator, educational
  card, formula application session, legend and sliders.
- `src/features/gravity/application`: pure formula input transitions and legacy
  tutor request compatibility.
- `src/features/gravity/hooks`: original calculator state transitions.
- `src/features/ai/components`: persistent tutor provider, explicit context bridge,
  Gravity-only floating dialog and bounded request history.
- `src/features/ai/application`: shared tutor contracts, validation, trusted context
  construction and provider-independent prompt construction.
- `src/features/ai/infrastructure`: one server-only OpenAI adapter, bounded HTTP
  body reader and process-local consumption controls.
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
application operations should not depend on concrete infrastructure or React UI.
The existing pure `gravityJourney.ts` stage catalogue currently lives next to the
journey components and is shared by tutor validation and UI. Components call
application operations or pure domain functions, as needed.

Add `infrastructure/` only for actual external integrations. Keep credentials and
provider SDKs in server modules, protected with `import "server-only"`. A route
handler parses and validates HTTP input, invokes the operation and maps the result
to an HTTP response. Keep framework request/response types out of the domain.

The calculator delegates parsing and unknown selection to pure application
functions. `GravityParametersProvider` creates one `useGravityFormula` draft,
shared by the inline calculator and the `GravityFormulaAccess` drawer through
`useGravityFormulaDraft`. The unknown remains explicitly selected and draft edits
never update laboratory parameters; `solveGravity` and the physical
domain remain unchanged. Selecting a new unknown carries the previous exact
result into the known fields. `GravityFormulaSession` provides a calculator-only
reset and access to the explicit application action. A separate visual interaction
context links each equation symbol, its visible input and the read-only simulation;
hover only changes visual state. `GravityFormulaApplication` compares a valid result with the
laboratory values, displays the pending notice and commits only after an explicit
button action. Partial edits never update the simulation. Reset remounts only the
editor and restores focus to its reset button when appropriate; resetting the
laboratory also invalidates the formula session through its reset version.

`GravityJourney` in `GravityJourneyTabs.tsx` owns stage selection and per-stage
scroll positions for both the viewport and document. Short mobile/tablet screens
use document scrolling so the header and footer cannot collapse the content area;
the journey restores the appropriate scroll position using the active CSS mode.
`GravityScreen` stays on the server and passes the existing
educational components as children. The initial selection is empty: the cover
shows the title and entry cards. Inside a stage, `GravityJourneyNavigation` shows
the back arrow, stage heading and existing custom `GravityStageSelector`; it does
not introduce a second horizontal stage tablist or duplicate the tutor trigger.
The selector implements a radio menu with keyboard navigation and focus return.
All four panels stay mounted; `hidden` removes inactive content from layout and
keyboard navigation without resetting formula inputs or challenge state.
`GravityStageLink` changes the panel and focuses it without scrolling the
document. Stage hashes and browser history restore the right panel after
hydration; initial server/client rendering is deterministic. CSS handles the
short fade/translation and disables it for reduced motion.

`gravityStages` orders discovery, understanding, experiment and challenges;
`gravityStageById` resolves references without coupling a stage to its array index.
The previous stage IDs remain valid URL hashes. `GravityDiscovery` composes the
four-topic `GravityEducationalCard` and the informational `GravityScienceCard`.
Only the educational content switches; the science reference remains mounted.
Principles and everyday examples retain their existing components and selector.
Discovery uses natural document scrolling on mobile/tablet and a compact desktop
grid. Its visible title belongs to the educational column; the existing navigation
retains back and the custom selector without another header.

`GravityIntroduction` now focuses on understanding: the existing simulation on the
left and shared interactive formula on the right, without duplicated educational
text. Small or short screens may scroll necessary content rather than clip it.
The tutor receives server-owned discovery facts about gravity, history and SI
units only in the discovery stage, using the existing API and provider.

Experiment and challenges use `GravityStageLayout`: the same read-only
`GravityUnderstandingSimulation` with a compact presentation on the left and the
stage controls on the right. All simulations read the same parameters context;
`GravityExperiment` contains only sliders, reset, comparison and explanations,
with no duplicate two-body SVG. The challenge state stays in the mounted
`GravityLab`. Entering a pending challenge or advancing restores the reference
parameters without resetting the formula draft. Checking commits the existing
challenge parameters; returning to a revealed challenge restores that scenario.
The adaptive practice flow uses its own evaluation endpoint. Its questions,
answers and attempts are not published to the global tutor, which only offers
conceptual hints in this stage.

`GalleryProvider` persists filters, scroll and playback across gallery/detail
navigation in the three-body layout. The server computes trajectories once per
slug; the browser only projects/interpolates samples and updates SVG refs through
`requestAnimationFrame`. Keep numerical integration outside the client graph.

## Global tutor flow

The locale layout mounts `TutorProvider`, `TutorConversationProvider` and one
`GlobalTutor` without route-dependent keys. There is a single `global` session.
`TutorContextBridge` publishes the active route/stage and current facts; snapshots
from other paths are never used for new requests. Context changes do not send AI
requests. Gravity exposes its revision-checked parameter proposal port. Three Body
exposes only numeric configuration/status/periodicity observations; orbit details
send a slug whose scientific metadata is resolved from the server catalogue.

`threeBodyTutorContext.ts` validates allowed keys, finite numbers, bounds, statuses
and coherent periodicity summaries. Client observations are explicitly distinct
from server-owned data. The model receives a bounded history as historical dialogue,
not authority for the current simulator. Practice gives conceptual hints only and
continues to use its separate evaluation endpoint; no pending exercise answer is
supplied to the tutor. All numerical domains remain independent of the AI layer.

`ExplainWithAI` uses a localized topic-specific question and opens the existing
chat through the launcher. Explicit educational requests cannot create proposals.
The conversation store locks requests synchronously and suppresses rapid repeated
questions. Only a user's confirmed, fresh Gravity proposal can update parameters;
no AI action runs a simulation.

`tutorHistory.ts` is the storage boundary: versioned JSON, 30 messages, limited
text, user/assistant roles and context labels only. Restore runs after hydration,
never sends requests and strips all authorization and callback objects. Clear
increments a generation, aborts active calls and removes stored history so late
responses cannot recreate it. Storage exceptions preserve in-memory operation.
`TutorChat` renders historical origin labels, loading/error/retry, quick actions,
proposals and the composer. Retry retains its original question context. The
floating dialog handles focus return, Escape, reduced motion and visualViewport.

`POST /api/ai` retains origin/content-type checks, bounded body/history, rate and
concurrency limits, timeout handling and the existing OpenAI adapter. Legacy quick
action requests still normalize into this single flow. API keys remain server-only.

## Verification

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

When changing presentation, also check mobile and desktop rendering, locale
navigation and keyboard behavior in a browser.

`tests/global-tutor.test.mjs` covers strict input rejection, Home and Three Body
contexts including all six orbit slugs, server-derived Gravity facts, prompt separation, legacy normalization,
body-byte limits, rate/concurrency controls and the sole provider's request and
error contract. The provider test intercepts `fetch`; it never sends a paid
request. A live check of credentials, provider availability and answer quality is
separate from automated verification.

`tests/browser/global-tutor.mjs` checks the shared conversation across routes,
exact restoration of the last 30 messages, stale proposal rejection, API retry,
clear/abort and empty history after reload, the independent practice endpoint,
real experiment periodicity, locales, mobile layouts and keyboard interaction.
It uses actual components with isolated routing and mocked API responses.

`tests/tutor-conversation.test.mjs` verifies that preparing a newly submitted user
question retains the latest conversation tail, starts with a user turn, satisfies
all three history limits and leaves UI messages/metadata untouched.
