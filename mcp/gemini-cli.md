# Gemini CLI MCP Setup

To install the supported MCP servers for Gemini CLI, run the following commands (using full URLs to ensure correct source):

## 1. Docs MCP (Context7)
```bash
gemini extensions install https://github.com/upstash/context7
```

## 2. GitHub MCP
```bash
gemini extensions install https://github.com/modelcontextprotocol/servers/tree/main/src/github
# Note: You may need to verify the exact URL or use the npx adapter if direct install fails.
# Alternatively: gemini extensions install https://github.com/github/github-mcp-server
```

## 3. Chrome DevTools MCP
```bash
gemini extensions install https://github.com/ChromeDevTools/chrome-devtools-mcp
```
