const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4";

const NAV_LINKS = ["Features", "Plans", "Security", "About"] as const;

function AxonMark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 256 256"
      fill="none"
      role="img"
      aria-label="Axon logo"
    >
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="#1B133C" />
      <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="#1B133C" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <section className="relative flex h-screen w-full flex-col overflow-hidden">
      {/* looping background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        src={VIDEO_URL}
        className="absolute inset-0 z-0 h-[130%] w-full object-cover object-top"
      />

      {/* navigation */}
      <header className="relative z-10 flex justify-center px-4 pt-4 md:pt-6">
        <nav className="flex items-center gap-5 rounded-xl bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md md:gap-8 md:px-6">
          <a href="#" aria-label="Axon home" className="flex items-center">
            <AxonMark />
          </a>
          <div className="hidden items-center gap-6 sm:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm font-medium text-[#1B133C]/80 transition-colors duration-200 hover:text-[#1B133C]"
              >
                {link}
              </a>
            ))}
          </div>
        </nav>
      </header>

      {/* hero */}
      <main className="relative z-10 mt-8 flex flex-1 flex-col items-center px-4 text-center md:mt-16">
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-xl border border-[#1B133C]/10 bg-white/70 px-4 py-2 text-sm font-medium backdrop-blur-sm">
          <span className="grid h-5 w-5 place-items-center rounded bg-orange-500 text-[11px] font-bold text-white">
            Y
          </span>
          Funded by Y Combinator
        </div>

        <h1 className="max-w-4xl font-[family-name:var(--font-instrument-serif)] text-4xl leading-[0.95] tracking-tight text-[#1B133C] sm:text-5xl md:text-7xl lg:text-8xl">
          Deploy digital workers
          <br />
          for mundane workflows
        </h1>

        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-[#1B133C]/70 sm:mt-6 sm:text-sm md:text-base">
          Eliminate your tedious browser work and 10x your team&apos;s capacity.
          Put intelligent agents on every routine process so you grow faster and
          deliver more for clients — effortlessly.
        </p>

        <button
          type="button"
          className="mt-7 rounded-xl bg-[#FEFEFE] px-6 py-3 text-sm font-semibold text-[#1B133C] shadow-[0px_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0px_6px_16px_rgba(0,0,0,0.2)] sm:mt-8 sm:px-8 sm:py-3.5"
        >
          Get Early Access
        </button>
      </main>
    </section>
  );
}
