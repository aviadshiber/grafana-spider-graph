import fc from 'fast-check';
import { closedSegments, normalizedValue, polarPoint, seriesPoints } from './radar';

describe('radar geometry', () => {
  it('keeps finite polar points on the requested radius', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 3, max: 100 }),
        fc.double({ min: 1, max: 1000, noNaN: true }),
        (index, count, radius) => {
          const point = polarPoint(index % count, count, radius, { x: 0, y: 0 }, -90, true);
          expect(Math.hypot(point.x, point.y)).toBeCloseTo(radius, 8);
        }
      )
    );
  });

  it('clamps normalized values when requested', () => {
    expect(normalizedValue(-5, { name: 'A', min: 0, max: 10 }, true)).toBe(0);
    expect(normalizedValue(15, { name: 'A', min: 0, max: 10 }, true)).toBe(1);
  });

  it('preserves missing values as disconnected segments', () => {
    const axes = ['A', 'B', 'C'].map((name) => ({ name, min: 0, max: 10 }));
    const points = seriesPoints(
      { name: 'S', values: [2, undefined, 8] },
      axes,
      100,
      { x: 100, y: 100 },
      -90,
      true,
      true
    );
    expect(closedSegments(points)).toHaveLength(2);
  });
});
