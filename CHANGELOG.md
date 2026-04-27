# Changelog

## 1.0.0 - 2026-04-27

Initial release.

- Cost & quota statusline for Claude Code with 5h/7d quota bars, session burn rate, today/week/month/total cost summaries, and per-project breakdown with cache hit rate.
- Per-file `mtime + size` cache for transcript scanning. Cold-render ~0.9s, warm-render ~80ms even on large `~/.claude/projects` histories. Cache stored at `~/.cache/ccwatch/transcript-cache.json`.
- Dedicated context-window progress bar (`ctxbar`) with green→yellow→red gradient.
- Interactive `/ccwatch` slash command — wizard that asks which cells should be visible and writes the result to plugin config.
- One-line install via `npx @terzigolu/ccwatch` — copies the plugin into `~/.claude/plugins/cache/terzigolu/ccwatch/<version>/` and wires `statusLine.command` automatically.
- Native Claude Code plugin: also installable via `/plugin marketplace add` + `/plugin install`.
- API users: per-model token pricing (Opus / Sonnet / Haiku each priced separately). Cache reads tracked at 10% of fresh-input pricing.
- Pro / Max subscribers: reads OAuth quota via Anthropic API for live 5h / 7d runway with countdowns.
- Adaptive layout — switches to compact rows on narrow widths; trims trailing columns rather than truncating cell content.
