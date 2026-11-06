---
title: "307 Hours for One Invoice"
slug: "307-hours-for-one-invoice"
type: "Retrospective"
periodStart: "2026-10"
periodEnd: "2026-10"
displayDate: "OCT 2026"
project: "PG27"
hero: {"src": "/images/journal/invoice-hidden-foundation-hydroelectric-hall.webp", "alt": "Illustrative hydroelectric turbine hall with concrete columns, machinery and warm industrial lighting"}
summary: "A simple invoice exposed gaps in sales context, document processing and authority boundaries, leading to three implementation attempts and a broader document architecture."
homeSummary: "One invoice took three attempts and an estimated 307 hours—and changed the document architecture."
status: "draft"
draft: true
---

*How a simple invoicing task led me to rethink document architecture, sales context, and responsibility boundaries in PG27.*

## One Invoice. How Hard Could It Be?

In early October, we were working on restoring and validating the Sale Runtime in PG27. As part of our internal Operational Recovery System (OSR) effort, we needed to test a corporate sale.

The scenario seemed straightforward: a buyer places an order, receives an invoice for a bank transfer, and the payment is confirmed manually.

I wasn't planning to build a document subsystem for that.

My AI agent and I had even decided to postpone the Document Manager. Why build an entire subsystem when all we needed was a single invoice?

Take the order details, add the seller's information, determine the receiving bank account, and generate the document.

Simple enough.

Or so I thought.

## The Invoice That Didn't Have Enough Data

The first serious problem appeared when we tried to gather the information needed to generate the invoice.

PG27 is built around a Sale—a business process that moves through a sequence of scenarios, events, and waiting states. The Platform manages the canonical state of the sale, while the Node executes its assigned operations in its own environment.

But generating an invoice requires more than knowing that a sale exists and is waiting for payment.

You need to know who the buyer is, who the seller is, what's being sold, in what quantities, at what prices, and which business details belong on the document.

It turned out that the Node didn't have a convenient way to retrieve the complete set of accepted Sale data for use by downstream document processing.

So we started looking at CTX-SALE.

That work led to separate mechanisms for retrieving the current sales context and its business history. We also had to preserve an important architectural boundary: canonical business facts belong to the Platform, while the Node resolves authorized local participant data within its own scope.

That's when a question came up that went far beyond invoicing.

If the Node had already received the order, why should every downstream consumer have to figure out where to get that information all over again?

Today it's a document. Tomorrow it could be accounting, economics, or another subsystem.

Building a separate fact-gathering mechanism for every consumer would eventually give us several competing representations of the same sale.

I didn't like that approach.

We needed one consistent way to retrieve accepted Sale data, not another local data collector.

## The Document Manager We Never Intended to Build

While we were sorting out the sales context, our supposedly simple task kept raising new questions.

When should the invoice be generated?

What happens if the buyer hasn't provided all the required information?

Which seller details should we use?

Where should the generated document be stored?

When the buyer opens it again, should we show the original document or generate a new version using whatever data happens to be current?

And what happens when we need a contract, an acceptance certificate, or another business document instead of an invoice?

Eventually, it became clear that document generation couldn't remain a private feature of Manual Bank.

PG27 already uses a Registry-Driven Model. System configuration defines available capabilities, their parameters, and the conditions under which they apply. I wanted documents to follow the same principle.

That's how a separate document architecture began to take shape.

We separated template definitions, document inputs, generation procedures, original-document storage, and document lifecycle management.

The Registry gained the necessary definitions and configurations. On the Node side, we introduced the Builder, Renderer, and storage mechanisms.

We also made a deliberate decision to keep generated documents on the Node. They may contain buyers' personal information, and we had no reason to turn the Platform into a centralized repository for document contents.

At some point, we had built exactly what we'd originally decided to postpone: the first version of a Document Manager.

But we still didn't have a working invoice.

## Whose Bank Details Go on the Invoice?

The next problem involved the business details of the Node owner.

PG27 separates the responsibilities of the Provider and the Local Node Admin.

The Provider manages its own profile through wAPI. The local administrator interacts with the Node through nAPI and performs operations within the permissions assigned to that role.

This allows a Provider to operate multiple isolated Nodes with different local administrators while retaining control over its canonical business details.

The invoice needed those details, but we didn't want to invent another administrative authority just to retrieve them.

We spent quite a while figuring out how the existing configuration pipeline delivered Provider, AccountBank, and Bank data to the Node.

At one point, we even considered introducing another API for retrieving trusted information.

But why create another source when we already had the Registry, configuration management, and local materialization?

We eventually returned to the existing configuration architecture.

That still left another question.

A Provider can have multiple bank accounts. Which one should appear on the invoice?

Manual Bank already had a setting for selecting the receiving account used in its payment instructions. But the document subsystem shouldn't automatically treat that selection as universal for every document.

The account selected for a particular payment method and the banking information associated with the sale aren't necessarily the same thing.

That distinction would become important later.

## The Second Attempt. I Thought the Hard Part Was Over

After all that work, I figured the next attempt at generating the invoice would be mostly mechanical.

We had the data. We had the document architecture. We could retrieve the business details.

All that remained was putting the document together.

**I was wrong.**

Invoice generation was still too tightly coupled to Manual Bank.

The AI agent had implemented part of the data preparation inside the payment mechanism itself. Locally, the approach seemed reasonable: the invoice was needed for a bank transfer, so Manual Bank would prepare everything required.

But that created a problem in PG27's architecture.

Manual Bank is one way to execute a payment. It shouldn't own the general Sale data or become the universal mechanism for preparing documents.

We had started mixing responsibilities for bank details, sales context, and document processing.

What bothered me most was that the changes were beginning to affect the Payment Runtime—an area we hadn't intended to rework just to generate an invoice.

At one point, I put it plainly: here we were, on our third attempt to implement document processing, and somehow we were back to modifying the payment runtime.

I wasn't happy with the design.

We could have kept adapting the accumulated code, adding conditions, and patching the dependencies that appeared along the way.

But that would have meant preserving an implementation that was drifting further and further from the architectural principles we'd started with.

I decided it would be better to restore a controlled baseline and rebuild the necessary procedures than to keep forcing the existing implementation into shape.

## The Third Attempt. Back to the Architecture

We restored the controlled baseline, preserving the approved architectural decisions and the Document components we still needed.

Then we began separating responsibilities, one step at a time.

CTX-SALE provides the accepted sales context.

Required Fields collects missing buyer information when the scenario calls for it.

The Node resolves authorized values from its local sources and associates them with the appropriate context.

The Document capability uses prepared inputs to generate a document and preserve its original version.

Manual Bank consumes that capability without taking ownership of how it works internally.

We also had to resolve the banking information problem.

The canonical banking context of the Sale and the account selected for a particular Manual Bank payment option were assigned distinct roles. One mechanism should no longer silently replace the data belonging to the other.

The Document Core changed as well.

Instead of building one universal mechanism that retrieves data, generates documents, manages their state, and handles viewing, we separated those procedures.

The generator creates a document from prepared inputs.

The storage mechanism preserves the original.

The viewer returns that saved document rather than regenerating it from values that may have changed since its creation.

We implemented the changes incrementally, checking each part before moving to the next.

It took time, but it allowed us to focus on getting the responsibility boundaries right instead of endlessly adapting tightly coupled implementations.

## A Buyer Shouldn't Lose Their Sale

Along the way, we discovered that generating a complete invoice also required further work on Buyer Identity.

In a corporate sale, not all buyer information is necessarily available when the Sale is created.

The Seller may provide some of it. The buyer may need to supply the rest.

So we extended the Sale flow to allow buyers to authenticate on the Node and continue their original transaction.

Signing in shouldn't wipe out an existing order or create a new Sale.

In the scenarios we validated, buyers returned to their original Sale after authentication, with the necessary context preserved.

The buyer's account dashboard remained a separate space, with a way to return to the order.

This fits one of PG27's original architectural principles: a Sale isn't a one-shot HTTP request. It's a process that can wait for an external action and then resume.

For invoicing, that meant the document subsystem could use the necessary information from an authenticated buyer without becoming responsible for managing the buyer's account.

Another seemingly small requirement had brought us back to a fundamental principle of the system.

## 307 Hours Later

By the end of October, we finally had a result.

In one validated development scenario, the invoice was generated automatically after the required information had been collected and was available for viewing.

In another, the document was created through a separate authorized operation, saved, and retrieved as the original document.

These were different tests, but together they demonstrated that document processing was no longer limited to a single procedure embedded in Manual Bank.

By my estimate, the three attempts at implementing the invoice and its supporting document architecture took **307 hours**.

**178 of those hours went into the third attempt.**

If you look only at the final result, the number seems almost absurd.

Three hundred and seven hours to generate an invoice.

But we didn't spend three hundred hours drawing an invoice.

We were figuring out who owned the sales data, how the Node should retrieve the information it needed, where Provider and LNA authority boundaries belonged, who selected the bank account, how Required Fields should be prepared, and why the document subsystem shouldn't control the Payment Runtime.

We reconsidered decisions, abandoned implementations that weren't working out, and returned to architectural principles whenever local fixes started creating new dependencies.

In the end, we got more than an invoice.

We got the foundation of a document architecture that can now evolve to support contracts, Russian universal transfer documents (UPD), and other documents associated with different stages of a Sale: before payment, after payment, and upon completion.

At the beginning of October, all I wanted was to test a corporate sale using a bank transfer.

Building a Document Manager certainly wasn't part of the plan.

**But I suppose that's one of the reasons I enjoy building systems: you never quite know which small task will force you to take a much closer look at your own architecture.**
