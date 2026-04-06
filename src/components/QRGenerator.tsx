import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";

const QR_TYPES = [
  { id: "url", label: "URL", icon: "🔗" },
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "phone", label: "Phone", icon: "📞" },
  { id: "email", label: "Email", icon: "✉️" },
  { id: "sms", label: "SMS", icon: "💬" },
  { id: "vcard", label: "vCard", icon: "👤" },
  { id: "text", label: "Text", icon: "📝" },
] as const;

type QRType = (typeof QR_TYPES)[number]["id"];

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
  "#ffffff",
  "#000000",
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
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

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  textarea = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  const baseClass =
    "w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-text-muted uppercase tracking-wider">
        {label}
      </label>
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
      return <InputField label="URL" name="url" value={fields.url || ""} onChange={onChange} placeholder="https://example.com" />;
    case "text":
      return <InputField label="Text" name="text" value={fields.text || ""} onChange={onChange} placeholder="Enter your text here..." textarea />;
    case "phone":
      return <InputField label="Phone Number" name="phone" value={fields.phone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" />;
    case "email":
      return (
        <div className="space-y-3">
          <InputField label="Email Address" name="emailAddress" value={fields.emailAddress || ""} onChange={onChange} type="email" placeholder="hello@example.com" />
          <InputField label="Subject" name="subject" value={fields.subject || ""} onChange={onChange} placeholder="Optional subject" />
          <InputField label="Body" name="body" value={fields.body || ""} onChange={onChange} placeholder="Optional message body" textarea />
        </div>
      );
    case "sms":
      return (
        <div className="space-y-3">
          <InputField label="Phone Number" name="smsPhone" value={fields.smsPhone || ""} onChange={onChange} type="tel" placeholder="+1 234 567 8900" />
          <InputField label="Message" name="smsBody" value={fields.smsBody || ""} onChange={onChange} placeholder="Optional message" textarea />
        </div>
      );
    case "wifi":
      return (
        <div className="space-y-3">
          <InputField label="Network Name (SSID)" name="ssid" value={fields.ssid || ""} onChange={onChange} placeholder="MyWiFiNetwork" />
          <InputField label="Password" name="wifiPassword" value={fields.wifiPassword || ""} onChange={onChange} type="password" placeholder="Network password" />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider">
              Encryption
            </label>
            <select
              value={fields.encryption || "WPA"}
              onChange={(e) => onChange("encryption", e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={fields.hidden === "true"}
              onChange={(e) => onChange("hidden", e.target.checked ? "true" : "false")}
              className="rounded border-border accent-accent"
            />
            Hidden network
          </label>
        </div>
      );
    case "vcard":
      return (
        <div className="space-y-3">
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
    bgColor: "#0a0a0a",
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

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="2" fill="#6366f1" />
                <rect x="20" y="2" width="10" height="10" rx="2" fill="#6366f1" />
                <rect x="2" y="20" width="10" height="10" rx="2" fill="#6366f1" />
                <rect x="14" y="14" width="4" height="4" rx="1" fill="#818cf8" />
                <rect x="22" y="22" width="8" height="8" rx="2" fill="#818cf8" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">QRzap</h1>
          </div>
          <span className="text-xs text-text-muted">Generate QR codes instantly</span>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Type selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {QR_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeType === t.id
                  ? "bg-accent text-white shadow-lg shadow-accent/25"
                  : "bg-surface text-text-muted hover:bg-surface-hover hover:text-text border border-border"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Two-card layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Card */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                {QR_TYPES.find((t) => t.id === activeType)?.icon}{" "}
                {QR_TYPES.find((t) => t.id === activeType)?.label} Details
              </h2>
            </div>

            <TypeFields type={activeType} fields={fields} onChange={handleFieldChange} />

            {/* Customize toggle */}
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm text-text-muted hover:text-text hover:border-border-hover transition-colors"
            >
              <span>Customize Appearance</span>
              <svg
                className={`w-4 h-4 transition-transform ${showCustomize ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCustomize && (
              <div className="space-y-4 pt-1">
                {/* Foreground color */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider">
                    Foreground Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={`fg-${c}`}
                          onClick={() => setOptions((prev) => ({ ...prev, fgColor: c }))}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            options.fgColor === c ? "border-accent scale-110" : "border-border"
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
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={`bg-${c}`}
                          onClick={() => setOptions((prev) => ({ ...prev, bgColor: c }))}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            options.bgColor === c ? "border-accent scale-110" : "border-border"
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
                  <label className="flex justify-between text-xs font-medium text-text-muted uppercase tracking-wider">
                    <span>Size</span>
                    <span className="text-text font-mono">{options.size}px</span>
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
                    className="w-full accent-accent"
                  />
                </div>

                {/* Error correction */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider">
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
                            ? "bg-accent text-white"
                            : "bg-bg text-text-muted border border-border hover:border-border-hover"
                        }`}
                      >
                        {lvl.value}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted">
                    {ERROR_LEVELS.find((l) => l.value === options.errorCorrection)?.label}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview Card */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col items-center justify-between gap-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted self-start">
              Preview
            </h2>

            {/* QR Display */}
            <div className="flex-1 flex items-center justify-center">
              {qrDataUrl ? (
                <div className="rounded-xl p-4 bg-bg border border-border">
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    width={options.size > 280 ? 280 : options.size}
                    height={options.size > 280 ? 280 : options.size}
                    className="rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                  <p className="text-text-muted text-sm text-center px-4">
                    Fill in the details to<br />generate your QR code
                  </p>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Download buttons */}
            {qrDataUrl && (
              <div className="w-full space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => downloadAs("png")}
                    className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={() => downloadAs("svg")}
                    className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
                  >
                    Download SVG
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => downloadAs("jpeg")}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text hover:border-border-hover transition-colors"
                  >
                    Download JPEG
                  </button>
                  <button
                    onClick={() => downloadAs("webp")}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text hover:border-border-hover transition-colors"
                  >
                    Download WebP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between text-xs text-text-muted">
          <span>QRzap — Free QR Code Generator</span>
          <span>No data is stored. Everything runs in your browser.</span>
        </div>
      </footer>
    </div>
  );
}
