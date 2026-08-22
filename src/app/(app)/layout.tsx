// app shell: fixed left rail, main area beside it. mobile leaves room for toggle.
import type { ReactNode } from "react";
import { Sidebar } from "@/components/app/sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <Sidebar />
      <main className="px-6 pt-16 pb-10 md:pt-6 md:pl-64">
        {children}
      </main>
    </div>
  );
}
