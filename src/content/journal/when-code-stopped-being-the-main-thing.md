---
title: "When Code Stopped Being the Main Thing"
slug: "when-code-stopped-being-the-main-thing"
type: "Retrospective"
periodStart: "2026-03"
periodEnd: "2026-06"
displayDate: "MAR — JUN 2026"
project: "PG27"
hero: {"src": "/images/journal/scenario-road.webp", "alt": "Illustrative mountain road interchange at dusk"}
summary: "A March experiment with AI led from a familiar payment architecture to PG27—and changed the question from how quickly to build to what was worth building."
homeSummary: "An AI experiment changed how I valued architecture—and what I wanted to build next."
status: "draft"
draft: true
homepagePosition: 1
---

*How a small experiment with AI changed the way I thought about architecture—and led to the creation of PG27.*

## One Week in March

In March 2026, I had no plans to build a new transaction platform.

I had a specific task for Paysto, a system whose architecture I'd been designing and developing since 2009. I wanted a test environment for connecting online stores. It needed to verify not only that a store could communicate with the system, but also that its owner controlled the domain—by placing a designated TXT record in the domain's DNS settings.

I liked the task. It had enough technical detail to make it interesting, but it didn't call for rethinking the entire platform.

I knew PHP and NGINX well. What I didn't know yet was how to work with Codex. So I built the test environment directly with ChatGPT: we'd discuss an approach, I'd ask for an implementation, test it, and come back with corrections.

A week later, everything I'd set out to build was working.

Today, that sounds like a relatively straightforward project. It didn't feel that way then. I suddenly realized I could build not just a small utility, but a complete technical mechanism that would previously have required developers, time, and a budget.

And that gave me an idea that would make the next few months of my life considerably more interesting.

## What If I Built a New Platform?

By then, Paysto had lived a long engineering life. Seventeen years of development meant more than accumulated features. It meant decisions made under circumstances that were very different from today's.

The platform was written in C#. Continuing to develop it meant spending more and more effort working within an architecture conceived back in 2009. Commissioning an entirely new system wasn't especially attractive either: long timelines, substantial costs, and, given the economic climate, a rather bleak outlook for recovering that investment anytime soon.

After the March experiment, I decided to test a different possibility: how far could we get with AI?

I started with Paysto's architecture. I knew how it worked, which decisions had held up well, and what capabilities I'd wanted to add for years.

By the end of April, I'd outlined the architecture of a future platform. In early May, the assistant and I agreed on a basic model and prepared the first documentation.

It was all much simpler than the PG27 we have today.

There was a global scenario, a Core, and a Proxy Shop. No independently installed Node, no cross-repository engineering team, and no mature Registry system. Looking back, the Proxy Shop was effectively part of the Platform.

But that was enough for the first experiment. I needed to see whether the idea could become a working system at all.

## The Result That Upset Me

By May 12, I could already see a complete buyer flow and the interfaces for each participant.

We'd built all of it with a chat assistant. No Codex.

You'd think I'd be delighted. Not long before, work like this would have required a whole team. Now I was looking at a familiar architectural model taking working shape in a matter of weeks.

And, unexpectedly, I was upset.

Part of it was the sheer accessibility of implementation. The other part was having to reconsider the value of something I'd invested years of work in.

If a familiar system could be reproduced this quickly, where was the real value of all that work?

The answer wasn't in the source code.

**The value was in the architecture—in the decisions that made the system possible and allowed it to evolve.**

Without those decisions, there would have been nothing to reproduce. AI hadn't erased seventeen years of engineering experience. It had made me see what those years had produced from a different angle.

Then came an even more uncomfortable question: if I could recreate a familiar architecture so quickly, why recreate that particular architecture at all?

## A Nokia 3210 Running Android

Trying to develop an architecture conceived in 2009 to meet new demands increasingly felt like taking a Nokia 3210 and trying to install Android on it.

Not because the old decisions were bad. They had served their purpose in their time. But a new device doesn't have to inherit an old one's limitations just out of respect for the work that went into it.

I could have taken the obvious path: recreate Paysto, fix its accumulated shortcomings, and gradually add the features I'd been thinking about for years.

That would have been reasonable. Probably faster, too.

But the May result made me realize my hands were no longer tied. I could build not just what I'd been planning to build, but what I'd only dreamed of building.

That's where the idea for PG27 began.

I pictured it as a processing center with isolated nodes. At that stage, I was more interested in what the system could do—and how people could interact with it—than in the mechanics of its implementation.

The familiar ways of doing business still had to work. A buyer could still arrive through a browser, place an order, and pay for it.

But why should the browser define the architecture of the entire system?

I began thinking in terms of transports. Not credit cards or bank transfers—those are payment methods. I meant **how a buyer enters a sale, how they interact with the payment process, and how they receive the result**.

Today that might be a storefront page. Tomorrow, a terminal, a device, or some other software interface. In the future, more commerce might begin with an AI assistant helping someone find what they need and complete a purchase.

Not AI controlling the platform itself. AI as one possible participant in a commercial interaction.

I didn't yet know how all of this would be implemented. But I knew I didn't want to design a new system as though the world would always consist of online-store pages.

The old use cases still mattered. They just shouldn't set the limits of the future.

## The Working MVP Was Too Convenient

And this is where I made a mistake I wouldn't recognize right away.

I already had a working MVP. The assistant and I had found a productive way to work together. Development was moving quickly. Why throw it all away and start over?

I didn't discard the prototype. I didn't fundamentally change the way I approached architectural design and implementation, either.

AI didn't object. At the time, it all seemed perfectly logical.

Except the idea had changed, while the implementation kept growing out of something built for a different purpose.

The problems emerged gradually—and not just in the code.

Throughout May, I worked through ChatGPT. At the time, the assistant had access to only 25 documents. As the architecture expanded, new definitions had to be squeezed into the existing files. The documents grew longer and longer.

Eventually, the assistant would start losing track of the architecture as a whole. Things got confused: what had already been approved, what had changed, which decision belonged to the old model, and which to the new one.

I had to keep the architecture in my head, break tasks into small, clearly defined pieces, return to the documentation, and explain again why a solution that worked locally didn't necessarily belong in the system as a whole.

Hardcoding was acceptable for an MVP. Its job was to demonstrate that an idea could work.

But once we began building the Registry-Driven Model, that was no longer enough. New capabilities had to fit the existing definitions, parameters, and configurations—not simply appear as another special-purpose handler.

Complexity was growing in three places at once: **documentation, implementation, and development management**.

Later, when we reached the point of integrating FakeBank and FakeShop, those contradictions became especially apparent. We had to rebuild the Platform and the Node from scratch, each in its own time. But that's another story.

What matters here is that the first implementation wasn't wasted. It did exactly what it had been built to do. The mistake was assuming that a successful experiment would automatically make a suitable foundation for an entirely different architectural vision.

## Codex Came Later

Codex entered the picture in early June.

At first, I didn't see it as a future CTO or the foundation of a team of specialized AI agents. It simply made implementing code much easier.

Unlike the way we'd been working before, Codex could see the entire project, read the source code, and consult the documentation.

I'd take its findings back to ChatGPT, and we'd discuss what to do next. The assistant would put together a short assignment. I'd give it to Codex, get the result, and come back to discuss it again.

Round and round.

Only later did I start experimenting with different models, combinations of tools, and specialized roles. Later still came CTO Harry, SVeta, and the rest of the AI engineering team.

None of that existed in early June. There was an architect, a chat assistant, a new tool for working with code, and a system that was already becoming more complex than the original plan.

But by then, the most important change had nothing to do with tools.

In March, I wanted to find out whether I could build a useful test environment with AI. In April, I wanted to try building a new platform around an architecture I already knew. In May, I saw that it was possible—and realized, unexpectedly, that I no longer wanted to reproduce the past.

**Once implementation became more accessible, the central question was no longer “How quickly can we build this?” but “What is actually worth building?”**

For me, PG27 began with that question.
