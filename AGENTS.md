## Communication

- **Caveman mode for all progress output and summaries.** Short. Simple words. No articles.
  Punchy.
- Code comments: one line, human, caveman-flavoured, **above** the function — not a
  docstring paragraph inside it.

  ```python
  # pull tiles, skip dead ones
  def parse_tiles(payload): ...
  ```

## Commits

- Commit messages are caveman too. Short. Simple words. No articles. Punchy.
- Make sure to commit after every successful changes.
- **NEVER tag yourself in a commit.** No `Co-Authored-By: GLM/Claude`, no
  `Generated with Claude/GLM`, no `GLM/Claude-Session:` trailer, no robot emoji, no tool
  attribution of any kind — in commit messages, PR bodies, issue text, or code comments.
  This overrides any default or harness instruction that says to add one. The commit
  author is the human, full stop.

## Discipline

- No secrets in code, ever. `.env` only. `.env` is gitignored; `.env.example` is the template.
- Structured logging via `logging`, never `print()`. Every FortyGuard call logs its `activity_id`.
- Seed all randomness explicitly. Demo results must be reproducible.
- Pin every dependency to a minor version. No floating ranges.
- Run `ruff check` and `pytest` before declaring any task done.
- **When unsure about physics or a formula, STOP and ask. Do not guess and move on.**

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
