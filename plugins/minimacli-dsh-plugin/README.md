# @minimacli/dsh-plugin

The DSH harness plugin for minimacli. It lets `minimacli` connect to and drive
a DSH harness.

## Usage

Install the plugin with:

```sh
minimacli --install @minimacli/dsh-plugin
```

Once installed, it becomes available as the `dsh` harness.

## Configuration

The plugin connects to a DSH harness at `http://127.0.0.1:3080` by default.
You can point it at another harness through the plugin options:

```jsonc
{
  // ...
  "plugins": [
    // ...
    {
      "options": {
        "url": "http://127.0.0.1:3080"
      }
    }
  ]
}


```

## License

MIT
