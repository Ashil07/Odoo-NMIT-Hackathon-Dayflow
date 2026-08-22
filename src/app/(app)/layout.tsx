// every signed-in page hangs off the same glass shell.
import type { ReactNode } from "react";
import { Shell } from "@/components/app/shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="df-root">
      <Shell>{children}</Shell>
    </div>
  );
}
