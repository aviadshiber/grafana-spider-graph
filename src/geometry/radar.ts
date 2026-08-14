import type { SpiderAxis, SpiderSeries } from '../data';

export interface Point {
  x: number;
  y: number;
}

export function normalizedValue(value: number, axis: SpiderAxis, clamp: boolean): number {
  const normalized = (value - axis.min) / (axis.max - axis.min);
  return clamp ? Math.max(0, Math.min(1, normalized)) : normalized;
}

export function polarPoint(
  index: number,
  count: number,
  radius: number,
  center: Point,
  startAngle: number,
  clockwise: boolean
): Point {
  const direction = clockwise ? 1 : -1;
  const angle = ((startAngle + (direction * (360 * index)) / count) * Math.PI) / 180;
  return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
}

export function seriesPoints(
  series: SpiderSeries,
  axes: SpiderAxis[],
  radius: number,
  center: Point,
  startAngle: number,
  clockwise: boolean,
  clamp: boolean
): Array<Point | undefined> {
  return axes.map((axis, index) => {
    const value = series.values[index];
    return value === undefined
      ? undefined
      : polarPoint(index, axes.length, radius * normalizedValue(value, axis, clamp), center, startAngle, clockwise);
  });
}

export function closedSegments(points: Array<Point | undefined>): string[] {
  if (points.some((point) => point === undefined)) {
    const segments: string[] = [];
    let current: Point[] = [];
    for (const point of [...points, undefined]) {
      if (point) {
        current.push(point);
      } else if (current.length) {
        segments.push(current.map((item) => `${item.x},${item.y}`).join(' '));
        current = [];
      }
    }
    return segments;
  }
  return [points.map((point) => `${point!.x},${point!.y}`).join(' ')];
}
