// split auth composition. form on white, one large panel of navy beside it.
// the aside is decoration — it never carries anything the form needs, so it
// drops below lg without loss.
import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/marketing/chrome";

export function AuthShell({
  children,
  aside,
  footer,
}: {
  children: ReactNode;
  aside: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mk grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)]">
      <div className="flex min-w-0 flex-col px-[clamp(20px,5vw,56px)] py-7">
        <Link href="/" aria-label="Back to the Dayflow home page" className="flex-none self-start">
          <Wordmark />
        </Link>

        <main className="flex flex-1 items-center py-10">
          <div className="w-full" style={{ maxWidth: 424 }}>
            {children}
          </div>
        </main>

        {footer ? (
          <div className="flex-none" style={{ maxWidth: 424, fontSize: "0.8125rem", color: "var(--mk-ink-3)" }}>
            {footer}
          </div>
        ) : null}
      </div>

      <aside className="mk-navy mk-on-dark relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center">
        {aside}
      </aside>
    </div>
  );
}
