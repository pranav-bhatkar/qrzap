---
title: "the table has a qr code and the menu is a 404."
description: "why restaurant qr menus break and how to make one that actually works."
date: 2026-04-02
tags: ["restaurants", "qr-code", "guide"]
---

sat down at a restaurant last week. nice place, new-ish. no paper menu. just a little acrylic stand with a qr code and the text "scan for menu."

i scanned it. safari opened. white screen. then a 404.

asked the waiter. he shrugged. "yea that happens sometimes, let me just tell you the specials." so he listed six dishes from memory while i tried to remember what "pollo alla" something was. ordered wrong. didn't care enough to fix it.

this is happening everywhere now.

**the numbers are not great**

a 2024 survey found 88% of customers prefer paper menus over qr code menus. eighty eight percent. that's not a preference, that's a rejection.

the complaints are always the same. the qr code links to a pdf that takes 15 seconds to load on mobile data. or it wants you to download an app. or it opens a page that asks for your email before showing the menu. or, the classic, it just doesn't work at all.

one restaurant group reported a 10% drop in check averages after going qr-only. people order less when they can't browse properly. makes sense. you don't impulse-add a dessert when you're pinching and zooming a pdf on your phone.

**restaurants aren't dumb, they got sold bad tools**

i want to be clear about this. restaurants didn't choose to have broken menus. someone sold them a "digital menu solution" during covid. monthly subscription. dashboard with analytics. dynamic qr codes that route through some third party server.

the restaurant paid for three months, maybe six. then stopped. maybe they switched POS systems. maybe they forgot. maybe the company that sold them the service shut down entirely. doesn't matter. the qr code on the table still points to that dead service.

and nobody on staff knows how to fix it because the person who set it up left two years ago.

this is the lifecycle of almost every restaurant qr menu. signup, print, forget, break.

**the problem isn't qr codes**

qr codes work fine. your phone camera reads them instantly. the technology is solid. the problem is what's on the other end of the scan.

if you use a dynamic qr service, the code points to their server. their server redirects to your menu. when you stop paying, the redirect dies. your qr code now goes to a 404, or worse, to their sales page asking you to resubscribe.

meanwhile the acrylic stand is still on table 12.

**the fix is boring and free**

put your menu on a webpage. not a pdf. not an app. a webpage. it can be as simple as a google doc set to "anyone with the link can view." or a free google sites page. or a single html file on your existing website.

then generate a static qr code that points directly to that url. not through a redirect service. the url gets encoded into the qr pattern itself. no middleman server. nothing to expire.

[qrzap.fun](https://qrzap.fun) does this. paste your menu url, download the qr code. it's generated in your browser, no account needed. the qr code will work as long as the url it points to exists.

```bash
npx qrzap g --type url --data "https://yourrestaurant.com/menu" --format png
```

that's it. print it. laminate it. put it on the table.

**some things i'd recommend**

keep the url short. `yourrestaurant.com/menu` is better than `docs.google.com/document/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit?usp=sharing`. shorter urls make smaller qr codes that scan easier.

test the qr code on at least three different phones before printing. iphone, android, an older phone if you can find one. some phones handle qr differently.

print it at minimum 2x2cm. smaller than that and cameras struggle, especially in dim restaurant lighting.

update the menu page, not the qr code. that's the whole point. the code stays the same forever. you just change the webpage it points to.

and please, don't go qr-only. keep paper menus. some people don't want to use their phone. some people's phones are dead. some people are 74 years old and just want to read a menu. the qr code should be an option, not a requirement.

**the real move**

print the qr code. put it next to a stack of paper menus. let people choose. the people who want to scan will scan. the people who don't, won't. nobody gets a 404. nobody flags down a waiter to recite the specials from memory.

restaurants have enough problems without their table signs linking to dead pages.
