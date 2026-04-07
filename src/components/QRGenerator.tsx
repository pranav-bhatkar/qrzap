import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LinkIcon,
  WifiIcon,
  PhoneIcon,
  EmailIcon,
  SmsIcon,
  UserIcon,
  TextIcon,
  DownloadIcon,
  HeartIcon,
  QrIcon,
  ClipboardIcon,
  ShareIcon,
  ContactBookIcon,
  CheckIcon,
  ChevronDownIcon,
  PaletteIcon,
} from "./icons";

type IconComponent = React.ComponentType<{ className?: string }>;
type QRType = "url" | "wifi" | "phone" | "email" | "sms" | "vcard" | "text";

const QR_TYPES: ReadonlyArray<{
  id: QRType;
  label: string;
  Icon: IconComponent;
}> = [
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
  "#ffffff",
  "#000000",
  "#0f172a",
  "#1e293b",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
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
      const p: string[] = [];
      if (fields.subject)
        p.push(`subject=${encodeURIComponent(fields.subject)}`);
      if (fields.body) p.push(`body=${encodeURIComponent(fields.body)}`);
      return `mailto:${fields.emailAddress || ""}${p.length ? "?" + p.join("&") : ""}`;
    }
    case "sms":
      return `sms:${fields.smsPhone || ""}${fields.smsBody ? "?body=" + encodeURIComponent(fields.smsBody) : ""}`;
    case "wifi":
      return `WIFI:T:${fields.encryption || "WPA"};S:${fields.ssid || ""};P:${fields.wifiPassword || ""};H:${fields.hidden === "true" ? "true" : "false"};;`;
    case "vcard": {
      const l = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${fields.lastName || ""};${fields.firstName || ""};;;`,
        `FN:${(fields.firstName || "") + " " + (fields.lastName || "")}`.trim(),
      ];
      if (fields.vcardPhone) l.push(`TEL:${fields.vcardPhone}`);
      if (fields.vcardEmail) l.push(`EMAIL:${fields.vcardEmail}`);
      if (fields.org) l.push(`ORG:${fields.org}`);
      if (fields.vcardUrl) l.push(`URL:${fields.vcardUrl}`);
      l.push("END:VCARD");
      return l.join("\n");
    }
    default:
      return "";
  }
}

function PasteButton({ onPaste }: { onPaste: (t: string) => void }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          const t = await navigator.clipboard.readText();
          if (t) {
            onPaste(t.trim());
            setOk(true);
            setTimeout(() => setOk(false), 1500);
          }
        } catch {}
      }}
      className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
    >
      {ok ? (
        <CheckIcon className="w-3 h-3 text-emerald-400" />
      ) : (
        <ClipboardIcon className="w-3 h-3" />
      )}
      {ok ? "Done" : "Paste"}
    </button>
  );
}

function ContactPickerButton({
  onChange,
}: {
  onChange: (n: string, v: string) => void;
}) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    setOk("contacts" in navigator && "ContactsManager" in window);
  }, []);
  if (!ok) return null;
  return (
    <Button
      variant="outline"
      className="w-full gap-2 border-dashed"
      onClick={async () => {
        try {
          const nav = navigator as any;
          const c = await nav.contacts.select(["name", "email", "tel"], {
            multiple: false,
          });
          if (c.length) {
            const x = c[0];
            if (x.name?.[0]) {
              const p = x.name[0].split(" ");
              onChange("firstName", p[0]);
              onChange("lastName", p.slice(1).join(" "));
            }
            if (x.tel?.[0]) onChange("vcardPhone", x.tel[0]);
            if (x.email?.[0]) onChange("vcardEmail", x.email[0]);
          }
        } catch {}
      }}
    >
      <ContactBookIcon className="w-4 h-4" /> Import from Contacts
    </Button>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  textarea = false,
  showPaste = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (n: string, v: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  showPaste?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </Label>
        {showPaste && <PasteButton onPaste={(t) => onChange(name, t)} />}
      </div>
      {textarea ? (
        <Textarea
          id={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="bg-muted/30 border-border/20 text-sm"
        />
      ) : (
        <Input
          id={name}
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="bg-muted/30 border-border/20 text-sm"
        />
      )}
    </div>
  );
}

function EyeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}
function EyeOffIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (n: string, v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="bg-muted/30 border-border/20 text-sm pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          {show ? (
            <EyeOffIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function TypeFields({
  type,
  fields,
  onChange,
}: {
  type: QRType;
  fields: Record<string, string>;
  onChange: (n: string, v: string) => void;
}) {
  switch (type) {
    case "url":
      return (
        <Field
          label="URL"
          name="url"
          value={fields.url || ""}
          onChange={onChange}
          placeholder="https://example.com"
          showPaste
        />
      );
    case "text":
      return (
        <Field
          label="Text"
          name="text"
          value={fields.text || ""}
          onChange={onChange}
          placeholder="Enter text..."
          textarea
          showPaste
        />
      );
    case "phone":
      return (
        <Field
          label="Phone"
          name="phone"
          value={fields.phone || ""}
          onChange={onChange}
          type="tel"
          placeholder="+1 234 567 8900"
          showPaste
        />
      );
    case "email":
      return (
        <div className="space-y-3">
          <Field
            label="Email"
            name="emailAddress"
            value={fields.emailAddress || ""}
            onChange={onChange}
            type="email"
            placeholder="hello@example.com"
            showPaste
          />
          <Field
            label="Subject"
            name="subject"
            value={fields.subject || ""}
            onChange={onChange}
            placeholder="Optional"
          />
          <Field
            label="Body"
            name="body"
            value={fields.body || ""}
            onChange={onChange}
            placeholder="Optional"
            textarea
          />
        </div>
      );
    case "sms":
      return (
        <div className="space-y-3">
          <Field
            label="Phone"
            name="smsPhone"
            value={fields.smsPhone || ""}
            onChange={onChange}
            type="tel"
            placeholder="+1 234 567 8900"
            showPaste
          />
          <Field
            label="Message"
            name="smsBody"
            value={fields.smsBody || ""}
            onChange={onChange}
            placeholder="Optional"
            textarea
          />
        </div>
      );
    case "wifi":
      return (
        <div className="space-y-3">
          <Field
            label="SSID"
            name="ssid"
            value={fields.ssid || ""}
            onChange={onChange}
            placeholder="Network name"
          />
          <PasswordField
            label="Password"
            name="wifiPassword"
            value={fields.wifiPassword || ""}
            onChange={onChange}
            placeholder="Password"
          />
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Encryption
            </Label>
            <Select
              value={fields.encryption || "WPA"}
              onValueChange={(v) => onChange("encryption", v)}
            >
              <SelectTrigger className="bg-muted/30 border-border/20 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={fields.hidden === "true"}
              onChange={(e) => onChange("hidden", String(e.target.checked))}
              className="rounded"
            />
            Hidden
          </label>
        </div>
      );
    case "vcard":
      return (
        <div className="space-y-3">
          <ContactPickerButton onChange={onChange} />
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="First"
              name="firstName"
              value={fields.firstName || ""}
              onChange={onChange}
              placeholder="John"
            />
            <Field
              label="Last"
              name="lastName"
              value={fields.lastName || ""}
              onChange={onChange}
              placeholder="Doe"
            />
          </div>
          <Field
            label="Phone"
            name="vcardPhone"
            value={fields.vcardPhone || ""}
            onChange={onChange}
            type="tel"
            placeholder="+1 234 567 8900"
          />
          <Field
            label="Email"
            name="vcardEmail"
            value={fields.vcardEmail || ""}
            onChange={onChange}
            type="email"
            placeholder="john@example.com"
          />
          <Field
            label="Org"
            name="org"
            value={fields.org || ""}
            onChange={onChange}
            placeholder="Acme Inc."
          />
          <Field
            label="Website"
            name="vcardUrl"
            value={fields.vcardUrl || ""}
            onChange={onChange}
            placeholder="https://example.com"
          />
        </div>
      );
  }
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 max-w-6xl w-full mx-auto lg:px-0">
      <nav
        style={{
          width: scrolled ? "90%" : "100%",
          transform: scrolled ? "translateY(10px)" : "translateY(0)",
          transition:
            "width 0.4s cubic-bezier(0.32, 0.72, 0, 1), transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
        }}
        className={`mx-auto flex items-center justify-between px-8 lg:px-12 py-3 ${
          scrolled
            ? "rounded-lg bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/50 shadow-lg shadow-black/20"
            : "bg-transparent border border-transparent border-b-zinc-800"
        }`}
      >
        <a
          href="https://pranavbhatkar.me"
          target="_blank"
          rel="noopener noreferrer"
          className="header-logo"
        >
          <span className="header-logo-icon">
            <QrIcon className="w-4 h-4" />
          </span>
          <div className="header-logo-text">
            <p className="header-logo-qrzap">
              QRzap <span className="text-zinc-500">by</span>
            </p>
            <p className="header-logo-pranav">Pranav</p>
            <p className="header-logo-bhatkar">Bhatkar</p>
          </div>
        </a>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a
            href="/docs"
            className="rounded px-3 py-2 hover:bg-secondary hover:brightness-125 transition-all duration-300"
          >
            API
          </a>
          <a
            href="/support"
            className="rounded px-3 py-2 hover:bg-secondary hover:brightness-125 transition-all duration-300 flex items-center gap-1"
          >
            <HeartIcon className="w-3 h-3" />
            Support
          </a>
        </div>
      </nav>
    </div>
  );
}

export default function QRGenerator() {
  const [activeType, setActiveType] = useState<QRType>("url");
  const [fields, setFields] = useState<Record<string, string>>({ url: "" });
  const [options, setOptions] = useState<QROptions>({
    fgColor: "#ffffff",
    bgColor: "#09090b",
    size: 300,
    errorCorrection: "M",
  });
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [svgString, setSvgString] = useState("");
  const [showCustomize, setShowCustomize] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const set = useCallback((n: string, v: string) => {
    setFields((p) => ({ ...p, [n]: v }));
  }, []);
  const qrData = buildQRData(activeType, fields);

  useEffect(() => {
    if (!qrData) {
      setQrDataUrl("");
      setSvgString("");
      return;
    }
    const t = setTimeout(async () => {
      try {
        const o = {
          width: options.size,
          margin: 2,
          color: { dark: options.fgColor, light: options.bgColor },
          errorCorrectionLevel: options.errorCorrection,
        };
        const [d, s] = await Promise.all([
          QRCode.toDataURL(qrData, o),
          QRCode.toString(qrData, { ...o, type: "svg" as const }),
        ]);
        setQrDataUrl(d);
        setSvgString(s);
      } catch {
        setQrDataUrl("");
        setSvgString("");
      }
    }, 150);
    return () => clearTimeout(t);
  }, [qrData, options]);

  const dl = useCallback(
    (fmt: "png" | "svg" | "jpeg" | "webp") => {
      if (!qrData) return;
      if (fmt === "svg") {
        const u = URL.createObjectURL(
          new Blob([svgString], { type: "image/svg+xml" }),
        );
        Object.assign(document.createElement("a"), {
          href: u,
          download: `qr.svg`,
        }).click();
        URL.revokeObjectURL(u);
        return;
      }
      const c = document.createElement("canvas");
      c.width = options.size * 2;
      c.height = options.size * 2;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, c.width, c.height);
        Object.assign(document.createElement("a"), {
          href: c.toDataURL(
            { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" }[fmt],
            0.95,
          ),
          download: `qr.${fmt}`,
        }).click();
      };
      img.src = qrDataUrl;
    },
    [qrData, qrDataUrl, svgString, options.size],
  );

  const share = useCallback(async () => {
    if (!qrDataUrl) return;
    try {
      const b = await (await fetch(qrDataUrl)).blob();
      const f = new File([b], "qr.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [f] }))
        await navigator.share({ title: "QR Code", files: [f] });
      else await navigator.share({ title: "QR Code", url: location.href });
    } catch {}
  }, [qrDataUrl]);

  return (
    <div className="bg-background">
      {/* Nav - static at top, floats on scroll */}
      <NavBar />
      <div className="h-20" />

      {/* Main: two-column, always side by side on md+ */}
      <main className="px-4 md:px-8 lg:px-12 py-6 max-w-6xl mx-auto w-full">
        {/* Hero */}
        <div className="text-center pt-6 pb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Create QR Code
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate high-quality QR codes for your digital and physical assets.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_400px] gap-8">
          {/* ===== LEFT: all settings ===== */}
          <div className="space-y-5">
            {/* Type selector: dropdown on mobile, pills on md+ */}
            <div className="md:hidden">
              <Select
                value={activeType}
                onValueChange={(v) => setActiveType(v as QRType)}
              >
                <SelectTrigger className="border-0 text-sm w-full font-medium rounded-full h-10 px-4 shadow-md">
                  <div className="flex items-center gap-2.5">
                    {(() => {
                      const t = QR_TYPES.find((x) => x.id === activeType);
                      return t ? (
                        <>
                          <t.Icon className="w-4 h-4" />
                          <span>{t.label}</span>
                        </>
                      ) : null;
                    })()}
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {QR_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="rounded-lg">
                      <span className="flex items-center gap-2.5">
                        <t.Icon className="w-4 h-4" />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="hidden md:flex flex-wrap gap-1">
              {QR_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveType(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeType === t.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <t.Icon className="w-3 h-3" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Form fields */}
            <div className="rounded-xl border border-border/20 bg-card/50 p-4 md:p-6">
              <TypeFields type={activeType} fields={fields} onChange={set} />
            </div>

            {/* Customize accordion */}
            <div className="rounded-lg border border-border/20 bg-card/50">
              <button
                onClick={() => setShowCustomize(!showCustomize)}
                className="flex items-center justify-between w-full px-5 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PaletteIcon className="w-3.5 h-3.5" />
                  Appearance
                </span>
                <ChevronDownIcon
                  className={`w-3.5 h-3.5 transition-transform ${showCustomize ? "rotate-180" : ""}`}
                />
              </button>
              {showCustomize && (
                <div className="px-5 pb-5 space-y-4">
                  <Separator className="opacity-20" />
                  {/* Colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Foreground
                      </Label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {PRESET_COLORS.slice(0, 4).map((c) => (
                          <button
                            key={`f${c}`}
                            onClick={() =>
                              setOptions((p) => ({ ...p, fgColor: c }))
                            }
                            className={`w-5 h-5 rounded-full ring-1 ring-offset-1 ring-offset-background ${options.fgColor === c ? "ring-foreground/50" : "ring-transparent"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input
                          type="color"
                          value={options.fgColor}
                          onChange={(e) =>
                            setOptions((p) => ({
                              ...p,
                              fgColor: e.target.value,
                            }))
                          }
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Background
                      </Label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {PRESET_COLORS.slice(0, 4).map((c) => (
                          <button
                            key={`b${c}`}
                            onClick={() =>
                              setOptions((p) => ({ ...p, bgColor: c }))
                            }
                            className={`w-5 h-5 rounded-full ring-1 ring-offset-1 ring-offset-background ${options.bgColor === c ? "ring-foreground/50" : "ring-transparent"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input
                          type="color"
                          value={options.bgColor}
                          onChange={(e) =>
                            setOptions((p) => ({
                              ...p,
                              bgColor: e.target.value,
                            }))
                          }
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Size + EC */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Size
                        </Label>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {options.size}
                        </span>
                      </div>
                      <Slider
                        value={[options.size]}
                        onValueChange={(v: number | number[]) =>
                          setOptions((p) => ({
                            ...p,
                            size: Array.isArray(v) ? v[0] : v,
                          }))
                        }
                        min={128}
                        max={512}
                        step={8}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Error Correction
                      </Label>
                      <div className="flex gap-1">
                        {ERROR_LEVELS.map((l) => (
                          <button
                            key={l.value}
                            onClick={() =>
                              setOptions((p) => ({
                                ...p,
                                errorCorrection:
                                  l.value as QROptions["errorCorrection"],
                              }))
                            }
                            className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${options.errorCorrection === l.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground bg-muted/30"}`}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT: QR preview ===== */}
          <div className="md:sticky md:top-20 md:self-start flex flex-col items-center gap-3">
            <div className="w-[200px] h-[200px] md:w-[340px] md:h-[340px] rounded-lg bg-muted/20 border border-border/20 flex items-center justify-center p-3">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <QrIcon className="w-8 h-8 text-muted-foreground/15 mx-auto mb-1" />
                  <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">
                    Preview
                  </p>
                </div>
              )}
            </div>

            {/* Download */}
            {qrDataUrl && (
              <div className="flex items-center gap-1.5 w-[200px] md:w-full md:max-w-[360px]">
                <Button
                  size="sm"
                  className="flex-grow gap-1.5 text-xs h-8"
                  onClick={() => dl("png")}
                >
                  <DownloadIcon className="w-3 h-3" />
                  PNG
                </Button>
                {mounted && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="h-8 px-2">
                        <ChevronDownIcon className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[100px]">
                      <DropdownMenuItem
                        onClick={() => dl("png")}
                        className="text-xs"
                      >
                        PNG
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => dl("svg")}
                        className="text-xs"
                      >
                        SVG
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => dl("jpeg")}
                        className="text-xs"
                      >
                        JPEG
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => dl("webp")}
                        className="text-xs"
                      >
                        WebP
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {"share" in navigator && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={share}
                  >
                    <ShareIcon className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Meta */}
            <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">
              {options.size}px / EC: {options.errorCorrection}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
