# Skills

[![skills.sh](https://skills.sh/b/sawirricardo/skills)](https://skills.sh/sawirricardo/skills)

Skills and plugins for Claude Code and other coding agents.

## Install

All skills:

```sh
npx skills@latest add sawirricardo/skills
```

One skill:

```sh
npx skills@latest add sawirricardo/skills --skill cache-timer
```

Claude Code plugins are also available through the plugin marketplace:

```sh
claude plugin marketplace add sawirricardo/skills
claude plugin install cache-timer@sawirricardo
```

## Skills

| Skill | What it does |
| --- | --- |
| [cache-timer](skills/cache-timer) | Claude Code status line countdown until the prompt cache expires (plugin with hooks) |

## License

MIT
