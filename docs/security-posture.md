# Security posture

All query data and persisted options are untrusted. React text nodes render labels and diagnostics; the code does not use raw HTML, dynamic URLs, CSS strings, `eval`, browser storage, or network requests. Numeric style controls are bounded and enum options are allowlisted during migration.

The parser caps rows, axes, series, cells, and diagnostics. Non-finite values cannot enter SVG coordinates. Dependencies are lockfile-pinned, reviewed after a cooldown, scanned in CI, and represented by a CycloneDX SBOM. CodeQL, dependency review, OpenSSF Scorecard, React compatibility scanning, Grafana plugin validation, signed release automation, and provenance attestations are configured.

Report vulnerabilities through GitHub private security advisories. Do not include production dashboard data, tokens, or credentials in reports.
