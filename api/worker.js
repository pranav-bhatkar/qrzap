/**
 * QRzap REST API - Cloudflare Worker
 *
 * Deploy: wrangler deploy api/worker.js --name qrzap-api
 *
 * Usage: POST https://api.qrzap.fun/generate
 *        GET  https://api.qrzap.fun/generate?type=url&url=https://example.com
 */

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
  wifi: ({ ssid, password = "", encryption = "WPA", hidden = false }) =>
    `WIFI:T:${encryption};S:${ssid || ""};P:${password};H:${hidden};;`,
  vcard: ({ firstName = "", lastName = "", phone, email, org, url }) => {
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
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

async function handleGenerate(params) {
  const type = params.type;
  if (!type || !QR_BUILDERS[type]) {
    return jsonResponse(
      { error: `Invalid type. Valid: ${Object.keys(QR_BUILDERS).join(", ")}` },
      400
    );
  }

  const builder = QR_BUILDERS[type];
  const data = builder(params);

  if (!data) {
    return jsonResponse({ error: "No data to encode. Check required fields." }, 400);
  }

  const size = parseInt(params.size) || 400;
  const ec = ["L", "M", "Q", "H"].includes(params.errorCorrection)
    ? params.errorCorrection
    : "M";
  const format = params.format === "svg" ? "svg" : "png";

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(data, {
        type: "svg",
        width: size,
        margin: 2,
        errorCorrectionLevel: ec,
      });
      return new Response(svg, {
        headers: { "Content-Type": "image/svg+xml", ...CORS_HEADERS },
      });
    }

    const dataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin: 2,
      errorCorrectionLevel: ec,
    });
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    return new Response(binary, {
      headers: { "Content-Type": "image/png", ...CORS_HEADERS },
    });
  } catch (err) {
    return jsonResponse({ error: `Generation failed: ${err.message}` }, 500);
  }
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "") {
      return jsonResponse({
        name: "QRzap API",
        version: "1.0.0",
        docs: "https://qrzap.fun/docs",
        endpoints: {
          "GET /generate": "Generate QR code with query parameters",
          "POST /generate": "Generate QR code with JSON body",
        },
        types: Object.keys(QR_BUILDERS),
      });
    }

    if (url.pathname === "/generate") {
      let params = {};

      if (request.method === "POST") {
        try {
          params = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON body" }, 400);
        }
      } else if (request.method === "GET") {
        for (const [key, value] of url.searchParams) {
          params[key] = value;
        }
      } else {
        return jsonResponse({ error: "Method not allowed" }, 405);
      }

      return handleGenerate(params);
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};
