---
title: "sixty dollars per qr code."
description: "qr code generators charge $35-120/month. most people don't need any of that."
date: 2026-04-02
tags: ["pricing", "qr-code", "free"]
---

i went down a rabbit hole looking at qr code generator pricing pages last night. i need you to know how unhinged it is.

beaconstac. no free plan at all. their starter is $5/month for 3 codes. three. and there are scan limits even on paid plans. you're paying and they're still counting how many times someone points a camera at your sticker.

qr tiger. they give you 3 free codes but each one caps at 500 scans and they slap ads on them. if your cafe menu gets popular, congratulations, your qr code stops working.

qr-code-generator.com. this one is my favorite. they lure you in with a 14-day free trial. then it's EUR 178 per year. that's like $190. for a qr code generator. and if you don't cancel in time, your card gets charged and your codes are already printed everywhere so you're basically locked in. (they have a 1.5 on trustpilot btw. 9,200+ reviews. go read them. it's grim.)

but the one that really got me was this. i found plans charging $120/year, and the plan only includes 2 dynamic codes.

that's $60 per qr code per year.

sixty dollars. per year. for a small square that encodes a url. a url you could literally type out faster than it takes to load their pricing page.

**the checkout trick**

a lot of these sites show monthly prices but default to annual billing at checkout. so you see "$10/month" and think ok fine, then your card gets hit for $120 immediately. you have to actively look for the monthly toggle, and some of them hide it pretty well.

i'm not saying it's illegal. i'm saying it's designed to catch people who don't read carefully. and the people making qr codes for their dog walking business or apartment wifi are exactly the kind of people who won't read carefully because why would you expect a qr code to have a pricing page at all.

**the math doesn't work**

think about how many qr codes a normal person needs. one for their website. maybe one for their wifi. maybe one for a business card. that's like 3 codes, and you make them once.

you're not running an ad campaign across 47 cities with A/B testing on scan conversion rates. you just want a square that links to your menu.

paying $120/year for that is insane. paying $190/year for that is clinical.

**the dirty secret**

here's what none of these sites explain clearly: there are two types of qr codes. static and dynamic.

a static code puts the actual url directly in the qr pattern. it works forever. no server needed. no subscription. no one can kill it. it's just data printed in a pattern.

a dynamic code is a redirect. the qr code points to *their* server, which then forwards to your url. that's how they track scans. that's also how they hold your code hostage when you stop paying.

dynamic codes exist for analytics. if you're a marketing team running campaigns and you need to know how many scans came from which billboard, sure, pay for that. makes sense.

but if you're making a qr code for your instagram link? your wifi password? your restaurant menu? you don't need analytics. you don't need dynamic codes. you don't need a subscription.

you need a png.

**here's what i can't get over**

the qr code specification is open. free. it was made by denso wave in 1994 for tracking car parts. the entire point was that anyone could use it. the patent holders explicitly chose not to charge licensing fees.

and now there's an industry charging you $60/year to generate one.

generating a qr code is a solved problem. it's a few kilobytes of computation. your phone does it natively. your browser can do it in javascript. there is no reason this should cost money.

[qrzap](https://qrzap.fun) generates qr codes in your browser. no account. no limits. no expiry. no tracking. the code runs client-side. nothing hits a server. you download a png or svg and that's it.

i didn't build it because the world needed another qr code generator. i built it because the existing ones are charging rent on a rectangle.

$60 per code per year and you probably didn't even notice.
