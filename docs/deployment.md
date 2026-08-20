# Deployment

Build with `npm ci && npm run build`. Development Grafana accepts the unsigned plugin through the supplied Docker Compose configuration. Never enable unsigned plugins in a shared production deployment.

## Production release

SpiderGraph is a frontend-only panel. It requires no backend process, credentials, datasource permissions, or additional network access. Production distributions must be signed and installed as immutable artifacts.

Before creating a `v0.1.0` tag, configure the protected GitHub `release-signing` environment with:

- Secret `GRAFANA_ACCESS_POLICY_TOKEN`: a Grafana access policy token with `plugins:write` for the organization matching the `aviadshiber` plugin-ID prefix.
- Variable `GRAFANA_PLUGIN_ROOT_URLS`: the comma-separated Grafana `root_url` values approved by the administrators. These values must match the server configuration exactly; do not infer them from a browser URL.

The tagged release workflow verifies that the tag is on `main` and matches `package.json`, verifies the registry and lockfile, creates an SBOM, builds and privately signs through Grafana's official action, produces a SHA-256 checksum, and attaches build provenance. Package contents use the exact top-level directory `aviadshiber-spidergraph-panel`.

## Administrator installation

1. Verify the release provenance and SHA-256 checksum before extraction.
2. Install the signed ZIP on a staging or canary Grafana 11.5.2 instance using the organization's immutable image or Helm deployment process.
3. Confirm startup logs contain `Plugin registered` for `aviadshiber-spidergraph-panel` and do not contain signature errors.
4. Open the provisioned example or create a panel using the plugin, then verify rendering, keyboard interaction, tooltips, and the accessible value table.
5. Roll out the identical archive to every Grafana replica. A readiness check should fail when the expected plugin ID/version is unavailable.

For rollback, restore the previous Grafana image or plugin artifact and restart the affected replicas. Existing dashboards retain their saved configuration but show the standard missing-plugin state until a compatible version is restored.

Changing `src/plugin.json` or the installed plugin files requires a Grafana restart. Never change the plugin ID after dashboards use it.
