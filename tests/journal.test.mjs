import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getHomepageJournalEntries,
  getJournalDateBound,
  getVisibleJournalEntries,
  groupJournalEntriesByYear,
  isValidJournalDate,
  sortJournalEntries,
} from '../src/lib/journal.ts';

function entry(slug, data = {}) {
  return { id: slug, data: { slug, status: 'draft', displayDate: 'Historical date', ...data } };
}

test('calendar validation preserves month precision and rejects invalid days', () => {
  for (const value of ['2026-10', '2026-10-02', '2024-02-29', '2000-02-29']) {
    assert.equal(isValidJournalDate(value, true), true, value);
  }
  assert.equal(isValidJournalDate('2026-10'), false);
  for (const value of ['2026-02-29', '1900-02-29', '2026-04-31', '2026-00', '2026-13', '0000-01', '2026-1', '2026-10-00', '2026-10-02T00:00:00Z']) {
    assert.equal(isValidJournalDate(value, true), false, value);
    assert.throws(() => getJournalDateBound(value, 'end'));
  }
  assert.equal(getJournalDateBound('2024-02', 'end'), 20240229);
  assert.equal(getJournalDateBound('1900-02', 'end'), 19000228);
  assert.equal(getJournalDateBound('2026-10', 'start'), 20261001);
  assert.equal(getJournalDateBound('2026-10', 'end'), 20261031);
});

test('mixed precision sorting uses end bounds then start bounds without changing source dates', () => {
  const inputs = [
    entry('day', { occurredAt: '2026-10-27' }),
    entry('wide', { periodStart: '2026-05', periodEnd: '2026-10' }),
    entry('month', { periodStart: '2026-10', periodEnd: '2026-10' }),
    entry('last-day', { occurredAt: '2026-10-31' }),
  ];
  const before = structuredClone(inputs);
  assert.deepEqual(sortJournalEntries(inputs).map(({ id }) => id), ['last-day', 'month', 'wide', 'day']);
  assert.deepEqual(inputs, before);
  const ties = [entry('b', { occurredAt: '2026-10-02' }), entry('a', { occurredAt: '2026-10-02' })];
  assert.deepEqual(sortJournalEntries(ties).map(({ id }) => id), ['a', 'b']);
  assert.ok(getJournalDateBound('2026-10-31', 'start') <= getJournalDateBound('2026-10', 'end'));
  assert.ok(getJournalDateBound('2026-11', 'start') > getJournalDateBound('2026-10', 'end'));
});

test('historical intervals are grouped only in their end year', () => {
  const entries = sortJournalEntries([
    entry('cross-year', { periodStart: '2025-12', periodEnd: '2026-01' }),
    entry('previous', { occurredAt: '2025-12-31' }),
  ]);
  assert.deepEqual(groupJournalEntriesByYear(entries).map(({ year, entries }) => [year, entries.map(({ id }) => id)]), [
    ['2026', ['cross-year']], ['2025', ['previous']],
  ]);
});

test('DEV previews drafts while production requires published status without a draft flag', () => {
  const entries = [
    entry('new-draft', { draft: true }),
    entry('old-draft'),
    entry('contradictory', { status: 'published', draft: true }),
    entry('future-project', { status: 'published', draft: false }),
    entry('legacy-published', { status: 'published' }),
  ];
  assert.equal(getVisibleJournalEntries(entries, true).length, 5);
  assert.deepEqual(getVisibleJournalEntries(entries, false).map(({ id }) => id), ['future-project', 'legacy-published']);
});

test('preserved J01–J03 cannot become duplicate entries or homepage cards in either environment', () => {
  const old = ['from-scenarios-to-a-system', 'building-the-platform-node-boundary', 'the-first-completed-payment']
    .map((slug, index) => entry(slug, { status: 'published', homepagePosition: index + 1 }));
  const current = [3, 1, 2].map((position) => entry(`current-${position}`, { draft: true, homepagePosition: position }));
  for (const isDev of [true, false]) {
    const visible = getVisibleJournalEntries([...old, ...current], isDev);
    assert.deepEqual(visible, isDev ? current : []);
    assert.deepEqual(getHomepageJournalEntries(visible).map(({ id }) => id), isDev ? ['current-1', 'current-2', 'current-3'] : []);
  }
});

test('duplicate routes and homepage positions fail explicitly', () => {
  assert.throws(() => getVisibleJournalEntries([entry('same'), entry('same')], true), /Duplicate Journal slug/);
  assert.throws(() => getHomepageJournalEntries([
    entry('one', { homepagePosition: 1 }), entry('two', { homepagePosition: 1 }),
  ]), /Duplicate Journal homepage position/);
});
