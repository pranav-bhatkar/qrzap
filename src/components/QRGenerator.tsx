import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  LinkIcon, WifiIcon, PhoneIcon, EmailIcon,
  SmsIcon, UserIcon, TextIcon, DownloadIcon,
  ChevronDownIcon, PaletteIcon, HeartIcon, QrIcon,
  ClipboardIcon, ShareIcon, ContactBookIcon, CheckIcon,
} from "./icons";

type IconComponent = React.ComponentType<{ className?: string }>;
type QRType = "url" | "wifi" | "phone" | "email" | "sms" | "vcard" | "text";

const QR_TYPES: ReadonlyArray<{ id: QRType; label: string; Icon: IconComponent }> = [
  { id: "url", label: "URL", Icon: LinkIcon },
  { id: "wifi", label: "WiFi", Icon: WifiIcon },
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
  { value: "L", label: "Low (7%)" },
  { value: "M", label: "Medium (15%)" },
  { value: "Q", label: "Quartile (25%)" },
  { value: "H", label: "High (30%)" },
] as const;

const PRESET_COLORS = [
  "#ffffff", "#000000", "#0f172a", "#1e293b",
  "#0ea5e9", "#10b981", "#f59e0b", "#ef4444",
];

function buildQRData(type: QRType, fields: Record<string, string>): string {
  switch (type) {
    case "url":
      return fields.url || "";
    case "text":
      return fields.text || "";
    case "phone":
      return `tel:${fields.phone || ""}`;
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
        "BEGIN:VCARD",
        "VERSION:3.0",
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
    default:
      return "";
  }
}

// --- Paste button ---
function PasteButton({ onPaste }: { onPaste: (text: string) => void }) {
  const [pasted, setPasted] = useState(false);
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onPaste(text.trim());
        setPasted(true);
        setTimeout(() => setPasted(false), 1500);
      }
    } catch { /* clipboard denied */ }
  }, [onPaste]);

  return (
    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={handlePaste}>
      {pasted ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <ClipboardIcon className="w-3 h-3" />}
      {pasted ? "Pasted" : "Paste"}
    </Button>
  );
}

// --- Contact picker ---
function ContactPickerButton({ onChange }: { onChange: (name: string, value: string) => void }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported("contacts" in navigator && "ContactsManager" in window);
  }, []);
  if (!supported) return null;

  const pickContact = async () => {
    try {
      const nav = navigator as Navigator & {
        contacts: {
          select: (props: string[], opts: { multiple: boolean }) => Promise<Array<{
            name?: string[]; email?: string[]; tel?: string[];
          }>>;
        };
      };
      const contacts = await nav.contacts.select(["name", "email", "tel"], { multiple: false });
      if (contacts.length > 0) {
        const c = contacts[0];
        if (c.name?.[0]) {
          const parts = c.name[0].split(" ");
          onChange("firstName", parts[0] || "");
          onChange("lastName", parts.slice(1).join(" ") || "");
        }
        if (c.tel?.[0]) onChange("vcardPhone", c.tel[0]);
        if (c.email?.[0]) onChange("vcardEmail", c.email[0]);
      }
    } catch { /* cancelled */ }
  };

  return (
    <Button variant="outline" className="w-full gap-2 border-dashed" onClick={pickContact}>
      <ContactBookIcon className="w-4 h-4" />
      Import from Contacts
    </Button>
  );
}

// --- Field wrapper ---
function Field({
  label, name, value, onChange, type = "text", placeholder, textarea = false, showPaste = false,
}: {
  label: string; name: string; value: string;
  onChange: (name: string, value: string) => void;
  type?: string; placeholder?: string; textarea?: boolean; showPaste?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="text-xs">{label}</Label>
        {showPaste && <PasteButton onPaste={(text) => onChange(name, text)} />}
      </div>
      {textarea ? (
        <Textarea
          id={name} name={name} value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder} rows={3}
        />
      ) : (
        <Input
          id={name} name={name} type={type} value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

// --- Type-specific fields ---
function TypeFields({ type, fields, onChange }: {
  type: QRType; fields: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  switch (type) {
    case "url":
      return <Field label="URL" name="url" value={fields.url || ""} onChange={onChange} placeholder="https://example.com" showPaste />;
    case "text":
      return <Field label="Text" name="text" value={fields.text || ""} onChange={onChange} placeholder="Enter your text here..." textarea showPaste />;
    case "phone":
      return <Field label="Phone Number" name="phone" value={fields.phone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" showPaste />;
    case "email":
      return (
        <div className="space-y-3">
          <Field label="Email Address" name="emailAddress" value={fields.emailAddress || ""} onChange={onChange} type="email" placeholder="hello@example.com" showPaste />
          <Field label="Subject" name="subject" value={fields.subject || ""} onChange={onChange} placeholder="Optional subject" />
          <Field label="Body" name="body" value={fields.body || ""} onChange={onChange} placeholder="Optional message body" textarea />
        </div>
      );
    case "sms":
      return (
        <div className="space-y-3">
          <Field label="Phone Number" name="smsPhone" value={fields.smsPhone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" showPaste />
          <Field label="Message" name="smsBody" value={fields.smsBody || ""} onChange={onChange} placeholder="Optional message" textarea />
        </div>
      );
    case "wifi":
      return (
        <div className="space-y-3">
          <Field label="Network Name (SSID)" name="ssid" value={fields.ssid || ""} onChange={onChange} placeholder="MyWiFiNetwork" />
          <Field label="Password" name="wifiPassword" value={fields.wifiPassword || ""} onChange={onChange} type="password" placeholder="Network password" />
          <div className="space-y-1.5">
            <Label className="text-xs">Encryption</Label>
            <Select value={fields.encryption || "WPA"} onValueChange={(v) => onChange("encryption", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={fields.hidden === "true"}
              onChange={(e) => onChange("hidden", e.target.checked ? "true" : "false")}
              className="rounded border-border accent-primary"
            />
            Hidden network
          </label>
        </div>
      );
    case "vcard":
      return (
        <div className="space-y-3">
          <ContactPickerButton onChange={onChange} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" name="firstName" value={fields.firstName || ""} onChange={onChange} placeholder="John" />
            <Field label="Last Name" name="lastName" value={fields.lastName || ""} onChange={onChange} placeholder="Doe" />
          </div>
          <Field label="Phone" name="vcardPhone" value={fields.vcardPhone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" />
          <Field label="Email" name="vcardEmail" value={fields.vcardEmail || ""} onChange={onChange} type="email" placeholder="john@example.com" />
          <Field label="Organization" name="org" value={fields.org || ""} onChange={onChange} placeholder="Acme Inc." />
          <Field label="Website" name="vcardUrl" value={fields.vcardUrl || ""} onChange={onChange} placeholder="https://example.com" />
        </div>
      );
  }
}

// --- Main component ---
export default function QRGenerator() {
  const [activeType, setActiveType] = useState<QRType>("url");
  const [fields, setFields] = useState<Record<string, string>>({ url: "https://example.com" });
  const [options, setOptions] = useState<QROptions>({
    fgColor: "#ffffff", bgColor: "#09090b", size: 280, errorCorrection: "M",
  });
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [svgString, setSvgString] = useState("");
  const [showCustomize, setShowCustomize] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for portal-based components
  useEffect(() => { setMounted(true); }, []);

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
  }, []);

  const qrData = buildQRData(activeType, fields);

  // Keyboard shortcut for Command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // QR generation
  useEffect(() => {
    if (!qrData) { setQrDataUrl(""); setSvgString(""); return; }
    const generateQR = async () => {
      try {
        const opts = {
          width: options.size, margin: 2,
          color: { dark: options.fgColor, light: options.bgColor },
          errorCorrectionLevel: options.errorCorrection,
        };
        const [dataUrl, svg] = await Promise.all([
          QRCode.toDataURL(qrData, opts),
          QRCode.toString(qrData, { ...opts, type: "svg" as const }),
        ]);
        setQrDataUrl(dataUrl);
        setSvgString(svg);
      } catch { setQrDataUrl(""); setSvgString(""); }
    };
    const timer = setTimeout(generateQR, 150);
    return () => clearTimeout(timer);
  }, [qrData, options]);

  const downloadAs = useCallback(
    (format: "png" | "svg" | "jpeg" | "webp") => {
      if (!qrData) return;
      if (format === "svg") {
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `qrzap-${activeType}.svg`; a.click();
        URL.revokeObjectURL(url);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = options.size * 2; canvas.height = options.size * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const mime = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" } as const;
        const a = document.createElement("a");
        a.href = canvas.toDataURL(mime[format], 0.95);
        a.download = `qrzap-${activeType}.${format}`; a.click();
      };
      img.src = qrDataUrl;
    },
    [qrData, qrDataUrl, svgString, activeType, options.size]
  );

  const shareQR = useCallback(async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      const file = new File([blob], `qrzap-${activeType}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "QR Code from QRzap", files: [file] });
      } else {
        await navigator.share({ title: "QR Code from QRzap", url: window.location.href });
      }
    } catch { /* cancelled */ }
  }, [qrDataUrl, activeType]);

  const activeTypeData = QR_TYPES.find((t) => t.id === activeType);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Command palette - only render after mount to avoid hydration mismatch */}
        {mounted && (
          <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
            <CommandInput placeholder="Search QR type..." />
            <CommandList>
              <CommandEmpty>No type found.</CommandEmpty>
              <CommandGroup heading="QR Types">
                {QR_TYPES.map((t) => (
                  <CommandItem
                    key={t.id}
                    onSelect={() => { setActiveType(t.id); setCmdOpen(false); }}
                    className="gap-2"
                  >
                    <t.Icon className="w-4 h-4" />
                    {t.label}
                    {activeType === t.id && <Badge variant="secondary" className="ml-auto text-[10px]">Active</Badge>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        )}

        {/* Header */}
        <header className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <QrIcon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-semibold tracking-tight">QRzap</span>
            </a>
            <div className="flex items-center gap-2">
              {/* Quick search trigger */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2 text-xs text-muted-foreground" onClick={() => setCmdOpen(true)}>
                    <QrIcon className="w-3.5 h-3.5" />
                    Quick switch
                    <kbd className="pointer-events-none ml-1 inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      <span className="text-xs">&#8984;</span>K
                    </kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch QR type quickly</TooltipContent>
              </Tooltip>

              {/* Customize sheet trigger (mobile) */}
              {mounted && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="sm:hidden gap-1.5">
                      <PaletteIcon className="w-3.5 h-3.5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Customize</SheetTitle>
                    </SheetHeader>
                    <CustomizePanel options={options} setOptions={setOptions} />
                  </SheetContent>
                </Sheet>
              )}

              <Separator orientation="vertical" className="h-4 hidden sm:block" />

              <a href="/support">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <HeartIcon className="w-3.5 h-3.5" />
                  Support
                </Button>
              </a>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-5xl px-4 py-6">
          {/* Type selector */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {QR_TYPES.map((t) => (
              <Button
                key={t.id}
                variant={activeType === t.id ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setActiveType(t.id)}
              >
                <t.Icon className="w-3.5 h-3.5" />
                {t.label}
              </Button>
            ))}
          </div>

          {/* Two-card layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {activeTypeData && <activeTypeData.Icon className="w-4 h-4 text-muted-foreground" />}
                  {activeTypeData?.label} Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TypeFields type={activeType} fields={fields} onChange={handleFieldChange} />

                <Separator />

                {/* Customize toggle (desktop) */}
                <div className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setShowCustomize(!showCustomize)}
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <PaletteIcon className="w-4 h-4" />
                      Customize Appearance
                    </span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${showCustomize ? "rotate-180" : ""}`} />
                  </Button>
                  {showCustomize && (
                    <div className="mt-4">
                      <CustomizePanel options={options} setOptions={setOptions} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium">Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-between gap-6">
                {/* QR Display */}
                <div className="flex-1 flex items-center justify-center">
                  {qrDataUrl ? (
                    <div className="rounded-xl p-4 bg-background border border-border">
                      <img
                        src={qrDataUrl}
                        alt="Generated QR Code"
                        width={Math.min(options.size, 280)}
                        height={Math.min(options.size, 280)}
                        className="rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                      <div className="text-center px-4">
                        <QrIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">
                          Fill in the details to<br />generate your QR code
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Download buttons */}
                {qrDataUrl && (
                  <div className="w-full space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button className="gap-2" onClick={() => downloadAs("png")}>
                        <DownloadIcon className="w-3.5 h-3.5" /> PNG
                      </Button>
                      <Button className="gap-2" onClick={() => downloadAs("svg")}>
                        <DownloadIcon className="w-3.5 h-3.5" /> SVG
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="gap-2" onClick={() => downloadAs("jpeg")}>
                        <DownloadIcon className="w-3.5 h-3.5" /> JPEG
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={() => downloadAs("webp")}>
                        <DownloadIcon className="w-3.5 h-3.5" /> WebP
                      </Button>
                    </div>
                    {"share" in navigator && (
                      <Button variant="outline" className="w-full gap-2" onClick={shareQR}>
                        <ShareIcon className="w-3.5 h-3.5" /> Share QR Code
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-8">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>QRzap / Free QR Code Generator</span>
            <span>No data stored. Everything runs in your browser.</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

// --- Customize panel (used in both sheet and inline) ---
function CustomizePanel({ options, setOptions }: {
  options: QROptions;
  setOptions: React.Dispatch<React.SetStateAction<QROptions>>;
}) {
  return (
    <div className="space-y-5 pt-4">
      {/* Foreground color */}
      <div className="space-y-2">
        <Label className="text-xs">Foreground Color</Label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={`fg-${c}`}
                onClick={() => setOptions((prev) => ({ ...prev, fgColor: c }))}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  options.fgColor === c ? "border-primary scale-110" : "border-border"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="color" value={options.fgColor}
            onChange={(e) => setOptions((prev) => ({ ...prev, fgColor: e.target.value }))}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>
      </div>

      {/* Background color */}
      <div className="space-y-2">
        <Label className="text-xs">Background Color</Label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={`bg-${c}`}
                onClick={() => setOptions((prev) => ({ ...prev, bgColor: c }))}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  options.bgColor === c ? "border-primary scale-110" : "border-border"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="color" value={options.bgColor}
            onChange={(e) => setOptions((prev) => ({ ...prev, bgColor: e.target.value }))}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>
      </div>

      {/* Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Size</Label>
          <span className="text-xs font-mono text-muted-foreground">{options.size}px</span>
        </div>
        <Slider
          value={[options.size]}
          onValueChange={([v]) => setOptions((prev) => ({ ...prev, size: v }))}
          min={128} max={512} step={8}
        />
      </div>

      {/* Error correction */}
      <div className="space-y-2">
        <Label className="text-xs">Error Correction</Label>
        <ToggleGroup
          type="single"
          value={options.errorCorrection}
          onValueChange={(v) => { if (v) setOptions((prev) => ({ ...prev, errorCorrection: v as QROptions["errorCorrection"] })); }}
          className="justify-start"
        >
          {ERROR_LEVELS.map((lvl) => (
            <ToggleGroupItem key={lvl.value} value={lvl.value} size="sm" className="text-xs px-3">
              {lvl.value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">
          {ERROR_LEVELS.find((l) => l.value === options.errorCorrection)?.label}
        </p>
      </div>
    </div>
  );
}
