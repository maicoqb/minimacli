import { Harness, isHarnessPlugin } from '@minimacli/plugin';
import { type PluginEntry, getPlugins } from './pluginStore';

export type {
  Harness,
  HarnessDescriptor,
  HarnessStatus,
  SessionCreated,
  PromptAccepted,
  SessionEvent,
  AssistantDelta,
  AssistantComplete,
  ToolCall,
  ToolArguments,
  ApprovalRequest,
  QuestionItem,
  QuestionOption,
  QuestionRequest,
  QuestionAnswerItem,
  QuestionAnswer,
} from '@minimacli/plugin';

export const harnessCache = new Map<string, Harness>();

export function getHarness(): Harness {
  const [selected]: PluginEntry[] = getPlugins({ kind: 'harness', active: true });
  if (!selected) {
    throw new Error('No harness plugin available');
  }
  const { plugin, options } = selected;
  if (!isHarnessPlugin(plugin)) {
    throw new Error('Configured plugin is not a harness plugin');
  }
  let harness = harnessCache.get(plugin.id);
  if (!harness) {
    harness = plugin.create(options);
    harnessCache.set(plugin.id, harness);
  }
  return harness;
}
