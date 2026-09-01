// DSH harness plugin. Implements HarnessPlugin so minimacli drives the DSH
// harness through the plugin mechanism.

import type { HarnessPlugin, HarnessPluginOptions } from '@minimacli/plugin';
import type { Harness } from '@minimacli/plugin';
import { createHarnessDsh } from './dsh-harness';

export const dshPlugin: HarnessPlugin = {
  id: 'dsh',
  kind: 'harness',
  defaultOptions: {
    url: 'http://127.0.0.1:3080',
  },
  create(options?: HarnessPluginOptions): Harness {
    const { url } = options || {};
    if (!url) {
      throw new Error('dsh plugin requires a url option');
    }
    return createHarnessDsh({ url });
  },
};
