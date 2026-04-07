#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import QRCode from "qrcode";

const QR_TYPES = {
  url: {
    description: "Generate QR code for a URL",
    params: {
      url: { type: "string", description: "The URL to encode" },
    },
    required: ["url"],
    build: ({ url }) => url,
  },
  wifi: {
    description: "Generate QR code for WiFi network credentials",
    params: {
      ssid: { type: "string", description: "Network name (SSID)" },
      password: { type: "string", description: "Network password" },
      encryption: { type: "string", description: "Encryption type: WPA, WEP, or nopass", default: "WPA" },
      hidden: { type: "boolean", description: "Whether the network is hidden", default: false },
    },
    required: ["ssid"],
    build: ({ ssid, password = "", encryption = "WPA", hidden = false }) =>
      `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`,
  },
  phone: {
    description: "Generate QR code for a phone number",
    params: {
      phone: { type: "string", description: "Phone number with country code" },
    },
    required: ["phone"],
    build: ({ phone }) => `tel:${phone}`,
  },
  email: {
    description: "Generate QR code for an email address with optional subject and body",
    params: {
      email: { type: "string", description: "Email address" },
      subject: { type: "string", description: "Email subject" },
      body: { type: "string", description: "Email body" },
    },
    required: ["email"],
    build: ({ email, subject, body }) => {
      const params = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      return `mailto:${email}${params.length ? "?" + params.join("&") : ""}`;
    },
  },
  sms: {
    description: "Generate QR code for an SMS message",
    params: {
      phone: { type: "string", description: "Phone number" },
      message: { type: "string", description: "Pre-filled message text" },
    },
    required: ["phone"],
    build: ({ phone, message }) =>
      `sms:${phone}${message ? "?body=" + encodeURIComponent(message) : ""}`,
  },
  vcard: {
    description: "Generate QR code for a contact card (vCard)",
    params: {
      firstName: { type: "string", description: "First name" },
      lastName: { type: "string", description: "Last name" },
      phone: { type: "string", description: "Phone number" },
      email: { type: "string", description: "Email address" },
      org: { type: "string", description: "Organization name" },
      url: { type: "string", description: "Website URL" },
    },
    required: ["firstName"],
    build: ({ firstName, lastName = "", phone, email, org, url }) => {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${lastName};${firstName};;;`,
        `FN:${firstName} ${lastName}`.trim(),
      ];
      if (phone) lines.push(`TEL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      if (org) lines.push(`ORG:${org}`);
      if (url) lines.push(`URL:${url}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    },
  },
  text: {
    description: "Generate QR code for plain text",
    params: {
      text: { type: "string", description: "The text to encode" },
    },
    required: ["text"],
    build: ({ text }) => text,
  },
};

function buildToolSchema() {
  const properties = {
    type: {
      type: "string",
      enum: Object.keys(QR_TYPES),
      description: "Type of QR code to generate",
    },
    size: {
      type: "number",
      description: "QR code size in pixels (default: 400)",
    },
    errorCorrection: {
      type: "string",
      enum: ["L", "M", "Q", "H"],
      description: "Error correction level (default: M)",
    },
    format: {
      type: "string",
      enum: ["png", "svg"],
      description: "Output format (default: png)",
    },
  };

  for (const [, config] of Object.entries(QR_TYPES)) {
    for (const [key, param] of Object.entries(config.params)) {
      if (!properties[key]) {
        properties[key] = { type: param.type, description: param.description };
      }
    }
  }

  return {
    type: "object",
    properties,
    required: ["type"],
  };
}

const server = new Server(
  { name: "qrzap", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "generate_qr",
      description:
        "Generate a QR code. Supports: URL, WiFi, phone, email, SMS, vCard, and plain text. Returns base64 PNG or SVG string.",
      inputSchema: buildToolSchema(),
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "generate_qr") {
    return {
      content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
      isError: true,
    };
  }

  const args = request.params.arguments ?? {};
  const type = args.type;
  const config = QR_TYPES[type];

  if (!config) {
    return {
      content: [
        {
          type: "text",
          text: `Unknown QR type: ${type}. Valid types: ${Object.keys(QR_TYPES).join(", ")}`,
        },
      ],
      isError: true,
    };
  }

  for (const req of config.required) {
    if (!args[req]) {
      return {
        content: [{ type: "text", text: `Missing required field: ${req}` }],
        isError: true,
      };
    }
  }

  const data = config.build(args);
  const size = args.size ?? 400;
  const errorCorrection = args.errorCorrection ?? "M";
  const format = args.format ?? "png";

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(data, {
        type: "svg",
        width: size,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
      });
      return {
        content: [{ type: "text", text: svg }],
      };
    }

    const dataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin: 2,
      errorCorrectionLevel: errorCorrection,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");

    return {
      content: [
        {
          type: "image",
          data: base64,
          mimeType: "image/png",
        },
        {
          type: "text",
          text: `[QR Code generated as PNG (${size}x${size}px)]\n\nBase64 PNG data (use: echo '<data>' | base64 -d > qr.png):\n\nDATA_START\n${base64}\nDATA_END`,
        },
      ],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `QR generation failed: ${err.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
