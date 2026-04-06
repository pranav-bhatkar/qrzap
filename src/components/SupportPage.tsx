import { HeartIcon, QrIcon } from "./icons";

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

export default function SupportPage() {
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
          <a
            href="/"
            className="text-xs font-medium text-zinc-400 hover:text-sky-400 transition-colors"
          >
            Back to Generator
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-6">
            <HeartIcon className="w-7 h-7 text-sky-400" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
            Support QRzap
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
            QRzap is free and always will be. If you find it useful, consider
            supporting the project to help keep it running and improving.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Buy Me a Coffee */}
          <a
            href="https://buymeacoffee.com/pranavbhatkar"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <CoffeeIcon className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1.5">
              Buy Me a Coffee
            </h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Support with a one-time or recurring contribution via Buy Me a Coffee.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 group-hover:gap-2.5 transition-all">
              Contribute
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </span>
          </a>

          {/* Razorpay */}
          <a
            href="https://razorpay.me/@pranavbhatkar"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4">
              <CreditCardIcon className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1.5">
              Razorpay
            </h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Support via Razorpay with UPI, cards, net banking, and more payment options.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 group-hover:gap-2.5 transition-all">
              Contribute
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-600">
            Thank you for using QRzap. Every contribution helps.
          </p>
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
