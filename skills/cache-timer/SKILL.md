---
name: cache-timer
description: 'Explains the cache-timer status line countdown (prompt cache expiry) and how to configure it. Use when the user asks how long until the prompt cache expires, what "cache: cold" means, or how to change the cache TTL or warning threshold.'
---

The cache-timer plugin in this folder shows a status line countdown until the main thread's prompt cache expires. Its hooks live in `hooks/register.ts` and load because this folder has a `.claude-plugin/plugin.json`.

Status line values:
- `🟢 cache: 52:10`: time left before the cache expires
- `🟡 cache: 1:45 left`: under the warning threshold (a toast also fires once)
- `🔴 cache: cold`: expired; the next message re-writes the whole cache at full input cost
- `⚪ cache: -`: no request yet in this session, or after `/clear`

Each main-thread model request resets the timer. Subagent requests don't.

Config, via `/config` (cache-timer rows) or `/plugin configure cache-timer`:
- `ttl`: `1h` (default, subscription plans) or `5m` (API-key billing). The plugin can't detect which applies.
- `warnSeconds`: seconds left at which the warning starts (default 120).

If the timer isn't showing, run `/reload-plugins` and check `/plugin` for load errors.
