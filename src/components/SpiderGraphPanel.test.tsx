import React from 'react';
import { FieldType, LoadingState, toDataFrame, type PanelProps } from '@grafana/data';
import { render, screen } from '@testing-library/react';
import { defaultOptions, type SpiderGraphOptions } from '../types';
import { SpiderGraphPanel } from './SpiderGraphPanel';

jest.mock('@grafana/ui', () => ({
  useTheme2: () => ({
    colors: { border: { weak: '#888' }, text: { primary: '#111' }, background: { primary: '#fff' } },
    visualization: { getColorByName: () => '#5794f2' },
  }),
}));

const frame = toDataFrame({
  fields: [
    { name: 'Axis', type: FieldType.string, values: ['Speed', 'Quality', 'Cost'] },
    { name: 'Alpha', type: FieldType.number, values: [8, 5, 3] },
  ],
});

function props(options: Partial<SpiderGraphOptions> = {}): PanelProps<SpiderGraphOptions> {
  return {
    data: { series: [frame], state: LoadingState.Done, timeRange: {} as never },
    options: { ...defaultOptions, ...options },
    width: 500,
    height: 400,
    id: 1,
    title: 'Test',
    fieldConfig: { defaults: {}, overrides: [] },
    timeRange: {} as never,
    timeZone: 'utc',
    transparent: false,
    renderCounter: 1,
    replaceVariables: (value) => value,
    onOptionsChange: jest.fn(),
    onFieldConfigChange: jest.fn(),
    onChangeTimeRange: jest.fn(),
    eventBus: {} as never,
  };
}

describe('SpiderGraphPanel', () => {
  it('renders accessible chart semantics and focusable values', () => {
    render(<SpiderGraphPanel {...props()} />);
    expect(screen.getByRole('img', { name: /spider graph with 3 axes and 1 series/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /alpha, speed: 8/i })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('button', { name: 'Alpha' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders the raw-value table on request', () => {
    render(<SpiderGraphPanel {...props({ showAccessibleTable: true })} />);
    expect(screen.getByRole('table', { name: 'Spider graph values' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '8' })).toBeInTheDocument();
  });
});
