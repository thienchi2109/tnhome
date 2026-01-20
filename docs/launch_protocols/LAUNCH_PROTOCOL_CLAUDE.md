### Claude Code Quick Start Guide

**Time Estimate:** 10 minutes

#### 1. Installation
Install the official tool.
```bash
npm install -g @anthropic-ai/claude-code
```
- **Requirements:** Node.js, Anthropic Account
- **Compatibility:** macOS/Linux (WSL for Windows)

#### 2. Setup Project Context
Claude Code looks for `CLAUDE.md`.
- **File Location:** Project root.
- **Action:** Place the generated `CLAUDE.md` (and `AGENTS.md`) in your project root.
- **Verification:** Claude will confirm context loading on startup.

#### 3. First Prompt
Start the REPL:
```bash
claude
```
Then type:
```text
Read AGENTS.md. Scaffold the project.
```

#### 4. Context & Workflow
- **Persistence:** Claude remembers context within a session nicely.
- **Cost:** Monitor token usage, as large contexts add up with Claude Opus/Sonnet.

#### 5. Links & Resources
- **Docs:** [claude.ai/docs](https://docs.anthropic.com)
