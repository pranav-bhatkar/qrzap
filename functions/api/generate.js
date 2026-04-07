import QRCode from "qrcode";

const QR_BUILDERS = {
  url: ({ url }) => url || "",
  text: ({ text }) => text || "",
  phone: ({ phone }) => `tel:${phone || ""}`,
  email: ({ email, subject, body }) => {
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    return `mailto:${email || ""}${params.length ? "?" + params.join("&") : ""}`;
  },
  sms: ({ phone, message }) =>
    `sms:${phone || ""}${message ? "?body=" + encodeURIComponent(message) : ""}`,
  wifi: ({ ssid, password = "", encryption = "WPA", hidden = "false" }) =>
    `WIFI:T:${encryption};S:${ssid || ""};P:${password};H:${hidden};;`,
  vcard: ({ firstName = "", lastName = "", phone, email, org, url }) => {
    const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${lastName};${firstName};;;`, `FN:${firstName} ${lastName}`.trim()];
    if (phone) lines.push(`TEL:${phone}`);
    if (email) lines.push(`EMAIL:${email}`);
    if (org) lines.push(`ORG:${org}`);
    if (url) lines.push(`URL:${url}`);
    lines.push("END:VCARD");
    return lines.join("\n");
  },
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handleGenerate(params) {
  const type = params.type;
  const builder = QR_BUILDERS[type];
  if (!type || !builder) {
    return new Response(JSON.stringify({ error: `Invalid type. Valid: ${Object.keys(QR_BUILDERS).join(", ")}` }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
  }
  const data = builder(params);
  if (!data) {
    return new Response(JSON.stringify({ error: "No data to encode." }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
  }
  const size = parseInt(params.size) || 400;
  const ec = ["L", "M", "Q", "H"].includes(params.errorCorrection) ? params.errorCorrection : "M";
  const format = params.format === "svg" ? "svg" : "png";
  try {
    if (format === "svg") {
      const svg = await QRCode.toString(data, { type: "svg", width: size, margin: 2, errorCorrectionLevel: ec });
      return new Response(svg, { headers: { "Content-Type": "image/svg+xml", ...CORS } });
    }
    const dataUrl = await QRCode.toDataURL(data, { width: size, margin: 2, errorCorrectionLevel: ec });
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return new Response(binary, { headers: { "Content-Type": "image/png", ...CORS } });
  } catch (err) {
    return new Response(JSON.stringify({ error: `Failed: ${err.message}` }), { status: 500, headers: { "Content-Type": "application/json", ...CORS } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const params = {};
  for (const [key, value] of url.searchParams) params[key] = value;
  return handleGenerate(params);
}

export async function onRequestPost({ request }) {
  try {
    const params = await request.json();
    return handleGenerate(params);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
  }
}
