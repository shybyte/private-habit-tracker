export const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

export interface TimeRange {
  start: number;
  end: number;
}

export function getDateRangeOfDay(date: Date): TimeRange {
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endDate = new Date(startDate.getTime() + MILLISECONDS_IN_DAY);
  return {start: startDate.getTime(), end: endDate.getTime()};
}