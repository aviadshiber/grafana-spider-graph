# Security policy

## Reporting a vulnerability

Please do not report suspected vulnerabilities in a public issue. Use the private security-reporting channel provided by the hosting forge, or contact the maintainers through the project’s private security contact if one is configured there. Include a clear description, affected version, reproduction steps, impact assessment, and a safe proof of concept where possible.

We will acknowledge a report when practical, investigate privately, and coordinate disclosure and remediation with the reporter. Please allow time for a fix before public disclosure.

## Operational guidance

Do not place secrets in panel JSON, screenshots, examples, issue reports, or logs. Verify plugin artifacts and keep Grafana and SpiderGraph versions pinned in production.

## Upstream development advisories

The release process keeps the following narrowly scoped, time-bounded exceptions in
`osv-scanner.toml`. They must be reviewed before each release and removed as soon as a compatible
upstream update is available or the panel begins to exercise an affected path:

- `react-router` ([GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) and
  [GHSA-337j-9hxr-rhxg](https://github.com/advisories/GHSA-337j-9hxr-rhxg)) is transitive to
  `@grafana/ui`. Webpack externalizes React Router and Grafana provides it at runtime; SpiderGraph
  does not import it, use navigation, or use server-side hydration.

The `react:detect` and SBOM checks verify the runtime and distribution graph. Grafana and React
packages are externalized from the production bundle and are supplied by the host Grafana instance.

## Supported versions

Security fixes are prioritized for the latest release and the currently supported Grafana compatibility tiers. Alpha releases may receive fixes without a backport guarantee.

Automated security scores are point-in-time signals rather than warranties. Repository controls,
accepted limitations, and their review triggers are recorded in
[Security posture and accepted limitations](docs/security-posture.md).
