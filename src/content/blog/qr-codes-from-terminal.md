---
title: "qr codes from your terminal."
description: "generate wifi, vcard, email qr codes from the command line without constructing raw strings."
date: 2026-04-05
tags: ["cli", "developer-tools", "terminal"]
---

so i needed a wifi qr code for the office. opened my terminal because that's where i live. ran `qrencode` and typed my wifi password as a string.

then i remembered wifi qr codes aren't just plain text. the format is this:

```
WIFI:T:WPA;S:MyNetwork;P:xK9$mN2p;;
```

yea. you have to build that string yourself. the semicolons, the `T:` prefix for encryption type, the `S:` for SSID. miss one semicolon and the phone just stares at you.

tried `segno` too. same deal. these tools take a raw string and turn it into a QR. they don't care what's inside the string. you're on your own for the encoding part.

i spent 12 minutes googling the wifi QR string format. twelve. for something that should take five seconds.

**this is the thing that bothered me**

every CLI QR tool works the same way: give me text, i give you squares. but nobody asks *what kind* of QR you're making. wifi? vcard? email? doesn't matter to them. you construct the string, you pass it in, you pray you got the spec right.

vcards are worse btw. the format looks like this:

```
BEGIN:VCARD
VERSION:3.0
N:Bhatkar;Pranav
TEL:+919876543210
EMAIL:pranav@example.com
END:VCARD
```

good luck typing that into a one-liner without messing up a newline.

**qrzap does it differently**

qrzap understands structured types. you tell it you want a wifi QR, it asks for the ssid and password. you tell it you want a vcard, it asks for name, phone, email. no string construction. no memorizing specs.

three ways to use it.

**interactive mode** walks you through it step by step. it uses @clack/prompts so it actually looks nice in the terminal, not like a bash script from 2004.

```bash
npx qrzap i
```

it asks what type of QR you want, then collects the fields one by one. picks sensible defaults. shows you a preview right there in the terminal using UTF-8 block characters.

```
  ████ ██  ████ ██ ████
  █  █ ███ █  █  █ █  █
  ████  █  ████ █  ████
       █ █      ██
  █ ██ ██ █ █ ██ █ ████
  █  ██ █ ██  ██ █
  ████ █  ████  █  ████
```

that's your QR. in your terminal. no browser, no file manager, no nothing.

**direct mode** is for when you know exactly what you want. good for scripts, CI pipelines, automation.

```bash
npx qrzap g --type wifi --ssid "OfficeNet" --password "xK9$mN2p" --encryption WPA --format png
```

outputs a png. you can also do `--format svg` or `--format terminal` if you just want to see it on screen.

```bash
npx qrzap g --type vcard --name "Pranav Bhatkar" --phone "+919876543210" --email "pranav@example.com" --format svg
```

that builds the entire vcard string for you. no `BEGIN:VCARD` nonsense.

email QR codes too:

```bash
npx qrzap g --type email --to "hello@qrzap.fun" --subject "hey" --format terminal
```

**the third mode is MCP**

if you run `npx qrzap` with no arguments it starts as an MCP server. this means claude or any MCP client can call it as a tool. ask claude to "make me a wifi qr code for my home network" and it calls qrzap under the hood. but that's a different blog post.

**the part i actually care about**

i can pipe things now. i have a script that reads wifi credentials from a config file and generates QR codes for each network. took maybe 15 lines of bash. with `qrencode` i would've needed a helper function just to assemble the wifi string format.

the terminal preview is surprisingly useful too. i ssh into a server, generate a QR, and it renders right there. screenshot it from my phone if i need to. ugly workflow but it works at 2am when you're too tired to open a browser.

one package. `npx qrzap`. no global install, no dependencies to manage, runs and
