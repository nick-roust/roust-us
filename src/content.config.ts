import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { getJournalDateBound, isValidJournalDate } from './lib/journal';

const pointDate = z.string().refine((value) => isValidJournalDate(value), 'Expected a valid YYYY-MM-DD date.');
const periodDate = z.string().refine((value) => isValidJournalDate(value, true), 'Expected a valid YYYY-MM or YYYY-MM-DD date.');

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: z.enum(['Milestone', 'Engineering Note', 'Visual Story', 'Publication', 'Retrospective']),
    occurredAt: pointDate.optional(),
    periodStart: periodDate.optional(),
    periodEnd: periodDate.optional(),
    displayDate: z.string(),
    publishedAt: pointDate.optional(),
    project: z.string(),
    hero: z.object({ src: z.string().startsWith('/'), alt: z.string().min(1) }).optional(),
    summary: z.string().min(1),
    homeSummary: z.string().min(1).optional(),
    status: z.enum(['draft', 'published']).default('draft'),
    draft: z.boolean().optional(),
    homepagePosition: z.number().int().min(1).max(3).optional(),
    researchEventIds: z.array(z.string()).default([]),
    reviewNotes: z.array(z.string()).default([]),
    disclosureReviewRequired: z.boolean().default(true),
  }).superRefine((entry, context) => {
    const hasPointDate = Boolean(entry.occurredAt);
    const hasPeriod = Boolean(entry.periodStart || entry.periodEnd);
    if (hasPointDate === hasPeriod || (hasPeriod && (!entry.periodStart || !entry.periodEnd))) {
      context.addIssue({ code: 'custom', message: 'Provide either occurredAt or both periodStart and periodEnd.' });
    }
    if (entry.periodStart && entry.periodEnd
      && isValidJournalDate(entry.periodStart, true) && isValidJournalDate(entry.periodEnd, true)
      && getJournalDateBound(entry.periodStart, 'start') > getJournalDateBound(entry.periodEnd, 'end')) {
      context.addIssue({ code: 'custom', message: 'periodEnd must not precede periodStart.' });
    }
    if (entry.status === 'published' && !entry.publishedAt) {
      context.addIssue({ code: 'custom', message: 'Published entries require a separate publishedAt date.' });
    }
    if (entry.status === 'published' && entry.draft === true) {
      context.addIssue({ code: 'custom', message: 'A published entry cannot be marked draft.' });
    }
    if (entry.homepagePosition !== undefined && !entry.hero) {
      context.addIssue({ code: 'custom', message: 'Homepage stories require a reviewed hero image.' });
    }
  }),
});

export const collections = { journal };
