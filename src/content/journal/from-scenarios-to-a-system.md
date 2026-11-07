---
title: From scenarios to a system
slug: from-scenarios-to-a-system
type: Retrospective
periodStart: '2026-04-09'
periodEnd: '2026-07-03'
displayDate: APR — JUL 2026
project: PG27
hero:
  src: /images/journal/scenario-road.webp
  alt: Illustrative mountain road interchange at dusk
summary: A scenario that could wait and resume became a thin SALE implementation in May, followed by staged runtime development through July. The broader architecture and its acceptance remained works in progress.
homeSummary: I shaped a sale as a scenario that waits for an event and resumes, then developed that principle through a first SALE implementation and staged runtime work.
status: draft
homepagePosition: 1
---

## A model for interrupted work

My earliest dated PG27 architecture notes point to one operating principle: a sale can advance as a scenario, wait for an event, and resume at a defined point. This gives an asynchronous process continuity. A buyer may need to act; a payment result may arrive later. The scenario provides a place to hold the work and a rule for what should happen next.

April 9 dates this principle; the wider architecture took shape across documents describing sale, payment and delivery contours, and relationships among scenarios, modules and events. The design expanded over time. The full architecture was not approved all at once on April 9, and its boundaries did not all become final together.

AI assistance was part of the design-to-implementation workflow: I used it to explore and materialize the direction as implementation capabilities emerged. The architectural choices remained the thread connecting the evolving model to the runtime.

## From principle to a first SALE slice

In May, the scenario model took its first code-backed form. A thin SALE path normalized an incoming request, advanced through scenario stages, waited for buyer action or a payment result, and continued toward a completion event. The important step was making the pause and continuation explicit in an implementation rather than leaving them only in an architectural description.

The May result was a first slice, not a complete runtime. The code materialized these stages, but the MVP as a whole had no established acceptance or preserved end-to-end test result. Recovery and behavior beyond the implemented path remained open engineering work.

## Building the runtime in stages

During June and July, the runtime acquired more explicit stages around resolving sale and payment choices, preparing activation and payment instructions, and registering waits for later continuation. The design moved toward a runtime that could hand work between a current Sale state and the next action while keeping execution responsibilities visible.

Those stages extended the architectural direction, but they do not imply that every later component descended directly from the May implementation. Universal replay, recovery and completion across all paths were not established. July work included runtime slices and formalized contracts; neither a declared boundary nor a frozen contract alone shows that all runtime behavior was validated.

## An evolving system, not a finished one

By July, the original scenario/event/wait/resume principle had informed a thin implementation and a more structured runtime. The design had become more concrete as implementation capabilities appeared, while the limits of each stage remained visible. Broader April decision dates, complete recovery behavior and overall acceptance were still unresolved.

That is the architectural progression: a focused execution principle, a first SALE slice, then staged runtime development. It established a foundation for later integration work without claiming that the complete PG27 architecture or payment system was already finished.
