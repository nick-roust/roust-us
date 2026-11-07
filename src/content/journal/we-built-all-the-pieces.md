---
title: "We Built All the Pieces. Then We Had to Make Them Work Together."
slug: "we-built-all-the-pieces"
type: "Retrospective"
periodStart: "2026-08-31"
periodEnd: "2026-10-27"
displayDate: "AUG — OCT 2026"
project: "PG27"
hero: {"src": "/images/journal/first-payment-tunnel.webp", "alt": "Illustrative road passing through a mountain tunnel toward sunrise"}
summary: "September integration exposed configuration and synchronization gaps before a browser-based Sale Route completed with the FakeBank simulator on October 2."
homeSummary: "We had the components. Integration work made one complete sale through the FakeBank simulator possible."
status: "draft"
draft: true
homepagePosition: 3
---

*How a month of integration testing brought PG27 to its first completed sale.*

## After the First Big Win

On August 31, 2026, I marked our first major victory: we could finally create a configuration through the Node and get confirmation back from the Platform.

The sequence looked modest enough: `nAPI → pAPI → nAPI`. A Node administrator initiates an action, the Platform makes the decision, and the result comes back. No buyer, no payment, no triumphant “Thank you for your order” page.

But for us, it was a big deal. After two months of rethinking the architecture, we had finally seen a working interaction in the model we actually wanted to build.

You might think the hard part was behind us. The protocols were there. We could create configurations. The Platform and the Node were finally talking to each other.

All we had to do now was complete a sale.

That *all* took another month.

A Sale isn't a single request. You need a seller. The seller needs a connection to an external channel. A buyer has to arrive through that channel, express an intent to buy, and receive a payment route. And at the end, there has to be a result—not inside an isolated test, but at the end of the entire chain.

By late August, we'd learned how to connect the parts. Now we had to find out whether those parts could accomplish something together.

## The Sale That Never Started

In early September, we were testing the Sale Runtime synthetically. On September 9, we had positive results: the route passed the checks within the defined scenario.

That mattered. But it didn't mean a buyer could already arrive through the Node and complete a payment through a Gateway. A synthetic test proves what it tests. It doesn't stand in for an integrated system.

On September 13, we moved on to something more interesting. The scenario was perfectly ordinary: create a seller, connect an external channel, and submit a Sale Intent through cAPI.

The Node rejected the request.

The reason was almost embarrassingly simple. During the earlier steps—creating the seller and the connection—the Node hadn't received the necessary configuration updates. The new entities already existed on the Platform, but the execution side didn't yet have their current state.

In other words, the problem wasn't that we didn't know how to run a Sale. We hadn't made sure the participants responsible for running it shared a consistent view of the configuration.

We fixed the delivery of those updates. And that's when we found something more interesting than the rejection itself.

## When Every Setting Arrives at Once

It turned out that whenever the Node synchronized, it kept requesting a complete snapshot of its settings and its consumers' configurations.

Change one parameter? Download the whole lot.

When a system is small, that approach can look perfectly reasonable. Convenient, even: request everything, get the latest state, and carry on. But we weren't building a demo store with one setting. The configuration would grow along with the number of participants, connections, and scenarios.

I looked at it and realized that, if we left things as they were, every small change would depend on the size of all the state we'd accumulated.

And to think, this had started with a seller request that wouldn't go through.

Before we could change synchronization, though, we needed to understand exactly what we were trying to synchronize.

## SVeta Puts the Sale Together

By September, two months of intense development had taken the implementation a long way. The documentation had grown so much that even AI was struggling to distinguish current decisions from historical alternatives.

There was no shortage of configuration sources, either. Global definitions on the Platform, administrative settings on the Node, seller connection parameters, the global scenario—each made sense on its own. But for a particular Sale, they had to come together into one consistent picture.

We decided to stop expanding the architecture indefinitely while we still didn't have a working route. In September, architectural changes were restricted. The priority was to prove what we'd already built.

Our CTO, Harry, who had previously kept the architecture aligned across repositories, was now mostly recording validation statuses.

Basically, the CTO was taking it easy.

SVeta, our System Validation agent, handled the entire inventory. Her job wasn't to invent another version of PG27 or rewrite the Registry. She analyzed the existing Registry-Driven Model to find the simplest route we could actually run from beginning to end.

First, a minimal configuration. Then a test. Only after that passed would we add more parameters.

It was an important change in how we worked. In August, we'd divided responsibilities among AI agents so we wouldn't lose the architecture while developing in parallel. In September, we had to change gears: stop adding capabilities and learn how to assemble them into a working process.

Sometimes, to get a system moving forward, you have to stop giving it new things to do.

## A Fix That Became More Than a Fix

On September 23, we moved to an incremental model for saving and synchronizing configurations—an approach I'd proposed.

The idea was simple: if only a little has changed, don't transfer everything every time. The Node should receive the changes it needs, not download a complete snapshot of its settings again.

But the decision brought another result, one I initially thought of as a bonus.

We now had a foundation for restoring a Node on another server.

And that revealed something important about our architecture. The Platform knows the configurations and the state it's authorized to hold. It does not own the Node's banking secrets or buyers' personally identifiable information. We'd deliberately kept that data off the Platform.

So restoring a Node from the Platform's side doesn't magically recreate passwords or personal data the Platform never received. Preserving or restoring those requires a separate local solution.

To me, that wasn't an unfortunate limitation. It confirmed a boundary we'd chosen on purpose. Once we'd decided that secrets belong with the Node owner, we couldn't abandon that principle just to make recovery more convenient.

We'd set out to get one Sale Intent through the system. Instead, we ended up seriously rethinking how the Node manages its state—and gaining a capability we hadn't even been considering when that first request failed.

## October 2

By the end of September, we'd gradually brought the necessary pieces into one chain. Not without stops, checks, and the occasional return to something we thought we'd finished.

On October 2, 2026, we completed the full Sale Route.

It was a conventional browser-based sale using FakeBank. The buyer followed the defined route, the system executed the necessary stages, the payment simulator took part in processing, and the Sale reached completion.

For the first time, we'd confirmed not just a protocol, not just configuration creation, and not just synthetic execution inside the Platform, but an end-to-end sale scenario.

Why start with a browser?

Because it was a familiar, well-understood transport. We didn't need to prove terminals, new interfaces, and every possible interaction model at the same time. We needed to verify one complete vertical and establish that the architecture could execute it.

A browser-based Sale didn't prove that every other transport was ready. But it gave us a reason to move on to the next scenario without building a new platform for it.

I remember wanting to put a big period at the end of that chapter. Five months of work, so many revisions, so many separate checks—and finally, a completed sale.

But I couldn't quite put that period there.

## Every Win Brings Us Closer

I've come to think about engineering victories differently.

On August 31, we confirmed configuration creation through the Node. That was a win.

On October 2, we completed a full browser-based Sale Route with FakeBank. Another win—and one much closer to what we'd been building toward.

But that didn't make PG27 a finished transaction platform. Retail sales still needed fiscalization and integration with real banks. On the corporate side, we still had to complete the required procedures and document workflows.

So we kept going. On October 24, we completed a corporate sale through Manual Bank. And on October 27, we reached the first Invoice.

An invoice that had seemed like a small task turned into a long story of its own. But that's for another article.

September taught me something else. You can build the right components, agree on protocols, create a Registry, and divide the work among AI agents. But until all of that can execute one end-to-end business scenario, you have a collection of engineering achievements—not yet a system proven to work together.

Still, I don't want to diminish those achievements just because there's more work ahead.

**Every win brings us closer.**

That's how I now look at the history of PG27: not as one long road to a triumphant “Done,” but as a sequence of decisions, each making the next challenge possible.
