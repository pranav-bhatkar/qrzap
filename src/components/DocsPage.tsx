import { QrIcon } from "./icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function TerminalIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <div className="rounded-lg border border-border/30 overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-muted/30 border-b border-border/20 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {title}
        </div>
      )}
      <pre className="p-4 bg-muted/10 overflow-x-auto text-sm font-mono text-foreground/90 leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto w-full">
          <a href="/" className="flex items-center gap-2">
            <QrIcon className="w-5 h-5 text-foreground" />
            <span className="text-lg font-semibold tracking-tighter">QRzap</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Generator</a>
            <a href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-12 pb-8 px-6 text-center max-w-4xl mx-auto w-full">
        <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/30 flex items-center justify-center mx-auto mb-6">
          <TerminalIcon className="w-7 h-7 text-foreground/70" />
        </div>
        <h1 className="text-4xl font-bold tracking-[-0.04em] mb-3">MCP Server</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
          Generate QR codes from any AI agent or app. One tool, seven QR types, zero config. Works with Claude, Cursor, Windsurf, and any MCP-compatible client.
        </p>
      </header>

      {/* Content */}
      <main className="flex-grow px-6 pb-16 max-w-4xl mx-auto w-full space-y-12">

        {/* Quick Start */}
        <Section title="Quick Start">
          <p className="text-sm text-muted-foreground">Add QRzap to your AI client with a single command.</p>

          <Card className="border-border/30">
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Claude Code</p>
                <CodeBlock>{`claude mcp add qrzap -- npx qrzap-mcp@latest`}</CodeBlock>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Claude Desktop (claude_desktop_config.json)</p>
                <CodeBlock>{`{
  "mcpServers": {
    "qrzap": {
      "command": "npx",
      "args": ["qrzap-mcp@latest"]
    }
  }
}`}</CodeBlock>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Cursor / VS Code (.cursor/mcp.json)</p>
                <CodeBlock>{`{
  "mcpServers": {
    "qrzap": {
      "command": "npx",
      "args": ["qrzap-mcp@latest"]
    }
  }
}`}</CodeBlock>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Tool Reference */}
        <Section title="Tool Reference">
          <p className="text-sm text-muted-foreground">
            The server exposes a single tool: <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono">generate_qr</code>
          </p>

          <Card className="border-border/30">
            <CardContent className="p-6 space-y-6">
              {/* Parameters */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-medium">Common Parameters</p>
                <div className="space-y-2">
                  {[
                    { name: "type", type: "string", required: true, desc: "url, wifi, phone, email, sms, vcard, or text" },
                    { name: "size", type: "number", required: false, desc: "Output size in pixels (default: 400)" },
                    { name: "errorCorrection", type: "string", required: false, desc: "L, M, Q, or H (default: M)" },
                    { name: "format", type: "string", required: false, desc: "png or svg (default: png)" },
                  ].map((p) => (
                    <div key={p.name} className="flex items-start gap-3 text-sm">
                      <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono shrink-0">{p.name}</code>
                      <span className="text-muted-foreground/60 text-xs shrink-0">{p.type}</span>
                      {p.required && <span className="text-[9px] uppercase tracking-widest bg-foreground/10 text-foreground/60 px-1.5 py-0.5 rounded shrink-0">required</span>}
                      <span className="text-muted-foreground text-xs">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type-specific params */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-medium">Type-Specific Parameters</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { type: "url", fields: "url" },
                    { type: "text", fields: "text" },
                    { type: "phone", fields: "phone" },
                    { type: "wifi", fields: "ssid, password, encryption, hidden" },
                    { type: "email", fields: "email, subject, body" },
                    { type: "sms", fields: "phone, message" },
                    { type: "vcard", fields: "firstName, lastName, phone, email, org, url" },
                  ].map((t) => (
                    <div key={t.type} className="p-3 rounded-lg bg-muted/20 border border-border/10">
                      <code className="text-xs font-mono font-semibold">{t.type}</code>
                      <p className="text-xs text-muted-foreground mt-1">{t.fields}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Examples */}
        <Section title="Examples">
          <p className="text-sm text-muted-foreground">Just ask your AI agent naturally. Here are some prompts that work:</p>

          <div className="space-y-3">
            <Card className="border-border/30">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">URL</p>
                <p className="text-sm italic text-muted-foreground mb-3">"Generate a QR code for https://qrzap.fun"</p>
                <CodeBlock title="Tool call">{`{
  "type": "url",
  "url": "https://qrzap.fun"
}`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">WiFi</p>
                <p className="text-sm italic text-muted-foreground mb-3">"Make a QR for my home WiFi: network MyWiFi, password secret123"</p>
                <CodeBlock title="Tool call">{`{
  "type": "wifi",
  "ssid": "MyWiFi",
  "password": "secret123",
  "encryption": "WPA"
}`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">vCard</p>
                <p className="text-sm italic text-muted-foreground mb-3">"Create a contact QR for John Doe, phone +1234567890, email john@example.com"</p>
                <CodeBlock title="Tool call">{`{
  "type": "vcard",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "email": "john@example.com"
}`}</CodeBlock>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Response Format */}
        <Section title="Response Format">
          <p className="text-sm text-muted-foreground">
            PNG format returns an MCP image content block (base64). SVG format returns the SVG markup as text.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <CodeBlock title="PNG response">{`{
  "content": [{
    "type": "image",
    "data": "<base64>",
    "mimeType": "image/png"
  }]
}`}</CodeBlock>
            <CodeBlock title="SVG response">{`{
  "content": [{
    "type": "text",
    "text": "<svg>...</svg>"
  }]
}`}</CodeBlock>
          </div>
        </Section>

        {/* npm */}
        <Section title="Install MCP Globally">
          <p className="text-sm text-muted-foreground">
            If you prefer installing globally instead of using npx:
          </p>
          <CodeBlock>{`npm install -g qrzap-mcp`}</CodeBlock>
          <p className="text-sm text-muted-foreground">
            Then use <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono">qrzap-mcp</code> as the command in your MCP config instead of <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono">npx qrzap-mcp@latest</code>.
          </p>
        </Section>

        {/* REST API */}
        <div className="pt-4">
          <div className="w-full h-px bg-border/30 mb-12" />
        </div>

        <Section title="REST API">
          <p className="text-sm text-muted-foreground">
            For non-MCP integrations, use the REST API directly. Returns the QR image as PNG or SVG.
          </p>

          <Card className="border-border/30">
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Base URL</p>
                <CodeBlock>{`https://qrzap.fun/api`}</CodeBlock>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Endpoints</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono shrink-0">GET</code>
                    <code className="text-xs font-mono text-muted-foreground">/generate?type=url&url=https://example.com</code>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded font-mono shrink-0">POST</code>
                    <code className="text-xs font-mono text-muted-foreground">{`/generate  { "type": "url", "url": "..." }`}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title="API Examples">
          <div className="space-y-3">
            <Card className="border-border/30">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">cURL - GET (returns PNG)</p>
                <CodeBlock>{`curl "https://qrzap.fun/api/generate?type=url&url=https://qrzap.fun" -o qr.png`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">cURL - POST with JSON</p>
                <CodeBlock>{`curl -X POST https://qrzap.fun/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"type":"wifi","ssid":"MyNetwork","password":"secret123"}' \\
  -o wifi-qr.png`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">SVG format</p>
                <CodeBlock>{`curl "https://qrzap.fun/api/generate?type=url&url=https://qrzap.fun&format=svg" -o qr.svg`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">JavaScript / Fetch</p>
                <CodeBlock>{`const res = await fetch("https://qrzap.fun/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "vcard",
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    email: "john@example.com"
  })
});
const blob = await res.blob();
// Use the blob as an image`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Python</p>
                <CodeBlock>{`import requests

response = requests.post("https://qrzap.fun/api/generate", json={
    "type": "email",
    "email": "hello@example.com",
    "subject": "Hello"
})

with open("qr.png", "wb") as f:
    f.write(response.content)`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">HTML - Inline Image</p>
                <CodeBlock>{`<img src="https://qrzap.fun/api/generate?type=url&url=https://qrzap.fun"
     alt="QR Code" width="200" height="200" />`}</CodeBlock>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="API Parameters">
          <p className="text-sm text-muted-foreground">Same parameters as the MCP tool. All query params or JSON body fields work identically.</p>
          <Card className="border-border/30">
            <CardContent className="p-5">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono shrink-0">format=png</code>
                  <span className="text-xs text-muted-foreground">Returns <code className="text-xs">image/png</code> binary</span>
                </div>
                <div className="flex items-start gap-3">
                  <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono shrink-0">format=svg</code>
                  <span className="text-xs text-muted-foreground">Returns <code className="text-xs">image/svg+xml</code> markup</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-3">
                No API key needed. CORS enabled. Free and open.
              </p>
            </CardContent>
          </Card>
        </Section>

        {/* Self-Host */}
        <Section title="Self-Host">
          <p className="text-sm text-muted-foreground">
            The entire project is open source. Clone and deploy your own instance:
          </p>
          <CodeBlock>{`git clone https://github.com/pranav-bhatkar/qrzap.git
cd qrzap && npm install && npm run build`}</CodeBlock>
        </Section>

        {/* CTA */}
        <div className="text-center pt-4">
          <a href="/">
            <Button size="lg" className="gap-2">
              <QrIcon className="w-4 h-4" />
              Try the Web Generator
            </Button>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-6 max-w-4xl mx-auto gap-4">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">QRzap</span>
          <div className="flex items-center gap-6">
            <a href="/support" className="text-[11px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors">Support</a>
            <a href="https://github.com/pranav-bhatkar/qrzap" target="_blank" rel="noopener noreferrer" className="text-[11px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
