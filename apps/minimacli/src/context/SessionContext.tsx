import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getHarness,
  type ApprovalRequest,
  type QuestionAnswerItem,
  type QuestionItem,
  type QuestionRequest,
  type SessionEvent,
} from '../lib/harness';
import { updateMessages, type ChatMessage } from '../lib/messages';
import { getLastSessionId, touchSession } from '../lib/sessionStore';
import { useHarness } from './HarnessContext';

export type AnswerableQuestion = QuestionItem & {
  answer?: QuestionAnswerItem;
};

type PendingQuestion = Omit<QuestionRequest, 'questions'> & {
  questions: AnswerableQuestion[];
  customAnswer?: boolean;
};

type SessionContextValue = {
  isReady: boolean;
  workspace: string;
  prompt: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
  isTurnActive: boolean;
  hasPendingApproval: boolean;
  respondApproval: (kind: 'allow' | 'deny') => Promise<void>;
  pendingQuestion: PendingQuestion | null;
  respondQuestion: (answer: QuestionAnswerItem) => Promise<void>;
  messages: ChatMessage[];
};

export const INPUT_CUSTOM_ANSWER = 'input_custom_answer';

type QuestionResult =
  | { type: 'update'; next: PendingQuestion }
  | { type: 'submit'; next: PendingQuestion };

function resolveQuestion(
  pendingQuestion: PendingQuestion,
  answer: QuestionAnswerItem
): QuestionResult {
  if (
    (answer.selected === undefined || answer.selected.length === 0) &&
    !answer.custom
  ) {
    const { customAnswer, ...next } = pendingQuestion;
    return { type: 'update', next };
  }

  if (answer.selected.length === 1 && answer.selected[0] === INPUT_CUSTOM_ANSWER) {
    return { type: 'update', next: { ...pendingQuestion, customAnswer: true } };
  }

  const questions = pendingQuestion.questions.map((question) =>
    question.id === answer.id ? { ...question, answer } : question
  );
  const allAnswered = questions.every((question) => question.answer !== undefined);

  if (allAnswered) {
    return { type: 'submit', next: { ...pendingQuestion, questions } };
  }
  
  return { type: 'update', next: { ...pendingQuestion, questions } };
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  forceNewSession = false,
}: {
  children: ReactNode;
  forceNewSession?: boolean;
}) {
  const { status } = useHarness();
  const harness = useMemo(() => getHarness(), []);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState(process.cwd());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTurnActive, setIsTurnActive] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<ApprovalRequest | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<PendingQuestion | null>(null);

  const isReady = status === 'up' && sessionId !== null;
  const hasPendingApproval = pendingApproval !== null;

  function streamEvents(sessionId: string, controller: AbortController) {
    harness.streamEvents(
      sessionId,
      (event: SessionEvent) => {
        if (event.kind === 'approval-requested') {
          setPendingApproval(event);
        }
        if (event.kind === 'question-requested' && event.questions.length > 0) {
          setPendingQuestion(event as PendingQuestion);
        }
        setMessages((current) => {
          const next = updateMessages(current, event);
          const last = next[next.length - 1];
          setIsTurnActive(last?.streaming ?? false);
          return next;
        });
      },
      controller.signal
    );
  }

  async function connect() {
    try {
      const cwd = process.cwd();
      const lastSessionId = forceNewSession ? null : getLastSessionId(cwd);
      setSessionId(lastSessionId ?? (await harness.createSession(cwd)).sessionId);
      setWorkspace(cwd);
    } catch {
      return;
    }
  }

  async function sendPrompt(sessionId: string, text: string) {
    setMessages((current) => [
      ...current,
      { role: 'user', text, streaming: false },
    ]);
    setIsTurnActive(true);
    await harness.prompt(sessionId, text);
  }

  useEffect(() => {
    if (status !== 'up' || sessionId) {
      return;
    }
    connect();
  }, [harness, status, sessionId]);

  useEffect(() => {
    if (sessionId && status === 'up') {
      touchSession(sessionId, process.cwd());
    }
  }, [sessionId, status]);

  useEffect(() => {
    if (!sessionId || status !== 'up') {
      return;
    }
    const controller = new AbortController();
    streamEvents(sessionId, controller);
    return () => controller.abort();
  }, [harness, sessionId, status]);

  const prompt = useCallback(
    async (text: string) => {
      if (!sessionId) {
        throw new Error('no session');
      }
      await sendPrompt(sessionId, text);
    },
    [sessionId]
  );

  const interrupt = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    await harness.cancel(sessionId);
  }, [harness, sessionId]);

  const respondApproval = useCallback(
    async (kind: 'allow' | 'deny') => {
      if (!pendingApproval) {
        throw new Error('no pending approval');
      }
      setPendingApproval(null);
      await harness.respondApproval(pendingApproval, kind);
    },
    [harness, pendingApproval]
  );

  const respondQuestion = useCallback(
    async (answer: QuestionAnswerItem) => {
      if (!pendingQuestion) {
        throw new Error('no pending question');
      }
      
      const result = resolveQuestion(pendingQuestion, answer);
      if (result.type === 'update') {
        setPendingQuestion(result.next);
        return;
      }

      const answers = result.next.questions.flatMap((q) => (q.answer ? [q.answer] : []));
      setPendingQuestion(null);
      await harness.respondQuestion(result.next, { answers });
    },
    [harness, pendingQuestion]
  );

  const value: SessionContextValue = {
    isReady,
    workspace,
    prompt,
    interrupt,
    isTurnActive,
    hasPendingApproval,
    respondApproval,
    pendingQuestion,
    respondQuestion,
    messages,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return value;
}
