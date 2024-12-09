# MCP Server for Drupal

A Model Context Protocol server

This is a TypeScript-based MCP server for Drupal.

## Features

### Resources

- All the resources defined by the Drupal API during the initialization phase

### Tools

- All the tools defined by the Drupal API during the initialization phase

### Prompts

- All the prompts defined by the Drupal API during the initialization phase

## Development

Install dependencies:

```bash
bun install
```

Build the server:

```bash
bun run build
```

For development with auto-rebuild:

```bash
bun run dev
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-server-drupal": {
      "command": "__BINARY_PATH__",
      "args": ["--drupalBaseUrl", "__DRUPAL_BASE_URL__"],
      "env": {}
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
bun run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
