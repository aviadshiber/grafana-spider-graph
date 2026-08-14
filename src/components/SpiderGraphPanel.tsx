import React, { KeyboardEvent, useId, useMemo, useState } from 'react';
import type { PanelProps } from '@grafana/data';
import { css } from '@emotion/css';
import { useTheme2 } from '@grafana/ui';
import { parseSpiderData, type SpiderSeries } from '../data';
import { closedSegments, polarPoint, seriesPoints } from '../geometry/radar';
import { defaultOptions, type SpiderGraphOptions } from '../types';

const palette = ['blue', 'orange', 'green', 'red', 'purple', 'yellow', 'semi-dark-blue', 'semi-dark-green'];
const dashes = ['', '7 4', '2 3', '10 3 2 3', '1 4'];

const styles = {
  panel: css`
    height: 100%;
    min-height: 0;
    overflow: auto;
    width: 100%;
    color: var(--text-primary, inherit);
  `,
  layout: css`
    display: flex;
    height: 100%;
    min-height: 0;
    width: 100%;
  `,
  chart: css`
    flex: 1 1 auto;
    min-height: 160px;
    min-width: 0;
  `,
  legend: css`
    display: flex;
    flex: 0 0 auto;
    flex-wrap: wrap;
    gap: 5px 12px;
    justify-content: center;
    padding: 5px;
  `,
  legendRight: css`
    align-content: flex-start;
    flex-direction: column;
    justify-content: flex-start;
    max-width: 35%;
  `,
  legendButton: css`
    align-items: center;
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    gap: 5px;
    padding: 3px 4px;
    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  `,
  swatch: css`
    display: inline-block;
    height: 3px;
    width: 18px;
  `,
  state: css`
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    justify-content: center;
    min-height: 120px;
    padding: 16px;
    text-align: center;
  `,
  diagnostics: css`
    font-size: 12px;
    margin: 0;
    max-height: 72px;
    overflow: auto;
  `,
  table: css`
    border-collapse: collapse;
    font-size: 12px;
    margin: 6px;
    width: calc(100% - 12px);
    th,
    td {
      border-bottom: 1px solid currentColor;
      padding: 4px 6px;
      text-align: right;
    }
    th:first-child,
    td:first-child {
      text-align: left;
    }
  `,
};

function resolveOptions(options: SpiderGraphOptions): SpiderGraphOptions {
  return { ...defaultOptions, ...options };
}

function activate(event: KeyboardEvent, action: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

function formatted(series: SpiderSeries, value: number | undefined): string {
  if (value === undefined) {
    return 'Missing';
  }
  return (
    series.field?.display?.(value).text ?? new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(value)
  );
}

export function SpiderGraphPanel({ data, width, height, options: rawOptions }: PanelProps<SpiderGraphOptions>) {
  const theme = useTheme2();
  const options = useMemo(() => resolveOptions(rawOptions), [rawOptions]);
  const parsed = useMemo(() => parseSpiderData(data.series, options), [data.series, options]);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const titleId = `${useId().replace(/:/g, '')}-title`;
  const descriptionId = `${titleId}-description`;
  const chartHeight = Math.max(160, height - (options.legendPlacement === 'bottom' ? 42 : 0));
  const chartWidth = Math.max(160, width - (options.legendPlacement === 'right' ? Math.min(180, width * 0.3) : 0));
  const labelMargin = options.showAxisLabels
    ? Math.min(72, Math.max(34, Math.min(chartWidth, chartHeight) * 0.15))
    : 14;
  const radius = Math.max(20, Math.min(chartWidth, chartHeight) / 2 - labelMargin);
  const center = { x: chartWidth / 2, y: chartHeight / 2 };

  if (data.state === 'Error') {
    return (
      <div className={styles.state} role="alert">
        <strong>Query failed</strong>
        <span>{data.errors?.[0]?.message ?? 'Grafana could not load the panel data.'}</span>
      </div>
    );
  }
  if (!parsed.axes.length || !parsed.series.length) {
    return (
      <div className={styles.state}>
        <strong>No spider graph data</strong>
        <span>Provide a wide table (axis plus numeric series) or a long table (axis, series, value).</span>
        {parsed.diagnostics.length > 0 && (
          <ul className={styles.diagnostics}>
            {parsed.diagnostics.map((item, index) => (
              <li key={`${item.code}-${index}`}>{item.message}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  if (parsed.axes.length < 3) {
    return (
      <div className={styles.state} role="alert">
        <strong>At least three axes are required</strong>
        <span>Add another distinct axis row to draw a spider graph.</span>
      </div>
    );
  }

  const axisPoints = parsed.axes.map((_, index) =>
    polarPoint(index, parsed.axes.length, radius, center, options.startAngle, options.clockwise)
  );
  const color = (series: SpiderSeries, index: number) =>
    series.field?.config.color?.fixedColor ?? theme.visualization.getColorByName(palette[index % palette.length]);
  const toggle = (name: string) =>
    setHidden((current) => {
      const next = new Set(current);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  const legend =
    options.legendPlacement === 'hidden' ? null : (
      <div
        className={`${styles.legend} ${options.legendPlacement === 'right' ? styles.legendRight : ''}`}
        aria-label="Series legend"
      >
        {parsed.series.map((series, index) => (
          <button
            type="button"
            className={styles.legendButton}
            key={series.name}
            aria-pressed={!hidden.has(series.name)}
            onClick={() => toggle(series.name)}
          >
            <span
              className={styles.swatch}
              style={{ backgroundColor: color(series, index), opacity: hidden.has(series.name) ? 0.25 : 1 }}
            />
            <span style={{ opacity: hidden.has(series.name) ? 0.5 : 1 }}>{series.name}</span>
          </button>
        ))}
      </div>
    );

  return (
    <div className={styles.panel}>
      <div className={styles.layout} style={{ flexDirection: options.legendPlacement === 'bottom' ? 'column' : 'row' }}>
        <svg
          className={styles.chart}
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
        >
          <title id={titleId}>
            Spider graph with {parsed.axes.length} axes and {parsed.series.length} series
          </title>
          <desc id={descriptionId}>
            Use the legend buttons to show or hide series. Each point exposes its raw value to keyboard and pointer
            users.
          </desc>
          {Array.from({ length: options.gridLevels }, (_, level) => {
            const levelRadius = radius * ((level + 1) / options.gridLevels);
            const points = parsed.axes.map((_, index) =>
              polarPoint(index, parsed.axes.length, levelRadius, center, options.startAngle, options.clockwise)
            );
            return (
              <polygon
                key={level}
                points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                fill="none"
                stroke={theme.colors.border.weak}
                strokeWidth={1}
              />
            );
          })}
          {axisPoints.map((point, index) => (
            <g key={parsed.axes[index].name}>
              <line x1={center.x} y1={center.y} x2={point.x} y2={point.y} stroke={theme.colors.border.weak} />
              {options.showAxisLabels &&
                (() => {
                  const label = polarPoint(
                    index,
                    parsed.axes.length,
                    radius + 16,
                    center,
                    options.startAngle,
                    options.clockwise
                  );
                  return (
                    <text
                      x={label.x}
                      y={label.y}
                      textAnchor={Math.abs(label.x - center.x) < 6 ? 'middle' : label.x < center.x ? 'end' : 'start'}
                      dominantBaseline="middle"
                      fill={theme.colors.text.primary}
                      fontSize={12}
                    >
                      {parsed.axes[index].name}
                    </text>
                  );
                })()}
            </g>
          ))}
          {parsed.series.map((series, seriesIndex) => {
            if (hidden.has(series.name)) {
              return null;
            }
            const points = seriesPoints(
              series,
              parsed.axes,
              radius,
              center,
              options.startAngle,
              options.clockwise,
              options.clampValues
            );
            const segments = closedSegments(points);
            const paint = color(series, seriesIndex);
            const complete = points.every(Boolean);
            return (
              <g key={series.name} aria-label={series.name}>
                {complete && (
                  <polygon points={segments[0]} fill={paint} fillOpacity={options.fillOpacity} stroke="none" />
                )}
                {segments.map((segment, index) => (
                  <polyline
                    key={index}
                    points={complete ? `${segment} ${segment.split(' ')[0]}` : segment}
                    fill="none"
                    stroke={paint}
                    strokeWidth={options.lineWidth}
                    strokeDasharray={options.useDashPatterns ? dashes[seriesIndex % dashes.length] : undefined}
                    strokeLinejoin="round"
                  />
                ))}
                {points.map(
                  (point, index) =>
                    point && (
                      <React.Fragment key={parsed.axes[index].name}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={Math.max(3, options.pointRadius)}
                          fill={paint}
                          stroke={theme.colors.background.primary}
                          strokeWidth={1}
                          tabIndex={0}
                          role="img"
                          aria-label={`${series.name}, ${parsed.axes[index].name}: ${formatted(series, series.values[index])}`}
                          onKeyDown={(event) => activate(event, () => undefined)}
                        >
                          <title>
                            {series.name} — {parsed.axes[index].name}: {formatted(series, series.values[index])} (scale{' '}
                            {parsed.axes[index].min}–{parsed.axes[index].max})
                          </title>
                        </circle>
                        {options.showValues && (
                          <text
                            x={point.x}
                            y={point.y - options.pointRadius - 4}
                            textAnchor="middle"
                            fill={theme.colors.text.primary}
                            fontSize={10}
                            pointerEvents="none"
                          >
                            {formatted(series, series.values[index])}
                          </text>
                        )}
                      </React.Fragment>
                    )
                )}
              </g>
            );
          })}
        </svg>
        {legend}
      </div>
      {parsed.diagnostics.length > 0 && (
        <details className={styles.diagnostics}>
          <summary>Diagnostics ({parsed.diagnostics.length})</summary>
          <ul>
            {parsed.diagnostics.map((item, index) => (
              <li key={`${item.code}-${index}`}>{item.message}</li>
            ))}
          </ul>
        </details>
      )}
      {options.showAccessibleTable && (
        <table className={styles.table}>
          <caption>Spider graph values</caption>
          <thead>
            <tr>
              <th>Axis</th>
              {parsed.series.map((series) => (
                <th key={series.name}>{series.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.axes.map((axis, axisIndex) => (
              <tr key={axis.name}>
                <th scope="row">{axis.name}</th>
                {parsed.series.map((series) => (
                  <td key={series.name}>{formatted(series, series.values[axisIndex])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
