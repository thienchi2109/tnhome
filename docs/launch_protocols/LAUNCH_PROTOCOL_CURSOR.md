### Cursor Quick Start Guide

**Time Estimate:** 5 minutes

#### 1. Installation
Install the CLI via the one-line command (Mac/Linux) or download from cursor.com.
```bash
sh -c "curl https://cursor.com/install -fsS | bash"
```
- **Requirements:** macOS / Windows / Linux
- **Verification:** Run `cursor-agent --version` in your terminal.

#### 2. Setup AGENTS.md Integration
Cursor natively supports Vibe-Coding.
- **File Location:** Project root.
- **Configuration:** Zero config required. Cursor scans the root for this file.
- **Verification:** Open Cursor's "Composer" (Cmd+I) and type "Read rules". It should reference the file.

#### 3. First Prompt
Open Composer (Cmd+I) or Chat (Cmd+L) and run:
```text
Read AGENTS.md. Scaffold the project structure based on the Tech Design.
```
- **Expect:** Cursor will read the file and propose a file tree creation plan.

#### 4. Context & Workflow
- **Reference:** You don't always need to type "Read AGENTS.md", but it helps for big tasks.
- **Updates:** If you edit `AGENTS.md`, start a new chat session to refresh context.
- **Tip:** Use `@AGENTS.md` in chat to explicitly force attention to it.

#### 5. Links & Resources
- **Official Docs:** [docs.cursor.com/rules](https://docs.cursor.com)
- **Community:** [forum.cursor.com](https://forum.cursor.com)
