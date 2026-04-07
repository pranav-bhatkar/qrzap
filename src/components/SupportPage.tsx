import { HeartIcon, QrIcon, LinkIcon } from "./icons";

function CoffeeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function CreditCardIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function StarIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}

export default function SupportPage() {
  return (
    <div className="bg-background">
      <main className="mx-auto max-w-6xl px-4 md:px-8 lg:px-12 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-medium mb-3">Support</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Keep QRzap free</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No ads. No tracking. No subscriptions. If you find it useful, here's how you can help.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Buy Me a Coffee - spans 2 cols */}
          <a
            href="https://buymeacoffee.com/pranavbhatkar"
            target="_blank"
            rel="noopener noreferrer"
            className="group md:col-span-2 rounded-xl border border-border/20 bg-card/50 p-8 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
            onClick={() => window.posthog?.capture("support_link_clicked", { platform: "buymeacoffee" })}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <CoffeeIcon className="w-6 h-6 text-amber-400" />
              </div>
              <ArrowRightIcon className="w-5 h-5 text-muted-foreground/30 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Buy Me a Coffee</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              One-time or recurring. Every coffee keeps the servers running and the code open source.
            </p>
          </a>

          {/* Razorpay */}
          <a
            href="https://razorpay.me/@pranavbhatkar"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-border/20 bg-card/50 p-8 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all"
            onClick={() => window.posthog?.capture("support_link_clicked", { platform: "razorpay" })}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-sky-400" />
              </div>
              <ArrowRightIcon className="w-5 h-5 text-muted-foreground/30 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Razorpay</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              UPI, cards, net banking. For supporters in India.
            </p>
          </a>

          {/* Star on GitHub */}
          <a
            href="https://github.com/pranav-bhatkar/qrzap"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-border/20 bg-card/50 p-8 hover:border-zinc-500/30 hover:bg-zinc-500/5 transition-all"
            onClick={() => window.posthog?.capture("github_link_clicked")}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-zinc-400" />
              </div>
              <ArrowRightIcon className="w-5 h-5 text-muted-foreground/30 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Star on GitHub</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free and takes 2 seconds. Helps others find QRzap.
            </p>
          </a>

          {/* Share - spans 2 cols */}
          <a
            href="https://twitter.com/intent/tweet?text=Found%20this%20free%20QR%20code%20generator%20with%20an%20API%20and%20MCP%20server%20%E2%80%94%20https%3A%2F%2Fqrzap.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="group md:col-span-2 rounded-xl border border-border/20 bg-card/50 p-8 hover:border-zinc-500/30 hover:bg-zinc-500/5 transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-zinc-400" />
              </div>
              <ArrowRightIcon className="w-5 h-5 text-muted-foreground/30 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Share it</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Tell someone about QRzap. Tweet it, post it, send it in a group chat. Word of mouth is the best marketing.
            </p>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Price", value: "Free" },
            { label: "QR Types", value: "7" },
            { label: "API Key", value: "None" },
            { label: "Rate Limit", value: "60/min" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/20 bg-card/50 p-5 text-center">
              <p className="text-xl font-bold mb-1">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50">{s.label}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-8">
          built by <a href="https://pranavbhatkar.me" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">pranav bhatkar</a>. open source. no strings attached.
        </p>
      </main>
    </div>
  );
}
