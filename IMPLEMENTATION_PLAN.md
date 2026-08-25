# Implementation Plan — minimacli

## Purpose

Phase-based implementation roadmap with done criteria.

## Scope

TUI and watcher (CLI), starting with the TUI. The VS Code extension is planned
as a later phase, reusing the same web, ledger, watcher, and sessions. One plan
for the whole minimacli.

## Phases

### Phase 1 — Minimal TUI

Done criteria: end-to-end conversation — send, respond, approve, and cancel.

Journeys:

- [ ] **1. Open/Close CLI** — opens and closes the TUI.
  - [ ] 1.1 Show greeting.
  - [ ] 1.2 Show text input prompt.
  - [ ] 1.3 Connect to the running server.
  - [ ] 1.4 Ctrl+C exits the TUI — with no turn in progress.
  - [ ] 1.5 Error: server unreachable → clear message; TUI does not open.
- [ ] **2. Send message to the AI** — prompt sent by the TUI.
  - [ ] 2.1 Type text in the input.
  - [ ] 2.2 Send with Enter — sends the prompt and clears the input.
  - [ ] 2.3 Empty input does not send.
  - [ ] 2.4 Error: send fails → clear message; can try again.
- [ ] **3. See the AI response** — response rendered.
  - [ ] 3.1 Receive the turn's response.
  - [ ] 3.2 Display the AI message (author + content).
  - [ ] 3.3 Cancel the in-progress action with Ctrl+C.
  - [ ] 3.4 Error: turn fails → clear message; TUI remains usable.
  - [ ] 3.5 Error: connection drops during the turn → clear message; TUI remains usable.
- [ ] **4. AI approval** — the AI asks permission to execute.
  - [ ] 4.1 Display the approval to the user.
  - [ ] 4.2 Show what will be done (command/action).
  - [ ] 4.3 Choose the option: allow, deny, abort — Y, N, Ctrl+C.
  - [ ] 4.4 Error: approval expires → clear message.
  - [ ] 4.5 Error: responding fails → clear message; can try again.
  - [ ] 4.6 Error: pending already resolved → clear message.
- [ ] **5. Single session** — the conversation belongs to a session.
  - [ ] 5.1 Opening the CLI starts a session.
  - [ ] 5.2 Opening the CLI in the same directory opens the last session.

### Phase 2 — Full TUI

Done criteria: all journeys working.

Journeys:

- [ ] **1. Open/Close CLI** — welcome details.
  - [ ] 1.1 Show logo in the greeting.
- [ ] **2. See the AI response** — history and details.
  - [ ] 2.1 Display multiple messages on screen (conversation history).
  - [ ] 2.2 Messages collapsed; open/close with click or ←/→.
  - [ ] 2.3 Display the tools used by the AI.
- [ ] **3. Session control** — multiple sessions.
  - [ ] 3.1 Opening a session restores the message history.
  - [ ] 3.2 Select another session — Ctrl+O.
  - [ ] 3.3 Names for sessions.
  - [ ] 3.4 Open a new session — Ctrl+N.
  - [ ] 3.5 Duplicate current session — Ctrl+D.
  - [ ] 3.6 Close current session — Ctrl+X, cancels the in-progress turn.
  - [ ] 3.7 Error: invalid/not found session → clear message.
  - [ ] 3.8 Error: creating session fails → clear message.
- [ ] **4. Navigation** — TUI navigation keys.
  - [ ] 4.1 ↑/↓ in input: history of prompts sent in the current session.
  - [ ] 4.2 Ctrl+↑/↓: navigate between conversation messages.
  - [ ] 4.3 PgUp/PgDn: scroll the conversation by page.
  - [ ] 4.4 Ctrl+PgUp/PgDn: switch between sessions.

### Phase 3 — Watcher

Done criteria: client dead without notice has its turn canceled; last client
closes → web dies (prune + kill); watcher exits if the web dies.

### Phase 4 — Final polish

Done criteria: tests covering what was built; docs updated;
packaging (e.g., installable global binary); i18n.

- force send message
- message queue