# Cursor MCP Setup

Copy the following JSON configuration into your Cursor MCP settings (Settings > Features > MCP > Add New / Edit JSON):

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_READ_ONLY_TOKEN"
    }
  },
  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp", "@latest"]
  }
}
```

**Note:** For the GitHub token, ensure it has minimal permissions (read-only) for security.
