import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import {
  LinkIcon, WifiIcon, PhoneIcon, EmailIcon,
  SmsIcon, UserIcon, TextIcon, DownloadIcon,
  ChevronDownIcon, PaletteIcon, HeartIcon, QrIcon,
  ClipboardIcon, ShareIcon, ContactBookIcon, CheckIcon,
} from "./icons";

type IconComponent = React.ComponentType<{ className?: string }>;

const QR_TYPES: ReadonlyArray<{ id: QRType; label: string; Icon: IconComponent }> = [
  { id: "url", label: "URL", Icon: LinkIcon },
  { id: "wifi", label: "WiFi", Icon: WifiIcon },
  { id: "phone", label: "Phone", Icon: PhoneIcon },
  { id: "email", label: "Email", Icon: EmailIcon },
  { id: "sms", label: "SMS", Icon: SmsIcon },
  { id: "vcard", label: "vCard", Icon: UserIcon },
  { id: "text", label: "Text", Icon: TextIcon },
];

type QRType = "url" | "wifi" | "phone" | "email" | "sms" | "vcard" | "text";

interface WifiData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  org: string;
  url: string;
}

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
    case "wifi": {
      const wifi: WifiData = {
        ssid: fields.ssid || "",
        password: fields.wifiPassword || "",
        encryption: (fields.encryption as WifiData["encryption"]) || "WPA",
        hidden: fields.hidden === "true",
      };
      return `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};H:${wifi.hidden ? "true" : "false"};;`;
    }
    case "vcard": {
      const vc: VCardData = {
        firstName: fields.firstName || "",
        lastName: fields.lastName || "",
        phone: fields.vcardPhone || "",
        email: fields.vcardEmail || "",
        org: fields.org || "",
        url: fields.vcardUrl || "",
      };
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${vc.lastName};${vc.firstName};;;`,
        `FN:${vc.firstName} ${vc.lastName}`.trim(),
      ];
      if (vc.phone) lines.push(`TEL:${vc.phone}`);
      if (vc.email) lines.push(`EMAIL:${vc.email}`);
      if (vc.org) lines.push(`ORG:${vc.org}`);
      if (vc.url) lines.push(`URL:${vc.url}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    default:
      return "";
  }
}

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
    } catch {
      // Clipboard access denied or unavailable
    }
  }, [onPaste]);

  return (
    <button
      type="button"
      onClick={handlePaste}
      className="flex items-center gap-1 rounded-md border border-zinc-700/50 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600/50 transition-colors"
      title="Paste from clipboard"
    >
      {pasted ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <ClipboardIcon className="w-3 h-3" />}
      {pasted ? "Pasted" : "Paste"}
    </button>
  );
}

function InputField({
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
  onChange: (name: string, value: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  showPaste?: boolean;
}) {
  const baseClass =
    "w-full rounded-lg border border-zinc-700/50 bg-zinc-900/50 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-zinc-400 tracking-wide">
          {label}
        </label>
        {showPaste && <PasteButton onPaste={(text) => onChange(name, text)} />}
      </div>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}

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
            name?: string[];
            email?: string[];
            tel?: string[];
          }>>;
        };
      };
      const contacts = await nav.contacts.select(
        ["name", "email", "tel"],
        { multiple: false }
      );
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
    } catch {
      // User cancelled or API unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={pickContact}
      className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700/50 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600/50 transition-colors"
    >
      <ContactBookIcon className="w-4 h-4" />
      Import from Contacts
    </button>
  );
}

function TypeFields({
  type,
  fields,
  onChange,
}: {
  type: QRType;
  fields: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  switch (type) {
    case "url":
      return <InputField label="URL" name="url" value={fields.url || ""} onChange={onChange} placeholder="https://example.com" showPaste />;
    case "text":
      return <InputField label="Text" name="text" value={fields.text || ""} onChange={onChange} placeholder="Enter your text here..." textarea showPaste />;
    case "phone":
      return <InputField label="Phone Number" name="phone" value={fields.phone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" showPaste />;
    case "email":
      return (
        <div className="space-y-3">
          <InputField label="Email Address" name="emailAddress" value={fields.emailAddress || ""} onChange={onChange} type="email" placeholder="hello@example.com" showPaste />
          <InputField label="Subject" name="subject" value={fields.subject || ""} onChange={onChange} placeholder="Optional subject" />
          <InputField label="Body" name="body" value={fields.body || ""} onChange={onChange} placeholder="Optional message body" textarea />
        </div>
      );
    case "sms":
      return (
        <div className="space-y-3">
          <InputField label="Phone Number" name="smsPhone" value={fields.smsPhone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" showPaste />
          <InputField label="Message" name="smsBody" value={fields.smsBody || ""} onChange={onChange} placeholder="Optional message" textarea />
        </div>
      );
    case "wifi":
      return (
        <div className="space-y-3">
          <InputField label="Network Name (SSID)" name="ssid" value={fields.ssid || ""} onChange={onChange} placeholder="MyWiFiNetwork" />
          <InputField label="Password" name="wifiPassword" value={fields.wifiPassword || ""} onChange={onChange} type="password" placeholder="Network password" />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400 tracking-wide">
              Encryption
            </label>
            <select
              value={fields.encryption || "WPA"}
              onChange={(e) => onChange("encryption", e.target.value)}
              className="w-full rounded-lg border border-zinc-700/50 bg-zinc-900/50 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={fields.hidden === "true"}
              onChange={(e) => onChange("hidden", e.target.checked ? "true" : "false")}
              className="rounded border-zinc-600 accent-sky-500"
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
            <InputField label="First Name" name="firstName" value={fields.firstName || ""} onChange={onChange} placeholder="John" />
            <InputField label="Last Name" name="lastName" value={fields.lastName || ""} onChange={onChange} placeholder="Doe" />
          </div>
          <InputField label="Phone" name="vcardPhone" value={fields.vcardPhone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" />
          <InputField label="Email" name="vcardEmail" value={fields.vcardEmail || ""} onChange={onChange} type="email" placeholder="john@example.com" />
          <InputField label="Organization" name="org" value={fields.org || ""} onChange={onChange} placeholder="Acme Inc." />
          <InputField label="Website" name="vcardUrl" value={fields.vcardUrl || ""} onChange={onChange} placeholder="https://example.com" />
        </div>
      );
  }
}

export default function QRGenerator() {
  const [activeType, setActiveType] = useState<QRType>("url");
  const [fields, setFields] = useState<Record<string, string>>({ url: "https://example.com" });
  const [options, setOptions] = useState<QROptions>({
    fgColor: "#ffffff",
    bgColor: "#09090b",
    size: 280,
    errorCorrection: "M",
  });
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [svgString, setSvgString] = useState<string>("");
  const [showCustomize, setShowCustomize] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
  }, []);

  const qrData = buildQRData(activeType, fields);

  useEffect(() => {
    if (!qrData) {
      setQrDataUrl("");
      setSvgString("");
      return;
    }

    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(qrData, {
          width: options.size,
          margin: 2,
          color: { dark: options.fgColor, light: options.bgColor },
          errorCorrectionLevel: options.errorCorrection,
        });
        setQrDataUrl(dataUrl);

        const svg = await QRCode.toString(qrData, {
          type: "svg",
          width: options.size,
          margin: 2,
          color: { dark: options.fgColor, light: options.bgColor },
          errorCorrectionLevel: options.errorCorrection,
        });
        setSvgString(svg);
      } catch {
        setQrDataUrl("");
        setSvgString("");
      }
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
        a.href = url;
        a.download = `qrzap-${activeType}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = options.size * scale;
      canvas.height = options.size * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" } as const;
        const dataUrl = canvas.toDataURL(mimeMap[format], 0.95);
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `qrzap-${activeType}.${format}`;
        a.click();
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
        await navigator.share({
          title: "QR Code from QRzap",
          files: [file],
        });
      } else {
        await navigator.share({
          title: "QR Code from QRzap",
          text: "Check out this QR code I made with QRzap",
          url: window.location.href,
        });
      }
    } catch {
      // User cancelled share
    }
  }, [qrDataUrl, activeType]);

  const activeTypeData = QR_TYPES.find((t) => t.id === activeType);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800/80">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <QrIcon className="w-4.5 h-4.5 text-sky-400" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">QRzap</h1>
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/support"
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-sky-400 transition-colors"
            >
              <HeartIcon className="w-3.5 h-3.5" />
              Support
            </a>
            <span className="text-xs text-zinc-500">Free QR Code Generator</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Type selector */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {QR_TYPES.map((t) => {
            const isActive = activeType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                }`}
              >
                <t.Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Two-card layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Card */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 space-y-5">
            <div className="flex items-center gap-2">
              {activeTypeData && <activeTypeData.Icon className="w-4 h-4 text-zinc-500" />}
              <h2 className="text-sm font-medium text-zinc-300">
                {activeTypeData?.label} Details
              </h2>
            </div>

            <TypeFields type={activeType} fields={fields} onChange={handleFieldChange} />

            {/* Customize toggle */}
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="w-full flex items-center justify-between rounded-lg border border-zinc-700/50 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <PaletteIcon className="w-4 h-4" />
                Customize Appearance
              </span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${showCustomize ? "rotate-180" : ""}`}
              />
            </button>

            {showCustomize && (
              <div className="space-y-4 pt-1">
                {/* Foreground color */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-400 tracking-wide">
                    Foreground Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={`fg-${c}`}
                          onClick={() => setOptions((prev) => ({ ...prev, fgColor: c }))}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            options.fgColor === c ? "border-sky-400 scale-110" : "border-zinc-700"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={options.fgColor}
                      onChange={(e) => setOptions((prev) => ({ ...prev, fgColor: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* Background color */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-400 tracking-wide">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={`bg-${c}`}
                          onClick={() => setOptions((prev) => ({ ...prev, bgColor: c }))}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            options.bgColor === c ? "border-sky-400 scale-110" : "border-zinc-700"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={options.bgColor}
                      onChange={(e) => setOptions((prev) => ({ ...prev, bgColor: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* Size slider */}
                <div className="space-y-2">
                  <label className="flex justify-between text-xs font-medium text-zinc-400 tracking-wide">
                    <span>Size</span>
                    <span className="text-zinc-300 font-mono">{options.size}px</span>
                  </label>
                  <input
                    type="range"
                    min={128}
                    max={512}
                    step={8}
                    value={options.size}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, size: parseInt(e.target.value) }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>

                {/* Error correction */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-400 tracking-wide">
                    Error Correction
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ERROR_LEVELS.map((lvl) => (
                      <button
                        key={lvl.value}
                        onClick={() =>
                          setOptions((prev) => ({
                            ...prev,
                            errorCorrection: lvl.value as QROptions["errorCorrection"],
                          }))
                        }
                        className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                          options.errorCorrection === lvl.value
                            ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                            : "text-zinc-400 border border-zinc-700/50 hover:border-zinc-600/50"
                        }`}
                      >
                        {lvl.value}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {ERROR_LEVELS.find((l) => l.value === options.errorCorrection)?.label}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview Card */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 flex flex-col items-center justify-between gap-6">
            <h2 className="text-sm font-medium text-zinc-300 self-start">
              Preview
            </h2>

            {/* QR Display */}
            <div className="flex-1 flex items-center justify-center">
              {qrDataUrl ? (
                <div className="rounded-xl p-4 bg-zinc-950 border border-zinc-800/80">
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    width={options.size > 280 ? 280 : options.size}
                    height={options.size > 280 ? 280 : options.size}
                    className="rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 rounded-xl border-2 border-dashed border-zinc-800 flex items-center justify-center">
                  <div className="text-center px-4">
                    <QrIcon className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">
                      Fill in the details to<br />generate your QR code
                    </p>
                  </div>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Download buttons */}
            {qrDataUrl && (
              <div className="w-full space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => downloadAs("png")}
                    className="flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400 transition-colors"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    PNG
                  </button>
                  <button
                    onClick={() => downloadAs("svg")}
                    className="flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400 transition-colors"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    SVG
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => downloadAs("jpeg")}
                    className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700/50 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    JPEG
                  </button>
                  <button
                    onClick={() => downloadAs("webp")}
                    className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700/50 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    WebP
                  </button>
                </div>
                {"share" in navigator && (
                  <button
                    onClick={shareQR}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-700/50 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
                  >
                    <ShareIcon className="w-3.5 h-3.5" />
                    Share QR Code
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 mt-12">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between text-xs text-zinc-500">
          <span>QRzap / Free QR Code Generator</span>
          <span>No data stored. Everything runs in your browser.</span>
        </div>
      </footer>
    </div>
  );
}
