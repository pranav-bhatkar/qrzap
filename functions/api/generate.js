import QRCode from "qrcode";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit = null;

function getRatelimit(env) {
  if (ratelimit) return ratelimit;
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
  });
  return ratelimit;
}

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

async function checkRateLimit(request, env) {
  const rl = getRatelimit(env);
  if (!rl) return { limited: false, headers: {} };

  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
  try {
    const { success, limit, remaining, reset } = await rl.limit(ip);
    const headers = {
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(reset),
    };

    if (!success) {
      return {
        limited: true,
        response: new Response(
          JSON.stringify({ error: "Rate limit exceeded. 60 requests per minute.", remaining: 0 }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60", ...headers, ...CORS } }
        ),
      };
    }
    return { limited: false, headers };
  } catch {
    // If Redis is down, allow the request through
    return { limited: false, headers: {} };
  }
}

async function handleGenerate(params, extraHeaders = {}) {
  const type = params.type;
  const builder = QR_BUILDERS[type];
  if (!type || !builder) {
    return new Response(JSON.stringify({ error: `Invalid type. Valid: ${Object.keys(QR_BUILDERS).join(", ")}` }), { status: 400, headers: { "Content-Type": "application/json", ...CORS, ...extraHeaders } });
  }
  const data = builder(params);
  if (!data) {
    return new Response(JSON.stringify({ error: "No data to encode." }), { status: 400, headers: { "Content-Type": "application/json", ...CORS, ...extraHeaders } });
  }
  const size = parseInt(params.size) || 400;
  const ec = ["L", "M", "Q", "H"].includes(params.errorCorrection) ? params.errorCorrection : "M";
  try {
    const svg = await QRCode.toString(data, { type: "svg", width: size, margin: 2, errorCorrectionLevel: ec });
    return new Response(svg, {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400", ...CORS, ...extraHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: `Failed: ${err.message}` }), { status: 500, headers: { "Content-Type": "application/json", ...CORS, ...extraHeaders } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestGet({ request, env }) {
  const rl = await checkRateLimit(request, env);
  if (rl.limited) return rl.response;

  const url = new URL(request.url);
  const params = {};
  for (const [key, value] of url.searchParams) params[key] = value;
  return handleGenerate(params, rl.headers);
}

export async function onRequestPost({ request, env }) {
  const rl = await checkRateLimit(request, env);
  if (rl.limited) return rl.response;

  try {
    const params = await request.json();
    return handleGenerate(params, rl.headers);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS, ...rl.headers } });
  }
}
