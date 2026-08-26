# AGENTS.md

Guidance for AI agents and contributors working in this repository.

## Overview

`minimacli` is a family of thin DSH clients for the DSH harness: a **terminal
CLI** (TUI) and a **VS Code extension**. Clients talk to an already-running
harness over its HTTP/WebSocket API and never boot their own harness profile.
See [`README.md`](README.md) for goals and surfaces.

## Conventions

- **Code and documentation are written in English.**
- **Prefer self-explanatory code over comments.**
- TypeScript + React (Ink) + Nx monorepo. Follow existing style (Prettier,
  ESLint).
- **Use `async`/`await`, not `.then()`/`.catch()` chains.**
- **`IMPLEMENTATION_PLAN.md` items:** title at most 5 words, description at most 10 words.

## Repository layout

Described by responsibility, not by naming every file — expect modules to
appear, disappear and be renamed.

- `apps/minimacli/src/components/` — presentational (Ink) UI pieces.
- `apps/minimacli/src/context/` — client state (harness status, session,
  messages, active turn); the DSH event stream is consumed and folded here.
- `apps/minimacli/src/hooks/` — custom React hooks.
- `apps/minimacli/src/lib/` — non-React logic: the network layer, DSH event
  parsing, and pure helpers.
- `apps/minimacli/src/main.tsx` — entry point.

## DSH communication

The client talks to the harness through a narrow set of RPCs plus one event
stream. The transport code in `apps/minimacli/src/lib/` is the authoritative
reference for payloads and event shapes.

| Method | Use |
|---|---|
| `host.describe` | health check / status |
| `session.create` | establish a session, returns `sessionId` |
| `session.prompt` | send a message (mode `queue`) |
| `session.cancel` | cancel the active turn |

### Active-turn model

A turn becomes active when a prompt is sent, and ends only when
`assistant-complete` arrives on the stream — `session.prompt` resolves
immediately in queue mode and does **not** mean the turn ended. The input area
may block **submitting** while a turn is active, but must **not** block the user
from **typing**.

## Commands

Run from the repo root. The app is built/installed via Nx.

```sh
npx nx build minimacli           # build (dist/minimacli)
npx tsc -p apps/minimacli/tsconfig.app.json --noEmit   # type-check
npx nx lint minimacli            # lint
```

To install the CLI globally: `npx nx build minimacli && npm i -g ./dist/minimacli`.

Note: the client assumes a running DSH harness at `http://127.0.0.1:3080`.
