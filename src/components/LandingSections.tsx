import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrIcon, ClipboardIcon, CheckIcon, LinkIcon, WifiIcon, PhoneIcon, EmailIcon, HeartIcon } from "./icons";

// --- Copy button ---
function CopyBtn({ text, className = "", onCopy }: { text: string; className?: string; onCopy?: () => void }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); onCopy?.(); }}
      className={`flex items-center gap-1 text-[10px] uppercase tracking-widest transition-colors ${ok ? "text-emerald-400" : "text-muted-foreground/60 hover:text-muted-foreground"} ${className}`}>
      {ok ? <CheckIcon className="w-3 h-3" /> : <ClipboardIcon className="w-3 h-3" />}
      {ok ? "Copied" : "Copy"}
    </button>
  );
}

// --- Terminal block ---
function Terminal({ command, title }: { command: string; title: string }) {
  return (
    <div className="rounded-xl border border-border/20 bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] text-muted-foreground/40 ml-2">{title}</span>
        </div>
        <CopyBtn text={command} />
      </div>
      <div className="p-4">
        <code className="text-sm font-mono text-emerald-400">$ {command}</code>
      </div>
    </div>
  );
}

// --- Typing animation ---
function TypeWriter({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse">|</span>}
    </span>
  );
}

// --- Section wrapper ---
function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`py-20 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">{children}</div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-medium mb-3">{children}</p>;
}

// === MCP Section ===
function MCPSection() {
  const tabs = [
    { id: "claude-code", label: "Claude Code", cmd: "claude mcp add qrzap -- npx qrzap@latest" },
    { id: "claude-desktop", label: "Claude Desktop", cmd: `{
  "mcpServers": {
    "qrzap": {
      "command": "npx",
      "args": ["qrzap@latest"]
    }
  }
}` },
    { id: "cursor", label: "Cursor", cmd: `{
  "mcpServers": {
    "qrzap": {
      "command": "npx",
      "args": ["qrzap@latest"]
    }
  }
}` },
  ];
  const [active, setActive] = useState(tabs[0]);

  return (
    <Section id="mcp">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <SectionLabel>MCP Server</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">One command setup</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-md">
            Add QR code generation to any AI agent. Works with Claude, Cursor, VS Code, and any MCP-compatible client.
          </p>
          <div className="flex gap-1 mb-4">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => { setActive(t); window.posthog?.capture("mcp_setup_tab_selected", { tab: t.id }); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${active.id === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/60 mt-4">
            Then ask: <span className="italic text-muted-foreground">"Generate a WiFi QR for network Office, password guest123"</span>
          </p>
        </div>
        <div>
          {active.id === "claude-code" ? (
            <Terminal command={active.cmd} title="Terminal" />
          ) : (
            <div className="rounded-xl border border-border/20 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/10">
                <span className="text-[10px] text-muted-foreground/40">
                  {active.id === "cursor" ? ".cursor/mcp.json" : "claude_desktop_config.json"}
                </span>
                <CopyBtn text={active.cmd} onCopy={() => window.posthog?.capture("mcp_command_copied", { tab: active.id })} />
              </div>
              <pre className="p-4 text-xs font-mono text-sky-400 overflow-x-auto">{active.cmd}</pre>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// === CLI Section ===
function CLISection() {
  return (
    <Section id="cli">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 space-y-3">
          <Terminal command="npx qrzap i" title="Interactive mode" />
          <Terminal command="npx qrzap g --type wifi --ssid Office --password guest --format png" title="Direct generate" />
          <Terminal command="npx qrzap help" title="Help" />
        </div>
        <div className="order-1 md:order-2">
          <SectionLabel>CLI Tool</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Generate from terminal</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-md">
            Interactive prompts, direct generation with flags, or start the MCP server. One package, three modes.
          </p>
          <div className="space-y-2 text-xs text-muted-foreground/60">
            <p><code className="bg-muted/30 px-1.5 py-0.5 rounded font-mono text-[11px] text-muted-foreground">npx qrzap i</code> Interactive mode with guided prompts</p>
            <p><code className="bg-muted/30 px-1.5 py-0.5 rounded font-mono text-[11px] text-muted-foreground">npx qrzap g</code> Direct generation with flags</p>
            <p><code className="bg-muted/30 px-1.5 py-0.5 rounded font-mono text-[11px] text-muted-foreground">npx qrzap</code> Start MCP server (default)</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

// === API Playground ===
function APIPlayground() {
  const [type, setType] = useState("url");
  const [params, setParams] = useState<Record<string, string>>({ url: "https://qrzap.fun" });

  const set = (k: string, v: string) => setParams((p) => ({ ...p, [k]: v }));

  const queryParts = [`type=${type}`];
  if (type === "url" && params.url) queryParts.push(`url=${encodeURIComponent(params.url)}`);
  if (type === "phone" && params.phone) queryParts.push(`phone=${encodeURIComponent(params.phone)}`);
  if (type === "wifi") {
    if (params.ssid) queryParts.push(`ssid=${encodeURIComponent(params.ssid)}`);
    if (params.password) queryParts.push(`password=${encodeURIComponent(params.password)}`);
  }
  if (type === "email" && params.email) queryParts.push(`email=${encodeURIComponent(params.email)}`);

  const apiUrl = `https://qrzap.fun/api/generate?${queryParts.join("&")}`;
  const hasData = (type === "url" && params.url) || (type === "phone" && params.phone) || (type === "wifi" && params.ssid) || (type === "email" && params.email);

  return (
    <Section id="api-playground" className="">
      <SectionLabel>REST API</SectionLabel>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Build your API link</h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-lg">
        No API key needed. Just a URL that returns an SVG image. 60 requests/min per IP.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8 items-start">
        {/* Builder */}
        <div className="space-y-4 min-w-0">
          <div className="flex gap-1">
            {[
              { id: "url", label: "URL", Icon: LinkIcon },
              { id: "wifi", label: "WiFi", Icon: WifiIcon },
              { id: "phone", label: "Phone", Icon: PhoneIcon },
              { id: "email", label: "Email", Icon: EmailIcon },
            ].map((t) => (
              <button key={t.id} onClick={() => { setType(t.id); setParams({}); window.posthog?.capture("api_playground_type_changed", { qr_type: t.id }); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${type === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                <t.Icon className="w-3 h-3" />{t.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border/20 bg-card/50 p-5 space-y-3">
            {type === "url" && (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">URL</Label>
                <Input value={params.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://example.com" className="bg-muted/30 border-border/20 text-sm" />
              </div>
            )}
            {type === "phone" && (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Phone</Label>
                <Input value={params.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="+1234567890" className="bg-muted/30 border-border/20 text-sm" />
              </div>
            )}
            {type === "wifi" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">SSID</Label>
                  <Input value={params.ssid || ""} onChange={(e) => set("ssid", e.target.value)} placeholder="MyNetwork" className="bg-muted/30 border-border/20 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Password</Label>
                  <Input value={params.password || ""} onChange={(e) => set("password", e.target.value)} placeholder="secret123" className="bg-muted/30 border-border/20 text-sm" />
                </div>
              </div>
            )}
            {type === "email" && (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</Label>
                <Input value={params.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="hello@example.com" className="bg-muted/30 border-border/20 text-sm" />
              </div>
            )}
          </div>

          {/* Generated URL */}
          <div className="rounded-xl border border-border/20 bg-zinc-950 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/10">
              <span className="text-[10px] text-muted-foreground/40">Generated URL</span>
              <CopyBtn text={apiUrl} onCopy={() => window.posthog?.capture("api_url_copied", { qr_type: type })} />
            </div>
            <div className="p-4 overflow-x-auto">
              <code className="text-[11px] font-mono text-sky-400 break-all whitespace-pre-wrap">{apiUrl}</code>
            </div>
          </div>

          {/* Embed code */}
          <div className="rounded-xl border border-border/20 bg-zinc-950 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/10">
              <span className="text-[10px] text-muted-foreground/40">HTML Embed</span>
              <CopyBtn text={`<img src="${apiUrl}" alt="QR Code" width="200" />`} />
            </div>
            <pre className="p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">{`<img src="${apiUrl}" alt="QR Code" width="200" />`}</pre>
          </div>
        </div>

        {/* Live QR preview */}
        <div className="md:sticky md:top-20 flex flex-col items-center gap-3">
          <div className="w-[180px] h-[180px] md:w-full md:aspect-square md:max-w-[240px] rounded-xl bg-muted/10 border border-border/20 flex items-center justify-center p-4">
            {hasData ? (
              <img src={apiUrl} alt="QR Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center">
                <QrIcon className="w-8 h-8 text-muted-foreground/15 mx-auto mb-1" />
                <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">Enter data</p>
              </div>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">Live from API</p>
        </div>
      </div>
    </Section>
  );
}

// === Features ===
function FeaturesSection() {
  const features = [
    { title: "7 QR Types", desc: "URL, WiFi, phone, email, SMS, vCard, text. Structured params, not raw strings.", icon: QrIcon },
    { title: "Free API", desc: "No auth, no rate limits, CORS enabled. Returns SVG. Use it as an image source.", icon: LinkIcon },
    { title: "MCP Server", desc: "One command to add QR generation to Claude, Cursor, or any AI agent.", icon: PhoneIcon },
    { title: "Privacy First", desc: "Everything runs client-side. No tracking, no data stored, no cookies.", icon: CheckIcon },
  ];

  return (
    <Section id="features" className="">
      <div className="text-center mb-12">
        <SectionLabel>Why QRzap</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Built for developers</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-border/15 bg-card/30 p-5 space-y-2">
            <f.icon className="w-5 h-5 text-muted-foreground/50" />
            <h3 className="text-sm font-semibold">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// === Open Source CTA ===
function OpenSourceCTA() {
  return (
    <Section id="opensource" className="">
      <div className="text-center max-w-lg mx-auto">
        <SectionLabel>Open Source</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Built in the open</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          QRzap is open source and free forever. Star the repo, fork it, self-host it, or contribute.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="https://github.com/pranav-bhatkar/qrzap" target="_blank" rel="noopener noreferrer" onClick={() => window.posthog?.capture("github_link_clicked")}>
            <Button variant="outline" className="gap-2 text-xs">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
              GitHub
            </Button>
          </a>
          <a href="https://www.npmjs.com/package/qrzap" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 text-xs">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" /></svg>
              npm
            </Button>
          </a>
          <a href="/support">
            <Button variant="outline" className="gap-2 text-xs">
              <HeartIcon className="w-3.5 h-3.5" />
              Support
            </Button>
          </a>
        </div>
      </div>
    </Section>
  );
}

// === Export all sections ===
export default function LandingSections() {
  return (
    <>
      <div className="max-w-6xl mx-auto"><div className="border-t border-zinc-800/40" /></div>
      <MCPSection />
      <div className="max-w-6xl mx-auto"><div className="border-t border-zinc-800/40" /></div>
      <CLISection />
      <div className="max-w-6xl mx-auto"><div className="border-t border-zinc-800/40" /></div>
      <APIPlayground />
      <div className="max-w-6xl mx-auto"><div className="border-t border-zinc-800/40" /></div>
      <FeaturesSection />
      <div className="max-w-6xl mx-auto"><div className="border-t border-zinc-800/40" /></div>
      <OpenSourceCTA />
    </>
  );
}
