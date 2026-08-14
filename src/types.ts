export const OPTIONS_SCHEMA_VERSION = 1;

export type DataMode = 'auto' | 'wide' | 'long';
export type DuplicateReducer = 'sum' | 'mean' | 'min' | 'max' | 'last';
export type MissingValueMode = 'gap' | 'zero';
export type ScaleMode = 'per-axis' | 'shared';
export type LegendPlacement = 'bottom' | 'right' | 'hidden';

export interface SpiderGraphOptions {
  schemaVersion: number;
  dataMode: DataMode;
  axisField?: string;
  seriesField?: string;
  valueField?: string;
  minField?: string;
  maxField?: string;
  duplicateReducer: DuplicateReducer;
  missingValue: MissingValueMode;
  scaleMode: ScaleMode;
  includeZero: boolean;
  clampValues: boolean;
  gridLevels: number;
  startAngle: number;
  clockwise: boolean;
  showAxisLabels: boolean;
  showValues: boolean;
  fillOpacity: number;
  lineWidth: number;
  pointRadius: number;
  legendPlacement: LegendPlacement;
  showAccessibleTable: boolean;
  useDashPatterns: boolean;
  maxAxes: number;
  maxSeries: number;
}

export const defaultOptions: SpiderGraphOptions = {
  schemaVersion: OPTIONS_SCHEMA_VERSION,
  dataMode: 'auto',
  duplicateReducer: 'last',
  missingValue: 'gap',
  scaleMode: 'per-axis',
  includeZero: true,
  clampValues: true,
  gridLevels: 5,
  startAngle: -90,
  clockwise: true,
  showAxisLabels: true,
  showValues: false,
  fillOpacity: 0.18,
  lineWidth: 2,
  pointRadius: 3,
  legendPlacement: 'bottom',
  showAccessibleTable: false,
  useDashPatterns: true,
  maxAxes: 24,
  maxSeries: 20,
};
