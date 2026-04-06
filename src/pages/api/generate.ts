import type { APIRoute } from "astro";
import QRCode from "qrcode";

export const prerender = false;

const QR_BUILDERS: Record<string, (args: Record<string, string>) => string> = {
  url: ({ url }) => url || "",
  text: ({ text }) => text || "",
  phone: ({ phone }) => `tel:${phone || ""}`,
  email: ({ email, subject, body }) => {
    const params: string[] = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    return `mailto:${email || ""}${params.length ? "?" + params.join("&") : ""}`;
  },
  sms: ({ phone, message }) =>
    `sms:${phone || ""}${message ? "?body=" + encodeURIComponent(message) : ""}`,
  wifi: ({ ssid, password = "", encryption = "WPA", hidden = "false" }) =>
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

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

async function handleGenerate(params: Record<string, string>) {
  const type = params.type;
  const builder = QR_BUILDERS[type];

  if (!type || !builder) {
    return jsonError(
      `Invalid type. Valid: ${Object.keys(QR_BUILDERS).join(", ")}`
    );
  }

  const data = builder(params);
  if (!data) {
    return jsonError("No data to encode. Check required fields.");
  }

  const size = parseInt(params.size) || 400;
  const ec = (["L", "M", "Q", "H"] as const).includes(
    params.errorCorrection as "L" | "M" | "Q" | "H"
  )
    ? (params.errorCorrection as "L" | "M" | "Q" | "H")
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
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(`Generation failed: ${message}`, 500);
  }
}

export const OPTIONS: APIRoute = () => {
  return new Response(null, { headers: CORS_HEADERS });
};

export const GET: APIRoute = async ({ url }) => {
  const params: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    params[key] = value;
  }
  return handleGenerate(params);
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const params = (await request.json()) as Record<string, string>;
    return handleGenerate(params);
  } catch {
    return jsonError("Invalid JSON body");
  }
};
