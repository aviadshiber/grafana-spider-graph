import type { Field } from '@grafana/data';

export type DiagnosticSeverity = 'error' | 'warning';
export interface SpiderDiagnostic {
  code: string;
  message: string;
  severity: DiagnosticSeverity;
}
export interface SpiderAxis {
  name: string;
  min: number;
  max: number;
}
export interface SpiderSeries {
  name: string;
  values: Array<number | undefined>;
  field?: Field;
}
export interface SpiderData {
  axes: SpiderAxis[];
  series: SpiderSeries[];
  diagnostics: SpiderDiagnostic[];
}
