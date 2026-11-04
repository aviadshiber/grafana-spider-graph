# Changelog

All notable SpiderGraph changes are recorded here.

## Unreleased

### Changed

- CI adds an explicit Grafana 13.2.4 e2e run next to 11.5.2, so the build is tested on both the React 18 and the React 19 Grafana runtime.

### Security

- Clear high-severity advisories in build-time dependencies that blocked the signed release: `basic-ftp` 6.2.5 (CVE-2026-102990, via `@grafana/sign-plugin`, overridden because upstream still pins 5.x), `js-yaml` 3.15.2/4.3.2 (CVE-2026-84375) and `source-map-js` 1.2.2 (CVE-2026-93749). None of them ship in the plugin bundle.
- Private signature adds an approved staging Grafana host under both `http://` and `https://`, alongside the existing testing and production hosts (six `root_url` values). Earlier releases fail signature validation there because the staging `root_url` is missing from the manifest.
- Private releases are signed for the approved testing and production Grafana `root_url` values, including the HTTPS production endpoint (previously only HTTP), so the plugin loads on an HTTPS production Grafana.
- Private signature now covers both `http://` and `https://` for the testing and production hosts (four `root_url` values). Production's server `root_url` uses `http://`, which the previous HTTPS-only signature rejected. The release signing gate now accepts two or more distinct approved URLs instead of exactly two.

## 0.1.0 - 2026-08-13

### Added

- Wide and long Grafana table contracts with explicit mapping, duplicate reducers, missing-value behavior, and multi-frame ingestion.
- Per-axis and shared domains with field override and data-column precedence, constant-domain handling, and optional clamping.
- Responsive theme-aware SVG, raw formatted values, legend filtering, dash patterns, keyboard focus, and accessible value table.
- Versioned option migrations plus hard row, axis, series, cell, and diagnostic limits.
- Unit, property, component, migration, and provisioned Grafana E2E coverage.
- CI, compatibility checks, signing, SBOM, CodeQL, dependency review, and release provenance automation.

### Status

SpiderGraph is beta. The documented v1 data and option contracts are compatibility baselines.
