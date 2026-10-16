# Gravity Lab architecture

The project uses Next.js App Router with feature modules. Clean Architecture
boundaries are applied where there is behavior to separate; there are no empty
domain layers or placeholder repositories.

## Current responsibilities

- `src/app`: Next.js entry points, route composition, metadata, layouts and HTTP
  responses. Pages render feature screens. The locale layout composes the shell.
- `src/features/home/components`: home screen.
- `src/features/gravity/components`: gravity screen.
- `src/features/three-body/components`: three-body screen.
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

`app/api/ai/route.ts` validates tutor input and delegates to the OpenAI adapter.
`features/gravity/application/tutor.ts` defines the framework-independent tutor
contract. The adapter uses server-only environment variables and the Responses API.
The client never imports infrastructure. Domain functions compute force; the model
only explains supplied results. `GravityLab` owns local experiment and challenge
state, and `GravityTutor` owns its asynchronous request state.

## Verification

- `npx tsc --noEmit --incremental false`
- `npm run lint`
- `npm run build`

When changing presentation, also check mobile and desktop rendering, locale
navigation and keyboard behavior in a browser.
