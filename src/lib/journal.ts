export interface JournalDateSource {
  occurredAt?: string;
  periodStart?: string;
  periodEnd?: string;
  displayDate: string;
}

function daysInMonth(year: number, month: number): number {
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]!;
}

export function isValidJournalDate(value: string, allowMonth = false): boolean {
  if (!(allowMonth ? /^\d{4}-\d{2}(?:-\d{2})?$/ : /^\d{4}-\d{2}-\d{2}$/).test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || month > 12) return false;
  return day === undefined || (day >= 1 && day <= daysInMonth(year, month));
}

export function getJournalDateBound(value: string, edge: 'start' | 'end'): number {
  if (!isValidJournalDate(value, true)) throw new Error(`Invalid Journal date: ${value}`);
  const [year, month, day] = value.split('-').map(Number) as [number, number, number?];
  // Границы месяца используются только для сравнения, без подмены исторической точности в контенте.
  return year * 10000 + month * 100 + (day ?? (edge === 'start' ? 1 : daysInMonth(year, month)));
}

function effectiveStart(entry: JournalDateSource): number {
  return getJournalDateBound(entry.occurredAt ?? entry.periodStart ?? '', 'start');
}

function effectiveEnd(entry: JournalDateSource): number {
  return getJournalDateBound(entry.occurredAt ?? entry.periodEnd ?? '', 'end');
}

// Сначала конец исторического периода, затем начало и стабильный идентификатор записи.
export function sortJournalEntries<T extends { id: string; data: JournalDateSource }>(entries: T[]): T[] {
  return [...entries].sort((left, right) =>
    effectiveEnd(right.data) - effectiveEnd(left.data) ||
    effectiveStart(right.data) - effectiveStart(left.data) ||
    left.id.localeCompare(right.id),
  );
}

export function getJournalDate(entry: JournalDateSource): string {
  return entry.displayDate;
}

export function groupJournalEntriesByYear<T extends { data: JournalDateSource }>(entries: T[]) {
  const groups = new Map<string, T[]>();
  for (const entry of entries) {
    // Для интервала год определяется датой его окончания, чтобы не дублировать запись между годами.
    const year = (entry.data.occurredAt ?? entry.data.periodEnd ?? '').slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), entry]);
  }
  return [...groups.entries()].map(([year, yearEntries]) => ({ year, entries: yearEntries }));
}

const preservedDraftSlugs = new Set([
  'from-scenarios-to-a-system',
  'building-the-platform-node-boundary',
  'the-first-completed-payment',
]);

interface JournalPublicationSource {
  slug: string;
  status: 'draft' | 'published';
  draft?: boolean;
  homepagePosition?: number;
}

export function getVisibleJournalEntries<T extends { data: JournalPublicationSource }>(entries: T[], isDev: boolean): T[] {
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.has(entry.data.slug)) throw new Error(`Duplicate Journal slug: ${entry.data.slug}`);
    slugs.add(entry.data.slug);
  }
  return entries.filter(({ data }) =>
    !preservedDraftSlugs.has(data.slug) && (isDev || (data.status === 'published' && data.draft !== true)),
  );
}

export function getHomepageJournalEntries<T extends { data: JournalPublicationSource }>(visibleEntries: T[]): T[] {
  const entries = visibleEntries.filter(({ data }) => data.homepagePosition !== undefined);
  const positions = new Set<number>();
  for (const { data } of entries) {
    const position = data.homepagePosition!;
    if (positions.has(position)) throw new Error(`Duplicate Journal homepage position: ${position}`);
    positions.add(position);
  }
  return entries.sort((left, right) => left.data.homepagePosition! - right.data.homepagePosition!);
}
