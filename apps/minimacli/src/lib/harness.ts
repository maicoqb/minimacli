import { createHarnessDsh } from './dsh/harness';

export const DEFAULT_HARNESS_URL = 'http://127.0.0.1:3080';

export type HarnessStatus = 'checking' | 'up' | 'down';

export type HarnessDescriptor = {
  version: string;
  provider: string;
};

export type ToolArguments = Record<string, unknown> | string;

export type SessionCreated = {
  sessionId: string;
};

export type PromptAccepted = {
  accepted: true;
};

export type AssistantDelta = {
  kind: 'assistant-delta';
  text: string;
};

export type AssistantComplete = {
  kind: 'assistant-complete';
  text: string;
};

export type ToolCall = {
  kind: 'tool-call';
  name: string;
  arguments: ToolArguments;
};

export type ApprovalRequest = {
  kind: 'approval-requested';
  reason: string;
};

export type QuestionOption = {
  label: string;
  description?: string;
};

export type QuestionItem = {
  id: string;
  question: string;
  header?: string;
  detail?: string;
  options?: QuestionOption[];
  multiSelect?: boolean;
};

export type QuestionRequest = {
  kind: 'question-requested';
  sessionId: string;
  questions: QuestionItem[];
  customAnswer?: boolean;
};

export type QuestionAnswerItem = {
  id: string;
  selected: string[];
  custom?: string;
};

export type QuestionAnswer = {
  answers: QuestionAnswerItem[];
};

export type SessionEvent = AssistantDelta | AssistantComplete | ToolCall | ApprovalRequest | QuestionRequest;

export interface Harness {
  readonly sessionId: string;
  describe(): Promise<HarnessDescriptor>;
  createSession(cwd?: string): Promise<SessionCreated>;
  prompt(sessionId: string, text: string): Promise<PromptAccepted>;
  cancel(sessionId: string): Promise<void>;
  streamEvents(
    sessionId: string,
    onEvent: (event: SessionEvent) => void,
    signal?: AbortSignal,
    onClose?: () => void
  ): void;
  respondApproval(request: ApprovalRequest, decision: 'allow' | 'deny'): Promise<void>;
  respondQuestion(request: QuestionRequest, answer: QuestionAnswer): Promise<void>;
}

const harnessCache = new Map<string, Harness>();

export function getHarness(url: string): Harness {
  let harness = harnessCache.get(url);
  if (!harness) {
    harness = createHarnessDsh({ url });
    harnessCache.set(url, harness);
  }
  return harness;
}
