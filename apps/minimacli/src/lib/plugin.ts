// Draft — plugin contract for minimacli.
// A plugin is a module whose default export is a Plugin. Different plugin
// kinds extend the base contract; a harness is one specific kind.

import type { Harness } from './harness';

/** Kind of a plugin. Add a value here for each new plugin family. */
export type PluginKind = 'harness';

/** Options a harness plugin receives when creating a harness instance. */
export type HarnessPluginOptions = Record<string, string>;

/**
 * Base contract shared by every minimacli plugin. A plugin file exports its
 * plugin object as the default export.
 */
export interface Plugin {
  /** Stable id identifying this plugin. */
  readonly id: string;
  /** Which family of plugin this is. */
  readonly kind: PluginKind;
}

/** A harness plugin: drives a chat harness over the network. */
export interface HarnessPlugin extends Plugin {
  readonly kind: 'harness';
  /** Create a harness instance bound to `url`. */
  create(url: string, options?: HarnessPluginOptions): Harness;
}

/** The shape of a plugin module: its default export is the plugin. */
export type PluginModule = {
  default: Plugin;
};

// Re-export the domain contract so plugin authors import everything from
// `@minimacli/plugin` instead of reaching into minimacli internals.
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
} from './harness';
