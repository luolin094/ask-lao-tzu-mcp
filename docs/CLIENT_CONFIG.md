# Client configuration

The exact configuration key differs by MCP client. The common shape is:

```json
{
  "mcpServers": {
    "ask-lao-tzu": {
      "command": "node",
      "args": ["/absolute/path/to/ask-lao-tzu-mcp/dist/index.js"]
    }
  }
}
```

Build the project before using this configuration. Do not put API keys in this repository: the server has no network dependency and does not need one.
