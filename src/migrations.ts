import type { PanelMigrationHandler } from '@grafana/data';
import { defaultOptions, OPTIONS_SCHEMA_VERSION, type SpiderGraphOptions } from './types';

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as UnknownRecord) : {};
const oneOf = <T extends string>(value: unknown, choices: readonly T[], fallback: T): T =>
  typeof value === 'string' && choices.includes(value as T) ? (value as T) : fallback;
const number = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
const boolean = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);
const optionalText = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

export function migrateOptions(input: unknown): SpiderGraphOptions {
  const value = record(input);
  return {
    schemaVersion: OPTIONS_SCHEMA_VERSION,
    dataMode: oneOf(value.dataMode, ['auto', 'wide', 'long'], defaultOptions.dataMode),
    axisField: optionalText(value.axisField),
    seriesField: optionalText(value.seriesField),
    valueField: optionalText(value.valueField),
    minField: optionalText(value.minField),
    maxField: optionalText(value.maxField),
    duplicateReducer: oneOf(
      value.duplicateReducer,
      ['sum', 'mean', 'min', 'max', 'last'],
      defaultOptions.duplicateReducer
    ),
    missingValue: oneOf(value.missingValue, ['gap', 'zero'], defaultOptions.missingValue),
    scaleMode: oneOf(value.scaleMode, ['per-axis', 'shared'], defaultOptions.scaleMode),
    includeZero: boolean(value.includeZero, defaultOptions.includeZero),
    clampValues: boolean(value.clampValues, defaultOptions.clampValues),
    gridLevels: number(value.gridLevels, defaultOptions.gridLevels, 1, 10),
    startAngle: number(value.startAngle, defaultOptions.startAngle, -360, 360),
    clockwise: boolean(value.clockwise, defaultOptions.clockwise),
    showAxisLabels: boolean(value.showAxisLabels, defaultOptions.showAxisLabels),
    showValues: boolean(value.showValues, defaultOptions.showValues),
    showScale: boolean(value.showScale, defaultOptions.showScale),
    fillOpacity: number(value.fillOpacity, defaultOptions.fillOpacity, 0, 1),
    lineWidth: number(value.lineWidth, defaultOptions.lineWidth, 0, 10),
    pointRadius: number(value.pointRadius, defaultOptions.pointRadius, 0, 12),
    legendPlacement: oneOf(value.legendPlacement, ['bottom', 'right', 'hidden'], defaultOptions.legendPlacement),
    showAccessibleTable: boolean(value.showAccessibleTable, defaultOptions.showAccessibleTable),
    useDashPatterns: boolean(value.useDashPatterns, defaultOptions.useDashPatterns),
    maxAxes: number(value.maxAxes, defaultOptions.maxAxes, 3, 100),
    maxSeries: number(value.maxSeries, defaultOptions.maxSeries, 1, 100),
  };
}

export const migrationHandler: PanelMigrationHandler<SpiderGraphOptions> = (panel) => migrateOptions(panel.options);
