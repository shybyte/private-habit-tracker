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

export function getUrlParameter(nameArg: string) {
  const name = nameArg.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}