---
title: "the qr code you printed last month is dead."
description: "most free qr generators expire your codes after 7 days. here's why and how to avoid it."
date: 2026-04-07
tags: ["qr-code", "scams", "static-vs-dynamic"]
---

so you printed 500 stickers. maybe business cards. maybe flyers for your cafe. you stuck them everywhere, handed them out, felt productive.

then someone scans one and gets a dead link.

turns out the "free" qr code you made on qr-code-generator.com wasn't really yours. it was a redirect through their server. and when your 14-day trial ended, they killed it.

this happens constantly. qr-code-generator.com has a 1.5 out of 5 on trustpilot across 9,200+ reviews. go look. the reviews are brutal. people finding out their printed materials are now worthless. menus, packaging, event posters. all dead.

**here's the scam pattern**

these sites generate what's called a "dynamic" qr code. sounds fancy. sounds like a feature. it's not. it means the qr code doesn't actually contain your url. it contains *their* url. a redirect link on their server.

`your-qr-code -> their-server.com/abc123 -> your-actual-link.com`

so when you scan it, you're hitting their server first. they forward you to your destination. and the moment you stop paying, they just... stop forwarding.

your qr code still scans. it just goes nowhere. or worse, it goes to their pricing page asking you to resubscribe.

you already printed 500 stickers. what are you gonna do.

that's the business model. get you to embed their redirect into physical materials you can't update, then charge you monthly forever. it's not a free tool. it's a trap with a timer.

**static codes don't do this**

a static qr code puts the actual data directly into the qr pattern. no redirect. no middleman server. no subscription.

when someone scans a static qr code pointing to `https://yourcafe.com/menu`, that url is literally encoded in the pixels. the phone reads it directly. there's no server in between that can die, paywall you, or go out of business.

the tradeoff is you can't change where it points after printing. but honestly, how often do you change your website url? and if you do, you'd probably want new stickers anyway.

**how to make one that actually lasts**

go to [qrzap.fun](https://qrzap.fun). paste your url. download the qr code. done.

qrzap generates static qr codes entirely in your browser. nothing hits a server. there's no account. no trial. no "upgrade to keep your code alive" email in 14 days.

the data lives in the qr itself. it works until the paper it's printed on disintegrates.

if you want to do it from terminal:

```bash
npx qrzap g --type url --data "https://yourcafe.com/menu" --format png
```

or drop this in your html and it generates on the fly:

```html
<img src="https://qrzap.fun/api/generate?data=https://yourcafe.com/menu" width="200" />
```

**how to tell if your existing qr code is a ticking bomb**

scan it. look at the url that shows up on your phone before it redirects. if it goes to something like `qr.link/abc123` or `app.qr-code-generator.com/xyz` before hitting your actual site, it's a dynamic code. it will die when you stop paying.

if the url goes directly to your site, you're fine. that's a static code. it'll work forever.

**why do these sites even exist**

because dynamic codes let them track scans. analytics. how many people scanned, when, where. that's the real product. you get a dashboard with charts. you pay monthly for it.

and yea, scan analytics can be useful if you're running a campaign. but most people making a qr code for their restaurant menu or business card don't need scan analytics. they need a code that works.

the problem is these sites default you into dynamic codes without explaining what that means. you think you're getting a free qr code. you're getting a hostage situation.

i genuinely think this is one of the more predatory patterns on the internet. it specifically targets people who won't discover the problem until they've committed to physical media they can't change. it's designed that way.

use a static code. own your data. don't let a subscription service sit between your sticker and your customer.

[qrzap.fun](https://qrzap.fun) if you need one.

ok bye.
