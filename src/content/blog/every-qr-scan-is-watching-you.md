---
title: "every qr code you scan is watching you."
description: "dynamic qr codes track your ip, location, and device. here's how static codes avoid that."
date: 2026-04-06
tags: ["privacy", "qr-code", "security"]
---

you know those qr codes on restaurant tables, event flyers, business cards? most of them aren't actually pointing you straight to a website. they're pointing you to a redirect server first. and that server is watching.

i didn't think about this for a long time. a qr code felt like a dumb object. black and white squares. scan it, go somewhere. but then i started reading about how dynamic qr code services actually work, and it got weird fast.

**here's the thing about dynamic qr codes**

there are two types of qr codes: static and dynamic. a static code has the url (or wifi password, or whatever) baked directly into the pattern. your phone reads the squares, decodes the data, done. no network call, no middleman.

a dynamic code works differently. the data in the squares isn't your destination url. it's a short link to a redirect server. when you scan it, your phone hits that server, the server logs everything it can about you, and then forwards you to the actual destination.

everything it can about you means: your ip address, your device type and os version, your browser, your approximate location (derived from ip), the exact time you scanned, and sometimes a device fingerprint. some services also drop cookies so they can track you across multiple scans.

this is not hypothetical. a 2023 paper from IEEE's ConPro workshop ("An Empirical Study of the Privacy Implications of QR Code Scanning") documented this in detail. the researchers analyzed the tracking behavior of major dynamic qr code platforms and found that most of them collect and store scan data with minimal or no disclosure to the person scanning. some share that data with third parties.

**bitly is everywhere**

bitly is one of the biggest players here. a huge chunk of dynamic qr codes on the internet route through bitly's infrastructure. every scan goes through their servers. they've built an analytics product on top of this. businesses pay for it. they want to know who's scanning their codes, from where, on what device, at what time.

which, from the business side, makes sense i guess. you want to know if your campaign is working. but from the scanner's side? you just wanted to see a menu. you didn't sign up for analytics.

and it's not just bitly. flowcode, qr tiger, beaconstac, they all do some version of this. it's the business model. the qr code is free because the data isn't.

**the paper made it concrete**

what stuck with me from the IEEE ConPro paper was how invisible this all is. there's no consent screen. no cookie banner. no "by scanning this qr code you agree to..." you just scan and go. the tracking happens in the fraction of a second between your scan and the redirect.

the researchers found that some services were transmitting location data and device identifiers to analytics endpoints before the redirect even completed. you couldn't opt out because you didn't know it was happening.

this is a little different from regular web tracking. with a website, you at least see the url bar. you can choose not to visit a site. with a qr code, you can't inspect the destination before you scan. well, some phones show a preview now, but most people just tap through.

**static codes don't have this problem**

a static qr code has no server in the middle. there's nothing to track because there's nothing to route through. the data goes directly from the pattern to your phone. no redirect, no analytics endpoint, no log.

the tradeoff is that you can't change where a static code points after you print it. businesses don't love that. but if your goal is "encode this url into a square people can scan," you don't need a redirect server. you just need the math.

**qrzap does this client side**

qrzap generates static qr codes entirely in your browser. no data gets sent to any server. the qr code is computed locally using javascript. there's no api call during generation (unless you're explicitly using the api endpoint, in which case the data still isn't stored). nothing is logged. nothing is tracked.

it's also open source. you can read the code and verify this yourself. there's no tracking pixel, no analytics sdk, no fingerprinting script. that's the whole point.

i'm not building a business on your scan data. i'm just making squares.

**the weird irony**

qr codes were invented in 1994 by denso wave for tracking car parts in a factory. a tool designed for inventory tracking became a consumer convenience tool, and then the convenience tool became a surveillance tool. the circle closed and nobody noticed.

i think about the IEEE paper a lot. not because it revealed some massive conspiracy. it didn't. it just documented something that was happening in plain sight, that everyone was too busy scanning to notice.

anyway. scan what you want. but maybe check where the redirect goes first.
