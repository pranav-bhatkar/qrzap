# QRzap

Free, open-source QR code generator with a web UI, REST API, and MCP server.

Supports URL, WiFi, phone, email, SMS, vCard, and plain text.

**[qrzap.fun](https://qrzap.fun)** | **[Docs](https://qrzap.fun/docs)** | **[API Reference](https://qrzap.fun/docs/reference)** | **[npm](https://www.npmjs.com/package/qrzap)**

## Features

- **Web UI** - Generate and download QR codes instantly. Customize colors, size, error correction.
- **REST API** - `GET /api/generate?type=url&url=...` returns SVG. No API key, CORS enabled.
- **MCP Server** - `npx qrzap` adds QR generation to any AI agent. Works with Claude, Cursor, VS Code.
- **7 QR types** - URL, WiFi, phone, email, SMS, vCard, text. Structured params (pass `ssid` and `password`, not raw WiFi strings).
- **Download formats** - PNG, SVG, JPEG, WebP from the web UI.
- **Privacy** - Everything runs client-side. No data stored. No tracking.

## MCP Server

One command to add QR code generation to any AI client:

```bash
# Claude Code
claude mcp add qrzap -- npx qrzap@latest

# Claude Desktop / Cursor / VS Code (add to config JSON)
{
  "mcpServers": {
    "qrzap": {
      "command": "npx",
      "args": ["qrzap@latest"]
    }
  }
}
```

Then ask: *"Generate a QR code for my WiFi network MyWiFi with password secret123"*

## REST API

```bash
# URL QR code
curl "https://qrzap.fun/api/generate?type=url&url=https://example.com" -o qr.svg

# WiFi QR code
curl -X POST https://qrzap.fun/api/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"wifi","ssid":"MyNetwork","password":"secret123"}' \
  -o wifi.svg

# Embed in HTML
<img src="https://qrzap.fun/api/generate?type=url&url=https://example.com" width="200" />
```

## Run locally

```bash
git clone https://github.com/pranav-bhatkar/qrzap.git
cd qrzap
npm install
npm run dev
```

## Tech stack

- [Astro](https://astro.build) + [React](https://react.dev)
- [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS](https://tailwindcss.com)
- [qrcode](https://www.npmjs.com/package/qrcode) (generation)
- [Cloudflare Pages](https://pages.cloudflare.com) (hosting)
- [MCP SDK](https://modelcontextprotocol.io) (AI agent integration)

## Support

If you find QRzap useful, consider supporting the project:

- [Buy Me a Coffee](https://buymeacoffee.com/pranavbhatkar)
- [Razorpay](https://razorpay.me/@pranavbhatkar)

## License

MIT
