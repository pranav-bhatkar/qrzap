---
title: "i tested 8 qr code generators."
description: "honest comparison of qr-code-generator.com, qrcode monkey, goqr.me, canva, adobe, beaconstac, qr tiger, and qrzap."
date: 2026-04-04
tags: ["comparison", "qr-code", "review"]
---

i spent most of last saturday testing QR code generators. not because i wanted to. because i needed a wifi QR for my apartment and figured i'd document which ones are actually usable and which ones are traps.

here's what happened.

**1. qr-code-generator.com**

time to first QR: about 4 minutes, because you have to sign up first.

this one has a 1.5/5 on Trustpilot. i read the reviews before signing up and should've stopped there. the "free trial" is 14 days, after which they charge EUR 178/year. they auto-bill. people in the reviews are furious about it. the cancellation process involves contacting support. classic.

the generator itself is fine once you're in. supports a bunch of types. but the pricing dishonesty kills it. if your free trial QR code stops working after 14 days because you didn't enter payment info, was it ever really free?

login required: yes. types: many. API: yes, paid. pricing honesty: terrible.

**2. QRCode Monkey**

time to first QR: about 40 seconds. genuinely fast.

this is the one i'd actually recommend if you want design customization and don't mind static codes. you can change colors, add logos, round the dots, all without signing up. it's legitimately free for static QR codes.

the catch: dynamic codes are paid. and there's a 5 codes per day limit that isn't obvious until you hit it. but for what it does for free, it's solid. i made a pretty good looking QR with a gradient and rounded corners in under a minute.

login required: no (for static). types: url, text, wifi, vcard, more. API: no free API. pricing honesty: decent, they're upfront about the free/paid split.

**3. goqr.me / api.qrserver.com**

time to first QR: instant, if you use the API directly.

this is the go-to free QR API that every stack overflow answer links to. `https://api.qrserver.com/v1/create-qr-code/?data=hello&size=200x200` and you get a PNG back. works great.

but. it only supports URL and plain text. no wifi. no vcard. no email. no sms. and their privacy policy says they log IP addresses. for a free service that generates QR codes, logging IPs feels unnecessary.

i used this for years before realizing how limited it is. if all you need is a URL QR code and you don't care about the IP logging, it works.

login required: no. types: url, text only. API: yes, free. pricing honesty: good, it's just free.

**4. QuickChart.io**

time to first QR: about 30 seconds with the API.

another API-first option. clean docs. 1000 requests per month on the free tier, which sounds generous until your app gets any real traffic. only supports URL and text, same as goqr.me.

it's a good tool if you're already using QuickChart for chart images. the QR endpoint feels like an afterthought though. 1000/month limit means you can't really use it in production without paying.

login required: no (for basic API). types: url, text. API: yes. pricing honesty: fine, limits are documented.

**5. Canva QR**

time to first QR: 3-4 minutes. you have to log in, open a design, find the QR code element, configure it.

you're generating a QR code inside a design tool. it's like using photoshop to write a text file. the QR code works but it's URL-only. no wifi. no vcard. no email. and you need a Canva account.

if you're already making a poster in Canva and need a QR code on it, sure. as a standalone QR generator, this is silly.

login required: yes. types: url only. API: no. pricing honesty: n/a, it's a design tool.

**6. Adobe Express QR**

time to first QR: even longer than Canva. you need an Adobe account and their sign-in flow is... an experience.

same problem as Canva. url-only. no wifi, no vcard. requires an account for something that should take 5 seconds. the generated QR code looks fine. the journey to get there doesn't.

login required: yes (Adobe account). types: url only. API: no. pricing honesty: n/a.

**7. Beaconstac (Uniqode)**

time to first QR: you can't. there's no free plan.

i hit the pricing page first. no free tier. the cheapest plan has scan limits even after you're paying. so you're paying monthly and your QR codes still have a cap on how many times someone can scan them. that's like paying for a door and being told it only opens 500 times.

they rebranded to Uniqode which is a choice. the product is aimed at enterprise and it shows. if you're a company with a marketing team and a budget, maybe. for everyone else, no.

login required: yes. types: many. API: yes, paid. pricing honesty: at least they don't pretend to be free.

**8. QR Tiger**

time to first QR: about 2 minutes with signup.

you get 3 free dynamic QR codes with a 500 scan limit each. that's actually decent for a dynamic code. they have tracking, analytics, the whole thing. the free codes have QR Tiger branding and ads on the scan page.

for the specific use case of "i need one dynamic QR code that tracks scans and i'll accept the branding," QR Tiger is a reasonable option. the tracking dashboard is genuinely useful. but 500 scans goes fast if you put the code anywhere public.

login required: yes. types: many. API: yes, paid. pricing honesty: okay, the limits are visible but you have to look.

**what i actually use now**

after all that, the wifi QR for my apartment took me about 15 seconds on [qrzap](https://qrzap.fun). no login. picked wifi type. typed my SSID and password. downloaded the SVG. printed it. done.

it supports 7 types (url, text, phone, email, sms, wifi, vcard). the API is free with no auth. there's an MCP server for AI agents. there's a CLI. it's open source so if qrzap.fun disappears tomorrow you can self-host the whole thing.

```
GET https://qrzap.fun/api/generate?type=wifi&ssid=MyNetwork&password=hunter2
```

no scan limits because the codes are static and the data is in the QR itself. nothing to expire. nothing to track. nothing to pay for.

i don't need dynamic tracking for my apartment wifi password. i don't need a marketing dashboard. i need a square that my friends can point their phone at.

**the scorecard**

| tool | time to first QR | login | types | free API | pricing honesty |
|------|-----------------|-------|-------|----------|----------------|
| qr-code-generator.com | 4 min | yes | many | paid | 1/5 |
| QRCode Monkey | 40 sec | no* | many | no | 4/5 |
| goqr.me | instant | no | 2 | yes | 5/5 |
| QuickChart.io | 30 sec | no | 2 | yes* | 4/5 |
| Canva | 3 min | yes | 1 | no | n/a |
| Adobe Express | 4 min | yes | 1 | no | n/a |
| Beaconstac | n/a | yes | many | paid | 3/5 |
| QR Tiger | 2 min | yes | many | paid | 3/5 |
| QRzap | 15 sec | no | 7 | yes | 5/5 |

half of these tools are solving a problem that doesn't exist. QR codes are an encoding format. the data is in the image. there's nothing to host. there's nothing to expire. charging monthly for static QR generation is like charging monthly for a calculator.

dynamic QR codes are a real thing and QR Tiger does them well. but most people don't need
