import { FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { SpiderGraphPanel } from './components/SpiderGraphPanel';
import { migrationHandler } from './migrations';
import { defaultOptions, type SpiderGraphOptions } from './types';

const options = <const T extends string>(items: ReadonlyArray<{ label: string; value: T }>) => ({
  settings: { options: [...items] },
});

export const plugin = new PanelPlugin<SpiderGraphOptions>(SpiderGraphPanel)
  .setMigrationHandler(migrationHandler)
  .useFieldConfig({
    standardOptions: {
      [FieldConfigProperty.DisplayName]: {},
      [FieldConfigProperty.Color]: {},
      [FieldConfigProperty.Unit]: {},
      [FieldConfigProperty.Decimals]: {},
      [FieldConfigProperty.Min]: {},
      [FieldConfigProperty.Max]: {},
    },
  })
  .setPanelOptions((builder) =>
    builder
      .addSelect({
        path: 'dataMode',
        name: 'Data mode',
        category: ['Data'],
        defaultValue: defaultOptions.dataMode,
        ...options([
          { value: 'auto', label: 'Auto-detect' },
          { value: 'wide', label: 'Wide table' },
          { value: 'long', label: 'Long table' },
        ]),
      })
      .addTextInput({
        path: 'axisField',
        name: 'Axis field',
        category: ['Data'],
        description: 'String field containing axis names. Empty means auto-detect.',
      })
      .addTextInput({
        path: 'seriesField',
        name: 'Series field',
        category: ['Data', 'Long table'],
        showIf: (value) => value.dataMode !== 'wide',
      })
      .addTextInput({
        path: 'valueField',
        name: 'Value field',
        category: ['Data', 'Long table'],
        showIf: (value) => value.dataMode !== 'wide',
      })
      .addSelect({
        path: 'duplicateReducer',
        name: 'Duplicate values',
        category: ['Data'],
        defaultValue: defaultOptions.duplicateReducer,
        ...options([
          { value: 'last', label: 'Last' },
          { value: 'sum', label: 'Sum' },
          { value: 'mean', label: 'Mean' },
          { value: 'min', label: 'Minimum' },
          { value: 'max', label: 'Maximum' },
        ]),
      })
      .addSelect({
        path: 'missingValue',
        name: 'Missing values',
        category: ['Data'],
        defaultValue: defaultOptions.missingValue,
        ...options([
          { value: 'gap', label: 'Leave a gap' },
          { value: 'zero', label: 'Use zero' },
        ]),
      })
      .addSelect({
        path: 'scaleMode',
        name: 'Scale',
        category: ['Scale'],
        defaultValue: defaultOptions.scaleMode,
        ...options([
          { value: 'per-axis', label: 'Per axis' },
          { value: 'shared', label: 'Shared domain' },
        ]),
      })
      .addTextInput({
        path: 'minField',
        name: 'Minimum field',
        category: ['Scale'],
        description: 'Optional numeric field containing a minimum for each axis.',
      })
      .addTextInput({
        path: 'maxField',
        name: 'Maximum field',
        category: ['Scale'],
        description: 'Optional numeric field containing a maximum for each axis.',
      })
      .addBooleanSwitch({
        path: 'includeZero',
        name: 'Include zero',
        category: ['Scale'],
        defaultValue: defaultOptions.includeZero,
      })
      .addBooleanSwitch({
        path: 'clampValues',
        name: 'Clamp to domain',
        category: ['Scale'],
        defaultValue: defaultOptions.clampValues,
      })
      .addSliderInput({
        path: 'gridLevels',
        name: 'Grid levels',
        category: ['Display'],
        defaultValue: defaultOptions.gridLevels,
        settings: { min: 1, max: 10, step: 1 },
      })
      .addSliderInput({
        path: 'startAngle',
        name: 'Start angle',
        category: ['Display'],
        defaultValue: defaultOptions.startAngle,
        settings: { min: -180, max: 180, step: 5 },
      })
      .addBooleanSwitch({
        path: 'clockwise',
        name: 'Clockwise',
        category: ['Display'],
        defaultValue: defaultOptions.clockwise,
      })
      .addBooleanSwitch({
        path: 'showAxisLabels',
        name: 'Show axis labels',
        category: ['Display'],
        defaultValue: defaultOptions.showAxisLabels,
      })
      .addBooleanSwitch({
        path: 'showValues',
        name: 'Show point values',
        category: ['Display'],
        defaultValue: defaultOptions.showValues,
      })
      .addSliderInput({
        path: 'fillOpacity',
        name: 'Fill opacity',
        category: ['Series'],
        defaultValue: defaultOptions.fillOpacity,
        settings: { min: 0, max: 0.8, step: 0.05 },
      })
      .addSliderInput({
        path: 'lineWidth',
        name: 'Line width',
        category: ['Series'],
        defaultValue: defaultOptions.lineWidth,
        settings: { min: 0, max: 10, step: 1 },
      })
      .addSliderInput({
        path: 'pointRadius',
        name: 'Point radius',
        category: ['Series'],
        defaultValue: defaultOptions.pointRadius,
        settings: { min: 0, max: 12, step: 1 },
      })
      .addSelect({
        path: 'legendPlacement',
        name: 'Legend',
        category: ['Legend'],
        defaultValue: defaultOptions.legendPlacement,
        ...options([
          { value: 'bottom', label: 'Bottom' },
          { value: 'right', label: 'Right' },
          { value: 'hidden', label: 'Hidden' },
        ]),
      })
      .addBooleanSwitch({
        path: 'useDashPatterns',
        name: 'Different line patterns',
        category: ['Accessibility'],
        defaultValue: defaultOptions.useDashPatterns,
      })
      .addBooleanSwitch({
        path: 'showAccessibleTable',
        name: 'Show value table',
        category: ['Accessibility'],
        defaultValue: defaultOptions.showAccessibleTable,
      })
      .addSliderInput({
        path: 'maxAxes',
        name: 'Maximum axes',
        category: ['Limits'],
        defaultValue: defaultOptions.maxAxes,
        settings: { min: 3, max: 100, step: 1 },
      })
      .addSliderInput({
        path: 'maxSeries',
        name: 'Maximum series',
        category: ['Limits'],
        defaultValue: defaultOptions.maxSeries,
        settings: { min: 1, max: 100, step: 1 },
      })
  );
