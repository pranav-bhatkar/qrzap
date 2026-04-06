import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  LinkIcon, WifiIcon, PhoneIcon, EmailIcon,
  SmsIcon, UserIcon, TextIcon, DownloadIcon,
  PaletteIcon, HeartIcon, QrIcon,
  ClipboardIcon, ShareIcon, ContactBookIcon, CheckIcon,
} from "./icons";

type IconComponent = React.ComponentType<{ className?: string }>;
type QRType = "url" | "wifi" | "phone" | "email" | "sms" | "vcard" | "text";

const QR_TYPES: ReadonlyArray<{ id: QRType; label: string; Icon: IconComponent }> = [
  { id: "url", label: "URL", Icon: LinkIcon },
  { id: "wifi", label: "Wi-Fi", Icon: WifiIcon },
  { id: "phone", label: "Phone", Icon: PhoneIcon },
  { id: "email", label: "Email", Icon: EmailIcon },
  { id: "sms", label: "SMS", Icon: SmsIcon },
  { id: "vcard", label: "vCard", Icon: UserIcon },
  { id: "text", label: "Text", Icon: TextIcon },
];

interface QROptions {
  fgColor: string;
  bgColor: string;
  size: number;
  errorCorrection: "L" | "M" | "Q" | "H";
}

const ERROR_LEVELS = [
  { value: "L", label: "Low" },
  { value: "M", label: "Med" },
  { value: "Q", label: "High" },
  { value: "H", label: "Max" },
] as const;

const PRESET_COLORS = [
  "#ffffff", "#000000", "#0f172a", "#1e293b",
  "#0ea5e9", "#10b981", "#f59e0b", "#ef4444",
];

function buildQRData(type: QRType, fields: Record<string, string>): string {
  switch (type) {
    case "url": return fields.url || "";
    case "text": return fields.text || "";
    case "phone": return `tel:${fields.phone || ""}`;
    case "email": {
      const parts = [`mailto:${fields.emailAddress || ""}`];
      const params: string[] = [];
      if (fields.subject) params.push(`subject=${encodeURIComponent(fields.subject)}`);
      if (fields.body) params.push(`body=${encodeURIComponent(fields.body)}`);
      if (params.length > 0) parts.push(params.join("&"));
      return parts.join("?");
    }
    case "sms": {
      const base = `sms:${fields.smsPhone || ""}`;
      return fields.smsBody ? `${base}?body=${encodeURIComponent(fields.smsBody)}` : base;
    }
    case "wifi":
      return `WIFI:T:${fields.encryption || "WPA"};S:${fields.ssid || ""};P:${fields.wifiPassword || ""};H:${fields.hidden === "true" ? "true" : "false"};;`;
    case "vcard": {
      const lines = [
        "BEGIN:VCARD", "VERSION:3.0",
        `N:${fields.lastName || ""};${fields.firstName || ""};;;`,
        `FN:${(fields.firstName || "") + " " + (fields.lastName || "")}`.trim(),
      ];
      if (fields.vcardPhone) lines.push(`TEL:${fields.vcardPhone}`);
      if (fields.vcardEmail) lines.push(`EMAIL:${fields.vcardEmail}`);
      if (fields.org) lines.push(`ORG:${fields.org}`);
      if (fields.vcardUrl) lines.push(`URL:${fields.vcardUrl}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    default: return "";
  }
}

// --- Paste ---
function PasteButton({ onPaste }: { onPaste: (text: string) => void }) {
  const [pasted, setPasted] = useState(false);
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { onPaste(text.trim()); setPasted(true); setTimeout(() => setPasted(false), 1500); }
    } catch { /* denied */ }
  }, [onPaste]);
  return (
    <button onClick={handlePaste} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
      {pasted ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <ClipboardIcon className="w-3 h-3" />}
      {pasted ? "Done" : "Paste"}
    </button>
  );
}

// --- Contact Picker ---
function ContactPickerButton({ onChange }: { onChange: (name: string, value: string) => void }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported("contacts" in navigator && "ContactsManager" in window); }, []);
  if (!supported) return null;
  const pickContact = async () => {
    try {
      const nav = navigator as Navigator & {
        contacts: { select: (props: string[], opts: { multiple: boolean }) => Promise<Array<{ name?: string[]; email?: string[]; tel?: string[] }>> };
      };
      const contacts = await nav.contacts.select(["name", "email", "tel"], { multiple: false });
      if (contacts.length > 0) {
        const c = contacts[0];
        if (c.name?.[0]) { const p = c.name[0].split(" "); onChange("firstName", p[0] || ""); onChange("lastName", p.slice(1).join(" ") || ""); }
        if (c.tel?.[0]) onChange("vcardPhone", c.tel[0]);
        if (c.email?.[0]) onChange("vcardEmail", c.email[0]);
      }
    } catch { /* cancelled */ }
  };
  return (
    <Button variant="outline" className="w-full gap-2 border-dashed" onClick={pickContact}>
      <ContactBookIcon className="w-4 h-4" /> Import from Contacts
    </Button>
  );
}

// --- Field ---
function Field({ label, name, value, onChange, type = "text", placeholder, textarea = false, showPaste = false }: {
  label: string; name: string; value: string; onChange: (name: string, value: string) => void;
  type?: string; placeholder?: string; textarea?: boolean; showPaste?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
        {showPaste && <PasteButton onPaste={(text) => onChange(name, text)} />}
      </div>
      {textarea ? (
        <Textarea id={name} name={name} value={value} onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder} rows={3} className="bg-muted/50 border-border/30 focus:border-foreground/20" />
      ) : (
        <Input id={name} name={name} type={type} value={value} onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder} className="bg-muted/50 border-border/30 focus:border-foreground/20" />
      )}
    </div>
  );
}

// --- Type Fields ---
function TypeFields({ type, fields, onChange }: { type: QRType; fields: Record<string, string>; onChange: (name: string, value: string) => void }) {
  switch (type) {
    case "url": return <Field label="Destination Link" name="url" value={fields.url || ""} onChange={onChange} placeholder="https://example.com" showPaste />;
    case "text": return <Field label="Content" name="text" value={fields.text || ""} onChange={onChange} placeholder="Enter your text here..." textarea showPaste />;
    case "phone": return <Field label="Phone Number" name="phone" value={fields.phone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" showPaste />;
    case "email":
      return (<div className="space-y-4">
        <Field label="Email Address" name="emailAddress" value={fields.emailAddress || ""} onChange={onChange} type="email" placeholder="hello@example.com" showPaste />
        <Field label="Subject" name="subject" value={fields.subject || ""} onChange={onChange} placeholder="Optional subject" />
        <Field label="Body" name="body" value={fields.body || ""} onChange={onChange} placeholder="Optional message body" textarea />
      </div>);
    case "sms":
      return (<div className="space-y-4">
        <Field label="Phone Number" name="smsPhone" value={fields.smsPhone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" showPaste />
        <Field label="Message" name="smsBody" value={fields.smsBody || ""} onChange={onChange} placeholder="Optional message" textarea />
      </div>);
    case "wifi":
      return (<div className="space-y-4">
        <Field label="Network Name (SSID)" name="ssid" value={fields.ssid || ""} onChange={onChange} placeholder="MyWiFiNetwork" />
        <Field label="Password" name="wifiPassword" value={fields.wifiPassword || ""} onChange={onChange} type="password" placeholder="Network password" />
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Encryption</Label>
          <Select value={fields.encryption || "WPA"} onValueChange={(v) => onChange("encryption", v)}>
            <SelectTrigger className="bg-muted/50 border-border/30"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA">WPA/WPA2</SelectItem>
              <SelectItem value="WEP">WEP</SelectItem>
              <SelectItem value="nopass">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={fields.hidden === "true"} onChange={(e) => onChange("hidden", e.target.checked ? "true" : "false")} className="rounded border-border accent-foreground" />
          Hidden network
        </label>
      </div>);
    case "vcard":
      return (<div className="space-y-4">
        <ContactPickerButton onChange={onChange} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" name="firstName" value={fields.firstName || ""} onChange={onChange} placeholder="John" />
          <Field label="Last Name" name="lastName" value={fields.lastName || ""} onChange={onChange} placeholder="Doe" />
        </div>
        <Field label="Phone" name="vcardPhone" value={fields.vcardPhone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" />
        <Field label="Email" name="vcardEmail" value={fields.vcardEmail || ""} onChange={onChange} type="email" placeholder="john@example.com" />
        <Field label="Organization" name="org" value={fields.org || ""} onChange={onChange} placeholder="Acme Inc." />
        <Field label="Website" name="vcardUrl" value={fields.vcardUrl || ""} onChange={onChange} placeholder="https://example.com" />
      </div>);
  }
}

// --- Main ---
export default function QRGenerator() {
  const [activeType, setActiveType] = useState<QRType>("url");
  const [fields, setFields] = useState<Record<string, string>>({ url: "https://example.com" });
  const [options, setOptions] = useState<QROptions>({ fgColor: "#ffffff", bgColor: "#09090b", size: 280, errorCorrection: "M" });
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [svgString, setSvgString] = useState("");
  const [showCustomize, setShowCustomize] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
  }, []);

  const qrData = buildQRData(activeType, fields);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCmdOpen((o) => !o); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!qrData) { setQrDataUrl(""); setSvgString(""); return; }
    const gen = async () => {
      try {
        const o = { width: options.size, margin: 2, color: { dark: options.fgColor, light: options.bgColor }, errorCorrectionLevel: options.errorCorrection };
        const [d, s] = await Promise.all([QRCode.toDataURL(qrData, o), QRCode.toString(qrData, { ...o, type: "svg" as const })]);
        setQrDataUrl(d); setSvgString(s);
      } catch { setQrDataUrl(""); setSvgString(""); }
    };
    const t = setTimeout(gen, 150);
    return () => clearTimeout(t);
  }, [qrData, options]);

  const downloadAs = useCallback((format: "png" | "svg" | "jpeg" | "webp") => {
    if (!qrData) return;
    if (format === "svg") {
      const b = new Blob([svgString], { type: "image/svg+xml" });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a"); a.href = u; a.download = `qrzap-${activeType}.svg`; a.click(); URL.revokeObjectURL(u);
      return;
    }
    const c = document.createElement("canvas"); c.width = options.size * 2; c.height = options.size * 2;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0, c.width, c.height); const m = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" } as const; const a = document.createElement("a"); a.href = c.toDataURL(m[format], 0.95); a.download = `qrzap-${activeType}.${format}`; a.click(); };
    img.src = qrDataUrl;
  }, [qrData, qrDataUrl, svgString, activeType, options.size]);

  const shareQR = useCallback(async () => {
    if (!qrDataUrl) return;
    try {
      const r = await fetch(qrDataUrl); const b = await r.blob();
      const f = new File([b], `qrzap-${activeType}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [f] })) { await navigator.share({ title: "QR Code from QRzap", files: [f] }); }
      else { await navigator.share({ title: "QR Code from QRzap", url: window.location.href }); }
    } catch { /* cancelled */ }
  }, [qrDataUrl, activeType]);

  const activeTypeData = QR_TYPES.find((t) => t.id === activeType);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Command Palette */}
        {mounted && (
          <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
            <CommandInput placeholder="Search QR type..." />
            <CommandList>
              <CommandEmpty>No type found.</CommandEmpty>
              <CommandGroup heading="QR Types">
                {QR_TYPES.map((t) => (
                  <CommandItem key={t.id} onSelect={() => { setActiveType(t.id); setCmdOpen(false); }} className="gap-2">
                    <t.Icon className="w-4 h-4" />
                    {t.label}
                    {activeType === t.id && <Badge variant="secondary" className="ml-auto text-[10px]">Active</Badge>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        )}

        {/* Frosted Nav */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-8">
              <a href="/" className="flex items-center gap-2">
                <QrIcon className="w-5 h-5 text-foreground" />
                <span className="text-lg font-semibold tracking-tighter">QRzap</span>
              </a>
              <div className="hidden md:flex gap-6 items-center">
                <button onClick={() => setCmdOpen(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  Quick Switch
                  <kbd className="pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                    <span className="text-xs">&#8984;</span>K
                  </kbd>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mounted && (
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="sm:hidden text-muted-foreground hover:text-foreground transition-colors">
                      <PaletteIcon className="w-5 h-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader><SheetTitle>Customize</SheetTitle></SheetHeader>
                    <CustomizePanel options={options} setOptions={setOptions} />
                  </SheetContent>
                </Sheet>
              )}
              <a href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <HeartIcon className="w-3.5 h-3.5" /> Support
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <header className="pt-12 pb-8 px-6 text-center max-w-6xl mx-auto w-full">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.04em] leading-tight mb-2">
            Create QR Code
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Generate high-quality QR codes for your digital and physical assets.
          </p>
        </header>

        {/* Pill Tabs */}
        <div className="flex justify-center mb-8 px-6">
          <div className="inline-flex items-center p-1 bg-muted/50 rounded-xl border border-border/30">
            {QR_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeType === t.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid - 3:2 layout */}
        <main className="flex-grow px-6 max-w-6xl mx-auto w-full pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* Configuration - 3 cols */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="border-border/30 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    {activeTypeData && <activeTypeData.Icon className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                      {activeTypeData?.label} Configuration
                    </span>
                  </div>

                  <TypeFields type={activeType} fields={fields} onChange={handleFieldChange} />

                  <Separator className="opacity-30" />

                  {/* Customize - desktop inline */}
                  <div className="hidden sm:block">
                    <button
                      onClick={() => setShowCustomize(!showCustomize)}
                      className="flex items-center justify-between w-full p-4 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <PaletteIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Appearance</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {showCustomize ? "Hide" : "Show"}
                      </span>
                    </button>
                    {showCustomize && <CustomizePanel options={options} setOptions={setOptions} />}
                  </div>
                </CardContent>
              </Card>

              {/* Download Row */}
              {qrDataUrl && (
                <div className="flex flex-wrap items-center gap-3">
                  <Button className="flex-grow gap-2" onClick={() => downloadAs("png")}>
                    <DownloadIcon className="w-3.5 h-3.5" /> Download PNG
                  </Button>
                  <Button variant="secondary" className="gap-2" onClick={() => downloadAs("svg")}>
                    <DownloadIcon className="w-3.5 h-3.5" /> SVG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadAs("jpeg")}>JPEG</Button>
                  <Button variant="outline" size="sm" onClick={() => downloadAs("webp")}>WebP</Button>
                  {"share" in navigator && (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={shareQR}>
                      <ShareIcon className="w-3.5 h-3.5" /> Share
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Preview - 2 cols, sticky */}
            <div className="lg:col-span-2 lg:sticky lg:top-20 space-y-4">
              <Card className="border-border/30 shadow-[0px_10px_40px_rgba(0,0,0,0.12)] overflow-hidden">
                <CardContent className="p-8">
                  {/* QR Preview */}
                  <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center p-6 mb-6 border border-border/10">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Generated QR Code"
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <div className="text-center">
                        <QrIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-muted-foreground/60 text-sm">
                          Fill in details to<br />generate your QR
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight">Live Preview</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          {options.size} x {options.size} px
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="p-5 rounded-xl bg-muted/20 border border-border/20">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-3">Details</span>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Type</span>
                    <p className="text-sm font-semibold">{activeTypeData?.label}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">EC Level</span>
                    <p className="text-sm font-semibold">{options.errorCorrection}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Status</span>
                    <p className="text-sm font-semibold">{qrData ? "Ready" : "Waiting"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-border/50 bg-muted/20">
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-6 max-w-6xl mx-auto gap-4">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">QRzap</span>
            <div className="flex items-center gap-6">
              <a href="/support" className="text-[11px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors">Support</a>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">No data stored</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

// --- Customize Panel ---
function CustomizePanel({ options, setOptions }: {
  options: QROptions; setOptions: React.Dispatch<React.SetStateAction<QROptions>>;
}) {
  return (
    <div className="space-y-6 pt-6">
      {/* FG Color */}
      <div className="space-y-3">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Foreground Color</Label>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={`fg-${c}`}
                onClick={() => setOptions((p) => ({ ...p, fgColor: c }))}
                className={`w-7 h-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all ${
                  options.fgColor === c ? "ring-foreground/40" : "ring-transparent hover:ring-muted-foreground/20"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input type="color" value={options.fgColor} onChange={(e) => setOptions((p) => ({ ...p, fgColor: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
          <span className="text-xs font-mono text-muted-foreground">{options.fgColor}</span>
        </div>
      </div>

      {/* BG Color */}
      <div className="space-y-3">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Background Color</Label>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={`bg-${c}`}
                onClick={() => setOptions((p) => ({ ...p, bgColor: c }))}
                className={`w-7 h-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all ${
                  options.bgColor === c ? "ring-foreground/40" : "ring-transparent hover:ring-muted-foreground/20"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input type="color" value={options.bgColor} onChange={(e) => setOptions((p) => ({ ...p, bgColor: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
          <span className="text-xs font-mono text-muted-foreground">{options.bgColor}</span>
        </div>
      </div>

      {/* Size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Size</Label>
          <span className="text-xs font-mono text-muted-foreground">{options.size}px</span>
        </div>
        <Slider value={[options.size]} onValueChange={([v]) => setOptions((p) => ({ ...p, size: v }))} min={128} max={512} step={8} />
      </div>

      {/* Error Correction - pill buttons */}
      <div className="space-y-3">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Error Correction</Label>
        <div className="flex gap-2">
          {ERROR_LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => setOptions((p) => ({ ...p, errorCorrection: lvl.value as QROptions["errorCorrection"] }))}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all ${
                options.errorCorrection === lvl.value
                  ? "bg-foreground text-background"
                  : "bg-muted border border-border/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {lvl.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
