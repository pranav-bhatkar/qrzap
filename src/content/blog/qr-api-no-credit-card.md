---
title: "your qr code api shouldn't need a credit card."
description: "qrzap's api is free, needs no auth, and returns an svg you can use anywhere."
date: 2026-04-05
tags: ["api", "developer-tools", "free"]
---

i needed to generate a QR code from a backend service last week. should've taken five minutes. it took an hour because every single QR API wanted me to create an account, enter a credit card, and agree to a pricing tier before i could make one GET request.

$49/month. 100 requests included. overage fees. API key rotation. usage dashboards. for a QR code. a *QR code*.

i'm encoding a URL into a square of black and white pixels. why does this require a billing department.

**the average experience**

you find a QR API. the landing page looks promising. you click "get started." signup form. email verification. now you're in a dashboard. you need to create a "project" to get an API key. you copy the key. you read the docs. you set up auth headers. you make a request. it works. cool.

then you check the pricing page and realize the free tier gives you 100 requests per month. your side project gets 200 visitors on a good day. so now you're paying $49/month to generate QR codes that the `qrcode` npm package could generate for free.

this is broken.

**qrzap's api**

here's how it works:

```
GET https://qrzap.fun/api/generate?type=url&url=https://example.com
```

that's it. returns an SVG. no API key. no signup. no rate limits. CORS is enabled so you can call it from anywhere.

you can use it as an `<img>` tag directly. zero javascript:

```html
<img src="https://qrzap.fun/api/generate?type=url&url=https://example.com" width="200" />
```

works in markdown too:

```markdown
![QR](https://qrzap.fun/api/generate?type=url&url=https://example.com)
```

**curl it**

```bash
curl "https://qrzap.fun/api/generate?type=url&url=https://example.com" -o qr.svg
```

**fetch it**

```js
const res = await fetch("https://qrzap.fun/api/generate?type=url&url=https://example.com");
const svg = await res.text();
```

**python it**

```python
import requests

r = requests.get("https://qrzap.fun/api/generate?type=url&url=https://example.com")
with open("qr.svg", "w") as f:
    f.write(r.text)
```

**7 types, same pattern**

the API supports url, text, phone, email, sms, wifi, and vcard. all through query params on GET or JSON body on POST.

wifi example:

```
GET https://qrzap.fun/api/generate?type=wifi&ssid=MyNetwork&password=hunter2&encryption=WPA
```

vcard example with POST:

```bash
curl -X POST https://qrzap.fun/api/generate \
  -H "Content-Type: application/json" \
  -d '{"type": "vcard", "firstName": "Jane", "lastName": "Doe", "phone": "+1234567890", "email": "jane@example.com"}'
```

email with subject line:

```
GET https://qrzap.fun/api/generate?type=email&email=hi@example.com&subject=Hello
```

every response is `image/svg+xml` with a one-day cache header. you can stick the URL anywhere you'd put an image and it just works.

**self-host it**

the whole thing is open source. if you don't want to depend on qrzap.fun, clone the repo and deploy it yourself. it's a single file. the QR generation is the `qrcode` npm package doing the actual work. the API is just a thin wrapper that parses your params and returns an SVG.

i don't understand why this is a $49/month SaaS. the entire generation logic is maybe 80 lines of code. the library that does the hard part is free and open source. the API layer is trivial.

somewhere along the way we decided that wrapping a free npm package in an HTTP endpoint and adding a stripe checkout was a business model. and it works, apparently, because there are like twelve companies doing this.

**what i actually wanted**

i wanted to put a QR code in an email template. the email template is HTML. i needed an image URL that resolves to a QR code. that's the whole requirement.

```html
<img src="https://qrzap.fun/api/generate?type=url&url=https://myapp.com/invite/abc123" width="150" />
```

no SDK. no build step. no API key in my environment variables. no monthly invoice.

anyway the API is at `qrzap.fun/api/generate` and it's free. i was eating mass noodles while writing this and now they're cold.
