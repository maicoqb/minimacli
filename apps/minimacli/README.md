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

## Prerequisites

A **DSH harness must be running** for the CLI to work. The CLI assumes a
harness listening on `http://127.0.0.1:3080`. Start the harness first, then run
`minimacli`. Without a running harness the client cannot connect.

## Requirements

- Node.js >= 18

## License

MIT
