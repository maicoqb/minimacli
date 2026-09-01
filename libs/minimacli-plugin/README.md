# @minimacli/plugin

The plugin contract for minimacli. It defines what a plugin looks like
so the minimacli client can discover.

## Installation

```sh
npm install @minimacli/plugin
```

## What it provides

- `Plugin` — the base contract every minimacli plugin implements.
- `HarnessPlugin` — a plugin that drives a chat harness;

## Writing a harness plugin

A plugin is a module whose **default export is a `HarnessPlugin`**. The
`create(options)` method returns a `Harness` implementation for the target
harness.

```ts
import type { HarnessPlugin } from '@minimacli/plugin';

const myPlugin: HarnessPlugin = {
  id: 'my-harness',
  kind: 'harness',
  create(options) {
    return myHarness({ url: options?.url });
  },
};

export default myPlugin;
```

## License

MIT
