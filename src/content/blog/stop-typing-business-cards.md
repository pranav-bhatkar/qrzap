---
title: "you're still typing business cards into your phone."
description: "vcard qr codes save contacts in one scan. no more typing names and numbers from paper cards."
date: 2026-04-04
tags: ["vcard", "qr-code", "networking"]
---

came back from a fintech conference last month with 23 business cards in my jacket pocket. sat on my couch that night and started typing them into my phone one by one.

first name. last name. phone number. email. company. some cards had a website too.

took me about 30 minutes. and i still messed up two emails because someone's handwriting made their `a` look like an `o`. didn't find out until i emailed them and got a bounce. by then i'd already forgotten which card was theirs.

this is such a dumb problem.

**the vcard qr code exists**

a vcard is a standard format for contact information. it's been around since the 90s. when you encode one into a qr code and someone scans it, their phone opens the contacts app with all the fields pre-filled. they tap save. done.

no typing. no squinting at handwriting. no "wait, was that a 7 or a 1."

on [qrzap.fun](https://qrzap.fun) you pick vcard, fill in the fields you want (first name, last name, phone, email, org, url), and download the qr. print it on your business card. or just keep it on your phone screen for people to scan.

the raw vcard string looks like this:

```
BEGIN:VCARD
VERSION:3.0
N:Bhatkar;Pranav;;;
FN:Pranav Bhatkar
TEL:+919876543210
EMAIL:pranav@example.com
ORG:QRzap
URL:https://qrzap.fun
END:VCARD
```

you don't need to write that yourself though.

**from the terminal**

```bash
npx qrzap g --type vcard --firstName "Pranav" --lastName "Bhatkar" --phone "+919876543210" --email "pranav@example.com" --org "QRzap" --url "https://qrzap.fun" --format png
```

that builds the vcard string and gives you a png. or use svg, or print it right in the terminal with `--format terminal`.

**from the API**

```html
<img src="https://qrzap.fun/api/generate?type=vcard&firstName=Pranav&lastName=Bhatkar&phone=+919876543210&email=pranav@example.com&org=QRzap" width="200" />
```

returns an svg. works as an img src. you could stick this in your email signature and every email you send has a scannable contact card at the bottom. i've seen a few people do this and it's honestly pretty good.

**keep it lean**

here's the thing about qr codes: the more data you stuff in, the denser the grid gets. a vcard with first name, phone, and email produces a clean, easy-to-scan code. a vcard with first name, last name, phone, mobile, fax, email, work email, org, title, address, website, and a note produces a tiny, dense mess that phone cameras struggle with at arm's length.

so don't add every field just because you can. pick the ones that matter. for most people that's name, phone, email, maybe org.

if you do need more data, bump up the error correction. qrzap has an error correction selector (L, M, Q, H). higher error correction means more redundancy, which helps with scanning reliability but also adds density. it's a tradeoff. for a business card with decent print quality, M is usually fine.

**the contact picker thing**

on android, there's a contact picker API that lets you import contact data from your existing phone contacts into a web form. qrzap supports this. so if you want to make a vcard qr for someone who's already in your phone, you can pull their info directly instead of retyping it. tap the contact picker, select the person, fields get filled in.

doesn't work on iOS because apple doesn't support the contact picker API in safari. just an android thing for now.

**where people actually use these**

business cards are the obvious one. but i've seen a few other setups that work well:

- team directories. a company prints a sheet with everyone's name and qr code. new employee scans the whole page on day one
- event badges. conference prints a vcard qr on each attendee's badge. you meet someone, scan their badge, done
- email signatures. the qr is just an img tag pointing at the API. every email becomes a scannable contact card
- real estate agents. they put the qr on for-sale signs. potential buyers scan and the agent's contact is in their phone before they even call

**the 23 business cards problem**

i went to another event two weeks ago. this time i had my vcard qr on my phone lock screen. someone wanted my contact, i showed them the screen, they scanned it, saved. took about 4 seconds.

i still collected 9 paper business cards from people who didn't have a qr. typed those in manually. mistyped one phone number. sent a text to a stranger.

anyway. the format has existed for 30 years and most people at conferences are still
