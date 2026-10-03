# cache-timer

A Claude Code plugin that shows how long until the main thread's prompt cache expires, in the status line:

- `cache: 52:10`: time left
- `cache: 1:45 left!`: under the warning threshold (plus a one-time toast)
- `cache: cold`: expired; the next message re-writes the whole cache
- `cache: -`: no request yet, or after `/clear`

Each main-thread model request resets the timer; subagent requests don't (they don't keep the main cache warm).

## Install

**From the marketplace** (gets updates via `/plugin`):

```sh
claude plugin marketplace add sawirricardo/skills
claude plugin install cache-timer@sawirricardo
```

**With [skills.sh](https://skills.sh)** (installs into `~/.claude/skills/cache-timer`):

```sh
npx skills@latest add sawirricardo/skills --skill cache-timer -a claude-code -g
```

Use one method, not several. The skills.sh install loads every session as `cache-timer@skills-dir`; the root `SKILL.md` also adds a `/cache-timer` skill that explains the status line. Run `/reload-plugins` to load it in an open session.

## Config

In `/config` (cache-timer rows), or `/plugin configure cache-timer`:

- `ttl`: `1h` (default, subscription plans) or `5m` (API-key billing). The plugin can't detect which your account uses.
- `warnSeconds`: when the warning kicks in (default 120).

## Develop

```sh
claude plugin validate .
claude plugin test .
```

Built on Claude Code's function-hooks API (`hooks/register.ts`), tested on 2.1.288. That API is early access and may change.
