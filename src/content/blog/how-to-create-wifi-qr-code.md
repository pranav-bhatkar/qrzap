---
title: "How to Create a WiFi QR Code in Seconds"
description: "Learn how to generate a WiFi QR code that lets anyone connect to your network instantly by scanning — no typing passwords."
date: 2026-04-07
tags: ["wifi", "qr-code", "guide"]
---

Sharing your WiFi password is annoying. You spell it out, they type it wrong, you spell it again. A WiFi QR code solves this — scan it, connect, done.

## What is a WiFi QR Code?

A WiFi QR code encodes your network name (SSID), password, and encryption type into a standard format. When someone scans it with their phone camera, it auto-connects them to the network.

## How to Create One

### Using QRzap Web

1. Go to [qrzap.fun](https://qrzap.fun)
2. Select **Wi-Fi** from the type selector
3. Enter your network name and password
4. Choose your encryption (WPA/WPA2 for most networks)
5. Download the QR code

### Using the CLI

```bash
npx qrzap g --type wifi --ssid "MyNetwork" --password "secret123" --format png
```

### Using the API

```bash
curl "https://qrzap.fun/api/generate?type=wifi&ssid=MyNetwork&password=secret123" -o wifi.svg
```

Or embed it directly in HTML:

```html
<img src="https://qrzap.fun/api/generate?type=wifi&ssid=MyNetwork&password=secret123" width="200" />
```

## Tips

- **Print it out** and stick it on your router or near the entrance
- **Use WPA/WPA2** encryption — WEP is outdated and insecure
- **Change the password?** Just generate a new QR code
- **For guests**, create a separate guest network and share that QR instead

## Security

The QR code contains your password in plain text (that's how the standard works). Anyone who scans it gets access. Use a guest network for public-facing QR codes.

---

Generate your WiFi QR code now at [qrzap.fun](https://qrzap.fun).
