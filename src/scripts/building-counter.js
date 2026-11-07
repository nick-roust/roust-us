export const PROJECT_TIME_ZONE = 'Europe/Moscow';

const PROJECT_START_DATE = { year: 2026, month: 5, day: 1 };
const REFERENCE_DATE = { year: 2026, month: 10, day: 30 };
const REFERENCE_ESTIMATED_HOURS = 2400;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// Календарь проекта всегда рассчитывается в Europe/Moscow, независимо от часового пояса устройства.

const projectDateTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: PROJECT_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const projectDateLabel = new Intl.DateTimeFormat('en-GB', {
  timeZone: PROJECT_TIME_ZONE,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function getProjectDateParts(date = new Date()) {
  const values = Object.fromEntries(
    projectDateTime.formatToParts(date).map(({ type, value }) => [type, value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function dateOrdinal({ year, month, day }) {
  return Date.UTC(year, month - 1, day);
}

export function getDevelopmentCounter(date = new Date()) {
  const projectDate = getProjectDateParts(date);
  const projectOrdinal = dateOrdinal(projectDate);
  const referenceOrdinal = dateOrdinal(REFERENCE_DATE);
  const elapsedCalendarDays = Math.round((projectOrdinal - referenceOrdinal) / MILLISECONDS_PER_DAY);
  const inclusiveProjectDays = Math.round((projectOrdinal - dateOrdinal(PROJECT_START_DATE)) / MILLISECONDS_PER_DAY) + 1;

  return {
    days: inclusiveProjectDays,
    estimatedHours: REFERENCE_ESTIMATED_HOURS + elapsedCalendarDays * 10,
    dateLabel: projectDateLabel.format(date),
  };
}

export function millisecondsUntilNextProjectDay(date = new Date()) {
  const projectDate = getProjectDateParts(date);
  const wallClockAsUtc = Date.UTC(
    projectDate.year,
    projectDate.month - 1,
    projectDate.day,
    projectDate.hour,
    projectDate.minute,
    projectDate.second,
    date.getUTCMilliseconds(),
  );
  const projectOffset = wallClockAsUtc - date.getTime();
  const nextLocalMidnightAsUtc = Date.UTC(projectDate.year, projectDate.month - 1, projectDate.day + 1);
  const nextProjectBoundary = nextLocalMidnightAsUtc - projectOffset;

  return Math.max(1, nextProjectBoundary - date.getTime() + 25);
}
