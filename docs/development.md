# Development

Install with Node 22 and `npm ci`. Use the checked-in Grafana webpack configuration; do not edit `.config/` directly.

Before a pull request, run:

```bash
npm run typecheck
npm run lint
npm run test:ci
npm run build
npm run react:detect
```

Run `npm run server` and then `npm run e2e` for integration coverage. Parser and geometry changes require unit tests; option changes require migration tests and updates to `src/types.ts`, `docs/data-model.md`, and the changelog.
