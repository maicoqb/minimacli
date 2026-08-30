// Plugin contract from @minimacli/plugin. A plugin is a module whose default
// export is a Plugin. Different plugin kinds extend the base contract; a
// harness is one specific kind.

import type { Harness } from './harness';

/** Kind of a plugin. Add a value here for each new plugin family. */
export type PluginKind = 'harness';

/** Options a harness plugin receives when creating a harness instance. */
export type HarnessPluginOptions = Record<string, string>;

/** Base contract shared by every minimacli plugin. */
export interface Plugin {
  /** Stable id identifying this plugin. */
  readonly id: string;
  /** Which family of plugin this is. */
  readonly kind: PluginKind;
}

/** A harness plugin: drives a chat harness. */
export interface HarnessPlugin extends Plugin {
  readonly kind: 'harness';
  /** Create a harness instance from the given options. */
  create(options?: HarnessPluginOptions): Harness;
}

/** The shape of a plugin module: its default export is the plugin. */
export type PluginModule = {
  default: Plugin;
};
