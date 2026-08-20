# SpiderGraph

[![CI](https://github.com/aviadshiber/grafana-spider-graph/actions/workflows/ci.yml/badge.svg)](https://github.com/aviadshiber/grafana-spider-graph/actions/workflows/ci.yml)
[![Security](https://github.com/aviadshiber/grafana-spider-graph/actions/workflows/security.yml/badge.svg)](https://github.com/aviadshiber/grafana-spider-graph/actions/workflows/security.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/aviadshiber/grafana-spider-graph/badge)](https://scorecard.dev/viewer/?uri=github.com/aviadshiber/grafana-spider-graph)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/aviadshiber/grafana-spider-graph/blob/main/LICENSE)
[![Grafana](https://img.shields.io/badge/Grafana-%3E%3D11.5.2-F46800?logo=grafana)](https://grafana.com/)

SpiderGraph is a frontend-only Grafana panel for comparing multivariate series on a responsive radar/spider chart. It accepts ordinary Grafana data frames, supports metrics with different units through per-axis normalization, and keeps the raw values available in tooltips and an accessible table.

![SpiderGraph service comparison dashboard in Grafana](https://raw.githubusercontent.com/aviadshiber/grafana-spider-graph/main/src/img/spidergraph-overview.png)

> **Project status:** SpiderGraph is in beta. The documented v1 data and option contracts in [`docs/data-model.md`](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/data-model.md) are compatibility baselines; production deployments should use signed, immutable release artifacts.

## Highlights

- Wide and long table parsing across multiple Grafana data frames.
- Per-axis or shared scaling, optional zero inclusion, clamping, and explicit domain overrides.
- Grafana units, decimals, display names, fixed colors, and light/dark theme support.
- Legend filtering, keyboard-focusable points, color-independent dash patterns, and an optional raw-value table.
- Pure parser, geometry, and migration layers with unit and property tests.
- Hard ingestion/rendering ceilings with actionable diagnostics.

## Compatibility

| Grafana version  | Support tier                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------- |
| 11.5.2 and later | Supported and tested in the CI compatibility matrix.                                      |
| Nightly          | Continuously tested as an early-warning target; regressions may require upstream changes. |

SpiderGraph is a panel plugin, not a data source. Grafana must be able to query the data source that provides the fields described in the [data model](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/data-model.md).

## Quick start

Requirements: Node.js 22+, npm, and Docker Compose.

```bash
npm ci
npm run server
```

Open <http://localhost:3000>, then open the provisioned **SpiderGraph Examples** dashboard or add a SpiderGraph panel to your own dashboard. For a local development loop, run `npm run dev` in a second terminal. See [development and testing](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/development.md).

## Data formats

Wide tables contain one string axis field and one or more numeric series fields:

| Axis         | Service A | Service B |
| ------------ | --------: | --------: |
| Availability |      99.9 |      99.5 |
| Latency      |       120 |       180 |
| Throughput   |       850 |       720 |

Long tables contain `axis`, `series`, and `value` fields. Field names can be mapped in panel options. Duplicate axis/series cells use the selected reducer, and missing values can remain gaps or become zero.

Per-axis normalization is the default because metrics commonly have different units. Domain precedence is Grafana field min/max override, optional min/max columns, then the observed extent. Tooltips and the accessible table always show raw formatted values. See [Data model and panel contract](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/data-model.md) for the complete schema and limits.

## Documentation

- [Data model and panel contract](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/data-model.md)
- [Architecture](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/architecture.md)
- [Deployment](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/deployment.md)
- [Development and testing](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/development.md)
- [Support](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/support.md)
- [Security posture and accepted limitations](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/security-posture.md)
- [Roadmap](https://github.com/aviadshiber/grafana-spider-graph/blob/main/ROADMAP.md)

## Community and governance

Contributions, issue reports, and documentation improvements are welcome. Read [CONTRIBUTING.md](https://github.com/aviadshiber/grafana-spider-graph/blob/main/CONTRIBUTING.md), [GOVERNANCE.md](https://github.com/aviadshiber/grafana-spider-graph/blob/main/GOVERNANCE.md), and the [Code of Conduct](https://github.com/aviadshiber/grafana-spider-graph/blob/main/CODE_OF_CONDUCT.md) before participating.

The plugin ID `aviadshiber-spidergraph-panel` is a saved-dashboard compatibility contract. Do not change it after publication. Catalog inclusion and signing are external review processes and are not implied by using this repository.

## Packaging and signing

```bash
npm run build
GRAFANA_ACCESS_POLICY_TOKEN=... npm run sign -- \
  --rootUrls https://your-approved-grafana.example.com/
mv dist aviadshiber-spidergraph-panel
zip -r aviadshiber-spidergraph-panel-0.1.0.zip aviadshiber-spidergraph-panel
```

For production, use the protected tagged-release workflow so the signed archive also includes a checksum, SBOM, and provenance. Unsigned builds are intended only for the development environment. See [deployment](https://github.com/aviadshiber/grafana-spider-graph/blob/main/docs/deployment.md).

## License

SpiderGraph is licensed under the [Apache License 2.0](https://github.com/aviadshiber/grafana-spider-graph/blob/main/LICENSE).
