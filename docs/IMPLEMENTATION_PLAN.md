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

- [x] **1. Open/Close CLI** — opens and closes the TUI.
  - [x] 1.1 Show greeting.
  - [x] 1.2 Show text input prompt.
  - [x] 1.3 Connect to the running server.
  - [x] 1.4 Ctrl+C exits the TUI — with no turn in progress.
  - [x] 1.5 Error: server unreachable status
- [ ] **2. Send message to the AI** — prompt sent by the TUI.
  - [x] 2.1 Type text in the input.
  - [x] 2.2 Send with Enter.
  - [x] 2.3 Empty input does not send.
  - [x] 2.4 Error: send fails → can try again.
- [x] **3. See the AI response** — response rendered.
  - [x] 3.1 Receive the turn's response.
  - [x] 3.2 Display the AI message (author + content).
  - [x] 3.3 Cancel the in-progress action with Ctrl+C.
  - [x] 3.4 Error: turn fails → TUI remains usable.
  - [x] 3.5 Error: connection drops during the turn → TUI remains usable.
- [x] **4. AI approval** — the AI asks permission to execute.
  - [x] 4.1 Display the approval to the user.
  - [x] 4.2 Show what will be done (command/action).
  - [x] 4.3 Choose the option: allow or deny.
  - [x] 4.4 Error: responding fails → can try again.
- [x] **5. AI questions** — the AI asks the user to answer questions.
  - [x] 5.1 Display a question with its options.
  - [x] 5.2 Support single selection.
  - [x] 5.3 Support free-text answers.
  - [x] 5.4 Support multiple questions at once.
  - [x] 5.5 Error: responding fails → can try again.
- [x] **6. Single session** — the conversation belongs to a session.
  - [x] 6.1 Opening the CLI starts a session.
  - [x] 6.2 Opening the CLI in the same directory opens the last session.
  - [x] 6.3 Starting a new session with `--new-session`, ignoring the stored last session.

### Phase 2 — Plugin architecture

Done criteria: a harness is distributed as a plugin; the DSH adapter is loaded
that way (plug and play) instead of being hardcoded in the client.

Journeys:

- [x] **1. Export plugin interface** — expose the contract a plugin implements.
  - [x] 1.1 A single plugin contract: create.
- [x] **2. Create a plugin** — provide the DSH harness as a plugin.
  - [x] 2.1 Extract the DSH client logic into the adapter plugin.
  - [x] 2.2 Load the DSH adapter through the plugin mechanism, not hardcoded.
- [x] **3. Load a plugin** — the client discovers and loads plugins.
  - [x] 3.1 Locate the installed plugins the user added.
  - [x] 3.2 Load a plugin artifact against a fixed loading contract.
  - [x] 3.3 Detect which plugin matches a given harness and use it.
- [x] **4. Install a plugin** — install and register a plugin.
  - [x] 4.1 Install a plugin into its own plugins folder.
  - [x] 4.2 Register the plugin in the plugins.json ledger.
  - [x] 4.3 Load plugin default options.

### Phase 3 — Full TUI

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
- [ ] **5. AI questions** — question details.
  - [ ] 5.1 Multiple selection.
  - [ ] 5.2 Skip question.
  - [ ] 5.3 Scrollable question panel.

### Phase 4 — Watcher

Done criteria: client dead without notice has its turn canceled; last client
closes → web dies (prune + kill); watcher exits if the web dies.

### Phase 5 — Final polish

Done criteria: tests covering what was built; docs updated;
packaging (e.g., installable global binary); i18n.

## Others

Ideas and nice-to-haves, not committed to a phase
yet:

- **Message queue** — queue prompts while a turn is running.
- **Force send message** — send even while a turn is in progress or blocked.
- **Attach files (`@`)** — type `@` in the input to pick and attach files to the prompt.
- **Run shell command** — type `!` to send a command in the input.
- **Shortcuts overlay (`Ctrl+?`)** — list the available keybindings and commands.
- **Change model / workspace** — in-TUI commands to switch the model and the workspace.
- **Multiple workspaces** — support running more than one workspace at the same time.
- **Theme** — customizable colors and appearance for the TUI.
- **Rename session** — rename the current session.
- **Extract multiline editor to a package** — our input editor model (`apps/minimacli/src/lib/text.ts`) is a candidate to publish to the community.
- **Read-only sessions** — sessions should start in read-only mode.
- **Thinking off** — sessions should start with thinking disabled.
- **Change session policy/sandbox** — change the sandbox/policy of a session.
- **Change session thinking** — change the thinking setting of a session.
- **Voice mode** — speak to the TUI.
- **Goals** — set session goals.
- **Usage / time** — show a line per assistant message.
- **Tips on greetings** — show tips about how to use on greetings
- **Recover a lost mid-turn turn** — settle interrupted turn state after reconnect.
- **Cap rendered message history** — avoid unbounded history that hurts memory/performance.
- **Strip markdown in message text** — approval `reason` can carry `**` formatting.
- **Always show last user message** — pin the latest user message on screen.
- **Tool output parsers** — friendly display for tool outputs.
- **Minimize modals** — allow overlays to be collapsed to free up screen space.
- **Markdown parser** — a markdown parser to render assistant messages in the TUI.
- **`--new-session` flag** — a CLI input to force starting a fresh session instead of reopening the last one.


