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
  floating dialog, per-view conversations and bounded request history.
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
functions; `useGravityFormula`, `solveGravity` and the physical domain keep their
existing implementation. `GravityFormulaSession` provides a nested controls
context that intercepts automatic parameter application and provides a local
calculator reset. `GravityFormulaApplication` compares a valid result with the
laboratory values, displays the pending notice and commits only after an explicit
button action. Partial edits never update the simulation. Reset remounts only the
editor and restores focus to its reset button when appropriate; resetting the
laboratory also invalidates the formula session through its reset version.

`GravityJourney` in `GravityJourneyTabs.tsx` owns stage selection and per-stage
scroll positions. `GravityScreen` stays on the server and passes the existing
educational components as children. The initial selection is empty: the cover
shows the title and entry cards. Inside a stage, `GravityJourneyNavigation` shows
the back arrow, stage heading and existing custom `GravityStageSelector`; it does
not introduce a second horizontal stage tablist or duplicate the tutor trigger.
The selector implements a radio menu with keyboard navigation and focus return.
All three panels stay mounted; `hidden` removes inactive content from layout and
keyboard navigation without resetting formula inputs or challenge state.
`GravityStageLink` changes the panel and focuses it without scrolling the
document. Stage hashes and browser history restore the right panel after
hydration; initial server/client rendering is deterministic. CSS handles the
short fade/translation and disables it for reduced motion.

`GravityIntroduction` retains its desktop two-column layout. The left side
composes `GravityUnderstandingSimulation` and `GravityEducationalCard`; the right
side retains the interactive formula. The educational card offers three
accessible tabs (law, principles and examples), reusing `GravityPrinciples` and
`GravityEveryday` including its own example selector. Tab switches preserve the
simulation and example selection. Small or short screens may scroll necessary
content rather than clip it.

`GalleryProvider` persists filters, scroll and playback across gallery/detail
navigation in the three-body layout. The server computes trajectories once per
slug; the browser only projects/interpolates samples and updates SVG refs through
`requestAnimationFrame`. Keep numerical integration outside the client graph.

## Shared tutor flow

The locale layout mounts `TutorProvider` once, with a single `GlobalTutor` sibling
to its children. A fixed launcher is available only on `/gravity`, `/three-body`
and orbit-detail paths. No duplicated assistant is mounted in the gravity header.
The dialog uses the browser's modal focus management, closes with Escape and
returns focus to its launcher. It is anchored at the bottom right (up to 420 px)
on desktop and adapts to the mobile viewport with safe-area padding and an
internally scrollable transcript.

`TutorContextBridge` publishes typed page context into a ref inside the provider.
`GravityLab` publishes the active stage, current parameters, available challenge,
current prediction and any checked attempt. The unchecked choice is distinct from
an evaluated attempt; tutor instructions guide without spoilers before checking,
unless the user asks directly for the answer. Gallery and detail Server Components pass a minimal context to
the client bridge. The provider only exposes a context matching the current
pathname, preventing stale page data during navigation. There is no DOM scraping
or consumption of gravity hooks outside their provider. Slider updates publish
context without rendering the chat or requesting the model; a request reads the
latest snapshot only after a user action.

`GlobalTutor` keeps separate in-memory conversations for Gravity, the gallery and
each orbit slug. They survive dialog close/reopen and navigation while the locale
layout remains mounted, with up to 48 UI messages per conversation. They are not
stored in local storage or persisted across reloads. Requests include at most 12
recent messages, 1,200 characters per message and 6,000 total, ending in a user
message. Per-view separation avoids supplying two-body history to an orbital
conversation. The panel supports free questions, explain/simplify/example actions,
pending state, errors and explicit retry; there is no automatic AI request on a
parameter change.

`POST /api/ai` delegates to `features/ai/application/tutorRequest.ts`, which strictly
validates the discriminated context, supported locale/mode and bounded dialogue.
It accepts the previous quick-action payload through a compatibility normalizer;
the old gravity adapter also delegates to the same shared provider. These are
compatibility entries, not a second OpenAI integration.

Before invoking the provider, `buildTutorContext` obtains numerical facts from the
server: two-body force and challenge correctness use the existing gravitational
domain; three-body slugs resolve against the six real catalogue entries. Orbital
context includes the equal-mass, planar, dimensionless Newtonian model, catalogue
information and, on detail pages, the actual initial state, period, convention and
documented source. Published seeds are identified separately where a local
shooting refinement is used. Clients cannot supply forces, source URLs or altered
orbit states as trusted context. The model explains this data; it cannot update
the application or replace its calculations.

`features/ai/infrastructure/openaiTutor.ts` is the sole adapter. It uses `fetch`
with OpenAI Responses API, exactly the server's `OPENAI_MODEL` and
`OPENAI_API_KEY`, `store: false`, up to 1,200 output tokens and a 25-second timeout.
Instructions include the verified context; dialogue remains separate untrusted
input. Only completed, nonempty text responses are accepted. The client imports
no server infrastructure or secrets. No new environment variables are needed.

The HTTP boundary checks the supplied Origin, accepts only JSON and reads at most
32 KiB with a 5-second body deadline. A process-local limiter allows 8 requests per
minute per client, 40 per minute globally, 1 in flight per client and 4 globally;
slots are released after success or failure. Client identification uses a bounded
forwarded IP header or a shared fallback. The global cap still applies if that
header is spoofed. HTTP 429 includes `Retry-After`; invalid requests, missing
configuration and provider failures have distinct error responses. Private
responses are marked `no-store`. These are best-effort in-memory controls: they
reset with the process, do not coordinate across replicas and are not an
authenticated per-user quota. A public multi-instance deployment needs external
rate limiting/shared quotas and a provider budget.

## Verification

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

When changing presentation, also check mobile and desktop rendering, locale
navigation and keyboard behavior in a browser.

`tests/global-tutor.test.mjs` covers strict input rejection, each of the six orbital
contexts, server-derived numerical facts, prompt separation, legacy normalization,
body-byte limits, rate/concurrency controls and the sole provider's request and
error contract. The provider test intercepts `fetch`; it never sends a paid
request. A live check of credentials, provider availability and answer quality is
separate from automated verification.

`tests/tutor-conversation.test.mjs` verifies that preparing a newly submitted user
question retains the latest conversation tail, starts with a user turn, satisfies
all three history limits and leaves UI messages/metadata untouched.
