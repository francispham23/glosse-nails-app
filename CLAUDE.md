# CLAUDE.md

See [AGENTS.md](./AGENTS.md) for the full project guide (stack, commands,
layout, rules, and testing conventions for this Expo + Convex app).

Quick start:

```bash
npm install
cp .env.example .env        # then fill in Convex + auth values
npm run start               # expo dev server
npm run typecheck && npm test
```

Quality gates: `npm run lint`, `npm run typecheck`, `npm test` — all run in CI
and via the lefthook pre-commit hook.
