import { useState } from "react";
import { QrIcon } from "./icons";
import { Button } from "@/components/ui/button";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="absolute top-2 right-2 text-[10px] uppercase tracking-widest text-muted-foreground/40 hover:text-muted-foreground transition-colors px-2 py-1 rounded bg-background/50"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Code({ children, title }: { children: string; title?: string }) {
  return (
    <div className="relative rounded-lg border border-border/20 overflow-hidden">
      {title && <div className="px-3 py-1.5 bg-muted/20 border-b border-border/10 text-[9px] uppercase tracking-widest text-muted-foreground/50 font-medium">{title}</div>}
      <pre className="p-4 text-xs font-mono leading-relaxed text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all"><code>{children}</code></pre>
      <CopyButton text={children} />
    </div>
  );
}

const TOC = [
  { id: "quickstart", label: "Quick Start" },
  { id: "mcp", label: "MCP Server" },
  { id: "api", label: "REST API" },
  { id: "embed", label: "Embed" },
  { id: "examples", label: "Examples" },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-grow px-4 md:px-8 py-10 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-[180px_1fr] gap-10">

          {/* TOC - left sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-16 space-y-1">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-medium mb-3">On this page</p>
              {TOC.map((item) => (
                <a key={item.id} href={`#${item.id}`}
                  className="block text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                  {item.label}
                </a>
              ))}
              <div className="border-t border-border/20 mt-4 pt-4">
                <a href="/docs/reference" className="block text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                  Full API Reference
                </a>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-16 max-w-2xl min-w-0">

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Documentation</h1>
              <p className="text-sm text-muted-foreground">Add QR code generation to any app, AI agent, or website in under a minute.</p>
            </div>

            {/* Quick Start */}
            <section id="quickstart" className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">Quick Start</h2>
              <p className="text-sm text-muted-foreground">Choose your integration method:</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <a href="#mcp" className="rounded-lg border border-border/20 bg-card/50 p-4 hover:border-border/40 transition-colors">
                  <p className="text-xs font-semibold mb-1">MCP Server</p>
                  <p className="text-[10px] text-muted-foreground">For AI agents</p>
                </a>
                <a href="#api" className="rounded-lg border border-border/20 bg-card/50 p-4 hover:border-border/40 transition-colors">
                  <p className="text-xs font-semibold mb-1">REST API</p>
                  <p className="text-[10px] text-muted-foreground">For apps and scripts</p>
                </a>
                <a href="#embed" className="rounded-lg border border-border/20 bg-card/50 p-4 hover:border-border/40 transition-colors">
                  <p className="text-xs font-semibold mb-1">HTML Embed</p>
                  <p className="text-[10px] text-muted-foreground">For websites</p>
                </a>
              </div>
            </section>

            {/* MCP */}
            <section id="mcp" className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">MCP Server</h2>
              <p className="text-sm text-muted-foreground">One command to add QR generation to any AI client.</p>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-1.5 font-medium">Claude Code</p>
                  <Code>{`claude mcp add qrzap -- npx qrzap@latest`}</Code>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-1.5 font-medium">Claude Desktop / Cursor / VS Code</p>
                  <Code>{`{
  "mcpServers": {
    "qrzap": {
      "command": "npx",
      "args": ["qrzap@latest"]
    }
  }
}`}</Code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Then ask your AI: <span className="italic">"Generate a QR code for https://example.com"</span></p>
            </section>

            {/* REST API */}
            <section id="api" className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">REST API</h2>
              <p className="text-sm text-muted-foreground">Returns a QR code image directly. No API key needed. Rate limited to 60 requests per minute per IP.</p>

              <Code title="GET">{`https://qrzap.fun/api/generate?type=url&url=https://example.com`}</Code>

              <Code title="POST">{`curl -X POST https://qrzap.fun/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"type":"wifi","ssid":"MyNetwork","password":"secret123"}'\\
  -o wifi.png`}</Code>

              {/* Live demo */}
              <div className="rounded-lg border border-border/20 bg-card/50 p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-3 font-medium">Live Preview</p>
                <div className="flex items-center gap-4">
                  <img
                    src="/api/generate?type=url&url=https://qrzap.fun&size=200"
                    alt="QR Code for qrzap.fun"
                    width={120}
                    height={120}
                    className="rounded bg-white p-1"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-medium">This QR is served live from the API</p>
                    <p className="text-[10px] text-muted-foreground">Try changing the <code className="bg-muted/50 px-1 rounded text-[10px]">url</code> parameter</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Returns <code className="bg-muted/50 px-1 rounded text-[10px]">image/svg+xml</code> (vector SVG). Works as an image source in HTML, Markdown, and any browser.{" "}
                <a href="/docs/reference" className="underline underline-offset-2 hover:text-foreground">See all parameters</a>
              </p>
            </section>

            {/* Embed */}
            <section id="embed" className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">Embed in HTML</h2>
              <p className="text-sm text-muted-foreground">Use the API URL directly as an image source. No JavaScript needed.</p>

              <Code title="HTML">{`<img
  src="https://qrzap.fun/api/generate?type=url&url=https://yoursite.com"
  alt="QR Code"
  width="200"
  height="200"
/>`}</Code>

              <Code title="Markdown">{`![QR Code](https://qrzap.fun/api/generate?type=url&url=https://yoursite.com)`}</Code>
            </section>

            {/* Examples */}
            <section id="examples" className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">Examples</h2>

              <div className="space-y-3">
                <Code title="JavaScript">{`const res = await fetch("https://qrzap.fun/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type: "vcard", firstName: "John", phone: "+1234567890" })
});
const blob = await res.blob();`}</Code>

                <Code title="Python">{`import requests
r = requests.get("https://qrzap.fun/api/generate", params={"type": "url", "url": "https://example.com"})
with open("qr.png", "wb") as f:
    f.write(r.content)`}</Code>
              </div>

              <div className="flex gap-3 pt-2">
                <a href="/docs/reference"><Button variant="outline" size="sm" className="text-xs">Full API Reference</Button></a>
                <a href="/"><Button variant="outline" size="sm" className="text-xs">Try the Generator</Button></a>
              </div>
            </section>
          </div>
        </div>
      </main>

    </div>
  );
}
