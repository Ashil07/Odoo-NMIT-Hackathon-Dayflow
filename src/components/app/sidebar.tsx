"use client";

// left rail: logo, nav, punch buttons, profile. mobile gets drawer.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarCheck,
  Layers,
  LogIn,
  LogOut,
  Menu,
  Palmtree,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/time-off", label: "Time off", icon: Palmtree },
] as const;

// mark active route, else quiet grey
function navClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
    active
      ? "bg-primary/10 font-medium text-primary"
      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* mobile menu toggle */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 rounded-lg border bg-background p-2 shadow-sm md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* mobile backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-200 md:translate-x-0",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full",
        )}
      >
        {/* logo */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="size-5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Dayflow
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="ml-auto rounded-md p-1 hover:bg-sidebar-accent md:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* nav */}
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={navClass(pathname === href)}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* punch in out. stubs, no logic yet */}
        <div className="mt-6 flex flex-col gap-2 px-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <LogIn className="size-4" />
            Check In
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <LogOut className="size-4" />
            Check Out
          </button>
        </div>

        {/* profile pinned to bottom */}
        <div className="mt-auto border-t p-3">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className={navClass(pathname === "/profile")}
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              MU
            </span>
            <span className="flex flex-col">
              <span className="text-foreground">Profile</span>
              <span className="text-xs text-muted-foreground">Muaz Mohammed</span>
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
