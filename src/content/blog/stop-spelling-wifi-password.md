---
title: "stop spelling your wifi password to every guest"
description: "wifi qr codes let anyone connect by scanning. no more spelling passwords out loud."
date: 2026-04-07
tags: ["wifi", "qr-code", "guide"]
---

so my wifi password is `Tw7$kR9xP`. i know. i set it two years ago when i was feeling security-conscious and now i pay for it every time someone comes over.

"what's the wifi?"

i say it out loud. T as in tom. w. 7. dollar sign. k. capital R. 9. x. capital P.

they type it. it doesn't work. i spell it again. they ask if the R is capital. i say yes. they try again. it works this time. then the next person walks in and we do it all over again.

four guests, four rounds. took like 8 minutes total if you add it up. for wifi.

**this isn't just a me problem**

airbnb hosts deal with this constantly. every guest, every check-in. some of them put the password on a card on the kitchen counter. guests still get it wrong because `l` looks like `1` in the font they picked.

cafes write it on the chalkboard. `Password: BeAnZ2024!` and then someone asks the barista because they can't tell if that's a capital B. offices print it in the onboarding packet and new hires still slack the IT person.

it's the same problem everywhere. passwords were designed for machines, not for reading out loud.

**the fix is a qr code**

you generate a wifi qr code once. print it. anyone scans it with their phone camera, it auto-connects them to the network. no typing, no spelling, no "is that a zero or an O."

takes about 30 seconds to make one. go to [qrzap.fun](https://qrzap.fun), pick wifi, type your SSID and password, download the image.

if you're a terminal person:

```bash
npx qrzap g --type wifi --ssid "HomeNetwork" --password "Tw7$kR9xP" --format png
```

that gives you a png. stick it wherever.

or use the API directly if you want to embed it somewhere:

```html
<img src="https://qrzap.fun/api/generate?type=wifi&ssid=HomeNetwork&password=Tw7$kR9xP" width="200" />
```

that returns an svg. works as an img src. you could put it on your airbnb listing page or internal wiki or whatever.

**what to do with it after**

i printed mine on a 3x3 inch card. taped it next to the front door. haven't spelled my password in months.

some people frame it, which is honestly kind of funny. a framed qr code on the wall like it's art. but it works.

i've seen cafes print it on table tents. one coworking space i went to had it on a sticker on every desk. an airbnb in goa had it laminated and velcroed to the nightstand. all good approaches.

you could also just tape it to the router itself. that way if someone's standing right next to it they can scan and connect.

**one security thing**

your wifi password is encoded in the qr code in plain text. that's how the standard works. so if you're putting this somewhere public, like a cafe or airbnb, use a guest network. most routers support this. set up a separate network for guests with its own password, make the qr for that one, keep your main network private.

this way even if someone screenshots the qr and shares it around, the worst they get is guest network access. your personal devices and files stay on the main network.

takes maybe 5 minutes to set up a guest network on most routers. worth it.

**the weird thing**

we've had qr codes since 1994. phones have been able to scan them natively since like 2017. wifi qr is a published standard. and yet most people still spell their password out loud in 2026.

i think it's just one of those things where the solution exists but nobody thinks to look for it. you just accept the annoyance as part of having guests over.

anyway. i made my qr 4 months ago. printed it for 15 cents at the office printer. taped it up. done. it's one of those tiny fixes that removes a recurring irritation from your life and you wonder why you didn't do it sooner.

ok bye.
