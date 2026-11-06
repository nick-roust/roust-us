---
title: "We Built the Protocol. Then We Had to Learn How to Build the System Together"
slug: "platform-node-integration"
type: "Retrospective"
periodStart: "2026-06-26"
periodEnd: "2026-08-31"
displayDate: "JUN — AUG 2026"
project: "PG27"
hero: {"src": "/images/journal/platform-node-bridge-construction.webp", "alt": "Illustrative bridge construction at sunset, with cranes above two unfinished spans separated by a visible gap"}
summary: "A working June protocol led to a rebuilt Node, clearer responsibilities and an AI engineering team, culminating in a bounded configuration operation on August 31."
homeSummary: "Rebuilding the Node also meant learning how to organize the team building it."
status: "draft"
draft: true
---

*How a June breakthrough between Platform and Node led to a new Node architecture, a team of AI agents, and our first major win at the end of August.*

## The Protocol Works. Time to Celebrate.

On June 26, 2026, I marked a milestone for myself: “Sale-Node ↔ PaymentGate communicate only through the Protocol. The architectural protocol is established.”

It was worth celebrating. Working with AI, we had implemented pAPI—the mechanism connecting the central Platform and the Node. Something that had previously existed in diagrams and discussions was beginning to take shape in code.

When you're working that hard, you need to remember to celebrate the milestones. Not for investors or progress reports. Sometimes you just want to stop for a minute and say: we did that.

A few days later, on July 2, I marked another one: “The point of no return. MVP Runtime implemented.” At the time, I genuinely saw it as a major step toward a working system.

But engineering celebrations have a peculiar downside. The morning after, you have to open the project again—and start asking questions you hadn't thought to ask the day before.

## It Worked. Just Not the Way I Wanted.

The limitations surfaced quickly. The Platform dictated almost everything the Node did—from decisions about the transaction to what the order-confirmation page should look like.

In many ways, the Node was still a proxy. That wasn't what I wanted.

I wanted a Node its owner could install independently with Docker. Open source, relatively lightweight, and straightforward to maintain. It needed to execute the Platform's instructions, work with its own local data, and communicate with a bank when instructed to do so.

I wasn't proposing that the Node should decide whether a Sale exists, what happens next, or which actions are permitted. Those decisions belong to the Platform.

We later described the boundary with a simple analogy: **the Platform is the brain; the Node is the arms and legs.**

The problem with the June implementation wasn't that PUSH APIs are inherently bad. Under different requirements, the approach might have been perfectly viable. AI even explained what network capacity and resources we'd need as traffic grew.

But every new question was harder than the last. How would we transfer documents? Where would we store them? How would the Node interact with banks? How could an owner maintain a Node if the central system dictated almost everything it did?

I tried to understand a protocol that was still new to me. Eventually, I reached a simple conclusion: no, this wasn't going to work for what I had in mind.

That didn't make pAPI any less of an achievement. We'd implemented what we'd agreed on. I just understood much better now **what we should have agreed on in the first place**.

## A Week and a Half Away from the Node

I didn't keep patching the June implementation indefinitely. We decided to build a new Node from scratch. Literally.

First, though, I turned to other work: FakeBank, then FakeShop. That gave me roughly a week and a half away from the Node.

By July 7, I was marking the arrival of FakeBank—a separate engineering testbed for future payment routes. On July 17, we got the first containerized FakeShop running.

On the surface, it looked like a detour from the main problem. In practice, the break helped. I came back to the Node with a clearer idea of what it should do itself—and what it shouldn't.

Around then, I also noticed something changing in the way I worked with AI.

Before, I might give it an instruction like, “Build the payment page this way.” AI would propose an implementation. It might work perfectly well.

But when you're building a system rather than a page, working software doesn't necessarily mean you've brought your idea to life.

Gradually, I started conversations differently: “What if we talk this through? Look, here's the situation: we've received an order, and now we need to send the buyer to payment…”

It takes longer. Sometimes we argued. Sometimes I stopped, studied the proposed solution, and suddenly thought, “Oh. Now I see why you did it that way.”

The early attempts weren't necessarily AI mistakes. Often, they were stages in my own understanding of the problem.

## Building the New Node from Both Ends

In July, we started building the new Node from two directions: the Platform side and the installation side.

On the Platform side, we created a dedicated test environment called Platform LAB. It simulated incoming requests to the central system so we could test interactions without waiting for the entire buyer journey to be ready.

On the Node side, we had to start with a question that's easy to underestimate: who installs this thing, and how?

The owner comes into the picture during initial installation. That's not the same role as the local manager who administers the running instance afterward. That distinction gave rise to wAPI, the installation Wizard protocol. Work on it also led to a separate UI repository.

Next came nAPI for Node administration, followed by the Seller and Buyer interfaces: sAPI and bAPI.

Every new participant forced us to define the boundaries more precisely. The Node needed access to permitted schemas, reference catalogs, and baseline configurations. Participants needed to be able to manage only what their roles allowed.

The question of banking secrets was fairly straightforward: they belonged locally on the Node. The Platform had no reason to receive the passwords for the owner's bank connections.

Later, the same separation of data responsibilities became important for personally identifiable information. In Seller and Buyer flows, actual personal data stayed within the local environment, while the Platform used the prescribed tokenized representations.

None of this turned the Node into an independent decision-making authority. It still executed the Platform's instructions. But execution now had its own interfaces, local data, and clearly defined limits of authority.

At last, the architecture was beginning to resemble the Node I'd wanted to build all along.

And then we ran into another problem.

## One AI Agent Wasn't Enough

By early August, we were starting to lose the architectural thread again. This time, the problem wasn't a particular protocol.

We were developing a complex system through a single agent. It had to keep the Platform, the Node, their contracts, the implementation, and the test results in context at the same time. Every new local task risked pulling the work away from the model we'd already agreed on.

On August 1, I marked a new phase with the words: “Nikolaich meets the complexity management system.” Our discussions produced another name for it: the “architectural turbulence shock absorber.”

It sounded almost like the title of a science-fiction movie. But behind the joke was a practical question: how do you keep an architecture coherent when its parts are evolving in separate repositories?

I organized a team of AI agents.

**Harry** became our cross-repository CTO, responsible for keeping development aligned with the Registry-Driven Model (RDM). **Nod** owned Node development; **Plat** owned Platform development. **Dep** handled builds, launches, and restarts. **SVeta**, our System Validation agent, checked behavior across repositories.

I routed engineering questions through Harry. He assigned work to the appropriate Codex agents, collected their reports, and brought the information back to one coordination point.

But there was another side to the process. In ChatGPT, we discussed architecture in plain language—sometimes starting with a business situation, sometimes arguing over a proposed solution. Then the three of us—me, the ChatGPT assistant, and the CTO—agreed on what to do next.

That didn't mean the AI team had taken over architectural decision-making. It meant I'd finally found a way to stop carrying all the engineering coordination in a single conversation—and in my own head.

There was an interesting parallel here. We were building a system in which the Platform and the Node had distinct responsibilities. To build it, we had to divide responsibilities within the development process, too.

## August 31. We're Finally in the Node.

On August 31, I marked the occasion with two words: **“First major victory!”**

What had happened? We'd confirmed a configuration-creation operation across this path:

**nAPI → pAPI → nAPI.**

An administrator made a request to the Node through nAPI. The request reached the Platform through pAPI. The Platform performed the authorized operation, and the result came back to the requester through the Node.

To a reader, that might sound like a fairly modest integration test. To me, it meant much more.

We'd had a working protocol back in June. But the Node then belonged to a design I'd decided to leave behind. Now we had a working interaction **within the architecture we'd actually set out to build**.

Not a complete Sale. Not a finished payment. One concrete capability: create a configuration through the Node's interface and receive confirmation from the Platform.

At the time, I put it this way: “This is only the beginning. But we're already in the Node.”

In June, we'd celebrated getting a protocol to work. In August, we celebrated finding our way back to the original idea—and making it work on its own terms.

## Building an Idea

Over those two months, I kept thinking back to the moment we'd abandoned the first Node.

Sometimes, when a new capability became possible, I'd tell myself: “See? You couldn't have done what you can do now with that old implementation.”

Not because the first architecture was objectively bad. It simply led somewhere I didn't want to go.

I gradually came to understand something: **executing a plan and bringing an idea to life are two different things.**

When the plan is ready, you can tell an implementer exactly what to do. But when you're starting with an idea for a complex system, parts of the plan are still waiting to be discovered. Sometimes through implementation. Sometimes through an attempt that doesn't work out. Sometimes through a pause, when instead of issuing another instruction, you start learning and talking things through.

AI can be an implementer, a sounding board, an opponent in a debate. But you still need to keep the architecture in your head and the Registry definitions in front of you. Otherwise, it's easy to end up with working code that quietly takes you away from what you meant to build.

September's integration tests were still ahead, as was the first completed Sale through FakeBank in October. But by August 31, I knew exactly what I was celebrating.

**We hadn't just learned how to connect the Platform and the Node. We'd learned how to build them together—without losing sight of why we'd started.**
