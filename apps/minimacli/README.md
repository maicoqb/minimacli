# @minimacli/minimacli

A thin terminal client (TUI) for the DSH harness. It complements the DSH web
GUI with a keyboard-driven terminal interface.

## Install

```sh
npm i -g @minimacli/minimacli
```

## Usage

Start the TUI from your terminal:

```sh
minimacli
```

The CLI connects to an already-running harness. It does not boot its own
harness profile.

## Plugins

`minimacli` supports optional plugins that can be installed and registered from
the CLI itself. Plugins are stored under the local minimacli plugin directory and
are automatically loaded when the app starts.

Recommended setup for the DSH harness:

```sh
npm i -g @minimacli/minimacli
minimacli --install @minimacli/dsh-plugin
```

This installs the DSH plugin and registers it for use with a local Harness at
`http://127.0.0.1:3080`.

### Plugin registry

The plugin registry is stored in a local file under the user's home directory:

- macOS/Linux: `~/.minimacli/plugins.json`
- Windows: `%USERPROFILE%\.minimacli\plugins.json`

This file stores the installed plugins and their default options.

Example:

```json
[
  {
    "id": "dsh",
    "kind": "harness",
    "packageName": "@minimacli/dsh-plugin",
    "defaultOptions": {
      "url": "http://127.0.0.1:3080"
    }
  }
]
```

You can edit the file manually if you need to add or change a plugin. After
updating it, restart `minimacli` so the app reloads the registry and picks up the
new configuration.

## Prerequisites

A **DSH harness must be running** for the CLI to work. The CLI assumes a
harness listening on `http://127.0.0.1:3080`. Start the harness first, then run
`minimacli`. Without a running harness the client cannot connect.

## Requirements

- Node.js >= 18

## License

MIT
