# TabsAGO MCP Playbook

This document outlines the **minimal, opt-in** MCP (Model Context Protocol) setup for TabsAGO. 
These servers are NOT required for development but can provide "superpowers" when enabled.

## 🛑 Hard Rules
1. **Opt-in Only:** Never configure these to run automatically without your explicit consent.
2. **Context Economy:** Only enable the specific MCP you need for the task at hand.
3. **Safety First:** When using Chrome DevTools MCP, use a separate Chrome profile or ensuring no sensitive data is active.

## 🛠️ Supported MCPs

### 1. Docs MCP (Context7)
*   **Purpose:** Look up up-to-date documentation to avoid hallucinations (e.g., Manifest V3 vs V2).
*   **When to use:** "How do I use the chrome.scripting API?" or "Check MV3 compliance for background service workers."
*   **Trigger:** "MCP Docs Check"

### 2. Repo MCP (GitHub)
*   **Purpose:** Read-only access to PRs, issues, and file history without leaving the IDE.
*   **When to use:** "Summarize PR #12" or "Check the history of `src/service-worker.ts`."
*   **Trigger:** "MCP GitHub Review"

### 3. Runtime/Perf MCP (Chrome DevTools)
*   **Purpose:** Inspect console logs, network requests, and performance traces of the extension running in Chrome.
*   **When to use:** "Why is the background script taking 500ms to load?" or "Capture a console log from the popup."
*   **Trigger:** "MCP DevTools Trace"

## 🚀 Setup Instructions

### For VSCode
Copy `.vscode/mcp.json.example` to your user or workspace settings.

### For Gemini CLI
Run the install commands found in `mcp/gemini-cli.md`.

### For Cursor
Copy the JSON from `mcp/cursor.md` into Cursor's MCP settings panel.

## 🗣️ 3-word MCP Triggers
Agents are instructed NOT to use MCP tools unless you include one of these phrases:

*   **"MCP Docs Check"** -> Allow Context7 / Chrome docs lookup.
*   **"MCP GitHub Review"** -> Allow GitHub MCP read-only repo/PR queries.
*   **"MCP DevTools Trace"** -> Allow Chrome DevTools MCP perf/trace/console/network work.
*   **"MCP Web Search"** -> Allow web search MCP (only if explicitly installed).
