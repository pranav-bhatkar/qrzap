#!/usr/bin/env node

import * as p from "@clack/prompts";
import pc from "picocolors";
import QRCode from "qrcode";
import { writeFileSync } from "fs";
import { resolve } from "path";

const VERSION = "1.1.0";

const QR_TYPES = [
  { value: "url", label: "URL", hint: "Website link" },
  { value: "wifi", label: "Wi-Fi", hint: "Network credentials" },
  { value: "phone", label: "Phone", hint: "Phone number" },
  { value: "email", label: "Email", hint: "Email address" },
  { value: "sms", label: "SMS", hint: "Text message" },
  { value: "vcard", label: "vCard", hint: "Contact card" },
  { value: "text", label: "Text", hint: "Plain text" },
];

function buildQRData(type, fields) {
  switch (type) {
    case "url": return fields.url;
    case "text": return fields.text;
    case "phone": return `tel:${fields.phone}`;
    case "email": {
      const params = [];
      if (fields.subject) params.push(`subject=${encodeURIComponent(fields.subject)}`);
      if (fields.body) params.push(`body=${encodeURIComponent(fields.body)}`);
      return `mailto:${fields.email}${params.length ? "?" + params.join("&") : ""}`;
    }
    case "sms": return `sms:${fields.phone}${fields.message ? "?body=" + encodeURIComponent(fields.message) : ""}`;
    case "wifi": return `WIFI:T:${fields.encryption || "WPA"};S:${fields.ssid};P:${fields.password || ""};;`;
    case "vcard": {
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${fields.name}`];
      if (fields.phone) lines.push(`TEL:${fields.phone}`);
      if (fields.email) lines.push(`EMAIL:${fields.email}`);
      if (fields.org) lines.push(`ORG:${fields.org}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    default: return "";
  }
}

async function promptForType(type) {
  const fields = {};
  switch (type) {
    case "url":
      fields.url = await p.text({ message: "URL", placeholder: "https://example.com", validate: (v) => v ? undefined : "Required" });
      break;
    case "text":
      fields.text = await p.text({ message: "Text content", placeholder: "Hello world", validate: (v) => v ? undefined : "Required" });
      break;
    case "phone":
      fields.phone = await p.text({ message: "Phone number", placeholder: "+1234567890", validate: (v) => v ? undefined : "Required" });
      break;
    case "email":
      fields.email = await p.text({ message: "Email address", placeholder: "hello@example.com", validate: (v) => v ? undefined : "Required" });
      fields.subject = await p.text({ message: "Subject (optional)", placeholder: "Press Enter to skip" });
      break;
    case "sms":
      fields.phone = await p.text({ message: "Phone number", placeholder: "+1234567890", validate: (v) => v ? undefined : "Required" });
      fields.message = await p.text({ message: "Message (optional)", placeholder: "Press Enter to skip" });
      break;
    case "wifi":
      fields.ssid = await p.text({ message: "Network name (SSID)", validate: (v) => v ? undefined : "Required" });
      fields.password = await p.text({ message: "Password (optional)", placeholder: "Press Enter for open network" });
      fields.encryption = await p.select({ message: "Encryption", options: [
        { value: "WPA", label: "WPA/WPA2" },
        { value: "WEP", label: "WEP" },
        { value: "nopass", label: "None (open)" },
      ]});
      break;
    case "vcard":
      fields.name = await p.text({ message: "Full name", validate: (v) => v ? undefined : "Required" });
      fields.phone = await p.text({ message: "Phone (optional)", placeholder: "Press Enter to skip" });
      fields.email = await p.text({ message: "Email (optional)", placeholder: "Press Enter to skip" });
      fields.org = await p.text({ message: "Organization (optional)", placeholder: "Press Enter to skip" });
      break;
  }

  // Check for cancellation
  for (const val of Object.values(fields)) {
    if (p.isCancel(val)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
  }

  return fields;
}

async function generateAndSave(data, format, outputPath) {
  if (format === "svg") {
    const svg = await QRCode.toString(data, { type: "svg", width: 400, margin: 2 });
    writeFileSync(outputPath, svg);
  } else if (format === "terminal") {
    const text = await QRCode.toString(data, { type: "utf8", small: true });
    console.log("\n" + text);
    return;
  } else {
    const dataUrl = await QRCode.toDataURL(data, { width: 400, margin: 2, color: { dark: "#000000", light: "#ffffff" } });
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    writeFileSync(outputPath, Buffer.from(base64, "base64"));
  }
  p.log.success(`Saved to ${pc.cyan(outputPath)}`);
}

async function interactiveMode() {
  p.intro(pc.bgCyan(pc.black(" QRzap ")));

  const type = await p.select({
    message: "What type of QR code?",
    options: QR_TYPES,
  });

  if (p.isCancel(type)) { p.cancel("Cancelled."); process.exit(0); }

  const fields = await promptForType(type);
  const data = buildQRData(type, fields);

  if (!data) { p.log.error("No data to encode."); process.exit(1); }

  const format = await p.select({
    message: "Output format",
    options: [
      { value: "terminal", label: "Show in terminal", hint: "Preview right here" },
      { value: "png", label: "Save as PNG", hint: "qr.png" },
      { value: "svg", label: "Save as SVG", hint: "qr.svg (vector)" },
    ],
  });

  if (p.isCancel(format)) { p.cancel("Cancelled."); process.exit(0); }

  let outputPath = "";
  if (format !== "terminal") {
    const filename = await p.text({
      message: "Filename",
      placeholder: `qr.${format}`,
      defaultValue: `qr.${format}`,
    });
    if (p.isCancel(filename)) { p.cancel("Cancelled."); process.exit(0); }
    outputPath = resolve(filename || `qr.${format}`);
  }

  const s = p.spinner();
  s.start("Generating QR code");
  await generateAndSave(data, format, outputPath);
  s.stop("Done");

  const again = await p.confirm({ message: "Generate another?" });
  if (again && !p.isCancel(again)) {
    await interactiveMode();
  } else {
    p.outro(pc.dim("qrzap.fun"));
  }
}

function showHelp() {
  console.log(`
  ${pc.bold("QRzap")} ${pc.dim(`v${VERSION}`)}
  ${pc.dim("Free QR code generator — CLI, MCP server, REST API")}

  ${pc.bold("Usage:")}
    ${pc.cyan("qrzap")}                    Start MCP server (for AI agents)
    ${pc.cyan("qrzap interactive")}         Interactive QR code generator
    ${pc.cyan("qrzap generate")} ${pc.dim("<options>")}  Generate QR code directly

  ${pc.bold("Commands:")}
    ${pc.cyan("interactive")}  ${pc.dim("i")}    Interactive mode with prompts
    ${pc.cyan("generate")}     ${pc.dim("g")}    Generate a QR code from flags
    ${pc.cyan("server")}       ${pc.dim("s")}    Start MCP server (default)
    ${pc.cyan("help")}                Show this help
    ${pc.cyan("version")}             Show version

  ${pc.bold("Generate options:")}
    ${pc.dim("--type")}       QR type: url, wifi, phone, email, sms, vcard, text
    ${pc.dim("--url")}        URL to encode
    ${pc.dim("--text")}       Text to encode
    ${pc.dim("--ssid")}       WiFi network name
    ${pc.dim("--password")}   WiFi password
    ${pc.dim("--phone")}      Phone number
    ${pc.dim("--email")}      Email address
    ${pc.dim("--name")}       Contact name (vCard)
    ${pc.dim("--format")}     Output: png, svg, terminal (default: terminal)
    ${pc.dim("--output")}     Output file path (default: qr.png/qr.svg)

  ${pc.bold("Examples:")}
    ${pc.dim("$")} qrzap i
    ${pc.dim("$")} qrzap g --type url --url https://example.com
    ${pc.dim("$")} qrzap g --type wifi --ssid MyNetwork --password secret --format png
    ${pc.dim("$")} qrzap g --type phone --phone +1234567890 --format svg --output contact.svg

  ${pc.dim("Docs:")} https://qrzap.fun/docs
  ${pc.dim("GitHub:")} https://github.com/pranav-bhatkar/qrzap
`);
}

function parseArgs(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) { flags[key] = next; i++; }
      else { flags[key] = true; }
    }
  }
  return flags;
}

async function directGenerate(flags) {
  const type = flags.type;
  if (!type) { console.error(pc.red("Error: --type is required")); process.exit(1); }

  const fields = {
    url: flags.url, text: flags.text, phone: flags.phone,
    email: flags.email, subject: flags.subject, message: flags.message,
    ssid: flags.ssid, password: flags.password, encryption: flags.encryption || "WPA",
    name: flags.name, org: flags.org,
  };

  const data = buildQRData(type, fields);
  if (!data) { console.error(pc.red("Error: Missing required fields for type " + type)); process.exit(1); }

  const format = flags.format || "terminal";
  const output = flags.output || (format !== "terminal" ? `qr.${format}` : "");

  console.log(pc.dim(`  Generating ${type} QR code...`));
  await generateAndSave(data, format, output ? resolve(output) : "");
  if (format === "terminal") {
    console.log(pc.dim(`  Scan the QR code above.`));
  }
}

// --- Entry point ---
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "server" || command === "s") {
  // Default: start MCP server
  import("./server.mjs");
} else if (command === "interactive" || command === "i") {
  interactiveMode();
} else if (command === "generate" || command === "g") {
  directGenerate(parseArgs(args.slice(1)));
} else if (command === "help" || command === "--help" || command === "-h") {
  showHelp();
} else if (command === "version" || command === "--version" || command === "-v") {
  console.log(`qrzap v${VERSION}`);
} else {
  console.error(pc.red(`Unknown command: ${command}`));
  showHelp();
  process.exit(1);
}
