"use client";

// session + server state. auth lives in an httpOnly cookie; role comes from
// the db via /api/auth/me. every mutation hits a role-checked route, then
// reloads. no role or permission is trusted from this file.

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
import { dayspan, type Payroll } from "@/lib/dayflow";
import { fmtDay, hhmm } from "@/lib/format";
import type { LeaveRow, LogRow, Me, Person } from "@/lib/types";

export type Role = "EMPLOYEE" | "HR_ADMIN";
export type LeaveType = "Paid" | "Sick" | "Unpaid";
export type ProfileTab = "resume" | "private" | "salary" | "settings";
export type Toast = { id: number; text: string; kind: "good" | "bad" };
export type WageRow = { id: string; empId: string; name: string; title: string; dept: string; wage: number };

// fetch wrapper. throws the server's error text.
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Store = {
  me: Me | null;
  loading: boolean;
  authed: boolean;
  isEmp: boolean;
  signOut: () => Promise<void>;
  reload: () => Promise<void>;

  clock: string;

  // punch clock: 0 not in, 1 in, 2 done — derived from today's server row
  checked: 0 | 1 | 2;
  inAt: string | null;
  outAt: string | null;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;

  myLog: LogRow[];
  range: "week" | "month";
  setRange: (r: "week" | "month") => void;

  requests: LeaveRow[];
  decide: (id: string, status: "Approved" | "Rejected", comment?: string) => Promise<void>;
  submitLeave: () => Promise<void>;

  people: Person[];
  registerDate: string;
  stepRegisterDay: (dir: number) => Promise<void>;

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

  // payroll editor (hr). wage mirrors whichever employee is targeted.
  payrollList: WageRow[];
  payrollTarget: WageRow | null;
  choosePayrollTarget: (id: string) => void;
  wage: string;
  setWage: (v: string) => void;
  saveWage: () => Promise<void>;

  myPayroll: Payroll | null;
  myWage: number;

  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  saveProfile: () => Promise<void>;

  toasts: Toast[];
  toast: (text: string, kind?: "good" | "bad") => void;
};

const Ctx = createContext<Store | null>(null);

export function DayflowProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState("--:--");

  const [myLog, setMyLog] = useState<LogRow[]>([]);
  const [myPayroll, setMyPayroll] = useState<Payroll | null>(null);
  const [requests, setRequests] = useState<LeaveRow[]>([]);
  const [range, setRange] = useState<"week" | "month">("week");

  const [people, setPeople] = useState<Person[]>([]);
  const [registerDate, setRegisterDate] = useState("");
  const registerDayRef = useRef<string | null>(null);
  const [payrollList, setPayrollList] = useState<WageRow[]>([]);
  const [payrollTargetId, setPayrollTargetId] = useState<string | null>(null);
  const targetRef = useRef<string | null>(null);
  const [wage, setWageState] = useState("50000");

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("Paid");
  const [from, setFrom] = useState(isoToday());
  const [to, setTo] = useState(isoToday());
  const [remarks, setRemarks] = useState("");
  const [attach, setAttach] = useState(false);

  const [bellOpen, setBellOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<ProfileTab>("resume");

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

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

  // boot: who am i, then pull my slice of the world
  const reload = useCallback(async () => {
    try {
      const { me } = await api<{ me: Me }>("/api/auth/me");
      setMe(me);
      setPhone(me.profile.phone);
      setAddress(me.profile.address);

      const jobs: Promise<void>[] = [
        api<{ log: LogRow[] }>("/api/attendance/me").then((d) => setMyLog(d.log)),
        api<{ wage: number; payroll: Payroll }>("/api/payroll/me").then((d) => setMyPayroll(d.payroll)),
        me.role === "EMPLOYEE"
          ? api<{ requests: LeaveRow[] }>("/api/leave/me").then((d) => setRequests(d.requests))
          : api<{ requests: LeaveRow[] }>("/api/leave").then((d) => setRequests(d.requests)),
      ];
      if (me.role === "HR_ADMIN") {
        jobs.push(
          api<{ people: Person[]; today: string }>(
            registerDayRef.current ? `/api/people?day=${registerDayRef.current}` : "/api/people",
          ).then((d) => {
            setPeople(d.people);
            setRegisterDate(fmtDay(new Date(d.today)));
            registerDayRef.current = new Date(d.today).toISOString().slice(0, 10);
          }),
          api<{ list: WageRow[] }>("/api/payroll").then((d) => {
            setPayrollList(d.list);
            const id = targetRef.current ?? d.list.find((w) => w.empId === "OIAARA20230012")?.id ?? d.list[0]?.id ?? null;
            targetRef.current = id;
            setPayrollTargetId(id);
            const row = d.list.find((w) => w.id === id);
            if (row) setWageState(String(row.wage));
          }),
        );
      }
      await Promise.all(jobs);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one fetch on mount, state lands after await
    void reload();
  }, [reload]);

  // pick whose structure the editor shows; wage follows the pick
  const choosePayrollTarget = useCallback(
    (id: string) => {
      targetRef.current = id;
      setPayrollTargetId(id);
      const row = payrollList.find((w) => w.id === id);
      if (row) setWageState(String(row.wage));
    },
    [payrollList],
  );

  // today's punch state falls out of the log's top row
  const todayKey = useMemo(() => fmtDay(new Date()), []);
  const todayRow = myLog.find((r) => r.day === todayKey);
  const checked: 0 | 1 | 2 = !todayRow || todayRow.in === "—" ? 0 : todayRow.out !== "—" ? 2 : 1;
  const inAt = todayRow && todayRow.in !== "—" ? todayRow.in : null;
  const outAt = todayRow && todayRow.out !== "—" ? todayRow.out : null;

  const signOut = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setMe(null);
    router.push("/");
  }, [router]);

  const checkIn = useCallback(async () => {
    try {
      await api("/api/attendance/check-in", { method: "POST" });
      toast("Checked in at " + hhmm());
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Check-in failed", "bad");
    }
  }, [toast, reload]);

  // walk the register across weekdays, refetch for that day
  const stepRegisterDay = useCallback(
    async (dir: number) => {
      if (!registerDayRef.current) return;
      const cur = new Date(registerDayRef.current + "T00:00:00");
      const next = new Date(cur);
      do {
        next.setDate(next.getDate() + dir);
      } while (next.getDay() === 0 || next.getDay() === 6);
      const iso = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
      registerDayRef.current = iso;
      try {
        const d = await api<{ people: Person[]; today: string }>(`/api/people?day=${iso}`);
        setPeople(d.people);
        setRegisterDate(fmtDay(new Date(d.today)));
      } catch (e) {
        toast(e instanceof Error ? e.message : "Could not load day", "bad");
      }
    },
    [toast],
  );

  const checkOut = useCallback(async () => {
    try {
      const d = await api<{ outAt: string; hrs: string }>("/api/attendance/check-out", { method: "POST" });
      toast("Checked out at " + d.outAt + " · " + d.hrs + "h");
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Check-out failed", "bad");
    }
  }, [toast, reload]);

  const leaveDays = useMemo(() => dayspan(from, to), [from, to]);

  const submitLeave = useCallback(async () => {
    try {
      await api("/api/leave", {
        method: "POST",
        body: JSON.stringify({ type: leaveType, from, to, remarks, attach }),
      });
      setLeaveOpen(false);
      setRemarks("");
      toast("Request sent to " + (me?.profile.manager ?? "your manager"));
      await reload();
      router.push("/time-off");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not send request", "bad");
    }
  }, [leaveType, from, to, remarks, attach, me, toast, reload, router]);

  const decide = useCallback(
    async (id: string, status: "Approved" | "Rejected", comment = "") => {
      try {
        await api(`/api/leave/${id}/decide`, {
          method: "POST",
          body: JSON.stringify({ status, comment }),
        });
        toast("Request " + status.toLowerCase());
        await reload();
      } catch (e) {
        toast(e instanceof Error ? e.message : "Decision failed", "bad");
      }
    },
    [toast, reload],
  );

  // digits only, feeds the payroll maths
  const setWage = useCallback((v: string) => setWageState(v.replace(/[^0-9]/g, "")), []);

  const saveWage = useCallback(async () => {
    if (!payrollTargetId) return;
    try {
      await api(`/api/payroll/${payrollTargetId}`, {
        method: "PATCH",
        body: JSON.stringify({ monthlyWage: Number(wage) || 0 }),
      });
      toast("Salary structure saved");
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Save failed", "bad");
    }
  }, [payrollTargetId, wage, toast, reload]);

  const saveProfile = useCallback(async () => {
    try {
      await api("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ phone, address }),
      });
      toast("Profile updated");
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Save failed", "bad");
    }
  }, [phone, address, toast, reload]);

  const payrollTarget = useMemo(
    () => payrollList.find((w) => w.id === payrollTargetId) ?? null,
    [payrollList, payrollTargetId],
  );

  const value: Store = {
    me,
    loading,
    authed: !!me,
    isEmp: me?.role === "EMPLOYEE",
    signOut,
    reload,
    clock,
    checked,
    inAt,
    outAt,
    checkIn,
    checkOut,
    myLog,
    range,
    setRange,
    requests,
    decide,
    submitLeave,
    people,
    registerDate,
    stepRegisterDay,
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
    payrollList,
    payrollTarget,
    choosePayrollTarget,
    wage,
    setWage,
    saveWage,
    myPayroll,
    myWage: me?.profile.monthlyWage ?? 0,
    phone,
    setPhone,
    address,
    setAddress,
    saveProfile,
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
