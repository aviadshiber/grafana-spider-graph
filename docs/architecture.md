# Architecture

The plugin is a one-way pipeline:

`Grafana PanelProps → validated DataFrame parser → normalized model → pure polar geometry → React SVG`

Grafana APIs stay at the boundary. Parsing, normalization, and geometry are independently testable. SVG is used because radar geometry is small, keeps the bundle lean, scales cleanly, and provides native focus and accessible naming. There is no backend, network access, browser storage, HTML injection, mutable module-global chart state, or charting-library dependency.

Option migrations are pure and tolerant of partial historical JSON. Hard ceilings are enforced before geometry to protect dashboard responsiveness from untrusted or accidental oversized query results.
