# minimacli

Thin DSH clients that complement the web GUI with two additional surfaces: a
**terminal CLI** and a **VS Code extension**.

Both are clients of an already-running harness — they talk to it over its
HTTP/WebSocket API and never boot their own harness profile.

## Goals

1. **Security** — the harness alone enforces the sandbox and the approval
   policy; no client ever holds that power.
2. **Isolation** — the harness and the client are separate worlds; the client
   reaches the harness only through its public API.
3. **Decoupling** — the client's lifecycle has nothing to do with the harness's
   plugins, profiles or configuration.
4. **Simplicity** — one command does everything: no manual web startup, no
   extra steps.
5. **Continuity** — the same conversation is available from any surface,
   exactly where you left off.
6. **Concurrency** — multiple sessions can be created at the same time — more
   than one conversation running simultaneously without conflicts, even within
   the same workspace.

## Surfaces

- **Terminal CLI** (`minimacli`) — a TUI that connects to the dedicated web.
- **VS Code extension** (`minimacli`) — a webview chat panel plus an integrated
  terminal running the same CLI wrapper.

## Architecture

The full architecture — lifecycle, watcher, ledger and open questions — lives
in [ARCHITECTURE.md](ARCHITECTURE.md).

## Roadmap

The feature roadmap is tracked in
[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), a phase-based plan.

## Status

Work in progress. Nothing is implemented yet.
