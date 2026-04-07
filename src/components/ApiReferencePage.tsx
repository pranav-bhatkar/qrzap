import { useState } from "react";
import { QrIcon } from "./icons";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="absolute top-2 right-2 text-[10px] uppercase tracking-widest text-muted-foreground/40 hover:text-muted-foreground transition-colors px-2 py-1 rounded bg-background/50">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Code({ children }: { children: string }) {
  return (
    <div className="relative rounded-lg border border-border/20 overflow-hidden">
      <pre className="p-4 text-xs font-mono leading-relaxed text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all"><code>{children}</code></pre>
      <CopyButton text={children} />
    </div>
  );
}

const TYPES = [
  { type: "url", required: "url", optional: "", example: '{ "type": "url", "url": "https://example.com" }' },
  { type: "text", required: "text", optional: "", example: '{ "type": "text", "text": "Hello World" }' },
  { type: "phone", required: "phone", optional: "", example: '{ "type": "phone", "phone": "+1234567890" }' },
  { type: "wifi", required: "ssid", optional: "password, encryption (WPA|WEP|nopass), hidden", example: '{ "type": "wifi", "ssid": "MyNetwork", "password": "secret", "encryption": "WPA" }' },
  { type: "email", required: "email", optional: "subject, body", example: '{ "type": "email", "email": "hi@example.com", "subject": "Hello" }' },
  { type: "sms", required: "phone", optional: "message", example: '{ "type": "sms", "phone": "+1234567890", "message": "Hey!" }' },
  { type: "vcard", required: "firstName", optional: "lastName, phone, email, org, url", example: '{ "type": "vcard", "firstName": "John", "lastName": "Doe", "phone": "+1234567890" }' },
];

const TOC = [
  { id: "endpoint", label: "Endpoint" },
  { id: "common", label: "Common Params" },
  { id: "types", label: "QR Types" },
  { id: "responses", label: "Responses" },
  { id: "errors", label: "Errors" },
  { id: "mcp-tool", label: "MCP Tool Schema" },
];

export default function ApiReferencePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-5 py-3 max-w-6xl mx-auto">
          <a href="/" className="flex items-center gap-2">
            <QrIcon className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-tight">QRzap</span>
          </a>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">Generator</a>
            <a href="/docs" className="hover:text-foreground transition-colors">Docs</a>
            <a href="/support" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </nav>

      <main className="flex-grow px-4 md:px-8 py-10 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-[180px_1fr] gap-10">
          <aside className="hidden md:block">
            <div className="sticky top-16 space-y-1">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-medium mb-3">Reference</p>
              {TOC.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="block text-xs text-muted-foreground hover:text-foreground transition-colors py-1">{item.label}</a>
              ))}
              <div className="border-t border-border/20 mt-4 pt-4">
                <a href="/docs" className="block text-xs text-muted-foreground hover:text-foreground transition-colors py-1">Back to Docs</a>
              </div>
            </div>
          </aside>

          <div className="space-y-14 max-w-2xl min-w-0">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">API Reference</h1>
              <p className="text-sm text-muted-foreground">Complete parameter reference for the QRzap REST API and MCP tool.</p>
            </div>

            {/* Endpoint */}
            <section id="endpoint" className="space-y-3">
              <h2 className="text-base font-semibold tracking-tight">Endpoint</h2>
              <div className="flex gap-3 text-xs">
                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">GET</span>
                <code className="text-muted-foreground font-mono">/api/generate?type=...&amp;...</code>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-mono">POST</span>
                <code className="text-muted-foreground font-mono">/api/generate</code>
                <span className="text-muted-foreground/50">JSON body</span>
              </div>
              <p className="text-xs text-muted-foreground">Base URL: <code className="bg-muted/30 px-1.5 rounded font-mono text-[11px]">https://qrzap.fun</code></p>
              <p className="text-xs text-muted-foreground/60">CORS enabled. No authentication required.</p>
            </section>

            {/* Common params */}
            <section id="common" className="space-y-3">
              <h2 className="text-base font-semibold tracking-tight">Common Parameters</h2>
              <div className="rounded-lg border border-border/20 overflow-x-auto">
                <table className="w-full text-xs min-w-[400px]">
                  <thead><tr className="border-b border-border/10 text-left text-[10px] uppercase tracking-widest text-muted-foreground/50">
                    <th className="px-4 py-2 font-medium">Param</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Default</th>
                    <th className="px-4 py-2 font-medium">Description</th>
                  </tr></thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/5"><td className="px-4 py-2 font-mono text-foreground/80">type</td><td className="px-4 py-2">string</td><td className="px-4 py-2">-</td><td className="px-4 py-2">Required. url, wifi, phone, email, sms, vcard, text</td></tr>
                    <tr className="border-b border-border/5"><td className="px-4 py-2 font-mono text-foreground/80">size</td><td className="px-4 py-2">number</td><td className="px-4 py-2">400</td><td className="px-4 py-2">Image size in pixels</td></tr>
                    <tr className="border-b border-border/5"><td className="px-4 py-2 font-mono text-foreground/80">format</td><td className="px-4 py-2">string</td><td className="px-4 py-2">png</td><td className="px-4 py-2">png or svg</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-foreground/80">errorCorrection</td><td className="px-4 py-2">string</td><td className="px-4 py-2">M</td><td className="px-4 py-2">L, M, Q, or H</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Types */}
            <section id="types" className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">QR Types</h2>
              <div className="space-y-3">
                {TYPES.map((t) => (
                  <div key={t.type} className="rounded-lg border border-border/20 bg-card/50 p-4 space-y-2">
                    <div className="flex items-baseline gap-3">
                      <code className="text-sm font-mono font-semibold text-foreground">{t.type}</code>
                      <span className="text-[10px] text-muted-foreground/50">required: <code className="font-mono">{t.required}</code></span>
                      {t.optional && <span className="text-[10px] text-muted-foreground/40">optional: {t.optional}</span>}
                    </div>
                    <Code>{t.example}</Code>
                  </div>
                ))}
              </div>
            </section>

            {/* Responses */}
            <section id="responses" className="space-y-3">
              <h2 className="text-base font-semibold tracking-tight">Responses</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/20 bg-card/50 p-4 space-y-1">
                  <p className="text-xs font-medium">format=png (default)</p>
                  <p className="text-[10px] text-muted-foreground">Content-Type: <code className="font-mono">image/png</code></p>
                  <p className="text-[10px] text-muted-foreground/60">Binary PNG data</p>
                </div>
                <div className="rounded-lg border border-border/20 bg-card/50 p-4 space-y-1">
                  <p className="text-xs font-medium">format=svg</p>
                  <p className="text-[10px] text-muted-foreground">Content-Type: <code className="font-mono">image/svg+xml</code></p>
                  <p className="text-[10px] text-muted-foreground/60">SVG markup string</p>
                </div>
              </div>
            </section>

            {/* Errors */}
            <section id="errors" className="space-y-3">
              <h2 className="text-base font-semibold tracking-tight">Errors</h2>
              <p className="text-xs text-muted-foreground">Errors return JSON with an <code className="bg-muted/30 px-1 rounded font-mono text-[10px]">error</code> field.</p>
              <Code>{`{ "error": "Invalid type. Valid: url, wifi, phone, email, sms, vcard, text" }`}</Code>
            </section>

            {/* MCP */}
            <section id="mcp-tool" className="space-y-3">
              <h2 className="text-base font-semibold tracking-tight">MCP Tool Schema</h2>
              <p className="text-xs text-muted-foreground">The MCP server exposes one tool: <code className="bg-muted/30 px-1 rounded font-mono text-[10px]">generate_qr</code>. Same parameters as the REST API. Returns base64 PNG image or SVG text.</p>
              <Code>{`// MCP tool call
{
  "name": "generate_qr",
  "arguments": {
    "type": "wifi",
    "ssid": "Office",
    "password": "guest123"
  }
}`}</Code>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/30 mt-auto">
        <div className="flex items-center justify-between px-5 py-2.5 max-w-6xl mx-auto text-[9px] uppercase tracking-widest text-muted-foreground/30">
          <span>QRzap</span><span>Open Source</span>
        </div>
      </footer>
    </div>
  );
}
