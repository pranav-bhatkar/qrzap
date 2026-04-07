# qrzap-mcp

MCP server for generating QR codes. Supports URL, WiFi, phone, email, SMS, vCard, and plain text.

One tool. Seven QR types. Zero config.

## Install

**Claude Code**
```bash
claude mcp add qrzap -- npx qrzap-mcp@latest
```

**Claude Desktop / Cursor / VS Code**
```json
{
  "mcpServers": {
    "qrzap": {
      "command": "npx",
      "args": ["qrzap-mcp@latest"]
    }
  }
}
```

## Usage

Just ask your AI naturally:

- "Generate a QR code for https://example.com"
- "Make a WiFi QR for network MyWiFi with password secret123"
- "Create a contact QR for John Doe, phone +1234567890"

## Tool: `generate_qr`

| Param | Type | Description |
|-------|------|-------------|
| `type` | string | **Required.** `url`, `wifi`, `phone`, `email`, `sms`, `vcard`, `text` |
| `size` | number | Image size in pixels (default: 400) |
| `format` | string | `png` or `svg` (default: png) |
| `errorCorrection` | string | `L`, `M`, `Q`, `H` (default: M) |

### Type-specific params

| Type | Required | Optional |
|------|----------|----------|
| `url` | `url` | |
| `text` | `text` | |
| `phone` | `phone` | |
| `wifi` | `ssid` | `password`, `encryption`, `hidden` |
| `email` | `email` | `subject`, `body` |
| `sms` | `phone` | `message` |
| `vcard` | `firstName` | `lastName`, `phone`, `email`, `org`, `url` |

## REST API

Also available as a free REST API:

```
https://qrzap.fun/api/generate?type=url&url=https://example.com
```

## Links

- [Web Generator](https://qrzap.fun)
- [API Docs](https://qrzap.fun/docs)
- [GitHub](https://github.com/pranav-bhatkar/qrzap)

## License

MIT
