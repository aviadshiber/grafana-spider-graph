# Deployment

Build with `npm ci && npm run build`. Development Grafana accepts the unsigned plugin through the supplied Docker Compose configuration. Production distributions must be signed according to their Grafana signature level.

The tagged release workflow checks that the tag matches `package.json`, verifies public lockfile URLs, builds, tests, creates an SBOM, signs through Grafana's official action when a policy token is configured, and attaches provenance. Package contents must have the exact top-level directory `aviadshiber-spidergraph-panel`.

Changing `src/plugin.json` requires a Grafana restart. Never change the plugin ID after dashboards use it.
