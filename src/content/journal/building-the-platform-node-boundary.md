---
title: Building the Platform–Node boundary
slug: building-the-platform-node-boundary
type: Retrospective
periodStart: '2026-06-24'
periodEnd: '2026-09-30'
displayDate: JUN — SEP 2026
project: PG27
hero:
  src: /images/journal/platform-node-bridge.webp
  alt: Illustrative bridge across a mountain reservoir at dusk
summary: Platform retained canonical business state and decisions while Node developed its own execution environment, local state and bounded responsibilities. Contracts and integration traces made that separation concrete, while exposing work still needed at the handoffs.
homeSummary: I separated Platform’s canonical business decisions from Node execution, then refined the contract as independent Node work and integration traces exposed practical boundaries.
status: draft
homepagePosition: 2
---

## Two kinds of responsibility

The Platform–Node boundary took shape as PG27 moved beyond the first SALE runtime. In this model, Platform owns canonical business state and makes the corresponding business decisions. Node is an independent execution environment with its own local state and configuration, responsible for work within defined boundaries and contracts.

That makes Node more than a stateless remote command handler. It has an execution context and bounded local responsibilities. The boundary determines which decisions remain canonical on Platform, which operations happen locally, and what information or result may cross between them. Local state is part of the execution model; its custody and disclosure rules developed over time and were not all settled in one decision.

This distinction also shaped configuration and data handling. Platform could retain authority over definitions and business decisions while a Node held the local material needed for its assigned work. The later rules for refresh, secrets and participant data were refined separately; the architecture should not be read as one complete custody contract established at the beginning.

## Contracts and separate implementation lines

June introduced the early Platform-to-Node protocol and intake work. In July, the architecture made Core/Platform authority and interaction contracts more explicit. Contract freezes set intended boundaries; they did not by themselves show that implementations conformed or worked together.

The Node work also followed distinct implementation histories. A standalone SALE-NODE reference line appeared in June; the later RDM repository was a separate line. I treat them as separate implementations addressing a related architectural boundary, not as one continuous codebase or a direct migration.

## Integration exposed the real boundary

August added Node runtime and payment-preparation work, but a live Core-to-Node-to-Core payment flow had not yet been demonstrated. September traces provided more concrete outcomes: a bounded Seller Connect path passed, while other paths stopped during page handling, instruction preparation or Core Required Fields resolution.

These results tested the handoffs in specific paths. They showed that architectural separation and compatible contracts were not enough by themselves: each side still had to prepare, admit and continue the work as expected. A pass in one bounded path did not resolve failures in another, and September did not demonstrate a completed payment loop.

## What the separation changed

The developing boundary gave the system a clearer division between canonical business authority and local execution. It also gave engineering work a practical way to locate responsibility when a flow stopped. By the end of September, contracts, separate implementations and observed traces had made the boundary more concrete, while integration remained incomplete.

The payment completion belongs to October. This period ends with a clearer architecture and better-defined integration questions, not with a claim that Node was merely a relay or that the whole Platform–Node system was complete.
