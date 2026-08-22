"use client";

// one client-side store for the whole mockup. lives above the router so
// state survives page hops. nothing here talks to a server.

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SEED_REQUESTS,
  dayspan,
  shortDate,
  type LeaveRequest,
  type LeaveStatus,
} from "@/lib/dayflow";

export type Role = "employee" | "admin";
export type LeaveType = "Paid" | "Sick" | "Unpaid";
export type ProfileTab = "resume" | "private" | "salary" | "settings";
export type Toast = { id: number; text: string; kind: "good" | "bad" };

type Store = {
  authed: boolean;
  role: Role;
  isEmp: boolean;
  signIn: (role: Role) => void;
  signOut: () => void;
  setRole: (role: Role) => void;

  clock: string;

  // punch clock: 0 not in, 1 in, 2 done
  checked: 0 | 1 | 2;
  inAt: string | null;
  outAt: string | null;
  checkIn: () => void;
  checkOut: () => void;

  range: "week" | "month";
  setRange: (r: "week" | "month") => void;

  requests: LeaveRequest[];
  decide: (id: string, status: LeaveStatus, who: string) => void;
  submitLeave: () => void;

  leaveOpen: boolean;
  openLeave: () => void;
  closeLeave: () => void;
  leaveType: LeaveType;
  setLeaveType: (t: LeaveType) => void;
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  remarks: string;
  setRemarks: (v: string) => void;
  leaveDays: number;
  attach: boolean;
  toggleAttach: () => void;

  bellOpen: boolean;
  toggleBell: () => void;
  closeBell: () => void;

  search: string;
  setSearch: (v: string) => void;

  selected: string | null;
  select: (id: string | null) => void;

  tab: ProfileTab;
  setTab: (t: ProfileTab) => void;

  wage: string;
  setWage: (v: string) => void;
  wageMode: "month" | "year";
  setWageMode: (m: "month" | "year") => void;

  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;

  toasts: Toast[];
  toast: (text: string, kind?: "good" | "bad") => void;
};

const Ctx = createContext<Store | null>(null);

// wall clock as HH:MM
function hhmm(d = new Date()): string {
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

export function DayflowProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [role, setRoleState] = useState<Role>("employee");
  const [clock, setClock] = useState("--:--");

  const [checked, setChecked] = useState<0 | 1 | 2>(0);
  const [inAt, setInAt] = useState<string | null>(null);
  const [outAt, setOutAt] = useState<string | null>(null);

  const [range, setRange] = useState<"week" | "month">("week");
  const [requests, setRequests] = useState<LeaveRequest[]>(SEED_REQUESTS);

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("Paid");
  const [from, setFrom] = useState("2026-09-07");
  const [to, setTo] = useState("2026-09-09");
  const [remarks, setRemarks] = useState("");
  const [attach, setAttach] = useState(false);

  const [bellOpen, setBellOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<ProfileTab>("resume");

  const [wage, setWageState] = useState("50000");
  const [wageMode, setWageMode] = useState<"month" | "year">("month");

  const [phone, setPhone] = useState("+91 98450 11234");
  const [address, setAddress] = useState("12B Ashwin Residency, Indiranagar, Bengaluru 560038");

  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  // clock ticks client-side only, keeps hydration honest
  useEffect(() => {
    const tick = () => setClock(hhmm());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const toast = useCallback((text: string, kind: "good" | "bad" = "good") => {
    const id = ++seq.current;
    setToasts((list) => [...list, { id, text, kind }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3000);
  }, []);

  const signIn = useCallback((next: Role) => {
    setRoleState(next);
    setAuthed(true);
    setBellOpen(false);
    setSelected(null);
  }, []);

  const signOut = useCallback(() => {
    setAuthed(false);
    setBellOpen(false);
    setSelected(null);
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    setBellOpen(false);
    setSelected(null);
    setSearch("");
  }, []);

  const checkIn = useCallback(() => {
    const t = hhmm();
    setChecked(1);
    setInAt(t);
    toast("Checked in at " + t);
  }, [toast]);

  const checkOut = useCallback(() => {
    const t = hhmm();
    setChecked(2);
    setOutAt(t);
    toast("Checked out at " + t + " · 8h 36m");
  }, [toast]);

  const decide = useCallback(
    (id: string, status: LeaveStatus, who: string) => {
      const line =
        status === "Approved"
          ? "Approved by Tanvi Nair — “Have a good break.”"
          : "Rejected by Tanvi Nair — “Please reschedule outside the release window.”";
      setRequests((list) => list.map((r) => (r.id === id ? { ...r, status, note: line } : r)));
      toast(who + " · " + id + " " + status.toLowerCase(), status === "Approved" ? "good" : "bad");
    },
    [toast],
  );

  const leaveDays = useMemo(() => dayspan(from, to), [from, to]);

  const submitLeave = useCallback(() => {
    const id = "LR-" + (2090 + requests.length);
    const span = from === to ? shortDate(from) : shortDate(from) + " – " + shortDate(to);
    const next: LeaveRequest = {
      id,
      who: "Aarav Rao",
      type: leaveType + " leave",
      range: span,
      days: leaveDays,
      status: "Pending",
      note: remarks || "No remarks added.",
      attach: leaveType === "Sick" && attach ? "certificate.pdf" : undefined,
    };
    setRequests((list) => [next, ...list]);
    setLeaveOpen(false);
    setRemarks("");
    toast("Request " + id + " sent to Priya Nair");
    router.push("/time-off");
  }, [requests.length, from, to, leaveType, leaveDays, remarks, attach, toast, router]);

  // digits only, wage feeds the whole payroll maths
  const setWage = useCallback((v: string) => setWageState(v.replace(/[^0-9]/g, "")), []);

  const value: Store = {
    authed,
    role,
    isEmp: role === "employee",
    signIn,
    signOut,
    setRole,
    clock,
    checked,
    inAt,
    outAt,
    checkIn,
    checkOut,
    range,
    setRange,
    requests,
    decide,
    submitLeave,
    leaveOpen,
    openLeave: () => setLeaveOpen(true),
    closeLeave: () => setLeaveOpen(false),
    leaveType,
    setLeaveType,
    from,
    setFrom,
    to,
    setTo,
    remarks,
    setRemarks,
    leaveDays,
    attach,
    toggleAttach: () => setAttach((a) => !a),
    bellOpen,
    toggleBell: () => setBellOpen((b) => !b),
    closeBell: () => setBellOpen(false),
    search,
    setSearch,
    selected,
    select: setSelected,
    tab,
    setTab,
    wage,
    setWage,
    wageMode,
    setWageMode,
    phone,
    setPhone,
    address,
    setAddress,
    toasts,
    toast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDayflow(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDayflow must sit inside DayflowProvider");
  return ctx;
}
