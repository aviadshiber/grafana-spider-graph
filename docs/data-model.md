# Data model

SpiderGraph accepts Grafana `DataFrame` tables in two v1 shapes.

## Wide

One string field identifies axes. Every numeric field except configured `min` and `max` fields becomes a series. Series names use Grafana display names when present. Row and frame order determine axis order.

## Long

A string axis field, string series field, and numeric value field define each cell. Duplicate `(series, axis)` cells are reduced using `last`, `sum`, `mean`, `min`, or `max`. Row and frame order determine axis and series order.

Null values are either gaps or zero according to `missingValue`. Non-finite values are ignored and diagnosed. At least three axes are required.

## Scale domains

Each axis is normalized to `[0, 1]`. Domain precedence is:

1. Grafana numeric field `min`/`max` overrides
2. Configured per-axis min/max data fields
3. Observed per-axis or shared data extent

Constant domains receive a deterministic non-zero range. Values outside the domain are clamped only when enabled. Raw values remain available in point labels and the accessible table.

## Limits

User limits default to 24 axes and 20 series. Absolute limits are 100 axes, 100 series, 10,000 rendered cells, 50,000 input rows, and 100 diagnostics. Reduction is reported rather than silent.
