---
title: "your ai agent can't make a qr code. yet."
description: "qrzap adds qr code generation to claude, cursor, and any mcp-compatible ai agent."
date: 2026-04-06
tags: ["mcp", "ai", "developer-tools"]
---

so your ai agent can write a react component, deploy it to vercel, send you a slack message about it, and then update a jira ticket. cool. now ask it to make a qr code.

it can't.

i kept running into this. i'd be in claude code, building something, and i'd need a qr code for a wifi network or a url or whatever. and every time i had to leave the terminal, open a browser, go to some website, fill in a form, download the image, move it to the right folder. felt dumb.

the thing is, MCP exists now. model context protocol. it's the standard for connecting ai agents to external tools. claude uses it, cursor uses it, vs code with copilot uses it. there are 8000+ integrations on zapier alone. your agent can search the web, read files, query databases, manage calendars, post to slack.

but no qr codes. i checked.

**the gap is weird**

qr codes are everywhere. restaurant menus, wifi passwords at airbnbs, event tickets, payment links. and yet the entire MCP ecosystem somehow skipped over a thing that millions of people use daily. you can ask claude to write a qr code library from scratch, sure. but you can't ask it to just... make one and hand it to you.

so i built the thing.

[qrzap](https://qrzap.fun) ships as an MCP server. one line to install:

```bash
npx qrzap@latest
```

one command to add it to claude code:

```bash
claude mcp add qrzap -- npx qrzap@latest
```

that's it. now you can talk to it like a normal person.

"make a wifi qr for network Office, password guest123"

and it does it. returns the image right there in your terminal. no browser, no forms, no copy-pasting ssids.

**it's not just raw text**

most qr generators dump everything into a plain text string. qrzap handles 7 structured types: url, wifi, email, phone, sms, vcard, and plain text. the difference matters because a wifi qr code has a specific encoding format that phones actually understand. a vcard qr code opens the contact app. structure matters.

so you can say things like:

- "generate a vcard qr for pranav, email pranav@example.com, phone 555-1234"
- "make a qr code for the url https://qrzap.fun"
- "create an email qr that opens a compose to support@qrzap.fun with subject Bug Report"

and the ai figures out the type and the parameters and gives you the image.

**works in cursor too**

same MCP protocol, same server. if you're in cursor or vs code with copilot chat, you can add qrzap as an MCP server and get the same thing. the setup varies slightly per editor but the server is the same `npx qrzap@latest` command.

i've been using it mostly in claude code because that's where i live, but it works anywhere MCP works.

**it's on npm**

```bash
npm info qrzap
```

open source. you can read the code, fork it, whatever. the whole point was to fill a gap that shouldn't exist. ai agents have access to thousands of tools and somehow "make me a qr code" wasn't one of them.

now it is.

i think about this a lot actually. the MCP ecosystem is growing fast but there are still these random holes. basic stuff that nobody built because it seemed too simple or too niche. qr codes aren't niche. they're on every table at every restaurant i've been to in the last two years.

anyway. `npx qrzap@latest`. that's the whole thing.
