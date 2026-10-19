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
Only the challenge stage publishes prediction and attempt data to the tutor.

`GalleryProvider` persists filters, scroll and playback across gallery/detail
navigation in the three-body layout. The server computes trajectories once per
slug; the browser only projects/interpolates samples and updates SVG refs through
`requestAnimationFrame`. Keep numerical integration outside the client graph.

## Gravity tutor flow

The locale layout mounts `TutorProvider` once. It mounts the conversation provider only on `/gravity`, in each supported locale.
Stages 02 and 03 mount `InlineTutor` in the formula/experiment card and suppress
`GlobalTutor`; discovery and practice keep their existing presentation. Three Body routes and all orbit details
have no tutor launcher, dialog or context bridge. Leaving Gravity unmounts the
chat, closes the dialog and aborts pending requests; returning mounts a fresh chat.
No duplicated assistant is mounted in the gravity header.
The dialog uses the browser's modal focus management, closes with Escape and
returns focus to its launcher. It is anchored at the bottom right (up to 420 px)
on desktop and adapts to the mobile viewport with safe-area padding and an
internally scrollable transcript.

`TutorContextBridge` publishes typed page context into a ref inside the provider.
`GravityLab` publishes the active stage, current parameters, available challenge,
current prediction and any checked attempt. The unchecked choice is distinct from
an evaluated attempt; tutor instructions guide without spoilers before checking,
unless the user asks directly for the answer. The provider only exposes a Gravity
context matching the current
pathname, preventing stale page data during navigation. There is no DOM scraping
or consumption of gravity hooks outside their provider. Slider updates publish
context without rendering the chat or requesting the model; a request reads the
latest snapshot only after a user action.

`TutorConversationProvider` owns the single `useTutorConversation` store. The
`gravity-understanding` and `gravity-laboratory` keys isolate messages, drafts,
requests and late responses across stages. `TutorChat` is the shared presentation
for `GlobalTutor` and `InlineTutor`, with up to 48 UI messages per session.
Formula reset remounts only the calculator, leaving the inline chat mounted.
Stage 02 quick actions select known formula terms through the interaction context;
model output cannot control highlights or propose parameter changes.
Stage 03 keeps its tutor outside the experiment/formula tab panels so switching
views preserves the same visible conversation. `GravityExperimentTutor` observes
the shared parameter context for its stale-explanation note; the request still
reads the current bridge snapshot only on an explicit action. Configuration
shortcuts focus the composer without invoking the model. Proposed changes use the
existing validated `TutorProposalCard` and revision-checked `applyProposal` port;
only confirmation updates the common state consumed by sliders and simulation.
 It is cleared when leaving Gravity
and is not stored in local storage or persisted across reloads. Requests include
at most 12 recent messages, 1,200 characters per message and 6,000 total, ending in
a user message. The panel supports free questions, explain/simplify/example actions,
pending state, errors and explicit retry; there is no automatic AI request on a
parameter change.

`POST /api/ai` delegates to `features/ai/application/tutorRequest.ts`, which strictly
validates the Gravity context, supported locale/mode and bounded dialogue.
Three Body contexts are rejected before invoking OpenAI.
It accepts the previous quick-action payload through a compatibility normalizer;
the old gravity adapter also delegates to the same shared provider. These are
compatibility entries, not a second OpenAI integration.

Before invoking the provider, `buildTutorContext` obtains numerical facts from the
existing Gravity domain on the server. It has no dependency on the orbit catalogue
or the Three Body feature. Clients cannot supply calculated forces as trusted
context. The model explains verified Gravity data; the application owns physical
calculations and validates proposed changes before explicit confirmation.

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

`tests/global-tutor.test.mjs` covers strict input rejection, exclusion of Three Body
contexts including all six orbit slugs, server-derived Gravity facts, prompt separation, legacy normalization,
body-byte limits, rate/concurrency controls and the sole provider's request and
error contract. The provider test intercepts `fetch`; it never sends a paid
request. A live check of credentials, provider availability and answer quality is
separate from automated verification.

`tests/tutor-conversation.test.mjs` verifies that preparing a newly submitted user
question retains the latest conversation tail, starts with a user turn, satisfies
all three history limits and leaves UI messages/metadata untouched.
