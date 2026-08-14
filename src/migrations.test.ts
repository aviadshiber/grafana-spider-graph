import { defaultOptions, OPTIONS_SCHEMA_VERSION } from './types';
import { migrateOptions } from './migrations';

describe('option migration', () => {
  it('fills defaults for missing and malformed options', () => {
    expect(migrateOptions(undefined)).toEqual(defaultOptions);
    expect(migrateOptions({ gridLevels: 999, dataMode: 'bad', fillOpacity: -2 })).toMatchObject({
      gridLevels: 10,
      dataMode: 'auto',
      fillOpacity: 0,
    });
  });

  it('is idempotent and preserves valid field mappings', () => {
    const once = migrateOptions({ schemaVersion: 0, dataMode: 'long', axisField: ' metric ', maxAxes: 12 });
    expect(migrateOptions(once)).toEqual(once);
    expect(once).toMatchObject({
      schemaVersion: OPTIONS_SCHEMA_VERSION,
      dataMode: 'long',
      axisField: 'metric',
      maxAxes: 12,
    });
  });
});
