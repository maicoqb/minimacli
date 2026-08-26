# DSH RPC & Event Stream

`minimacli` talks to a running DSH host over HTTP RPC and a WebSocket event
stream. All network I/O lives in
[`apps/minimacli/src/lib/harness.ts`](../apps/minimacli/src/lib/harness.ts).

Host: `http://127.0.0.1:3080` (`DEFAULT_HARNESS_URL`).

- **Unary RPC**: `POST /api/<method>`, JSON body.
- **Events**: WebSocket at `/api/events.mux`.
- **Answerable server-requests**: `POST /api/respond` (see Interactive flows).

## RPCs we use

Called through `callRpc<T>(url, method, payload)`.

| Method | Payload | Ok return | TUI usage |
|---|---|---|---|
| `host.describe` | `{}` | `HarnessDescriptor` | health check / status |
| `session.create` | `{ cwd? }` | `{ sessionId, agentPreset? }` | `SessionProvider` connect |
| `session.prompt` | `{ sessionId, mode: 'queue', content }` | `{ accepted, command? }` | `prompt()` |
| `session.cancel` | `{ sessionId }` | `{ accepted }` | `interrupt()` |

`HarnessDescriptor { version, cwd, provider, model, attachedSessions, home, canOpenPath }`.

`session.prompt` returns `accepted` **immediately** in queue mode — it only
confirms admission. The turn ends when `assistant/message` arrives on the
stream, which is why `isTurnActive` clears there, not when `prompt` resolves.

`session.cancel` keeps pending inbox work and resumes it in FIFO order.
Unavailable for subagent sessions (use `subagent.interrupt`).

## Event stream: `/api/events.mux`

```ts
streamEvents(url, sessionId, onFrame, signal?, onClose?): void
```

Opens one WebSocket, forwards frames whose envelope `sessionId` matches. The
frame of interest is the envelope `payload`:

```jsonc
{
  "payload": {
    "type": "session/event",
    "sessionId": "<id>",
    "event": { /* raw DSH SessionEvent */ }
  }
}
```

`SessionProvider` drops non-`session/event` frames and reduces `event` via
`parseMessageEvent` ([`events.ts`](../apps/minimacli/src/lib/events.ts)), folded
into `messages` by `updateMessages`
([`messages.ts`](../apps/minimacli/src/lib/messages.ts)).

### Events the TUI consumes

| `event.type` | Translation | Effect on state |
|---|---|---|
| `assistant/chunk` | `assistant-delta` | append text to last assistant msg |
| `assistant/message` | `assistant-complete` | end turn, `isTurnActive = false` |

- `assistant/chunk`: only `data.chunk.type === 'text-delta'` produces a delta;
  `block-start`, `block-end`, `usage`, `finish` are ignored.
- `assistant/message`: joins the text blocks of `data.message.content` into the
  final text.

## Interactive flows: question and approval

The host can pause a turn to ask the human something. Two answerable frames
arrive on the mux stream. Each is a server-request with a **stable `rpcId`** the
client echoes in its answer; answered on `POST /api/respond` (not a unary
method). Both arrive atomically — a single complete frame, unlike the streamed
assistant text.

```jsonc
{
  "rpcId": "<stable-id>",
  "payload": { "type": "question/requested" /* or approval/requested */ }
}
```

### `question/requested`

Sent when the model calls `ask()` (or a plan-review intent). Carries a batch of
`AskUserQuestionItem`, answered together.

```ts
{ type: 'question/requested', sessionId, questions: AskUserQuestionItem[] }
// AskUserQuestionItem { id, question, detail?, header?, options?, multiSelect?, intent? }
//   options?: { label, description? }[]
//   intent?: { kind: 'plan-review', approve: <option label> }
```

Resolution:

```ts
{ type: 'question/resolved', sessionId, questionRpcId, outcome: 'answered' | 'cancelled' }
```

Answer — client-response echoing the frame `rpcId`:

```ts
QuestionResponsePayload { sessionId, answer: { answers: [{ id, selected: string[], custom? }] } }
```

### `approval/requested`

Sent when a tool asks for one-time human approval.

```ts
{ type: 'approval/requested', sessionId, approvalId, toolName, callId?, reason? }
```

Resolution:

```ts
{ type: 'approval/resolved', sessionId, approvalId, outcome: ApprovalOutcome }
// ApprovalOutcome: 'allowed-once' | 'rejected' | 'cancelled' | 'unavailable'
```

Answer — client-response echoing the frame `rpcId`. The client can only grant or
reject (`cancelled`/`unavailable` are host-side outcomes):

```ts
ApprovalResponsePayload { sessionId, approvalId, outcome: 'allowed-once' | 'rejected' }
```

### Reconnect

On reopening the mux stream the host replays each session's still-pending
question/approval frames **reusing the same `rpcId`**. A late or duplicate answer
gets `{ accepted: false, reason: 'not-pending' | 'bad-response' }`.
