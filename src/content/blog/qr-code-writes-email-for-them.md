---
title: "a qr code that writes the email for them."
description: "email qr codes with pre-filled subject and body. the user just hits send."
date: 2026-04-03
tags: ["email", "qr-code", "marketing"]
---

most QR code generators let you encode an email address. that's it. someone scans it, their mail app opens with the "to" field filled in, and then they stare at a blank compose screen.

cool. now they have to figure out what to write. most of them won't bother. they'll close the app and forget about it.

the thing is, the `mailto:` URI spec has supported pre-filling the subject and body for years. like, since the 90s. you can literally put the entire email into the QR code so the person scanning it just has to hit send.

```
mailto:support@example.com?subject=Warranty%20Claim&body=Hi%2C%20I%20purchased%20your%20product%20on...
```

**the encoding problem**

that URL above looks fine until you try to build one yourself. spaces become `%20`. line breaks become `%0A`. ampersands, question marks, equals signs, all the characters that mean something in a URL, they all need to be percent-encoded or the whole thing breaks.

i tried hand-encoding a `mailto:` URI with a three-line body once. got it wrong twice. the first time the subject ate half the body text. the second time the line breaks showed up as literal `%0A` in gmail.

it's tedious and error-prone and nobody should be doing it manually.

**qrzap does the encoding for you**

on [qrzap.fun](https://qrzap.fun), you pick "email" as the type, fill in the address, subject, and body in separate fields, and it handles all the encoding. the QR code it generates contains a properly formatted `mailto:` URI.

when someone scans it, their mail app opens with everything filled in. to, subject, body. they read it, maybe change a word, and hit send.

that's the difference between "here's an email address" and "here's a ready-to-send email."

**where this is actually useful**

i keep thinking about the places where you want someone to email you but you know they won't unless you make it stupidly easy.

feedback forms at conferences. you put a QR on the slide at the end of your talk. someone scans it. the email says "feedback for [talk name]" in the subject and has a couple prompts in the body. they fill in two lines and send. way better than a google form nobody will open.

product packaging. you print a QR on the box that says "need help?" and it opens an email to support with the product name and SKU already in the subject. the customer doesn't have to hunt for your support email or explain what they bought.

RSVP links. event invites with a QR that opens an email saying "yes, i'll be there" in the body. one scan, one tap.

newsletter signup prompts. a QR on a poster that opens a pre-written email to your subscribe address.

**the api**

POST to the generate endpoint with the email fields:

```json
{
  "type": "email",
  "email": "support@acme.com",
  "subject": "Warranty Claim - Order #12345",
  "body": "Hi, I need help with my recent order."
}
```

or use it as an HTML embed with zero javascript:

```html
<img
  src="https://qrzap.fun/api/generate?type=email&email=support@acme.com&subject=Warranty%20Claim&body=Hi%2C%20I%20need%20help."
  width="200"
/>
```

returns an SVG. no API key. no signup.

**keep the body short**

one thing to watch out for: the more text you put in the body, the denser the QR code gets. dense QR codes have smaller modules (the little squares), which means phone cameras have a harder time scanning them, especially from a distance or on a printed surface.

i'd keep the body under 100 characters. a sentence or two. if you need more context, put a URL in the body that links to a form or a page with details.

subject lines are fine though. those are usually short enough.

**the packaging trick**

if you sell a physical product and you're not putting a support email QR on the packaging, you're missing something. nobody wants to type `warranty-claims@yourcompany.com` into their phone. nobody wants to write "i bought the model X-420 on march 15th" from scratch.

encode all of that into the QR. print it on the box. the customer scans, reviews, sends. your support team gets a properly formatted email with the product info already in it.

i was making dal chawal when i thought of this post and now the pressure cooker is whistling.
