export const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

export interface TimeRange {
  start: number;
  end: number;
}

function getBeginningOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDateRangeOfDay(date: Date): TimeRange {
  const startDate = getBeginningOfDay(date);
  const endDate = new Date(startDate.getTime() + MILLISECONDS_IN_DAY);
  return {start: startDate.getTime(), end: endDate.getTime()};
}

export function getDateForHour(date: Date, hour: number) {
  const result = getBeginningOfDay(date);
  result.setHours(hour);
  return result;
}

export function getUrlParameter(nameArg: string) {
  const name = nameArg.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}