# SpiderGraph panel for Grafana

SpiderGraph is a frontend-only Grafana panel for comparing multivariate series on a radar/spider chart. It is responsive, theme-aware, keyboard accessible, dependency-light, and deliberately bounded for dashboard safety.

## Data formats

Wide tables contain one string axis field and one or more numeric series fields:

| Axis         | Service A | Service B |
| ------------ | --------: | --------: |
| Availability |      99.9 |      99.5 |
| Latency      |       120 |       180 |
| Throughput   |       850 |       720 |

Long tables contain `axis`, `series`, and `value` fields. Field names can be mapped in panel options. Duplicate axis/series cells use the selected reducer. Missing values can remain gaps or become zero.

Per-axis normalization is the default because metrics commonly have different units. Domain precedence is Grafana field min/max override, optional min/max columns, then the observed extent. Tooltips and the accessible table always show raw formatted values.

## Features

- Wide and long table parsing across multiple Grafana data frames
- Per-axis or shared scaling, optional zero inclusion, and clamping
- Grafana units, decimals, display names, fixed colors, light/dark themes
- Legend filtering, keyboard-focusable data points, SVG name/description, optional raw-value table
- Color-independent dash patterns and visible focus behavior
- Pure geometry and migration layers with unit/property tests
- Hard ingestion/rendering ceilings with actionable diagnostics
- CI, Grafana E2E test harness, plugin validation, signing, SBOM, dependency review, CodeQL, and release attestations

## Development

Requires Node.js 22.11+ and Docker.

```bash
npm ci
npm run typecheck
npm run lint
npm run test:ci
npm run build
npm run server
```

Open <http://localhost:3000>. After changing `src/plugin.json`, restart Grafana.

## Packaging and signing

```bash
npm run build
GRAFANA_ACCESS_POLICY_TOKEN=... npm run sign
mv dist aviadshiber-spidergraph-panel
zip -r aviadshiber-spidergraph-panel-0.1.0.zip aviadshiber-spidergraph-panel
```

The plugin ID is a saved-dashboard compatibility contract. Do not change it after publication. See [deployment](docs/deployment.md), [data model](docs/data-model.md), and [security posture](docs/security-posture.md).

## License

Apache-2.0
