---
title: "I Didn't Want AI to Design My System for Me"
slug: "registry-and-configuration-authority"
type: "Retrospective"
periodStart: "2026-05"
periodEnd: "2026-10"
displayDate: "MAY — OCT 2026"
project: "PG27"
hero: {"src": "/images/journal/platform-node-bridge.webp", "alt": "Illustrative bridge across a mountain reservoir at dusk"}
summary: "Excel-authored definitions, the Registry and versioned configurations helped preserve architectural authority as PG27 and its AI-assisted implementation grew."
homeSummary: "I used definitions and versioned configurations to keep fast implementation aligned with the architecture."
status: "draft"
draft: true
homepagePosition: 2
---

*How Excel, a Registry, and versioned configurations helped me stay in control of PG27's architecture—and why development speed turned out to be the easier problem.*

## Everything Should Be Configurable

When I started designing PG27, I had an idea that was simple enough to describe: I wanted to manage virtually any system parameter from an admin interface.

Not just select a payment route from a set of prewritten procedures. Not fill in a settings table for yet another handler. I wanted to assemble procedures from definitions, parameters, and values—something like the registry editor in an operating system.

You can build a system without a Registry. But then the exceptions start piling up: a separate handler for one operation, an extra field for another, a special condition in the code for a third. Eventually, every new capability becomes more dependent on whatever was hardcoded before it.

I wanted to avoid that from the beginning. But another tension soon emerged: AI could produce working code faster than I could assess whether each local solution was undermining the architecture as a whole.

One more distinction matters. PG27 was never intended to be a bank or just another payment system. It's a transaction platform designed to manage the full sales lifecycle through configurable scenarios. Payment is only one operation within that process. And the process might start in a browser, a self-service kiosk, or an interface we aren't even using yet.

In a system like that, configuration isn't a nice feature of the admin panel. It's part of the foundation.

## The MVP That Made Us Too Optimistic

In May 2026, I put together the first MVP. I wanted to find out whether AI could help build a project of this complexity.

The speed was impressive. So impressive that I told my partners the new platform would be ready by the end of June. AI was giving me much the same estimate: late June, sometimes mid-July.

We were both wrong.

The problem wasn't that AI couldn't write code quickly. It was doing that quite well. The problem surfaced when we started building the foundation: putting individual pieces together quickly and building a coherent architecture are two very different things.

I could have handed the entire database design to an agent. It would have proposed tables, relationships, and handlers, then carried on implementing them.

But I would have risked ending up with exactly what I was trying to avoid: a system of my own whose inner workings I had to take on faith.

I didn't just need working code. I needed to understand why the system was built the way it was.

## Excel Instead of Magic

The solution was surprisingly simple: we started assembling the source definitions in Excel.

It's important to get the roles right here. Excel didn't control the running platform, and it wasn't a substitute for a database. It was my design tool. I defined the parameters and PRM structures by hand, following a model we had agreed on together.

I deliberately kept that part out of AI's hands. If the agent started changing the source tables itself, I would gradually lose track of what was going into the system.

Then came a converter that turned the Excel workbook into a bundle of Registry definitions. I also built my own validator so I could get clear feedback before the bundle entered the Platform. AI consumed the prepared, converted bundle and implemented the processing mechanisms inside the Platform.

That gave us a division of labor I was comfortable with: I owned the declarative foundation, the tools handled conversion and validation, and AI implemented the approved mechanisms in code.

Of course, we hadn't anticipated every parameter. New requirements emerged as we worked through specific situations. That's how we arrived at policies for viewing, editing, and storing data—including the principle that secrets and personal information should remain local to the Node.

The architecture didn't need to predict every future task. It needed to let us add new definitions without breaking the model we already had.

## The Computer Finally Booted

Over time, the Registry gained family domains, internal revisions, and versioned configurations. But definitions alone don't give you a way to operate a system.

We needed a lifecycle: rules governing how a configuration moves from Draft to Active and eventually to Archive. And the lifecycle rules themselves evolved and acquired versions of their own.

That took roughly a month and a half. There were plenty of moments when what I wanted turned out not to be quite what we needed.

Once we loaded the lifecycle policy and connected the admin interface, we could create configurations from PRM definitions and manage their states.

To me, it felt like **the computer had finally booted and displayed its first working screen**.

No, we hadn't completed our first sale yet. That was still about two months away. We had to assemble the participants, their interfaces, registration flows, configurations, and the interactions between Platform and Node.

But the system now had a working mechanism for creating and managing its own configurations. For me, that was the first big win.

Versioning turned out to be especially important. If a Sale began under one configuration, changing the settings later shouldn't erase the conditions under which that Sale was accepted. The ability to refer back to historical revisions was built into the model for precisely that reason.

## The Admin Panel Wasn't the Center of the Universe

Originally, I wanted one universal admin panel. As PG27 developed, though, my understanding of who should control what began to change.

The Platform retained Runtime Viewer. It lets us observe system state, sales history, accounts, participants, and configurations, and update PRM definitions and baseline CFGs.

But route configuration moved to the participants: the Node owner, the Seller, and the Buyer—each through APIs and within their own authority.

That aligned with another fundamental PG27 boundary: **the Platform makes decisions; the Node executes them**. At the same time, a Node must be independently installable and manageable by its owner, not merely a remote screen for the central system.

In July, we had to revisit the Platform–Node interaction model proposed by AI. A PUSH API implementation didn't fit my requirement for independent Node installation and management. That's a larger story of its own.

For the Registry, the implication was different: common definitions and rules stay consistent, while control over permitted configurations is distributed among participants.

And this is where AI came back into the picture.

With a few dozen parameters, a person can still work through the documentation. With hundreds of parameters, each with its own constraints and relationships, assembling a configuration for a particular business case becomes a very different challenge.

At one point, my assistant said something along these lines: “Nikolaich, the future is API/AI-first. Your beloved admin panels are going to matter to very few people.”

It was a teasing remark, but the point was sound. A business owner shouldn't have to study every setting. They should be able to describe what they need, while AI works with the declarative model through authorized APIs.

That doesn't mean AI controls the Platform itself, or that a Node has to contain a built-in agent. The architecture exposes definitions and operations that an external AI client can use. Decisions and authority remain where the system assigns them.

## Even Your Own AI Needs to Be Kept Inside the Registry Model

That approach came with an unexpected cost.

As the Registry grows, it gets harder for an agent to navigate all the definitions that already exist. It may fail to find the right parameter and propose a new table, a special-purpose procedure, or a hardcoded condition instead.

The local solution might even work. But accept enough of those solutions, and before long you're back to a system built out of exceptions—the very thing we set out to avoid.

So I constantly have to check not only **what** AI implemented, but **how** it implemented it. Sometimes the right answer isn't to write another mechanism. It's to find the capability that's already defined in the Registry.

Today, the source workbook contains 231 sheets, including 41 PRM sheets. I estimated roughly 400 parameters back in late July or early August. There are probably more after the subsequent development work, but I haven't done a current count.

Those aren't 400 combinations or 231 ready-made scenarios. They're source definitions from which specific configurations are assembled under the relevant policies and constraints.

The Registry doesn't eliminate the need for architectural discipline. It makes that discipline an everyday responsibility.

## Three PRMs and Six Reference Catalogs

A good example came later, when we started working on documents.

I've already told the story of how generating a single Invoice turned into building a Document subsystem and reconsidering the responsibility boundaries of several components. But there's another side to that story.

The document model required **three new PRMs and six reference catalogs**.

That doesn't mean we built document processing without writing code. The Builder, Renderer, input preparation, storage, and viewing mechanisms all needed implementation.

But we didn't have to invent a separate configuration system for documents. The new functional area got its definitions within the model we'd been building from the start.

In May, I was assembling PRMs by hand in Excel because I wanted to understand how my own system worked. A few months later, that same configuration architecture could accommodate an entirely new document domain.

That's why I wanted the Registry in the first place.

I wasn't trying to build a system that would never need another code change. I wanted to build one where every new capability wouldn't begin as another exception to our own rules.

**And perhaps the hardest part of working with AI hasn't been teaching it to write code. It's been making sure the speed of writing code doesn't destroy the architecture we set out to build.**
