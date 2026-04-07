---
title: "free qr code apis compared."
description: "goqr.me vs quickchart vs qrzap api. rates, types, auth, and actual code examples."
date: 2026-04-03
tags: ["api", "comparison", "developer-tools"]
---

i needed a free QR code API last month. not a library. an HTTP endpoint i could hit from any language, any platform, no SDK, no signup. turns out there are exactly three options worth looking at.

here's what i found after actually using all of them.

**1. goqr.me (api.qrserver.com)**

the OG. been around forever. no docs page that tells you the rate limit, which is either generous or ominous depending on how you think about it.

```
GET https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com
```

returns a PNG. you control size via query params. that's basically the whole API.

```bash
curl "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=hello" -o qr.png
```

```js
const img = document.createElement("img");
img.src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com";
```

what it supports: URL and plain text only. no wifi, no vcard, no email, no structured types. you can manually encode a wifi string yourself (`WIFI:T:WPA;S:MyNet;P:pass123;;`) but the API doesn't help you build it.

auth: none. no key needed.

rate limits: undocumented. i've hit it a few hundred times in a row and it didn't complain. but there's no SLA either. it could throttle you tomorrow and you'd have no recourse.

the catch: their privacy policy says they log IP addresses. if you're generating QR codes for users from your frontend, every one of those users' IPs is hitting goqr.me's servers. for a side project, whatever. for anything with real users, think about it.

it works. it's been working for years. that counts for something.

**2. quickchart.io**

primarily a chart API but they bolted on a QR endpoint. better docs than goqr.me. open source backend which is nice.

```
GET https://quickchart.io/qr?text=https://example.com&size=200
```

returns PNG by default. you can get SVG with `&format=svg`.

```bash
curl "https://quickchart.io/qr?text=hello&size=300" -o qr.png
```

```js
const res = await fetch("https://quickchart.io/qr?text=https://example.com&size=200&format=svg");
const svg = await res.text();
```

what it supports: same deal. text and URLs. no structured types. you're encoding raw strings.

auth: no key for the free tier. they have a paid tier with an API key if you want higher limits.

rate limits: 60 requests per minute, 1000 per month on free. that's... tight. if you're embedding QR codes as image tags on a page that gets traffic, you'll burn through 1000 monthly requests in a day. the 60/min is fine for dev work though.

the open source thing is real. the repo is on github (`typpo/quickchart`). you can self-host it and remove all rate limits. i respect that.

privacy is better here. their docs say they don't log request data on the free tier. paid tier has analytics.

**3. qrzap (qrzap.fun/api/generate)**

full disclosure, i built this one. so take everything with the appropriate grain of salt.

```
GET https://qrzap.fun/api/generate?type=url&url=https://example.com
```

returns SVG. always SVG.

```bash
curl "https://qrzap.fun/api/generate?type=wifi&ssid=Office&password=guest123&encryption=WPA" -o wifi.svg
```

```js
const res = await fetch("https://qrzap.fun/api/generate?type=email&email=hi@example.com&subject=Hello");
const svg = await res.text();
```

what it supports: 7 types. url, text, phone, email, sms, wifi, vcard. each type has structured params so you don't have to manually build `WIFI:T:WPA;S:...` strings or vcard payloads. the API handles the encoding.

```
GET https://qrzap.fun/api/generate?type=vcard&firstName=Jane&lastName=Doe&phone=+1234567890&email=jane@example.com
```

auth: none. no key. no signup.

rate limits: none published. it's a vercel deployment. if you somehow manage to DDoS it, cloudflare will probably step in. but for normal usage there's no throttle.

CORS is enabled. you can call it from any browser, any origin. goqr.me has CORS too. quickchart does as well on the free tier.

it's newer. been up for weeks, not years. goqr.me has been running since like 2013. that's a decade of uptime i can't compete with. if you need battle-tested stability for a production system, goqr.me is the safer bet right now.

**the actual comparison**

| | goqr.me | quickchart | qrzap |
|---|---|---|---|
| types | text, url | text, url | 7 structured types |
| output | PNG | PNG, SVG | SVG |
| auth | none | none (free tier) | none |
| rate limit | undocumented | 60/min, 1k/month | none |
| CORS | yes | yes | yes |
| logs IPs | yes | no (free tier) | no |
| open source | no | yes | yes |
| been around | ~2013 | ~2019 | 2026 |

if you just need a URL or text QR code and you want something that's been running for a decade, use goqr.me.

if you want self-hosting and decent docs, quickchart.

if you need wifi, vcard, email, sms, or phone QR codes from an API without building the encoding strings yourself, qrzap is the only free option that does that.

i've been using all three at different points. switched my own stuff to qrzap obviously, but i still have goqr.me URLs in old projects that work fine. never had one fail.

anyway those are your three options. pick whichever one and move on with your
