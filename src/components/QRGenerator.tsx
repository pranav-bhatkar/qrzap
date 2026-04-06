import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  LinkIcon, WifiIcon, PhoneIcon, EmailIcon,
  SmsIcon, UserIcon, TextIcon, DownloadIcon,
  PaletteIcon, HeartIcon, QrIcon,
  ClipboardIcon, ShareIcon, ContactBookIcon, CheckIcon,
  ChevronDownIcon,
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
      const params: string[] = [];
      if (fields.subject) params.push(`subject=${encodeURIComponent(fields.subject)}`);
      if (fields.body) params.push(`body=${encodeURIComponent(fields.body)}`);
      return `mailto:${fields.emailAddress || ""}${params.length ? "?" + params.join("&") : ""}`;
    }
    case "sms": {
      const base = `sms:${fields.smsPhone || ""}`;
      return fields.smsBody ? `${base}?body=${encodeURIComponent(fields.smsBody)}` : base;
    }
    case "wifi":
      return `WIFI:T:${fields.encryption || "WPA"};S:${fields.ssid || ""};P:${fields.wifiPassword || ""};H:${fields.hidden === "true" ? "true" : "false"};;`;
    case "vcard": {
      const lines = ["BEGIN:VCARD", "VERSION:3.0",
        `N:${fields.lastName || ""};${fields.firstName || ""};;;`,
        `FN:${(fields.firstName || "") + " " + (fields.lastName || "")}`.trim()];
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
        <Textarea id={name} value={value} onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder} rows={3} className="bg-muted/30 border-border/20" />
      ) : (
        <Input id={name} type={type} value={value} onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder} className="bg-muted/30 border-border/20" />
      )}
    </div>
  );
}

// --- Type Fields ---
function TypeFields({ type, fields, onChange }: { type: QRType; fields: Record<string, string>; onChange: (name: string, value: string) => void }) {
  switch (type) {
    case "url": return <Field label="Destination URL" name="url" value={fields.url || ""} onChange={onChange} placeholder="https://example.com" showPaste />;
    case "text": return <Field label="Content" name="text" value={fields.text || ""} onChange={onChange} placeholder="Enter your text..." textarea showPaste />;
    case "phone": return <Field label="Phone Number" name="phone" value={fields.phone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" showPaste />;
    case "email":
      return (<div className="space-y-3">
        <Field label="Email Address" name="emailAddress" value={fields.emailAddress || ""} onChange={onChange} type="email" placeholder="hello@example.com" showPaste />
        <Field label="Subject" name="subject" value={fields.subject || ""} onChange={onChange} placeholder="Optional subject" />
        <Field label="Body" name="body" value={fields.body || ""} onChange={onChange} placeholder="Optional body" textarea />
      </div>);
    case "sms":
      return (<div className="space-y-3">
        <Field label="Phone Number" name="smsPhone" value={fields.smsPhone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" showPaste />
        <Field label="Message" name="smsBody" value={fields.smsBody || ""} onChange={onChange} placeholder="Optional message" textarea />
      </div>);
    case "wifi":
      return (<div className="space-y-3">
        <Field label="Network Name (SSID)" name="ssid" value={fields.ssid || ""} onChange={onChange} placeholder="MyWiFiNetwork" />
        <Field label="Password" name="wifiPassword" value={fields.wifiPassword || ""} onChange={onChange} type="password" placeholder="Network password" />
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Encryption</Label>
          <Select value={fields.encryption || "WPA"} onValueChange={(v) => onChange("encryption", v)}>
            <SelectTrigger className="bg-muted/30 border-border/20"><SelectValue /></SelectTrigger>
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
      return (<div className="space-y-3">
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

// --- Settings icon ---
function SettingsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
  );
}

// === Main ===
export default function QRGenerator() {
  const [activeType, setActiveType] = useState<QRType>("url");
  const [fields, setFields] = useState<Record<string, string>>({ url: "" });
  const [options, setOptions] = useState<QROptions>({ fgColor: "#ffffff", bgColor: "#09090b", size: 300, errorCorrection: "M" });
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [svgString, setSvgString] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
  }, []);

  const qrData = buildQRData(activeType, fields);

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
      const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `qrzap-${activeType}.svg`; a.click(); URL.revokeObjectURL(u);
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
      if (navigator.canShare?.({ files: [f] })) await navigator.share({ title: "QR Code from QRzap", files: [f] });
      else await navigator.share({ title: "QR Code from QRzap", url: window.location.href });
    } catch { /* cancelled */ }
  }, [qrDataUrl, activeType]);

  const activeTypeData = QR_TYPES.find((t) => t.id === activeType);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Nav */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between px-5 py-3 max-w-3xl mx-auto w-full">
            <a href="/" className="flex items-center gap-2">
              <QrIcon className="w-5 h-5" />
              <span className="text-base font-semibold tracking-tighter">QRzap</span>
            </a>
            <div className="flex items-center gap-3">
              <a href="/docs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">API</a>
              <a href="/support" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <HeartIcon className="w-3 h-3" /> Support
              </a>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-grow flex flex-col items-center justify-center px-5 py-10 max-w-3xl mx-auto w-full">

          {/* QR Type dots */}
          <div className="flex items-center gap-1 mb-8">
            {QR_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeType === t.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Center card */}
          <div className="w-full grid sm:grid-cols-[1fr,auto] gap-8 items-start">
            {/* Left: Input */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                {activeTypeData && <activeTypeData.Icon className="w-4 h-4 text-muted-foreground" />}
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  {activeTypeData?.label}
                </span>
              </div>
              <TypeFields type={activeType} fields={fields} onChange={handleFieldChange} />
            </div>

            {/* Right: QR Preview */}
            <div className="flex flex-col items-center gap-4 sm:sticky sm:top-20">
              <div className="w-52 h-52 sm:w-56 sm:h-56 rounded-xl bg-muted/20 border border-border/20 flex items-center justify-center p-3">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain rounded" />
                ) : (
                  <div className="text-center">
                    <QrIcon className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">Enter data</p>
                  </div>
                )}
              </div>

              {/* Action row */}
              {qrDataUrl && (
                <div className="flex items-center gap-2 w-full max-w-56">
                  {/* Download split button */}
                  <div className="flex-grow flex">
                    <Button className="flex-grow rounded-r-none gap-2" onClick={() => downloadAs("png")}>
                      <DownloadIcon className="w-3.5 h-3.5" /> PNG
                    </Button>
                    {mounted && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="rounded-l-none border-l border-primary-foreground/20 px-2">
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => downloadAs("png")}>PNG</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadAs("svg")}>SVG</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadAs("jpeg")}>JPEG</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadAs("webp")}>WebP</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Share */}
                  {"share" in navigator && (
                    <Button variant="outline" size="icon" onClick={shareQR} className="shrink-0">
                      <ShareIcon className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}

              {/* Settings button -> Sheet */}
              {mounted && (
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors mt-1">
                      <SettingsIcon className="w-3.5 h-3.5" />
                      Customize
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[70vh] sm:max-h-none sm:max-w-sm" data-vaul-no-drag>
                    <SheetHeader>
                      <SheetTitle className="text-sm">Customize QR Code</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto">
                      <CustomizePanel options={options} setOptions={setOptions} activeType={activeType} setActiveType={setActiveType} />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-muted/10">
          <div className="flex items-center justify-between px-5 py-3 max-w-3xl mx-auto text-[10px] uppercase tracking-widest text-muted-foreground/40">
            <span>QRzap</span>
            <span>No data stored</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

// --- Customize Panel ---
function CustomizePanel({ options, setOptions, activeType, setActiveType }: {
  options: QROptions; setOptions: React.Dispatch<React.SetStateAction<QROptions>>;
  activeType: QRType; setActiveType: (t: QRType) => void;
}) {
  return (
    <div className="space-y-6 py-4 px-1">
      {/* Type selector */}
      <div className="space-y-3">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">QR Type</Label>
        <div className="grid grid-cols-4 gap-2">
          {QR_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-lg text-[10px] font-medium transition-all ${
                activeType === t.id
                  ? "bg-foreground text-background"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground border border-border/20"
              }`}
            >
              <t.Icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Separator className="opacity-20" />

      {/* Foreground */}
      <div className="space-y-3">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Foreground</Label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={`fg-${c}`}
                onClick={() => setOptions((p) => ({ ...p, fgColor: c }))}
                className={`w-6 h-6 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all ${
                  options.fgColor === c ? "ring-foreground/40" : "ring-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input type="color" value={options.fgColor} onChange={(e) => setOptions((p) => ({ ...p, fgColor: e.target.value }))} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
          <span className="text-[10px] font-mono text-muted-foreground">{options.fgColor}</span>
        </div>
      </div>

      {/* Background */}
      <div className="space-y-3">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Background</Label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={`bg-${c}`}
                onClick={() => setOptions((p) => ({ ...p, bgColor: c }))}
                className={`w-6 h-6 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all ${
                  options.bgColor === c ? "ring-foreground/40" : "ring-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input type="color" value={options.bgColor} onChange={(e) => setOptions((p) => ({ ...p, bgColor: e.target.value }))} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
          <span className="text-[10px] font-mono text-muted-foreground">{options.bgColor}</span>
        </div>
      </div>

      {/* Size */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Size</Label>
          <span className="text-[10px] font-mono text-muted-foreground">{options.size}px</span>
        </div>
        <Slider value={[options.size]} onValueChange={([v]) => setOptions((p) => ({ ...p, size: v }))} min={128} max={512} step={8} />
      </div>

      {/* Error Correction */}
      <div className="space-y-3">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Error Correction</Label>
        <div className="flex gap-2">
          {ERROR_LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => setOptions((p) => ({ ...p, errorCorrection: lvl.value as QROptions["errorCorrection"] }))}
              className={`px-3 py-1.5 text-[10px] font-semibold rounded-full uppercase transition-all ${
                options.errorCorrection === lvl.value
                  ? "bg-foreground text-background"
                  : "bg-muted/30 text-muted-foreground border border-border/20"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
