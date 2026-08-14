import { FieldType, toDataFrame } from '@grafana/data';
import { defaultOptions } from '../types';
import { parseSpiderData } from './parser';

describe('parseSpiderData', () => {
  it('parses wide data and builds per-axis domains', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'Axis', type: FieldType.string, values: ['Speed', 'Quality', 'Cost'] },
        { name: 'Alpha', type: FieldType.number, values: [8, 50, 3] },
        { name: 'Beta', type: FieldType.number, values: [6, 70, 4] },
      ],
    });
    const result = parseSpiderData([frame], defaultOptions);
    expect(result.axes.map((axis) => axis.name)).toEqual(['Speed', 'Quality', 'Cost']);
    expect(result.series.map((series) => series.name)).toEqual(['Alpha', 'Beta']);
    expect(result.axes.map(({ min, max }) => [min, max])).toEqual([
      [0, 8],
      [0, 70],
      [0, 4],
    ]);
  });

  it('pivots long data and reduces duplicate cells', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'axis', type: FieldType.string, values: ['A', 'A', 'B', 'C'] },
        { name: 'series', type: FieldType.string, values: ['One', 'One', 'One', 'One'] },
        { name: 'value', type: FieldType.number, values: [2, 3, 4, 5] },
      ],
    });
    const result = parseSpiderData([frame], { ...defaultOptions, dataMode: 'long', duplicateReducer: 'sum' });
    expect(result.series[0].values).toEqual([5, 4, 5]);
  });

  it('keeps nulls as gaps and diagnoses non-finite input', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'Axis', type: FieldType.string, values: ['A', 'B', 'C'] },
        { name: 'One', type: FieldType.number, values: [1, null, Number.POSITIVE_INFINITY] },
      ],
    });
    const result = parseSpiderData([frame], defaultOptions);
    expect(result.series[0].values).toEqual([1, undefined, undefined]);
    expect(result.diagnostics).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'invalid-value' })]));
  });

  it('enforces configured limits with diagnostics', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'Axis', type: FieldType.string, values: ['A', 'B', 'C', 'D'] },
        { name: 'One', type: FieldType.number, values: [1, 2, 3, 4] },
        { name: 'Two', type: FieldType.number, values: [4, 3, 2, 1] },
      ],
    });
    const result = parseSpiderData([frame], { ...defaultOptions, maxAxes: 3, maxSeries: 1 });
    expect(result.axes).toHaveLength(3);
    expect(result.series).toHaveLength(1);
    expect(result.diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining(['axis-limit', 'series-limit']));
  });

  it('does not silently fall back when an explicit mapping is wrong', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'Axis', type: FieldType.string, values: ['A', 'B', 'C'] },
        { name: 'One', type: FieldType.number, values: [1, 2, 3] },
      ],
    });
    const result = parseSpiderData([frame], { ...defaultOptions, axisField: 'Not present' });
    expect(result.series).toHaveLength(0);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'missing-axis-field', severity: 'error' })])
    );
  });
});
