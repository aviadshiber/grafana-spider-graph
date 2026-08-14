import { FieldType, type DataFrame, type Field } from '@grafana/data';
import type { DuplicateReducer, SpiderGraphOptions } from '../types';
import type { SpiderAxis, SpiderData, SpiderDiagnostic, SpiderSeries } from './model';

const HARD_MAX_AXES = 100;
const HARD_MAX_SERIES = 100;
const HARD_MAX_CELLS = 10_000;
const HARD_MAX_ROWS = 50_000;

function normalizeName(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s-]+/g, '_');
}

function valueAt(field: Field, index: number): unknown {
  const values = field.values as unknown as { get?: (i: number) => unknown; [index: number]: unknown };
  return values?.get ? values.get(index) : values?.[index];
}

function text(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const result = String(value).trim();
  return result || undefined;
}

function finiteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const result = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(result) ? result : undefined;
}

function findField(
  frame: DataFrame,
  configured: string | undefined,
  aliases: string[],
  type?: FieldType
): Field | undefined {
  const expected = configured ? normalizeName(configured) : undefined;
  return frame.fields.find((field) => {
    if (type && field.type !== type) {
      return false;
    }
    const name = normalizeName(field.name);
    return expected ? name === expected : aliases.includes(name);
  });
}

function frameLength(frame: DataFrame): number {
  return frame.fields.reduce((length, field) => Math.max(length, field.values.length), 0);
}

function diagnostic(
  diagnostics: SpiderDiagnostic[],
  severity: SpiderDiagnostic['severity'],
  code: string,
  message: string
) {
  if (diagnostics.length < 100) {
    diagnostics.push({ code, message, severity });
  }
}

function reduce(values: number[], reducer: DuplicateReducer): number {
  switch (reducer) {
    case 'sum':
      return values.reduce((sum, value) => sum + value, 0);
    case 'mean':
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'last':
      return values[values.length - 1];
  }
}

interface ParsedCells {
  axes: string[];
  cells: Map<string, Map<string, number[]>>;
  fields: Map<string, Field>;
  explicitMin: Map<string, number>;
  explicitMax: Map<string, number>;
}

function parseWide(frames: DataFrame[], options: SpiderGraphOptions, diagnostics: SpiderDiagnostic[]): ParsedCells {
  const parsed: ParsedCells = {
    axes: [],
    cells: new Map(),
    fields: new Map(),
    explicitMin: new Map(),
    explicitMax: new Map(),
  };
  let rowsRead = 0;
  for (const frame of frames) {
    const axis = options.axisField
      ? findField(frame, options.axisField, [], FieldType.string)
      : (findField(frame, undefined, ['axis', 'metric', 'dimension', 'category'], FieldType.string) ??
        frame.fields.find((field) => field.type === FieldType.string));
    if (!axis) {
      diagnostic(
        diagnostics,
        'error',
        'missing-axis-field',
        `Frame '${frame.name ?? frame.refId ?? 'unnamed'}' has no string axis field.`
      );
      continue;
    }
    const minField = findField(frame, options.minField, ['min', 'minimum'], FieldType.number);
    const maxField = findField(frame, options.maxField, ['max', 'maximum'], FieldType.number);
    const numeric = frame.fields.filter(
      (field) => field.type === FieldType.number && field !== minField && field !== maxField
    );
    if (!numeric.length) {
      diagnostic(
        diagnostics,
        'error',
        'missing-value-field',
        `Frame '${frame.name ?? frame.refId ?? 'unnamed'}' has no numeric series fields.`
      );
      continue;
    }
    const rowCount = Math.min(frameLength(frame), HARD_MAX_ROWS - rowsRead);
    rowsRead += rowCount;
    for (let row = 0; row < rowCount; row++) {
      const axisName = text(valueAt(axis, row));
      if (!axisName) {
        diagnostic(diagnostics, 'warning', 'invalid-axis', `Ignored row ${row + 1} with an empty axis.`);
        continue;
      }
      if (!parsed.axes.includes(axisName)) {
        parsed.axes.push(axisName);
      }
      const min = minField ? finiteNumber(valueAt(minField, row)) : undefined;
      const max = maxField ? finiteNumber(valueAt(maxField, row)) : undefined;
      if (min !== undefined) {
        parsed.explicitMin.set(axisName, min);
      }
      if (max !== undefined) {
        parsed.explicitMax.set(axisName, max);
      }
      for (const field of numeric) {
        const seriesName = field.config.displayName ?? field.name;
        parsed.fields.set(seriesName, field);
        const raw = valueAt(field, row);
        const value = finiteNumber(raw);
        if (value === undefined) {
          if (raw !== null && raw !== undefined && raw !== '') {
            diagnostic(
              diagnostics,
              'warning',
              'invalid-value',
              `Ignored non-finite value for '${seriesName}' on '${axisName}'.`
            );
          }
          continue;
        }
        const byAxis = parsed.cells.get(seriesName) ?? new Map<string, number[]>();
        byAxis.set(axisName, [...(byAxis.get(axisName) ?? []), value]);
        parsed.cells.set(seriesName, byAxis);
      }
    }
  }
  return parsed;
}

function parseLong(frames: DataFrame[], options: SpiderGraphOptions, diagnostics: SpiderDiagnostic[]): ParsedCells {
  const parsed: ParsedCells = {
    axes: [],
    cells: new Map(),
    fields: new Map(),
    explicitMin: new Map(),
    explicitMax: new Map(),
  };
  let rowsRead = 0;
  for (const frame of frames) {
    const strings = frame.fields.filter((field) => field.type === FieldType.string);
    const axis = options.axisField
      ? findField(frame, options.axisField, [], FieldType.string)
      : (findField(frame, undefined, ['axis', 'metric', 'dimension', 'category'], FieldType.string) ?? strings[0]);
    const series = options.seriesField
      ? findField(frame, options.seriesField, [], FieldType.string)
      : (findField(frame, undefined, ['series', 'group', 'name'], FieldType.string) ??
        strings.find((field) => field !== axis));
    const value = options.valueField
      ? findField(frame, options.valueField, [], FieldType.number)
      : (findField(frame, undefined, ['value', 'score', 'metric'], FieldType.number) ??
        frame.fields.find((field) => field.type === FieldType.number));
    const minField = findField(frame, options.minField, ['min', 'minimum'], FieldType.number);
    const maxField = findField(frame, options.maxField, ['max', 'maximum'], FieldType.number);
    if (!axis || !series || !value) {
      diagnostic(
        diagnostics,
        'error',
        'missing-long-fields',
        `Frame '${frame.name ?? frame.refId ?? 'unnamed'}' needs axis, series, and numeric value fields.`
      );
      continue;
    }
    const rowCount = Math.min(frameLength(frame), HARD_MAX_ROWS - rowsRead);
    rowsRead += rowCount;
    for (let row = 0; row < rowCount; row++) {
      const axisName = text(valueAt(axis, row));
      const seriesName = text(valueAt(series, row));
      const raw = valueAt(value, row);
      const numeric = finiteNumber(raw);
      if (!axisName || !seriesName) {
        diagnostic(diagnostics, 'warning', 'invalid-key', `Ignored row ${row + 1} with an empty axis or series.`);
        continue;
      }
      if (!parsed.axes.includes(axisName)) {
        parsed.axes.push(axisName);
      }
      parsed.fields.set(seriesName, value);
      const min = minField ? finiteNumber(valueAt(minField, row)) : undefined;
      const max = maxField ? finiteNumber(valueAt(maxField, row)) : undefined;
      if (min !== undefined) {
        parsed.explicitMin.set(axisName, min);
      }
      if (max !== undefined) {
        parsed.explicitMax.set(axisName, max);
      }
      if (numeric === undefined) {
        if (raw !== null && raw !== undefined && raw !== '') {
          diagnostic(
            diagnostics,
            'warning',
            'invalid-value',
            `Ignored non-finite value for '${seriesName}' on '${axisName}'.`
          );
        }
        continue;
      }
      const byAxis = parsed.cells.get(seriesName) ?? new Map<string, number[]>();
      byAxis.set(axisName, [...(byAxis.get(axisName) ?? []), numeric]);
      parsed.cells.set(seriesName, byAxis);
    }
  }
  return parsed;
}

function mode(frames: DataFrame[], options: SpiderGraphOptions): 'wide' | 'long' {
  if (options.dataMode !== 'auto') {
    return options.dataMode;
  }
  return frames.some((frame) => {
    const series = findField(frame, options.seriesField, ['series', 'group', 'name'], FieldType.string);
    const value = findField(frame, options.valueField, ['value', 'score'], FieldType.number);
    return Boolean(series && value);
  })
    ? 'long'
    : 'wide';
}

export function parseSpiderData(frames: DataFrame[], options: SpiderGraphOptions): SpiderData {
  const diagnostics: SpiderDiagnostic[] = [];
  const parsed =
    mode(frames, options) === 'long'
      ? parseLong(frames, options, diagnostics)
      : parseWide(frames, options, diagnostics);
  const maxAxes = Math.min(HARD_MAX_AXES, Math.max(3, Math.floor(options.maxAxes)));
  const maxSeries = Math.min(HARD_MAX_SERIES, Math.max(1, Math.floor(options.maxSeries)));
  const axes = parsed.axes.slice(0, maxAxes);
  const seriesNames = [...parsed.cells.keys()].slice(
    0,
    Math.min(maxSeries, Math.floor(HARD_MAX_CELLS / Math.max(axes.length, 1)))
  );
  if (parsed.axes.length > axes.length) {
    diagnostic(diagnostics, 'warning', 'axis-limit', `Showing ${axes.length} of ${parsed.axes.length} axes.`);
  }
  if (parsed.cells.size > seriesNames.length) {
    diagnostic(diagnostics, 'warning', 'series-limit', `Showing ${seriesNames.length} of ${parsed.cells.size} series.`);
  }

  const series: SpiderSeries[] = seriesNames.map((name) => ({
    name,
    field: parsed.fields.get(name),
    values: axes.map((axis) => {
      const values = parsed.cells.get(name)?.get(axis);
      return values?.length
        ? reduce(values, options.duplicateReducer)
        : options.missingValue === 'zero'
          ? 0
          : undefined;
    }),
  }));
  const allValues = series.flatMap((item) => item.values.filter((value): value is number => value !== undefined));
  const sharedMin = options.includeZero ? Math.min(0, ...allValues) : Math.min(...allValues);
  const sharedMax = options.includeZero ? Math.max(0, ...allValues) : Math.max(...allValues);
  const axisModels: SpiderAxis[] = axes.map((name, index) => {
    const values = series.map((item) => item.values[index]).filter((value): value is number => value !== undefined);
    const fieldMins = series
      .map((item) => item.field?.config.min)
      .filter((value): value is number => Number.isFinite(value));
    const fieldMaxes = series
      .map((item) => item.field?.config.max)
      .filter((value): value is number => Number.isFinite(value));
    let min =
      parsed.explicitMin.get(name) ??
      (options.scaleMode === 'shared' ? sharedMin : options.includeZero ? Math.min(0, ...values) : Math.min(...values));
    let max =
      parsed.explicitMax.get(name) ??
      (options.scaleMode === 'shared' ? sharedMax : options.includeZero ? Math.max(0, ...values) : Math.max(...values));
    if (fieldMins.length) {
      min = Math.min(...fieldMins);
    }
    if (fieldMaxes.length) {
      max = Math.max(...fieldMaxes);
    }
    if (!Number.isFinite(min)) {
      min = 0;
    }
    if (!Number.isFinite(max)) {
      max = min + 1;
    }
    if (max <= min) {
      max = min + Math.max(1, Math.abs(min) * 0.1);
    }
    return { name, min, max };
  });
  if (axisModels.length > 0 && axisModels.length < 3) {
    diagnostic(diagnostics, 'error', 'too-few-axes', 'A spider graph needs at least three distinct axes.');
  }
  return { axes: axisModels, series, diagnostics };
}
